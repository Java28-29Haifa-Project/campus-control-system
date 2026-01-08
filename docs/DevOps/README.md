# Educational Project: Serverless Application on AWS (React + Lambda + API Gateway + PostgreSQL)

## Overview

This project implements a modern serverless architecture on AWS using a multi-account strategy to isolate work between different teams.

### Components
- **Frontend**: React Single Page Application hosted on Amazon S3 + CloudFront (CDN, HTTPS).
- **Backend**: Microservices implemented as AWS Lambda functions (serverless).
- **API Layer**: Amazon API Gateway — single entry point routing requests to Lambda functions.
- **Database**: Amazon RDS for PostgreSQL (fully managed relational database).
- **Authentication** (optional): Amazon Cognito.

### Multi-Account Structure (AWS Best Practices)
- **Shared Services Account** — central account containing:
  - Amazon API Gateway
  - S3 bucket for static website hosting
  - CloudFront distribution
  - RDS PostgreSQL instance
  - Cognito User Pool (if authentication is required)
- **Frontend Account** — team responsible for the React application.
- **Backend Accounts** — one account per microservices team (own Lambda functions).

Benefits:
- Resource and responsibility isolation
- Enhanced security (least privilege principle)
- Independent deployment of each component
- Clear billing separation

### Cross-Account Integration
- API Gateway in the shared account invokes Lambda functions in backend accounts via cross-account IAM roles.
- Frontend accesses the S3 bucket using bucket policies.
- RDS access is controlled via Security Groups (and optionally VPC peering).

### DevOps Approach
- **Infrastructure as Code**: Terraform or AWS CloudFormation.
- **CI/CD**: AWS CodePipeline + CodeBuild (or GitHub Actions with cross-account role assumption).
- Each team deploys their component independently via dedicated pipelines.
- Separate staging and production environments.

### Cost Optimization
The architecture is designed to minimize costs:
- Heavy use of AWS Free Tier (RDS db.t3.micro, S3, Lambda, etc.).
- RDS PostgreSQL on db.t3.micro is free under Free Tier (750 hours/month + 20 GB storage).
- Lambda and API Gateway are pay-per-use — nearly free at educational workloads.

### Getting Started
1. Create an AWS Organization and required member accounts.
2. Deploy shared resources (API Gateway, S3, CloudFront, RDS) in the Shared Services account.
3. Each team develops and deploys their part using IaC.
4. Configure cross-account permissions.
