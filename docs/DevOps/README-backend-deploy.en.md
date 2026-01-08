# Backend (AWS Lambda Microservices) Deployment in the Educational Project

This document describes deploying microservices on AWS Lambda in the multi-account architecture.  
Each microservice is a separate Lambda function (or group), deployed in its **Backend Account**.  
Integration with API Gateway in **Shared Services Account** via cross-account permissions.

## Prerequisites
- Microservice code (e.g., Node.js/Python with handler, package.json/requirements.txt).
- AWS CLI installed.
- Access to Backend and Shared Accounts.
- API Gateway already created in Shared Account.
- Use Serverless Framework or AWS SAM (SAM recommended for AWS-native).

## Infrastructure Setup (in Backend Account)

### Option 1: AWS Console (quick)
1. **Create Lambda Function**
   - Name: `my-microservice-function`.
   - Runtime: Node.js 20 / Python 3.12.
   - Upload code as ZIP (or use ECR for containers).
   - Env vars: if needed (DB_URL, secrets).

2. **IAM Role for Lambda**
   - Create role with basic execution + required policies (e.g., RDS access).
   - Add trust policy for cross-account: allow Shared Account to assume/invoke.

3. **Cross-account Permission**
   - Add permission on Lambda for API Gateway (principal: apigateway.amazonaws.com, source-arn from Shared).

### Option 2: Terraform (recommended)
Example for one microservice:
```hcl
module "lambda_microservice" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "~> 7.0"

  function_name = "my-microservice"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  source_path   = "../services/my-service"

  environment_variables = {
    DB_HOST = "rds-endpoint"
  }

  attach_policies = true
  policies = ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
}
Cross-Account Integration with API Gateway
In Backend Account:

Add permission:Bashaws lambda add-permission --function-name my-microservice \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:region:shared-account-id:api-id/*" \
  --profile backend

In Shared Account: Integrate in API Gateway (see API Gateway guide).
Manual Deployment
Bash# For SAM: in services/my-service/
sam build
sam deploy --guided

# Or Serverless
sls deploy --aws-profile backend
Automated Deployment with GitHub Actions
File .github/workflows/deploy-microservice.yml (adapt per service):
YAMLname: Deploy Lambda Microservice

on:
  push:
    branches: [ main ]
    paths: [ 'services/my-service/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup SAM
        uses: aws-actions/setup-sam@v2

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::BACKEND_ACCOUNT_ID:role/GitHubActions-LambdaDeploy
          aws-region: us-east-1

      - name: Build and Deploy
        working-directory: services/my-service
        run: |
          sam build
          sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
Tips

Local test: sam local invoke.
Logs: CloudWatch in Backend Account.
Costs: Nearly free in Free Tier (1M requests/month).
