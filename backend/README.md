# EOSM Gateway

Express.js API Gateway for EOSM microservices architecture.

## Status

Node.js Gateway created (Express server with basic structure)

Health check endpoint implemented (`GET /health`)

##Prerequisites

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
Response: { "status": "ok" }
```


- //TODO lambda invocation
- //TODO production.json
- //TODO lambda endpoint
- //TODO test


## Next Steps

1. Use shared AWS credentials - ?
2. Implement authentication middleware
3. Add remaining API endpoints
4. Integrate with Lambda functions
5. Add comprehensive tests