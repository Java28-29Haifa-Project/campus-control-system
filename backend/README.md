# EOSM Gateway

**EOSM Gateway** is an Express.js–based API Gateway that serves as
the backend entry point for the EOSM microservices architecture. 
It is designed to run locally for development and inside AWS ECS Fargate behind 
AWS API Gateway for cloud deployment.

## Core Responsibilities
- **Request routing** to backend services
- **Validation and filtering** of incoming requests
- **Service abstraction** (currently mocked, transitioning to AWS Lambda)
- **Single entry point** for frontend clients


## Status

## Current Status
- Express.js server implemented with TypeScript
- Health check endpoint implemented
- Requests endpoint with filtering support
- Architecture defined (API Gateway → VPC Link → ALB → ECS)
-️ Authentication, authorization, and real Lambda integration are pending

## Architecture Overview
### Traffic Flow 
`Internet` → `AWS API Gateway (HTTP API)` → `VPC Link` → `Internal ALB` → `ECS Fargate (Node.js)` → `AWS Lambda` → `External DBs`


- **Public Entry:** API Gateway handles the public-facing endpoint and throttling.
- **Security:** VPC Link and Internal ALB ensure the ECS tasks are not exposed to the public internet.
- **Service Logic:** Business logic resides in Lambda services (mocked during current phase).

## Technology Stack
- **Node.js** v22.20.0
- **Express.js** & **TypeScript**
- **AWS Infrastructure:** API Gateway, ECS Fargate, ALB, Lambda
- **Package Manager:** npm

## Prerequisites
- Node.js v22.20.0
- npm
- (Optional) Docker & AWS CLI

## Installation
```bash
cd backend/gateway
npm install
```
## Running

Development mode (rimraf, tsc):
```bash
npm run dev
```

## Endpoints

### Health Check
```
GET /health
Response(200): { "status": "ok" }
```
### Get Requests
```
GET /requests
Optional query params:
?status=new | in_service | rejected | done
Response(200):
[
  {
    "requestId": "req0",
    "requestNumber": "REQ-0",
    "category": "electrical",
    "subject": "subject0",
    "userReportedPriority": "urgent",
    "status": "new",
    "createdAt": "2025-01-01T10:25:00Z"
  }
]



```

### API Documentation

For detailed API information, see the [API Documentation](docs/API-DOCUMENTATION.md).


### AWS & Deployment Notes
- CORS: Expected to be configured at the API Gateway level.
- Networking: The Express gateway does not expose itself publicly; all traffic is routed via the Internal ALB.

### TODO
- //TODO production.json
- //TODO test
- //TODO error handling


## Next Steps

1. Use shared AWS credentials - ?
2. Implement authentication middleware
3. Add remaining API endpoints
4. Replace stub service with real AWS Lambda invocation
5. Add comprehensive tests
6. Add role-based access
7. Finalize production.json and environment-specific configs
8. Add structured logging and improved error handling.
