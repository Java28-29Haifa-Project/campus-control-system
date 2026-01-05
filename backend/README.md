# EOSM Gateway

Express.js API Gateway for EOSM microservices architecture.

## Status

Node.js Gateway created (Express server with basic structure)

Health check endpoint implemented (`GET /health`)

Requests endpoint implemented with stubbed Lambda service

Query parameter filtering supported for requests
## Prerequisites

- Node.js v22.20.0
- npm

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

- //TODO production.json
- //TODO test


## Next Steps

1. Use shared AWS credentials - ?
2. Implement authentication middleware
3. Add remaining API endpoints
4. Replace stub service with real AWS Lambda invocation
5. Add comprehensive tests
6. Add role-based access
