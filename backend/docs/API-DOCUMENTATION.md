# Express Gateway API Documentation

**Base URL (Production):** `https://eosm-gateway.com`  
**Alternative URL:** `https://www.eosm-gateway.com

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
  "status": "ok",
  "timestamp": "2026-01-31T12:00:00Z",
  "service": "express-gateway",
  "environment": "production"
}
```

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
- **SUPPORT**: `support@test.org` / `password123`
- **ENGINEER**: `engineer@test.org` / `password123`
- **ADMIN**: `admin@test.org` / `password123`

---

### Logout
```http
POST /auth/logout
```

**Requires:** Authentication

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

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
GET /requests?status=new&category=network&priority=high
```
**Requires:** Authentication

**Role-based filtering:**
- **USER**: Only sees their own requests
- **SUPPORT/ENGINEER/ADMIN**: Sees all requests

**Response (200):**
```json
[
  {
    "requestId": "abc-123",
    "requestNumber": "REQ-20260131-0001",
    "userId": "user_001",
    "category": "network",
    "subject": "Wi-Fi not working in office",
    "description": "Cannot connect to wi-fi access point",
    "userReportedPriority": "high",
    "status": "new",
    "createdAt": "2026-01-31T10:00:00Z"
  }
]
```

---

### Get Single Request
```
GET /requests/:id
```
**Requires:** Authentication

**Access Control:**
- **USER**: Can only access own requests
- **SUPPORT+**: Can access all requests
- 
**Response (200):**
```json
{
  "requestId": "abc-123",
  "userId": "user_001",
  "category": "network",
  "subject": "Wi-Fi not working in office",
  "description": "Cannot connect to wi-fi access point",
  "userReportedPriority": "high",
  "status": "new",
  "createdAt": "2026-01-31T10:00:00Z"
}
```

---

### Create Request
```
POST /requests
```
**Requires:** Authentication (USER role only)

**Request Body:**
```json
{
  "category": "plumbing",
  "subject": "Leaking pipe in kitchen area",
  "description": "Pipe in kitchen is leaking",
  "userReportedPriority": "high"
}
```

**Validation:**
- `subject`: Required, 10-500 characters
- `description`: Optional
- `userReportedPriority`: Required, must be `low`, `medium`, `high`, or `urgent`

**Response (201):**
```json
{
  "requestId": "abc-123",
  "userId": "user_001",
  "category": "network",
  "subject": "Wi-Fi not working in office",
  "description": "Cannot connect to wi-fi access point",
  "userReportedPriority": "high",
  "status": "new",
  "createdAt": "2026-01-31T10:00:00Z"
}
```


---

### Update Request
```
PATCH /requests/:id
```
**Requires:** Authentication

**Request Body:**
```json
{
  "status": "in_service",
}
```

Support cannot set status back to `new`


**Response (200):**
```json
{
  "requestId": "abc-123",
  "status": "in_service",
  "updatedAt": "2026-01-31T11:00:00Z"
}
```

---

## Incident Endpoints

**Requires:** SUPPORT, ENGINEER, or ADMIN role

### Get All Incidents
```
GET /incidents
GET /incidents?status=new&priority=1&category=network
```
**Requires:** Authentication (SUPPORT, ENGINEER, or ADMIN)

**Response (200):**
```json
[
  {
    "incidentId": "inc-001",
    "ticketIds": ["req-001", "req-002"],
    "priority": 1,
    "status": "assigned",
    "category": "network",
    "description": "Multiple wi-fi complaints",
    "assignedBy": "engineer_001",
    "createdBy": "support_001",
    "createdAt": "2026-01-31T10:00:00Z",
    "updatedAt": "2026-01-31T10:30:00Z"
  }
]
```

---

### Get Single Incident
```
GET /incidents/:id
```
**Requires:** Authentication (SUPPORT+)

**Access Control:**
- **SUPPORT**: Cannot see system category incidents
- **ENGINEER/ADMIN**: Can see all incidents
- 
**Response (200):**
```json
{
  "incidentId": "inc-001",
  "ticketIds": ["req-001", "req-002"],
  "priority": 1,
  "status": "assigned",
  "category": "network",
  "description": "Multiple wi-fi complaints",
  "assignedBy": "engineer_001",
  "createdBy": "support_001",
  "createdAt": "2026-01-31T10:00:00Z",
  "updatedAt": "2026-01-31T10:30:00Z"
}
```

---

### Create Incident
```
POST /incidents
```
**Requires:** Authentication (SUPPORT+)

**Request Body:**
```json
{
  "ticketIds": ["req-001", "req-002"],
  "impact": "high",
  "urgency": "high",
  "category": "network",
  "description": "Multiple wi-fi access points down"
}
```
**Validation Rules:**
- `ticketIds`: Required, array of at least 1 ticket ID
- `impact`: Required, must be `low`, `medium`, `high`, or `critical`
- `urgency`: Required, must be `low`, `medium`, or `high`
- `category`: Required, must be `plumbing`, `electrical`, `hvac`, `gas`, `fire_safety`, `elevators`, `access`, `network`, `infrastructure`, `other`, `system`
- **system category**: Only notification MS can use 
- `description`: Optional, max 2000 characters
- `createdBy`: Automatically extracted from authentication cookie


**Response (201):**
```json
{
  "incidentId": "inc-001",
  "ticketIds": ["req-001", "req-002"],
  "priority": 1,
  "status": "new",
  "category": "network",
  "description": "Multiple wi-fi access points down",
  "createdBy": "support_001",
  "createdAt": "2026-01-31T10:00:00Z",
  "updatedAt": "2026-01-31T10:00:00Z"
}
```

---

## Engineer Endpoints (New)

### Assign Incident to Self
```http
PATCH /incidents/:id/assign
```

**Requires:** Authentication (ENGINEER+)

**Request Body:** None (engineer ID extracted from auth cookie)

**Response (200):**
```json
{
  "incidentId": "inc-001",
  "ticketIds": ["req-001", "req-002"],
  "priority": 1,
  "status": "assigned",
  "category": "network",
  "description": "Multiple wi-fi access points down",
  "assignedBy": "engineer_001",
  "createdBy": "support_001",
  "createdAt": "2026-01-31T10:00:00Z",
  "updatedAt": "2026-01-31T10:30:00Z"
}
```

### Update Incident Status
```http
PATCH /incidents/:id/status
```

**Requires:** Authentication (ENGINEER or ADMIN)

**Request Body:**
```json
{
  "status": "in_progress",
  "comment": "Working on fixing wi-fi access points"
}
```

**Valid Status Transitions:**
```
new → assigned → in_progress → resolved
```

- Cannot change from `in_progress` to `assigned`
- Cannot change from `resolved` to `in_progress` or `assigned`

**Response (200):**
```json
{
  "incidentId": "inc-001",
  "ticketIds": ["req-001", "req-002"],
  "priority": 1,
  "status": "in_progress",
  "category": "network",
  "description": "Multiple wi-fi access points down",
  "assignedBy": "engineer_001",
  "createdBy": "support_001",
  "createdAt": "2026-01-31T10:00:00Z",
  "updatedAt": "2026-01-31T11:00:00Z"
}
```

**Response (400) - Invalid transition:**
```json
{
  "error": "Invalid status transition"
}
```

### Raise Incident Priority
```http
PATCH /incidents/:id/priority
```

**Requires:** Authentication (ENGINEER or ADMIN)

**Request Body:**
```json
{
  "priority": 1,
  "comment": "Escalating to P1 - affecting all users"
}
```

**Valid Priority Changes:**
```
4 → 3 → 2 → 1
```

**Can only raise priority (lower number = higher priority)**
- Can change from 4 to 3, 3 to 2, 2 to 1
- CANNOT change from 1 to 2, 2 to 3, etc.

**Response (200):**
```json
{
  "incidentId": "inc-001",
  "ticketIds": ["req-001", "req-002"],
  "priority": 1,
  "status": "in_progress",
  "category": "network",
  "description": "Multiple wi-fi access points down",
  "assignedBy": "engineer_001",
  "createdBy": "support_001",
  "createdAt": "2026-01-31T10:00:00Z",
  "updatedAt": "2026-01-31T11:30:00Z"
}
```

**Response (400) - Invalid priority change:**
```json
{
  "error": "Cannot lower priority from 1 to 2"
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
## Data Models

### Categories

All categories are **lowercase** and used for both tickets and incidents:

| Category | Description | Examples |
|----------|-------------|----------|
| `plumbing` | Water-related issues | Leaks, clogs, pipe issues |
| `electrical` | Electrical systems | Power outages, faulty outlets |
| `hvac` | Heating, Ventilation, A/C | Temperature issues, air quality |
| `gas` | Gas systems | Gas leaks, heating |
| `fire_safety` | Fire safety equipment | Alarms, extinguishers, sprinklers |
| `elevators` | Elevator systems | Stuck elevator, maintenance |
| `access` | Access control | Locks, doors, emergency exits |
| `network` | Network infrastructure | Internet, cabling, wi-fi, phones, intercom |
| `infrastructure` | Building infrastructure | Parking, gates, roof, facade damage |
| `other` | Miscellaneous | Inspections, noise complaints |
| `system` | **Auto-generated only** | Only notification MS can use |

**Note:** Users and Support CANNOT use `system` category when creating tickets/incidents. This category is reserved for auto-generated incidents from the Notification Microservice.


### Ticket Status Flow

```
new → in_service → done
  ↓
rejected
```

- **new**: Just created, not yet being worked on
- **rejected**: Request rejected by support
- **in_service**: Being worked on
- **done**: Completed

---

### Incident Status Flow

```
new → assigned → in_progress → resolved → closed
```

- **new**: Created, not yet assigned
- **assigned**: Engineer assigned himself
- **in_progress**: Engineer working on it
- **resolved**: Engineer marked as resolved
- **closed**: Admin closed

**Cannot go backward in status flow!**

--

---

## Role-Based Access Control

| Endpoint | USER | SUPPORT | ENGINEER | ADMIN |
|----------|------|---------|----------|-------|
| `/auth/*` | Allowed | Allowed | Allowed | Allowed |
| `/requests` (GET) | Allowed (own only) | Allowed (all) | Allowed (all) | Allowed (all) |
| `/requests` (POST) | Allowed | Denied | Denied | Denied |
| `/requests` (PATCH) | Allowed (own only) | Allowed (all) | Allowed (all) | Allowed (all) |
| `/incidents` | Denied | Allowed | Allowed | Allowed |
| `/monitoring` | Denied | Denied | Denied | Allowed |
| `/audit` | Denied | Denied | Denied | Allowed |

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_value",
      "values": ["plumbing", "electrical", "general"],
      "path": ["category"],
      "message": "Invalid option: expected one of \"plumbing\"|\"electrical\"|\"general\""
    },
    {
      "origin": "string",
      "code": "too_small",
      "minimum": 10,
      "inclusive": true,
      "path": ["subject"],
      "message": "Too small: expected string to have >=10 characters"
    }
  ]
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

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "statusCode": 500,
  "timestamp": "2026-01-26T09:46:07.807Z",
  "path": "/requests"
}
```


---

## Fields enums

**Ticket Categories:**
`plumbing`, `electrical`, `hvac`, `gas`, `fire_safety`, `elevators`, `access`, `network`, `infrastructure`, `other`, `system`

**Ticket Statuses:**
`new`, `rejected`, `in_service`, `done`

**Incident Statuses:**
`new`, `assigned`, `in_progress`, `resolved`, `closed`

**Priorities:**
`1` (highest), `2`, `3`, `4` (lowest)

**Impacts:**
`low`, `medium`, `high`, `critical`

**Urgencies:**
`low`, `medium`, `high`

**User Priorities:**
`low`, `medium`, `high`, `urgent`

---

## Cookie Management

**The API uses HTTP-only cookies for security:**

- **In Browser/Axios:** Cookies are handled automatically
- **In fetch():** Use `credentials: 'include'`
- **In Postman:** Cookies are managed automatically

**Example with fetch():**
```javascript
// Login
const response = await fetch('https://eosm-gateway.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'user@test.org', password: 'password123' })
});

// Subsequent requests
const user = await fetch('https://eosm-gateway.com/auth/me', {
  credentials: 'include'
});
```

**Example with Axios:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://eosm-gateway.com',
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

**Issue:** Frontend sends uppercase values (PLUMBING, HIGH)
- **Solution:** All values must be lowercase (`plumbing`, `high`)