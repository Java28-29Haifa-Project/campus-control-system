# Краткая инструкция: VPC Peering для RDS (multi-account)

**Цель**: Обеспечить приватный доступ Lambda (в Backend Accounts) к RDS PostgreSQL (в Shared Services Account) через VPC Peering.

## Предварительные условия
- CIDR-блоки VPC не пересекаются (пример: Shared — `10.0.0.0/16`, Backend1 — `10.1.0.0/16` и т.д.).
- В каждом аккаунте создана роль для Terraform (`VPCPeeringRole`) с правами на EC2 peering и routing.

## Рекомендуемый способ: Terraform + модуль Cloud Posse

Папка: `infra/vpc-peering/`

### variables.tf
```hcl
variable "shared_vpc_id" {
  type = string
  description = "VPC ID в Shared Services Account"
}

variable "backend_accounts" {
  type = list(object({
    account_id   = string
    vpc_id       = string
    role_arn     = string
    name_suffix  = string
  }))
  default = []
}
provider.tf (пример для 2 backend)
hclprovider "aws" {
  region = "us-east-1"  # ваш регион
}

provider "aws" {
  alias  = "backend1"
  region = "us-east-1"
  assume_role {
    role_arn = var.backend_accounts[0].role_arn
  }
}

provider "aws" {
  alias  = "backend2"
  region = "us-east-1"
  assume_role {
    role_arn = var.backend_accounts[1].role_arn
  }
}
main.tf
hclmodule "vpc_peering" {
  for_each = { for acc in var.backend_accounts : acc.name_suffix => acc }

  source  = "cloudposse/vpc-peering-multi-account/aws"
  version = "~> 0.23"

  providers = {
    aws.requester = aws
    aws.accepter  = aws[each.value.name_suffix]
  }

  name      = "shared-to-${each.value.name_suffix}"
  requester_vpc_id = var.shared_vpc_id
  accepter_vpc_id  = each.value.vpc_id

  auto_accept_peering                     = true
  requester_allow_remote_vpc_dns_resolution = true
  accepter_allow_remote_vpc_dns_resolution  = true
}
terraform.tfvars (пример)
hclshared_vpc_id = "vpc-0abcd1234"

backend_accounts = [
  {
    account_id  = "111111111111"
    vpc_id      = "vpc-12345678"
    role_arn    = "arn:aws:iam::111111111111:role/VPCPeeringRole"
    name_suffix = "backend1"
  },
  {
    account_id  = "222222222222"
    vpc_id      = "vpc-abcdef12"
    role_arn    = "arn:aws:iam::222222222222:role/VPCPeeringRole"
    name_suffix = "backend2"
  }
]
Запуск
Bashcd infra/vpc-peering
terraform init
terraform apply
После peering

Security Groups:
RDS SG (Shared): Inbound 5432 от Lambda SG (Backend).
Lambda SG (Backend): Outbound 5432 к RDS SG.

Lambda: Включить VPC (Backend VPC + private subnets + соответствующая SG).

Готово! Lambda теперь может подключаться к RDS по приватному endpoint.
