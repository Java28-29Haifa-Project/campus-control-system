# Full Mini-Guide: Frontend, API Gateway, Lambda, and Database Integration (English)

## Goal
Create a unified working pipeline: **Frontend → API Gateway (CORS + JWT) → Lambda → Database**, with a test database for learning purposes.

---

## 1. Frontend (Amplify)

- URL: `https://main.d2q14890n6r4m7.amplifyapp.com`
- Sends HTTP requests to API Gateway
- Sends JWT in `Authorization` header
- Does not know about Lambda or database

> Frontend team's task: test API calls according to the contract.

---

## 2. API Gateway

### CORS Setup
- `Access-Control-Allow-Origin: https://main.d2q14890n6r4m7.amplifyapp.com`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Authorization, Content-Type`
- `Access-Control-Allow-Credentials: true`
- Ensure `OPTIONS` method exists for preflight
- Deploy Stage (`dev` or `prod`)

### JWT Authorization
- Identity source: `Authorization` header
- JWT issuer: authorization service
- Audience: application identifier
- Apply to required routes

### Lambda Integration
- Specify Lambda function for each route
- Check Lambda IAM Role (`lambda:InvokeFunction`)
- Deploy Stage after changes

---

## 3. Lambda

- Receives `event` from Gateway
- Connects to database via credentials or IAM
- Handles business logic
- Returns JSON to Gateway

### Testing
1. Gateway → Lambda: test with curl / Postman + JWT
2. Lambda → Database: test read/write operations
3. Frontend → Gateway → Lambda → Database: full flow

---

## 4. Database

- Recommended test database: Supabase or ElephantSQL
- Lambda uses credentials to connect
- Gateway is unaware of database

---

## 5. Coordination Recommendations

- Check IAM roles and Lambda invoke permissions
- Deploy Stage after any changes
- Use CloudWatch for logging
- Document all endpoints, methods, and authorization

---

## Summary
All project parts work together consistently:
```
Frontend (Amplify) → API Gateway (CORS + JWT) → Lambda → Database
```