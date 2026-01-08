# RDS PostgreSQL Deployment in the AWS Educational Project

RDS is the database in **Shared Services Account**.  
Access from Lambda in backend accounts via security groups/VPC.

## Prerequisites
- AWS CLI/Terraform.
- VPC in Shared Account (if not default).

## Infrastructure Setup

### Option 1: AWS Console
1. **Create DB Instance**
   - Engine: PostgreSQL (16+).
   - Class: db.t3.micro (Free Tier).
   - Storage: 20 GB gp3.
   - Public: No for prod.
   - Username/password.

2. **Security Group**
   - Inbound from backend VPCs (5432).

### Option 2: Terraform
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
  password = var.db_password

  publicly_accessible = false
  vpc_security_group_ids = [aws_security_group.rds.id]
}
Cross-Account Access

For Lambda: VPC peering between accounts.
Or IAM DB Auth.

Manual Deployment
Bashterraform apply
Automated Deployment
Workflow for infra:
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
Tips

Enable automatic backups.
Connect: psql -h endpoint -U admin.
Costs: Free Tier.
