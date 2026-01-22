# Quick Guide: AWS Lambda Integration and Full Pipeline Testing (English)

## Goal
Ensure correct connection between API Gateway and Lambda and test the full pipeline: Frontend → Gateway → Lambda → Database.

---

## 1. Check Lambda

1. Ensure Lambda is ready to receive `event` from API Gateway.
2. Check Lambda IAM Role:
   - Gateway must have permission to invoke the function (`lambda:InvokeFunction`).
3. Ensure Lambda has access to the test database (via IAM Role or credentials).

---

## 2. Setting up Gateway → Lambda integration

1. In API Gateway, select a route → Integration → Lambda.
2. Specify the correct Lambda function.
3. Apply JWT Authorizer (if not already applied).
4. Deploy Stage (`dev` or `prod`).

> Gateway will now correctly forward requests to Lambda.

---

## 3. Testing the integration

### 3.1 Gateway → Lambda

1. Use Postman or curl:
   ```bash
   curl -X GET https://api.example.com/prod/users/123 \
   -H "Authorization: Bearer <JWT>" \
   -H "Content-Type: application/json"
   ```
2. Verify that Lambda receives `event` with query, headers, path, and body.
3. Check for errors:
   - 401/403 → invalid JWT
   - 404 → wrong route

### 3.2 Lambda → Database

1. Lambda connects to the test database (e.g., Supabase).
2. Verify read/write operations.
3. Check for connection or authorization errors.

### 3.3 Frontend → Gateway → Lambda → DB

1. Launch frontend on Amplify.
2. Send a test request.
3. Verify correct JSON response.
4. Check CORS: browser should not block the request.

---

## 4. Recommendations

- Use a test database (Supabase / ElephantSQL) for learning projects.
- Check IAM roles and Lambda invoke permissions.
- Deploy Stage after every change.
- Use CloudWatch logs to track issues.

---

## Summary
Following these steps ensures the full pipeline works: Frontend → API Gateway (CORS + JWT) → Lambda → Database.