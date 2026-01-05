# AWS Lambda Services

## Overview
Serverless backend implemented using AWS Lambda and API Gateway.

## Architecture
- API Gateway → Lambda
- Shared backend module
- SNS for notifications
- CloudWatch for logs and alarms

## Services Overview
List and short description:

- auth-service
- request-service
- incident-service
- monitoring-service
- audit-service
- notification-service

## Service Responsibilities
Short subsection per service.

## API Overview
High-level REST structure (without full specs):
- /auth
- /requests
- /incidents
- /monitoring

## Authentication Flow
- Login
- JWT issuance
- Authorization via roles

## Error Handling
Standard error response format.

## Deployment
- AWS environment
- Stages (dev / prod)
- Configuration approach

## Logging & Monitoring
- CloudWatch logs
- Alarms
- Audit logs

## Local Development
How to test Lambdas locally (if applicable).
