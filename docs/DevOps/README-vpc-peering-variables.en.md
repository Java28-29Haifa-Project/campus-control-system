# Terraform Module for VPC Peering with Variable Definitions (variables.tf)

To make the configuration **scalable and convenient** for multiple backend accounts, add a **variables.tf** file with variable definitions.  
This allows centralized management of the backend accounts list (via tfvars file or GitHub Actions variables).

Current Cloud Posse module version as of January 2026: **~> 0.23.0** (or higher — check registry.terraform.io).

## Folder structure infra/vpc-peering/
- provider.tf     
- variables.tf    (new file with definitions)
- main.tf         (module call with for_each loop)
- terraform.tfvars (optional, example values)

### variables.tf (new file)
```hcl
variable "backend_accounts" {
  description = "List of backend accounts for VPC Peering with Shared Services"
  type = list(object({
    account_id     = string
    vpc_id         = string
    role_arn       = string
    name_suffix    = string
    allow_dns_resolution = optional(bool, true)
  }))
  default = []
}

variable "shared_vpc_id" {
  description = "VPC ID in Shared Services Account"
  type        = string
}

variable "shared_region" {
  description = "Shared Services region (usually us-east-1)"
  type        = string
  default     = "us-east-1"
}

variable "namespace" {
  description = "Namespace for tags (cloudposse label)"
  type        = string
  default     = "myproject"
}

variable "stage" {
  description = "Stage/environment (prod/staging/dev)"
  type        = string
  default     = "prod"
}
main.tf (updated with for_each)
hclmodule "vpc_peering" {
  for_each = { for acc in var.backend_accounts : acc.name_suffix => acc }

  source  = "cloudposse/vpc-peering-multi-account/aws"
  version = "0.23.0"

  providers = {
    aws.requester = aws
    aws.accepter  = aws[each.value.name_suffix]  # Dynamic alias (see provider.tf)
  }

  namespace = var.namespace
  stage     = var.stage
  name      = "shared-to-${each.value.name_suffix}"

  requester_vpc_id                          = var.shared_vpc_id
  requester_allow_remote_vpc_dns_resolution = each.value.allow_dns_resolution

  accepter_vpc_id                            = each.value.vpc_id
  accepter_allow_remote_vpc_dns_resolution  = each.value.allow_dns_resolution

  tags = {
    Project = "my-educational-project"
  }
}
provider.tf (example with aliases)
hclprovider "aws" {
  region = var.shared_region
}

# Example for backend1
provider "aws" {
  alias  = "backend1"
  region = var.shared_region
  assume_role {
    role_arn = var.backend_accounts[0].role_arn  # Or hardcode if few
  }
}
# Add similar for others
terraform.tfvars (example)
hclshared_vpc_id = "vpc-0abcd1234efgh5678"

backend_accounts = [
  {
    account_id     = "111111111111"
    vpc_id         = "vpc-1234567890abcdef0"
    role_arn       = "arn:aws:iam::111111111111:role/VPCPeeringRole"
    name_suffix    = "backend1"
  },
  {
    account_id     = "222222222222"
    vpc_id         = "vpc-abcdef1234567890"
    role_arn       = "arn:aws:iam::222222222222:role/VPCPeeringRole"
    name_suffix    = "backend2"
  }
]
Benefits

Add new backend — just append to the list.
Centralized management from Shared Account.
Easy CI/CD integration.

Run:
Bashterraform init
terraform plan
terraform apply
