# API Gateway Deployment in the AWS Educational Project

API Gateway is the central entry point, hosted in **Shared Services Account**.  
It routes requests to Lambda in backend accounts, adds auth, throttling.

## Prerequisites
- Lambda functions in backend accounts with permissions.
- AWS CLI/Terraform.
- Optional: Cognito for auth.

## Infrastructure Setup

### Option 1: AWS Console
1. **Create REST API**
   - Type: HTTP API (cheaper) or REST API (more features).
   - Add methods (GET/POST) and paths (/users, /orders).

2. **Lambda Integration**
   - For each route: Integration — Lambda proxy.
   - ARN: from backend account (cross-account supported).

3. **Deploy API**
   - Create stage (prod/staging).
   - Get invoke URL.

### Option 2: Terraform
```hcl
module "api_gateway" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "~> 5.0"

  name          = "my-project-api"
  protocol_type = "HTTP"

  integrations = {
    "GET /users" = {
      lambda_arn = "arn:aws:lambda:region:backend-account-id:function:my-users-lambda"
    }
  }

  domain_name = "api.myproject.com"  # optional
}
Cross-Account Setup

Lambdas in backend have permissions (see backend guide).

Manual Deployment
Bash# For CDK or Terraform
terraform apply
Automated Deployment
In GitHub Actions: Update routes after Lambda deploy via CLI or Terraform.
Example workflow:
YAMLname: Update API Gateway

on:
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::SHARED_ID:role/GitHubActions-APIDeploy
          aws-region: us-east-1

      - name: Deploy API
        run: terraform apply -auto-approve
Tips

Enable CORS for frontend.
Add Cognito authorizer for auth.
Monitor with CloudWatch.
