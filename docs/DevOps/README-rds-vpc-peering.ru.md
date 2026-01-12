# Доступ к RDS PostgreSQL из Lambda в других аккаунтах через VPC Peering

В вашем проекте RDS PostgreSQL находится в **Shared Services Account**, а Lambda-функции микросервисов — в отдельных **Backend Accounts**.  
По умолчанию Lambda в одном аккаунте не может напрямую обращаться к RDS в другом аккаунте по приватной сети.  
Самый надёжный и безопасный способ — настроить **VPC Peering** между аккаунтами, чтобы Lambda могла подключаться к RDS по приватному endpoint'у (без публичного доступа).

## Почему VPC Peering?
- Безопасность: RDS остаётся полностью приватным (publicly_accessible = false).
- Нет дополнительных затрат на NAT Gateway или публичный трафик.
- Низкая задержка.
- Работает с Lambda в VPC.

Альтернативы (менее рекомендуемые для учебного проекта):
- Публичный доступ к RDS + Security Groups по IP — небезопасно.
- RDS Proxy — сложнее и дороже.
- IAM Database Authentication — не заменяет сетевой доступ.

## Шаговая инструкция по настройке VPC Peering

### 1. Подготовка (в каждом аккаунте)
- Убедитесь, что у вас есть VPC:
  - Shared Services Account → VPC для RDS (можно default VPC).
  - Каждый Backend Account → VPC для Lambda (можно default VPC).
- CIDR-блоки VPC не должны пересекаться!  
  Примеры безопасных диапазонов:
  - Shared: `10.0.0.0/16`
  - Backend 1: `10.1.0.0/16`
  - Backend 2: `10.2.0.0/16`

Если пересекаются — создайте новые VPC.

### 2. Создание VPC Peering Connection (один раз на пару аккаунтов)

#### В Shared Services Account (Requester):
1. Перейдите в VPC → Peering Connections → Create peering connection.
2. Name: `shared-to-backend1`.
3. Local VPC: ваша VPC в Shared.
4. Account: **Another account** → укажите ID Backend Account.
5. Region: тот же регион.
6. VPC ID: VPC ID из Backend Account.
7. Создайте → получите Peering Connection ID (pcx-xxxx).

#### В Backend Account (Accepter):
1. Перейдите в VPC → Peering Connections.
2. Найдите pending connection от Shared Account.
3. Actions → Accept request.

### 3. Настройка Route Tables

В **обоих аккаунтах** добавьте маршруты:

#### В Shared Services Account (для трафика в Backend VPC):
- Выберите Route Table, ассоциированную с подсетями RDS.
- Routes → Edit routes → Add route:
  - Destination: CIDR Backend VPC (например, `10.1.0.0/16`)
  - Target: Peering Connection ID (pcx-xxxx)

#### В Backend Account (для трафика в Shared VPC):
- Выберите Route Table, ассоциированную с подсетями Lambda.
- Routes → Edit routes → Add route:
  - Destination: CIDR Shared VPC (`10.0.0.0/16`)
  - Target: тот же Peering Connection ID

### 4. Security Groups

#### В Shared Services Account (на RDS):
- Security Group RDS → Inbound rules → Add rule:
  - Type: PostgreSQL (5432)
  - Source: Security Group ID Lambda из Backend Account

#### В Backend Account (на Lambda):
- Security Group Lambda → Outbound rules:
  - Разрешите трафик на 5432 к Security Group RDS (или весь outbound — для простоты в учебном проекте).

### 5. Настройка Lambda (в Backend Account)
- Включите VPC для Lambda:
  - VPC: ваша Backend VPC
  - Subnets: приватные подсети (private subnets)
  - Security Groups: та, которая разрешает outbound к RDS

### 6. Terraform-пример (рекомендуется для автоматизации)

В **Shared Account** (`infra/shared/vpc-peering.tf`):
```hcl
resource "aws_vpc_peering_connection" "to_backend1" {
  vpc_id        = aws_vpc.shared.id
  peer_vpc_id   = "vpc-12345678"  # VPC ID из Backend1
  peer_owner_id = "BACKEND_ACCOUNT_ID"
  auto_accept   = false  # для cross-account

  tags = { Name = "shared-to-backend1" }
}

resource "aws_route" "shared_to_backend1" {
  route_table_id            = aws_vpc.shared.main_route_table_id
  destination_cidr_block    = "10.1.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection.to_backend1.id
}
В Backend Account:
hclresource "aws_vpc_peering_connection_accepter" "from_shared" {
  vpc_peering_connection_id = "pcx-xxxxxxxx"  # ID из Shared
  auto_accept               = true
}

resource "aws_route" "backend_to_shared" {
  route_table_id            = aws_vpc.backend.main_route_table_id
  destination_cidr_block    = "10.0.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection_accepter.from_shared.id
}
7. Тестирование подключения
В Lambda (или EC2 в Backend VPC):
Bashpsql -h your-rds-endpoint.rds.amazonaws.com -U admin -d mydb
Или из кода Lambda:
JavaScriptconst pg = require('pg');
const client = new pg.Client({
  host: 'your-rds-endpoint.rds.amazonaws.com',
  port: 5432,
  user: 'admin',
  password: process.env.DB_PASSWORD,
  database: 'mydb'
});
await client.connect();
Полезные советы

Повторите шаги 2–6 для каждого Backend Account.
DNS resolution работает автоматически через peering.
Задержка после создания peering — до 5 минут.
Мониторьте в VPC Flow Logs при проблемах.

После этой настройки Lambda безопасно и напрямую подключается к RDS.
