# Full Mini-Guide for Project Coordination (English)

## Goal
Ensure correct interaction of all project parts: **Frontend (Amplify), API Gateway, Lambda, Database, and Authorization**, with minimal effort in coordinating the teams.

---

## 1. Gather Information from Teams

1. **Frontend team:**
   - API Gateway endpoint
   - Methods and request structures
   - Type of authorization (JWT/OAuth)
   - Test tokens or credentials

2. **Backend Lambda team:**
   - List of functions and routes
   - Event format from Gateway
   - Database access (credentials or IAM Role)

3. **Database:**
   - Endpoint and credentials
   - Table schema / data structure
   - Accessibility for Lambda

4. **Authorization service:**
   - JWT issuer, audience
   - Token verification endpoint

> Compile all information into a shared document for all teams.

---

## 2. API Gateway Setup

1. Create Stage (`dev`/`prod`) and routes for all methods.
2. Enable CORS with frontend origin.
3. Set up JWT Authorizer for routes.
4. Integrate Lambda functions for each route.
5. Deploy Stage after changes.

---

## 3. Check IAM and Trust Between Services

1. Lambda should only allow invocation from API Gateway (Resource Policy).
2. Lambda has access to the database via IAM Role or credentials.
3. Frontend does not have direct access to Lambda or database — only via Gateway.

---

## 4. Full Pipeline Testing

1. **Gateway → Lambda:** test via Postman/curl with JWT.
2. **Lambda → Database:** test read and write operations.
3. **Frontend → Gateway → Lambda → Database:** test full flow.
4. Check CORS and authorization.
5. Use CloudWatch for logs and error tracking.

---

## 5. Team Coordination

- Assign a responsible coordinator for integration.
- Document endpoints, methods, authorization, CORS.
- Use `dev` Stage for testing and `prod` for production.
- Each team is responsible for their own part, coordinator ensures compatibility.
- Regular short syncs between teams to fix discrepancies.

---

## Summary
Following this guide ensures all parts of the project work correctly and securely:
```
Frontend (Amplify) → API Gateway (CORS + JWT) → Lambda → Database
```

