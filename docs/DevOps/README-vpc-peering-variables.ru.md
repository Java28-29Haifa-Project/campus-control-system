# Terraform модуль для VPC Peering с переменными (variables.tf)

Чтобы сделать конфигурацию **масштабируемой и удобной** для нескольких backend аккаунтов, добавьте файл **variables.tf** с определениями переменных.  
Это позволит централизованно управлять списком backend аккаунтов (например, через tfvars файл или GitHub Actions variables).

Актуальная версия модуля Cloud Posse на январь 2026: **~> 0.23.0** (или выше — проверьте на registry.terraform.io).

## Структура папки infra/vpc-peering/
- provider.tf     (провайдеры с assume_role)
- variables.tf    (определения переменных — этот файл)
- main.tf         (вызов модуля в цикле for_each)
- terraform.tfvars (опционально, пример значений)

### variables.tf (новый файл)
```hcl
variable "backend_accounts" {
  description = "Список backend аккаунтов для VPC Peering с Shared Services"
  type = list(object({
    account_id     = string               # ID backend аккаунта
    vpc_id         = string               # VPC ID в backend аккаунте
    role_arn       = string               # ARN роли для assume_role в backend
    name_suffix    = string               # Суффикс для имени peering (например, backend1)
    allow_dns_resolution = optional(bool, true)  # DNS resolution (по умолчанию true)
  }))
  default = []  # Заполните в terraform.tfvars или через -var
}

variable "shared_vpc_id" {
  description = "VPC ID в Shared Services Account"
  type        = string
}

variable "shared_region" {
  description = "Регион Shared Services (обычно us-east-1)"
  type        = string
  default     = "us-east-1"
}

variable "namespace" {
  description = "Namespace для тегов (cloudposse label)"
  type        = string
  default     = "myproject"
}

variable "stage" {
  description = "Stage/environment (prod/staging/dev)"
  type        = string
  default     = "prod"
}
main.tf (обновлённый с for_each)
hcl# Динамические провайдеры для каждого backend (если много — можно генерировать)
# Для примера — статически для 2-3, или используйте map в providers

module "vpc_peering" {
  for_each = { for acc in var.backend_accounts : acc.name_suffix => acc }

  source  = "cloudposse/vpc-peering-multi-account/aws"
  version = "0.23.0"  # или новее

  providers = {
    aws.requester = aws                    # Shared Account
    aws.accepter  = aws[each.value.name_suffix]  # Динамический алиас (см. ниже)
  }

  namespace = var.namespace
  stage     = var.stage
  name      = "shared-to-${each.value.name_suffix}"

  requester_vpc_id                          = var.shared_vpc_id
  requester_allow_remote_vpc_dns_resolution = each.value.allow_dns_resolution

  accepter_vpc_id                            = each.value.vpc_id
  accepter_allow_remote_vpc_dns_resolution  = each.value.allow_dns_resolution

  # Если нужно управлять из 3-го аккаунта — добавьте requester_aws_assume_role_arn и accepter_aws_assume_role_arn
  tags = {
    Project = "my-educational-project"
  }
}
provider.tf (с динамическими алиасами — пример для 2 backend)
Если backend много — лучше использовать отдельный модуль или скрипт для генерации. Для учебного проекта хватит статически:
hclprovider "aws" {
  region  = var.shared_region
  # profile или default для Shared Account
}

# Пример для backend1
provider "aws" {
  alias  = "backend1"
  region = var.shared_region
  assume_role {
    role_arn = "arn:aws:iam::${var.backend_accounts[0].account_id}:role/VPCPeeringRole"
  }
}

# Добавьте аналогично для backend2 и т.д., или используйте count если фиксированное число
terraform.tfvars (пример заполнения)
hclshared_vpc_id = "vpc-0abcd1234efgh5678"

backend_accounts = [
  {
    account_id     = "111111111111"
    vpc_id         = "vpc-1234567890abcdef0"
    role_arn       = "arn:aws:iam::111111111111:role/VPCPeeringRole"
    name_suffix    = "backend1"
    allow_dns_resolution = true
  },
  {
    account_id     = "222222222222"
    vpc_id         = "vpc-abcdef1234567890"
    role_arn       = "arn:aws:iam::222222222222:role/VPCPeeringRole"
    name_suffix    = "backend2"
    allow_dns_resolution = true
  }
]
Преимущества такого подхода

Добавляете новый backend — просто дописываете в список backend_accounts.
Все peering управляются из одного места (Shared Account).
Легко интегрировать в CI/CD.

Запустите:
Bashterraform init
terraform plan
terraform apply
