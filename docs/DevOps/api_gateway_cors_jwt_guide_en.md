# Quick Guide: Configuring CORS + JWT in AWS API Gateway for Amplify Frontend (English)

## Goal
Ensure proper interaction between Amplify frontend and API Gateway using JWT authorization and correct CORS headers.

---

## 1. Confirm Frontend Origin

- Frontend is hosted on Amplify: `https://main.d2q14890n6r4m7.amplifyapp.com`
- This URL must be used in `Access-Control-Allow-Origin`.

---

## 2. Configuring CORS in API Gateway

1. Open AWS API Gateway → your API → Routes → selected route.
2. Enable CORS.
3. Set headers:
   ```
   Access-Control-Allow-Origin: https://main.d2q14890n6r4m7.amplifyapp.com
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Authorization, Content-Type
   Access-Control-Allow-Credentials: true
   ```
4. Ensure OPTIONS method exists for preflight requests.
5. Deploy Stage (`dev` or `prod`).

---

## 3. Setting Up JWT Authorization

1. In API Gateway, select JWT Authorizer.
2. Specify:
   - Identity source: `Authorization` header
   - JWT issuer: your authorization service URL
   - Audience: your application identifier
3. Apply the Authorizer to the required routes.

> Gateway will validate JWT before invoking Lambda.

---

## 4. Testing

1. Check preflight OPTIONS request from browser → CORS headers should be correct.
2. Send GET/POST request with JWT → Lambda should receive `event`.
3. Check for errors:
   - `401/403` → invalid or missing JWT
   - `CORS policy` → incorrect origin or Stage not deployed

---

## 5. Summary
- Amplify frontend can safely call API Gateway.
- JWT authorization validates user permissions at Gateway level.
- CORS configured for the specific origin prevents browser blocking.

