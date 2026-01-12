# Terraform модуль для VPC Peering в multi-account окружении

Для вашего учебного проекта с **Shared Services Account** (где RDS) и несколькими **Backend Accounts** (где Lambda) рекомендуется использовать готовый Terraform-модуль **cloudposse/vpc-peering-multi-account/aws**.

Этот модуль:
- Создаёт VPC Peering Connection между VPC в разных аккаунтах.
- Автоматически принимает запрос (accepter).
- Добавляет маршруты в route tables (для всех CIDR блоков VPC).
- Поддерживает управление из третьего аккаунта (например, из root/organization management account) через assume_role.
- Поддерживает DNS resolution (опционально).

Источник: https://github.com/cloudposse/terraform-aws-vpc-peering-multi-account  
Registry: https://registry.terraform.io/modules/cloudposse/vpc-peering-multi-account/aws/latest

## Почему этот модуль?
- Проверенный и поддерживаемый (Cloud Posse — известны качественными модулями).
- Автоматически обрабатывает cross-account сложности (accepter, routes).
- Легко масштабируется на несколько backend аккаунтов (вызываете модуль несколько раз с разными параметрами).

## Подготовка
1. В каждом аккаунте создайте IAM Role для Terraform (например, `VPCPeeringRole`):
   - Trust policy: разрешает assume_role от аккаунта, где запускаете Terraform (обычно Shared или отдельный DevOps account).
   - Permissions: `ec2:DescribeVpcs`, `ec2:CreateVpcPeeringConnection`, `ec2:AcceptVpcPeeringConnection`, `ec2:CreateRoute`, `ec2:DeleteRoute` и т.д. (полный список в документации модуля).

2. Убедитесь, что CIDR блоки VPC не пересекаются (например, Shared: 10.0.0.0/16, Backend1: 10.1.0.0/16, Backend2: 10.2.0.0/16).

## Пример использования (в Shared Services Account)

Создайте папку `infra/vpc-peering/`.

### provider.tf
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# Основной провайдер — Shared Account
provider "aws" {
  region  = "us-east-1"  # или ваш регион
  profile = "shared"     # или default
}

# Провайдеры для backend аккаунтов (assume_role)
provider "aws" {
  alias   = "backend1"
  region  = "us-east-1"
  assume_role {
    role_arn = "arn:aws:iam::BACKEND1_ACCOUNT_ID:role/VPCPeeringRole"
  }
}

provider "aws" {
  alias   = "backend2"
  region  = "us-east-1"
  assume_role {
    role_arn = "arn:aws:iam::BACKEND2_ACCOUNT_ID:role/VPCPeeringRole"
  }
}
main.tf (peering с несколькими backend)
hclmodule "peering_to_backend1" {
  source  = "cloudposse/vpc-peering-multi-account/aws"
  version = "0.23.0"  # проверьте актуальную версию!

  providers = {
    aws.requester = aws          # Shared (requester)
    aws.accepter  = aws.backend1 # Backend1 (accepter)
  }

  name                        = "shared-to-backend1"
  requester_vpc_id            = aws_vpc.shared.id  # или data.aws_vpc.shared.id
  accepter_vpc_id             = "vpc-12345678"     # VPC ID в Backend1 (можно через data source)

  # Автоматический accept
  auto_accept_peering = true

  # DNS resolution (если нужно Route53 private hosted zones)
  requester_allow_remote_vpc_dns_resolution = true
  accepter_allow_remote_vpc_dns_resolution  = true

  tags = {
    Project = "my-educational-project"
  }
}

# Повторите для backend2
module "peering_to_backend2" {
  source  = "cloudposse/vpc-peering-multi-account/aws"
  version = "0.23.0"

  providers = {
    aws.requester = aws
    aws.accepter  = aws.backend2
  }

  name             = "shared-to-backend2"
  requester_vpc_id = aws_vpc.shared.id
  accepter_vpc_id  = "vpc-abcdef12"

  auto_accept_peering = true
  requester_allow_remote_vpc_dns_resolution = true
  accepter_allow_remote_vpc_dns_resolution  = true
}
Запуск
Bashcd infra/vpc-peering
terraform init
terraform plan
terraform apply
Модуль автоматически:

Создаст peering connection.
Примет его в backend аккаунте.
Добавит маршруты во все route tables (по тегам или всем).

Полезные советы

Если VPC создаются Terraform'ом — используйте outputs для передачи VPC ID.
Для большего контроля укажите requester_route_table_tags и accepter_route_table_tags.
После peering настройте Security Groups (как в предыдущей инструкции).
Тестируйте подключение из Lambda к RDS endpoint.

Этот подход — best practice для multi-account AWS окружений.
