# Express Gateway API Documentation

**Base URL (Production):** `https://7vsdxftpoc.execute-api.us-east-1.amazonaws.com`

**Authentication:** JWT tokens via HTTP-only cookies (handled automatically by browser)

---

## Public Endpoints (No Authentication)

### Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "ok"
}
```

### Lambda Health Checks
```
GET /health/lambdas/auth
GET /health/lambdas/request
GET /health/lambdas/incident
GET /health/lambdas/monitoring
GET /health/lambdas/audit
```
**Response:**
```json
{
  "service": "auth-lambda",
  "status": "ok",
  "timestamp": "2026-01-10T12:00:00Z"
}
```

---

## Authentication Endpoints

### Login
```
POST /auth/login
```
**Request Body:**
```json
{
  "email": "user@test.org",
  "password": "password123"
}
```
**Response (200):**
```json
{
  "userId": "user_001",
  "username": "john_user",
  "email": "user@test.org",
  "role": "USER"
}
```
**Sets cookies:** `accessToken` (15min), `refreshToken` (7 days)

**Test Users:**
- **USER**: `user@test.org` / `password123`
- **SUPPORT**: `support@test.org` / `support123`
- **ENGINEER**: `engineer@test.org` / `engineer123`
- **ADMIN**: `admin@test.org` / `admin123`

---

### Get Current User
```
GET /auth/me
```
**Requires:** Authentication

**Response (200):**
```json
{
  "userId": "user_001",
  "username": "john_user",
  "email": "user@test.org",
  "role": "USER"
}
```

---

### Refresh Token
```
POST /auth/refresh
```
**Requires:** Valid refresh token in cookie

**Response (200):**
```json
{
  "message": "Tokens refreshed successfully"
}
```
**Updates cookies** with new tokens

---

### Logout
```
POST /auth/logout
```
**Requires:** Authentication

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```
**Clears cookies** and blacklists refresh token

---

## Request (Ticket) Endpoints

### Get All Requests
```
GET /requests
GET /requests?status=new
```
**Requires:** Authentication

**Role-based filtering:**
- **USER**: Only sees their own requests
- **SUPPORT/ENGINEER/ADMIN**: Sees all requests

**Response (200):**
```json
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

**Query Parameters:**
- `status`: `new`, `rejected`, `in_service`, `done`

---

### Get Single Request
```
GET /requests/:id
```
**Requires:** Authentication

**Response (200):**
```json
{
  "requestId": "req0",
  "requestNumber": "REQ-0",
  "category": "electrical",
  "subject": "subject0",
  "userReportedPriority": "urgent",
  "status": "new",
  "createdAt": "2025-01-01T10:25:00Z"
}
```

---

### Create Request
```
POST /requests
```
**Requires:** Authentication

**Request Body:**
```json
{
  "category": "plumbing",
  "subject": "Leaking pipe",
  "description": "Pipe in kitchen is leaking",
  "userReportedPriority": "high"
}
```

**Response (201):**
```json
{
  "requestId": "req2",
  "requestNumber": "REQ-2",
  "userId": "user_001",
  "category": "plumbing",
  "subject": "Leaking pipe",
  "status": "new",
  "createdAt": "2025-01-10T12:00:00Z"
}
```

---

### Update Request
```
PATCH /requests/:id
```
**Requires:** Authentication (SUPPORT+ role)

**Request Body:**
```json
{
  "status": "in_service",
  "comment": "Working on it"
}
```

**Response (200):**
```json
{
  "requestId": "req0",
  "status": "in_service",
  "updatedAt": "2025-01-10T12:30:00Z"
}
```

---

## Incident Endpoints

**Requires:** SUPPORT, ENGINEER, or ADMIN role

### Get All Incidents
```
GET /incidents
GET /incidents?status=OPEN
```

**Response (200):**
```json
[
  {
    "incidentId": "inc0",
    "incidentNumber": "INC-0",
    "priority": "P1",
    "status": "OPEN",
    "impact": "high",
    "urgency": "critical",
    "category": "Network",
    "createdBy": "support0",
    "createdAt": "2025-01-01T13:00:00Z"
  }
]
```

---

### Get Single Incident
```
GET /incidents/:id
```

**Response (200):**
```json
{
  "incidentId": "inc0",
  "incidentNumber": "INC-0",
  "priority": "P1",
  "status": "OPEN",
  "impact": "high",
  "urgency": "critical",
  "category": "Network",
  "description": "Network outage",
  "createdBy": "support0",
  "createdAt": "2025-01-01T13:00:00Z"
}
```

---

### Create Incident
```
POST /incidents
```

**Request Body:**
```json
{
  "ticketIds": ["req0", "req1"],
  "impact": "high",
  "urgency": "critical",
  "category": "Network",
  "description": "Network outage in building A",
  "createdBy": "support_001"
}
```

**Response (201):**
```json
{
  "incidentId": "inc2",
  "incidentNumber": "INC-2",
  "priority": "P1",
  "status": "OPEN",
  "createdAt": "2025-01-10T12:00:00Z"
}
```

---

### Update Incident
```
PATCH /incidents/:id
```

**Request Body:**
```json
{
  "status": "RESOLVED",
  "urgency": "high",
  "updatedBy": "engineer_001"
}
```

---

## Monitoring Endpoints

**Requires:** ADMIN role only

### Get Logs
```
GET /monitoring/logs
GET /monitoring/logs?level=ERROR
GET /monitoring/logs?level=ERROR&startDate=2025-01-01
```

**Response (200):**
```json
[
  {
    "logId": "log0",
    "timestamp": "2025-01-01T14:00:00Z",
    "level": "ERROR",
    "service": "incident-service",
    "message": "Lambda timeout",
    "stackTrace": "trace0"
  }
]
```

---

### Get Alarms
```
GET /monitoring/alarms
GET /monitoring/alarms?status=ACTIVE
GET /monitoring/alarms?severity=HIGH
```

**Response (200):**
```json
[
  {
    "alarmId": "alarm0",
    "alarmName": "HighErrorRate",
    "severity": "HIGH",
    "status": "ACTIVE",
    "message": "Error rate exceeded threshold",
    "microservice": "incident-service",
    "triggerTime": "2025-01-01T14:00:00Z"
  }
]
```

---

## Audit Endpoint

**Requires:** ADMIN role only

### Send Audit Event
```
POST /audit
```

**Request Body:**
```json
{
  "actor": "admin_001",
  "action": "UPDATE_INCIDENT",
  "entityType": "INCIDENT",
  "entityId": "inc0",
  "timestamp": "2025-01-10T12:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true
}
```

---

## Role-Based Access Control

| Endpoint | USER | SUPPORT | ENGINEER | ADMIN |
|----------|------|---------|----------|-------|
| `/auth/*` | Allowed | Allowed | Allowed | Allowed |
| `/requests` | Allowed (own only) | Allowed (all) | Allowed (all) | Allowed (all) |
| `/incidents` | Denied | Allowed | Allowed | Allowed |
| `/monitoring` | Denied | Denied | Denied | Allowed |
| `/audit` | Denied | Denied | Denied | Allowed |

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required - no token provided"
}
```
or
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Required roles: ADMIN"
}
```

### 404 Not Found
```json
{
  "error": "Page not found"
}
```

---

## Cookie Management

**The API uses HTTP-only cookies for security:**

- **In Browser/Axios:** Cookies are handled automatically
- **In fetch():** Use `credentials: 'include'`
- **In Postman:** Cookies are managed automatically

**Example with fetch():**
```javascript
// Login
const response = await fetch('https://7vsdxftpoc.execute-api.us-east-1.amazonaws.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'user@test.org', password: 'password123' })
});

// Subsequent requests
const user = await fetch('https://7vsdxftpoc.execute-api.us-east-1.amazonaws.com/auth/me', {
  credentials: 'include'
});
```

**Example with Axios:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://7vsdxftpoc.execute-api.us-east-1.amazonaws.com',
  withCredentials: true // Enable cookies
});

// Login
await api.post('/auth/login', { email: 'user@test.org', password: 'password123' });

// Subsequent requests work automatically
const user = await api.get('/auth/me');
```

---

## Quick Test Flow

1. **Login:**
```bash
   POST /auth/login
   Body: { "email": "user@test.org", "password": "password123" }
```

2. **Get current user:**
```bash
   GET /auth/me
```

3. **Get your requests:**
```bash
   GET /requests
```

4. **Try admin endpoint (will fail 403):**
```bash
   GET /monitoring/logs
```

5. **Logout:**
```bash
   POST /auth/logout
```

6. **Try to access (will fail 401):**
```bash
   GET /auth/me
```

---

## Frontend Integration

1. **Always use `credentials: 'include'` or `withCredentials: true`**
2. **Handle 401 errors** --> redirect to login
3. **Handle 403 errors** --> show "access denied" message
4. **Token refresh is automatic** when using cookies
5. **On logout**, call `/auth/logout` endpoint to blacklist token

---

## Troubleshooting

**Issue:** "No token provided"
- **Solution:** Make sure `credentials: 'include'` is set

**Issue:** "CORS error"
- **Solution:** Backend should be configured for your frontend origin

**Issue:** "Token expired"
- **Solution:** Call `/auth/refresh` or redirect to login

**Issue:** "Access denied"
- **Solution:** User doesn't have required role for this endpoint