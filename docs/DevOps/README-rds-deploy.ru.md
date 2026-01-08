# Деплой RDS PostgreSQL в учебном проекте на AWS

RDS — база данных в **Shared Services Account**.  
Доступ из Lambda в backend accounts через security groups/VPC.

## Предварительные требования
- AWS CLI/Terraform.
- VPC в Shared Account (если не default).

## Настройка инфраструктуры

### Вариант 1: AWS Console
1. **Создайте DB instance**
   - Engine: PostgreSQL (версия 16+).
   - Instance class: db.t3.micro (Free Tier).
   - Storage: 20 GB gp3.
   - Public access: No (для prod), Yes для dev.
   - Master username/password.

2. **Security Group**
   - Allow inbound from backend VPCs (port 5432).

### Вариант 2: Terraform
```hcl
module "rds_postgres" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "my-project-db"

  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "mydb"
  username = "admin"
  password = var.db_password  # Используйте secrets

  publicly_accessible = false
  vpc_security_group_ids = [aws_security_group.rds.id]
}
Cross-account доступ

Для Lambda: Используйте VPC peering между accounts.
Или IAM DB Auth (для PostgreSQL).

Ручной деплой
Bashterraform apply
Автоматический деплой
В workflow для infra:
YAMLname: Deploy RDS

on: workflow_dispatch

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::SHARED_ID:role/GitHubActions-RDSDeploy
          aws-region: us-east-1

      - name: Terraform Apply
        run: terraform apply -auto-approve -var db_password=${{ secrets.DB_PASSWORD }}
Полезные советы

Бэкапы: Включите automatic.
Connect: psql -h endpoint -U admin.
Стоимость: Free Tier.
