# Terraform Module for Multi-Account VPC Peering

For your educational project with **Shared Services Account** (RDS) and multiple **Backend Accounts** (Lambda), the recommended Terraform module is **cloudposse/vpc-peering-multi-account/aws**.

This module:
- Creates VPC Peering Connection between VPCs in different accounts.
- Automatically accepts the connection.
- Adds routes to route tables (for all VPC CIDR blocks).
- Supports management from a third account via assume_role.
- Supports DNS resolution (optional).

Source: https://github.com/cloudposse/terraform-aws-vpc-peering-multi-account  
Registry: https://registry.terraform.io/modules/cloudposse/vpc-peering-multi-account/aws/latest

## Why this module?
- Proven and maintained (Cloud Posse is known for high-quality modules).
- Handles cross-account complexities automatically (accepter, routes).
- Easily scales to multiple backend accounts (call the module multiple times).

## Preparation
1. In each account, create an IAM Role for Terraform (e.g., `VPCPeeringRole`):
   - Trust policy: allows assume_role from the account running Terraform (usually Shared or DevOps).
   - Permissions: `ec2:DescribeVpcs`, `ec2:CreateVpcPeeringConnection`, `ec2:AcceptVpcPeeringConnection`, `ec2:CreateRoute`, etc. (full list in module docs).

2. Ensure VPC CIDR blocks do not overlap (e.g., Shared: 10.0.0.0/16, Backend1: 10.1.0.0/16).

## Example Usage (in Shared Services Account)

Create folder `infra/vpc-peering/`.

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

# Main provider — Shared Account
provider "aws" {
  region  = "us-east-1"
  profile = "shared"
}

# Providers for backend accounts (assume_role)
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
main.tf (peering to multiple backends)
hclmodule "peering_to_backend1" {
  source  = "cloudposse/vpc-peering-multi-account/aws"
  version = "0.23.0"  # check latest version!

  providers = {
    aws.requester = aws          # Shared (requester)
    aws.accepter  = aws.backend1 # Backend1 (accepter)
  }

  name                        = "shared-to-backend1"
  requester_vpc_id            = aws_vpc.shared.id
  accepter_vpc_id             = "vpc-12345678"  # VPC ID in Backend1

  auto_accept_peering = true

  requester_allow_remote_vpc_dns_resolution = true
  accepter_allow_remote_vpc_dns_resolution  = true

  tags = {
    Project = "my-educational-project"
  }
}

# Repeat for backend2
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
Execution
Bashcd infra/vpc-peering
terraform init
terraform plan
terraform apply
The module automatically:

Creates the peering connection.
Accepts it in the backend account.
Adds routes to all route tables.

Tips

If VPCs are created by Terraform — use outputs to pass VPC IDs.
For more control, specify requester_route_table_tags and accepter_route_table_tags.
After peering, configure Security Groups (as in previous guide).
Test connection from Lambda to RDS endpoint.

This is a best practice approach for multi-account AWS environments.
