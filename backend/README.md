# EOSM Gateway

**EOSM Gateway** is an Express.js-based API Gateway that serves as
the backend entry point for the EOSM microservices architecture.
It is designed to run locally for development and inside AWS ECS Fargate behind
AWS API Gateway for cloud deployment.

## Core Responsibilities
- **Request routing** to backend services
- **Authentication and authorization** via JWT tokens
- **Role-based access control** (USER, SUPPORT, ENGINEER, ADMIN)
- **Validation and filtering** of incoming requests
- **Service abstraction** via Lambda SDK interfaces
- **Single entry point** for frontend clients
- **Token management** with Redis-based blacklist

## Current Status
- Express.js server implemented with TypeScript
- JWT authentication system with access and refresh tokens
- HTTP-only cookie-based token delivery
- Redis Cloud integration for token blacklist
- Role-based authorization middleware
- Complete endpoint coverage: authentication, requests, incidents, monitoring, audit
- AWS deployment: API Gateway → VPC Link → Internal ALB → ECS Fargate
- Lambda SDK interfaces with mock implementations
- Comprehensive health check endpoints for all services
- Rate limiting and request throttling at API Gateway level
- CloudWatch logging enabled for monitoring

## Architecture Overview

### Traffic Flow
```
Internet → AWS API Gateway (HTTP API) → VPC Link → Internal ALB → ECS Fargate (Node.js) → Lambda Mocks → Redis Cloud
```

### Components

**AWS API Gateway (HTTP API)**
- Public-facing endpoint: `https://7vsdxftpoc.execute-api.us-east-1.amazonaws.com`
- Rate limiting: 5 requests/second, 10 burst (for now)
- CloudWatch logging enabled
- Routes all traffic to internal infrastructure via VPC Link

**VPC & Networking**
- VPC (10.0.0.0/16)
- Public subnets in us-east-1a and us-east-1b
- Internal Application Load Balancer

**ECS Fargate**
- Cluster: `express-gateway-cluster`
- Task: 0.25 vCPU, 512 MB memory
- Docker image stored in Amazon ECR
- Auto-scaling capability (currently 1 task)

**Security Layer**
- JWT-based authentication with access tokens (15 min TTL) and refresh tokens (7 day TTL)
- HTTP-only, Secure, SameSite=strict cookies
- Redis-based token blacklist with automatic TTL management
- Role-based authorization: USER, SUPPORT, ENGINEER, ADMIN
- Middleware validation on all protected endpoints

**Lambda Services**
- Currently mocked via SDK interfaces
- Five service domains: Auth, Request, Incident, Monitoring, Audit

**External Services**
- Redis Cloud: Token blacklist storage
- Future: PostgreSQL/MongoDB for persistent data

## Technology Stack

**Backend**
- Node.js v22.20.0
- Express.js & TypeScript
- JSON Web Tokens (jsonwebtoken)
- Redis client for blacklist management
- Cookie-parser for HTTP-only cookies

**AWS Infrastructure**
- API Gateway (HTTP API)
- ECS Fargate
- Application Load Balancer (internal)
- VPC Link
- Elastic Container Registry (ECR)
- CloudWatch Logs
- AWS Lambda (planned)

**Security**
- JWT authentication
- Redis Cloud (token blacklist)
- HTTP-only cookies
- Role-based access control

**Development Tools**
- TypeScript
- npm
- Docker
- AWS CLI

## Prerequisites
- Node.js v22.20.0
- npm
- Docker (for containerization)
- AWS CLI (for deployment)
- Redis Cloud account (for production)

## Installation
```bash
cd backend/gateway
npm install
```

## Environment Variables

Create a `.env` file in the `backend/gateway` directory:
```env
# JWT Configuration
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Redis Configuration
REDIS_HOST=your-redis-host.redis-cloud.com
REDIS_PORT=12345
REDIS_PASSWORD=your-redis-password

# Server Configuration
PORT=8080
NODE_ENV=development
```

**Note:** For AWS ECS deployment, environment variables are configured in the task definition JSON file, not via `.env`.

## Running Locally

### Development Mode
```bash
npm run dev
```

### Build and Run
```bash
npm run build
node build/app.js
```

### Docker
```bash
docker build -t express-gateway .
docker run -p 8080:8080 --env-file .env express-gateway
```

## API Endpoints

For complete API documentation including authentication flow, request/response examples, and role-based access control, see [API Documentation](docs/API-DOCUMENTATION.md).

### Public Endpoints
- `GET /health` - Gateway health check
- `GET /health/lambdas/{service}` - Service-specific health checks
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh

### Protected Endpoints (Require Authentication)
- `GET /auth/me` - Get current user information
- `POST /auth/logout` - Logout and blacklist token
- `GET /requests` - Get requests (role-filtered)
- `GET /incidents` - Get incidents (SUPPORT+ only)
- `GET /monitoring/logs` - Get system logs (ADMIN only)
- `GET /monitoring/alarms` - Get alarms (ADMIN only)
- `POST /audit` - Send audit event (ADMIN only)

### Test Users
- USER: `user@test.org` / `password123`
- SUPPORT: `support@test.org` / `support123`
- ENGINEER: `engineer@test.org` / `engineer123`
- ADMIN: `admin@test.org` / `admin123`



## Authentication Flow

1. **Login:** Client sends credentials to `/auth/login`
2. **Token Generation:** Server creates access token (15 min) and refresh token (7 days)
3. **Cookie Storage:** Tokens stored in HTTP-only, Secure, SameSite=strict cookies
4. **Authenticated Requests:** Browser automatically sends cookies with each request
5. **Token Validation:** Middleware verifies access token on protected routes
6. **Token Refresh:** Client calls `/auth/refresh` when access token expires
7. **Logout:** Client calls `/auth/logout`, refresh token added to Redis blacklist

## Role-Based Access Control

| Endpoint Category | USER | SUPPORT | ENGINEER | ADMIN |
|-------------------|------|---------|----------|-------|
| Authentication    | Yes  | Yes     | Yes      | Yes   |
| Requests (own)    | Yes  | Yes     | Yes      | Yes   |
| Requests (all)    | No   | Yes     | Yes      | Yes   |
| Incidents         | No   | Yes     | Yes      | Yes   |
| Monitoring        | No   | No      | No       | Yes   |
| Audit             | No   | No      | No       | Yes   |

## AWS Deployment

### Prerequisites
- AWS account with free tier
- AWS CLI configured with IAM user credentials
- Docker installed locally
- Redis Cloud account

### Deployment Steps

1. **Build and push Docker image:**
```bash
cd backend/gateway
npm run build
docker build -t express-gateway .
docker tag express-gateway:latest 757434564846.dkr.ecr.us-east-1.amazonaws.com/express-gateway:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 757434564846.dkr.ecr.us-east-1.amazonaws.com
docker push 757434564846.dkr.ecr.us-east-1.amazonaws.com/express-gateway:latest
```

2. **Update task definition with environment variables:**
```bash
aws ecs register-task-definition --cli-input-json file://task-definition-with-env.json --region us-east-1
```

3. **Deploy to ECS:**
```bash
aws ecs update-service --cluster express-gateway-cluster --service express-gateway-service --force-new-deployment --region us-east-1
```

4. **Monitor deployment:**
```bash
aws ecs describe-services --cluster express-gateway-cluster --services express-gateway-service --region us-east-1
aws logs tail /ecs/express-gateway --follow --region us-east-1
```


## Testing

### Local Manual Testing
Run the comprehensive test suite:
```bash
cd tests
./local-test-api-v2.sh
```

### Postman Collection
Import `Express-Gateway-API.postman_collection.json` from the `docs/` directory for interactive testing.

### Redis Monitoring
Connect to Redis Cloud to view blacklisted tokens:
```bash
redis-cli -h your-host.redis-cloud.com -p 12345 -a your-password
KEYS blacklist:*
MONITOR
```

## Security Considerations

**Implemented:**
- JWT-based authentication with short-lived access tokens
- Refresh token rotation on use
- HTTP-only cookies (XSS protection)
- SameSite=strict (CSRF protection)
- Secure flag for HTTPS-only transmission
- Redis-based token blacklist with automatic TTL
- Role-based authorization middleware
- Environment variable configuration for secrets
- Internal ALB (not internet-facing)
- VPC isolation

**Things to think about:**
- Rate limiting per user/IP
- Request payload validation
- SQL injection prevention
- HTTPS enforcement
- Security headers (Helmet.js)
- API key validation for service-to-service communication

## Monitoring and Logging

**CloudWatch Integration:**
- ECS task logs: `/ecs/express-gateway`
- API Gateway logs: `/aws/apigateway/express-gateway-api`
- Log format includes request IDs and error messages

**Health Checks:**
- Gateway: `GET /health`
- Individual services: `GET /health/lambdas/{service}`

## Next Steps

**Database Integration**
- Replace mock users with PostgreSQL/MongoDB
- Implement user registration endpoint
- Add password hashing with bcrypt
- Store user sessions

**Real Lambda Services**
- Deploy actual Lambda functions for each service
- Update SDK implementations to call real Lambdas
- Configure Lambda VPC access
- Set up Lambda-to-database connections

** Enhanced Security**
- Add Helmet.js for security headers ?
- Implement rate limiting per user
- Add request payload validation with Joi/Zod
- Enable HTTPS-only mode

**Testing & Quality**
- Jest unit tests for all controllers
- Integration tests for authentication flow
- Load testing with Artillery/k6
- CI/CD pipeline with GitHub Actions ?

**Production Readiness**
- Custom domain with Route53
- SSL certificate with ACM ?
- Multi-AZ deployment for high availability ???
- Automated backups for Redis
- Alerting with SNS/CloudWatch Alarms

## License

See LICENSE file for details.
