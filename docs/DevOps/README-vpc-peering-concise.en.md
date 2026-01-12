# Concise Guide: VPC Peering for RDS (multi-account)

**Goal**: Enable private access from Lambda (Backend Accounts) to RDS PostgreSQL (Shared Services Account) via VPC Peering.

## Prerequisites
- Non-overlapping VPC CIDR blocks (e.g., Shared: `10.0.0.0/16`, Backend1: `10.1.0.0/16`, etc.).
- IAM role `VPCPeeringRole` in each account with EC2 peering/routing permissions.

## Recommended: Terraform + Cloud Posse Module

Folder: `infra/vpc-peering/`

### variables.tf
```hcl
variable "shared_vpc_id" {
  type        = string
  description = "VPC ID in Shared Services Account"
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
provider.tf (example for 2 backends)
hclprovider "aws" {
  region = "us-east-1"
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

  name             = "shared-to-${each.value.name_suffix}"
  requester_vpc_id = var.shared_vpc_id
  accepter_vpc_id  = each.value.vpc_id

  auto_accept_peering                     = true
  requester_allow_remote_vpc_dns_resolution = true
  accepter_allow_remote_vpc_dns_resolution  = true
}
terraform.tfvars (example)
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
Run
Bashcd infra/vpc-peering
terraform init
terraform apply
After Peering

Security Groups:
RDS SG (Shared): Inbound 5432 from Lambda SG (Backend).
Lambda SG (Backend): Outbound 5432 to RDS SG.

Lambda: Enable VPC (Backend VPC + private subnets + proper SG).

Done! Lambda can now privately connect to RDS.
