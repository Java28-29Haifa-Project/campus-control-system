# EOSM Gateway

**EOSM Gateway** is an Express.js-based API Gateway that serves as
the backend entry point for the EOSM microservices architecture.
It implements a Backend for Frontend (BFF) pattern for optimal performance,
with direct database reads and Lambda-based writes.

## Core Responsibilities
- **Request routing** to backend services
- **Authentication and authorization** via JWT tokens
- **Role-based access control** (USER, SUPPORT, ENGINEER, ADMIN)
- **Validation and business logic** enforcement
- **Direct database reads** for optimal performance (BFF pattern)
- **Lambda-orchestrated writes** for separation of concerns
- **Request number generation** and validation
- **Single entry point** for frontend clients
- **Token management** with Redis-based blacklist

## Current Status
-  Express.js server implemented with TypeScript
-  JWT authentication system with access and refresh tokens
-  HTTP-only cookie-based token delivery
-  Redis Cloud integration for token blacklist
-  Role-based authorization middleware
-  Complete endpoint coverage: authentication, requests, incidents, monitoring, audit
-  BFF pattern implemented: Direct DB reads (3x faster), Lambda writes
-  Custom domain with HTTPS: `eosm-gateway.com`
-  AWS deployment: ALB → ECS Fargate → Neon PostgreSQL
-  Lambda integration: requests-write-lambda for write operations
-  Comprehensive health check endpoints for all services
-  CloudWatch logging enabled for monitoring
-  Production-ready security (bcrypt, token blacklist, RBAC)

## Architecture Overview



### Components

**Route 53 + ACM**
- Custom domain: `eosm-gateway.com`
- SSL/TLS certificate (RSA 2048-bit)
- DNS management with A records
- Auto-renewal enabled

**Application Load Balancer**
- Public-facing HTTPS endpoint
- SSL termination at load balancer
- HTTP to HTTPS redirect (301)
- Health checks for ECS tasks
- DNS: express-gateway-alb-201060984.us-east-1.elb.amazonaws.com

**VPC & Networking**
- VPC (10.0.0.0/16)
- Public subnets in us-east-1a and us-east-1b
- Security groups for access control

**ECS Fargate**
- Cluster: `express-gateway-cluster`
- Task: 0.25 vCPU, 512 MB memory
- Docker image stored in Amazon ECR
- Auto-scaling capability (currently 1 task)
- Container port: 8080

**AWS Lambda**
- Function: `requests-write-lambda`
- Runtime: Node.js 20.x
- Memory: 512 MB, Timeout: 30 seconds
- Purpose: Execute database write operations only
- Invoked by Express Gateway via AWS SDK

**Security Layer**
- JWT-based authentication with access tokens (15 min TTL) and refresh tokens (7 day TTL)
- HTTP-only, Secure, SameSite=strict cookies
- Redis-based token blacklist with automatic TTL management
- Role-based authorization: USER, SUPPORT, ENGINEER, ADMIN
- Middleware validation on all protected endpoints
- Bcrypt password hashing (cost factor: 10)

**External Services**
- **Neon PostgreSQL**: Serverless primary database
- **Redis Cloud**: Token blacklist storage and rate limiting

## Technology Stack

**Backend**
- Node.js v22.20.0
- Express.js & TypeScript
- JSON Web Tokens (jsonwebtoken)
- Redis client for blacklist management
- Cookie-parser for HTTP-only cookies
- PostgreSQL client (pg) for direct database access
- AWS SDK for Lambda invocation

**AWS Infrastructure**
- Route 53 (DNS management)
- ACM (SSL/TLS certificates)
- Application Load Balancer
- ECS Fargate (container orchestration)
- AWS Lambda (write operations)
- VPC (network isolation)
- Elastic Container Registry (ECR)
- CloudWatch Logs

**Database & Cache**
- Neon PostgreSQL (serverless)
- Redis Cloud (token blacklist)

**Security**
- JWT authentication
- Bcrypt password hashing
- HTTP-only cookies
- Role-based access control (RBAC)
- SSL/TLS encryption

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
- Neon account (for database)

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

# Database Configuration
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# AWS Configuration (for Lambda invocation)
AWS_REGION=us-east-1
REQUESTS_LAMBDA_NAME=requests-write-lambda

# Server Configuration
PORT=8080
NODE_ENV=development
FRONTEND_URL=https://your-frontend-url.com
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
- `GET /requests` - Get requests (role-filtered, **direct DB read - fast!**)
- `GET /requests/:id` - Get single request (direct DB read)
- `POST /requests` - Create request (through Lambda)
- `PATCH /requests/:id` - Update request (through Lambda)
- `GET /incidents` - Get incidents (SUPPORT+ only)
- `POST /incidents` - Create incident (SUPPORT+ only)
- `PATCH /incidents/:id` - Update incident (SUPPORT+ only)
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
2. **Password Validation:** Server uses bcrypt.compare to verify password
3. **Token Generation:** Server creates access token (15 min) and refresh token (7 days)
4. **Cookie Storage:** Tokens stored in HTTP-only, Secure, SameSite=strict cookies
5. **Authenticated Requests:** Browser automatically sends cookies with each request
6. **Token Validation:** Middleware verifies access token on protected routes
7. **Token Refresh:** Client calls `/auth/refresh` when access token expires
8. **Logout:** Client calls `/auth/logout`, refresh token added to Redis blacklist

## Security Architecture (AAA)

### Authentication

**JWT-based Authentication:**
- **Access Token** (15 minutes): Short-lived token for API requests
- **Refresh Token** (7 days): Long-lived token for obtaining new access tokens
- **Storage**: HTTP-only cookies (prevents XSS attacks)
- **Signing**: Separate secrets for access and refresh tokens

**Password Security:**
- Bcrypt hashing with salt
- 60-character hash storage
- Passwords never stored in plain text
- Validation on login with bcrypt.compare

**Token Flow:**
```
1. User Login → Express Gateway
2. Validate credentials (bcrypt.compare)
3. Generate JWT tokens (access + refresh)
4. Set HTTP-only cookies
5. User makes requests with cookies
6. Middleware validates access token
7. Token expires → Use refresh token
8. Refresh token → Get new access token
9. Logout → Blacklist refresh token in Redis
```

### Authorization (What can you do?)

**Role-Based Access Control (RBAC):**

| Role | Permissions |
|------|-------------|
| **USER** | Create requests, view own requests, update own requests |
| **SUPPORT** | View all requests, update requests, create incidents, view incidents |
| **ENGINEER** | Same as SUPPORT + manage incidents |
| **ADMIN** | Full access + monitoring + audit logs |

**Middleware Chain:**
```text
Router → authMiddleware → roleMiddleware → Controller
```

**Permission Checks:**
- **Route-level**: `requireRoles(['ADMIN', 'SUPPORT'])`
- **Resource-level**: Users can only access their own data
- **Field-level**: Different roles can update different fields

| Endpoint Category | USER | SUPPORT | ENGINEER | ADMIN |
|-------------------|------|---------|----------|-------|
| Authentication    | Yes  | Yes     | Yes      | Yes   |
| Requests (GET own)| Yes  | Yes     | Yes      | Yes   |
| Requests (GET all)| No   | Yes     | Yes      | Yes   |
| Requests (POST)   | Yes  | No      | No       | No    |
| Requests (PATCH)  | Own  | All     | All      | All   |
| Incidents         | No   | Yes     | Yes      | Yes   |
| Monitoring        | No   | No      | No       | Yes   |
| Audit             | No   | No      | No       | Yes   |

### Accounting (What did you do?)

**Audit Trail:**
- All sensitive operations logged
- User actions tracked with userId, timestamp, action type
- Failed authentication attempts logged
- ADMIN-only access to audit logs

**Redis Blacklist:**
- Logged-out refresh tokens blacklisted
- Prevents token reuse after logout
- TTL matches token expiration (7 days)

## BFF Implementation Details

### Read Operations (Direct Database)
```typescript
// Express Gateway: IRequestQueryRepository
async getAllRequests(status, user) {
  // Role-based filtering at database level
  if (user.role === 'USER') {
    query += ' WHERE user_id = $1';
  }
  // Direct PostgreSQL query - FAST! (50ms)
  return pool.query(query, params);
}
```

### Write Operations (Through Lambda)
```typescript
// Express Gateway: RequestWriteService
async createRequest(input) {
  // 1. Validate input
  this.validateCreateInput(input);
  
  // 2. Generate request number
  const count = await repository.getRequestCountToday();
  const requestNumber = `REQ-${date}-${count + 1}`;
  
  // 3. Send command to Lambda
  return lambda.invoke({
    action: 'CREATE_REQUEST',
    data: { requestNumber, ...input }
  });
}

// Lambda: Simple command executor
async function createRequest(pool, data) {
  // Just execute SQL - no validation, no business logic
  return pool.query('INSERT INTO requests ...', values);
}
```

### Command Pattern

Express Gateway sends simple commands to Lambda:
- `CREATE_REQUEST` - Insert new request
- `UPDATE_REQUEST` - Update existing request
- `CREATE_INCIDENT` - Create incident with related tickets
- `UPDATE_INCIDENT` - Update incident

Lambda acts as a **stateless command executor** - no complex logic, just SQL operations.

## Database Schema

**Tables:**
- `users`: User accounts with roles and bcrypt-hashed passwords
- `requests`: Support tickets/requests
- `incidents`: Grouped critical issues
- `incident_requests`: Many-to-many relationship

**Key Columns in requests:**
- `request_id`: UUID (auto-generated via uuid_generate_v4())
- `request_number`: Human-readable ID (REQ-YYYYMMDD-XXXX)
- `user_id`: Foreign key to users
- `category`: plumbing, electrical, general
- `subject`: 10-500 characters
- `user_reported_priority`: low, medium, high, urgent
- `ai_calculated_priority`: System-calculated priority (future ML)
- `status`: new, in_service, done, rejected
- `created_at`, `updated_at`: Timestamps

## AWS Deployment

### Domain & HTTPS Setup (Completed)

**Domain:** `eosm-gateway.com`

**Steps Completed:**
1.  Domain registration (Namecheap)
2.  ACM certificate requested (`*.eosm-gateway.com`)
3.  Route 53 hosted zone created
4.  Nameservers updated in Namecheap
5.  Certificate validated via DNS (CNAME)
6.  ALB HTTPS listener configured (port 443)
7.  HTTP redirect configured (port 80 → 443)
8.  A records created (eosm-gateway.com, www.eosm-gateway.com)

**Certificate Details:**
- ARN: `arn:aws:acm:us-east-1:757434564846:certificate/9ea15bc8-da2d-4a11-b5a8-94ea04fb1858`
- Type: RSA 2048-bit
- Status: Issued 
- Expiry: February 22, 2027
- Auto-renewal: Enabled

### ECS Deployment Steps

**Prerequisites:**
- AWS account with free tier
- AWS CLI configured with IAM user credentials
- Docker installed locally
- Redis Cloud account
- Neon database configured

**Deployment Steps:**

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

### Lambda Deployment

1. **Create Lambda package:**
```bash
cd requests-write-lambda
npm install
zip -r lambda.zip index.mjs node_modules package.json
```

2. **Upload to AWS Lambda:**
- Go to Lambda console
- Create function: `requests-write-lambda`
- Runtime: Node.js 20.x
- Upload ZIP file
- Set handler: `index.handler`
- Configure environment: `DATABASE_URL`
- Set timeout: 30 seconds
- Set memory: 512 MB

3. **Add IAM permission to ECS task role:**
```bash
# Allow ECS task to invoke Lambda
aws iam put-role-policy \
  --role-name ecs-express-gateway-task-role \
  --policy-name InvokeLambda \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:us-east-1:757434564846:function:requests-write-lambda"
    }]
  }'
```

## Testing

### Local Manual Testing
Run the comprehensive test suite:
```bash
cd tests
./local-test-api-v2.sh
```

### Production Testing
Test against production endpoint:
```bash
# Test health check
curl https://eosm-gateway.com/health

# Test login
curl -X POST https://eosm-gateway.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.org","password":"password123"}' \
  -c cookies.txt

# Test authenticated endpoint
curl https://eosm-gateway.com/requests \
  -b cookies.txt
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

## Monitoring and Logging

**CloudWatch Integration:**
- ECS task logs: `/ecs/express-gateway`
- Lambda logs: `/aws/lambda/requests-write-lambda`
- ALB access logs: Enabled
- Log format includes request IDs and error messages

**Health Checks:**
- Gateway: `GET /health`
- Lambda: `GET /health/lambdas/request`
- Database: Connection pool monitoring
- Redis: Connection status

**Metrics to Monitor:**
- Response times (reads should be ~50ms, writes ~150ms)
- Error rates (4xx, 5xx)
- Lambda invocations and duration
- Database connection pool usage
- Redis memory usage

## //TODO / protocol

### Database Fixes
1.  **Password Hash Issue**: Updated all users to use proper 60-character bcrypt hashes
2.  **Auth Controller**: Migrated from mock data to direct database queries
3.  **request_id Column**: Added UUID auto-generation for primary key
4.  **ai_calculated_priority**: Added missing column for future AI features

### Lambda Integration
1.  **Permission Fix**: Added Lambda invoke policy to ECS task role
2.  **Command Pattern**: Simplified Lambda to execute write commands only
3.  **Validation**: Moved all validation from Lambda to Express Gateway
4.  **Number Generation**: Request numbers generated in Express, not Lambda


**JWT TTL**: Updated to production values (15min/7day)

## Production Checklist

### Security
-  HTTPS enabled with valid certificate
-  HTTP-only cookies for token storage
-  Bcrypt password hashing
-  Token blacklist on logout
-  Role-based access control
-  CORS configured for frontend origin
-  Rate limiting (Redis-based)
-  SQL injection prevention (parameterized queries)
-  Input validation on all endpoints

### Performance
-  BFF pattern implemented (fast reads)
-  Database connection pooling
-  Lambda optimized (write-only)
-  CloudWatch logging enabled
-  Health check endpoints

### Infrastructure
-  Custom domain with HTTPS
-  Load balancer health checks
-  ECS auto-scaling configured
-  Lambda timeout and memory optimized
-  Database hosted on Neon (serverless)
-  Redis hosted on Redis Cloud
-  IAM roles with least privilege

### Monitoring
-  CloudWatch logs for ECS
-  CloudWatch logs for Lambda
-  Health check endpoints
-  ALB access logs
- //TODO Custom metrics and dashboards
- //TODO Error alerting 

## Security Considerations

**Implemented:**
-  JWT-based authentication with short-lived access tokens
-  Refresh token rotation on use
-  HTTP-only cookies (XSS protection)
-  SameSite=strict (CSRF protection)
-  Secure flag for HTTPS-only transmission
-  Redis-based token blacklist with automatic TTL
-  Role-based authorization middleware
-  Environment variable configuration for secrets
-  Bcrypt password hashing (cost factor: 10)
-  VPC isolation
-  SSL/TLS encryption with ACM
-  IAM roles with least privilege

**Future Enhancements:**
-  Rate limiting per user/IP
-  Request payload size limits
-  Helmet.js security headers
-  API key validation for service-to-service communication
-  DDoS protection with AWS Shield
-  WAF rules for common attacks

## Next Steps

### Short-term (Completed) 
-  Custom domain with Route53
-  SSL certificate with ACM
-  BFF pattern implementation
-  Lambda integration for writes
-  Direct database reads
-  Bcrypt password hashing
-  Production deployment

### Medium-term (In Progress)
-  Comprehensive test suite (Jest)
-  CI/CD pipeline
-  Custom CloudWatch dashboards
-  Automated backups for database
-  Alerting with SNS/CloudWatch Alarms

### Long-term (Planned)
-  Multi-AZ deployment for high availability
-  API Gateway integration (rate limiting, caching)
-  Email notifications (SES)
-  File attachments (S3)
-  Real-time updates (WebSocket)
-  Analytics dashboard
-  AI-powered priority calculation
-  Multi-tenancy support


**Current Version:** v1 (implicit)


**Production URL:** `https://eosm-gateway.com`

**Health Check:** `https://eosm-gateway.com/health`

---


**Backend:**
-  express middleware layers: (Auth, RBAC, Validation, Error)
- Database Tables: incident_requests, incidents, requests, users

**Infrastructure:**
- AWS Services: (ECS, Lambda, ALB, Route 53, ACM, ECR, VPC, CloudWatch)
- Lambda Functions: requests(tickets)-write-function
- IAM Roles: ??
- Certificates: ... (valid until Feb 2027)

**Last Updated:** January 26, 2026  