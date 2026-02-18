# Audit Service

Audit Service is responsible for centralized logging of all significant system and user actions in order to:
- enable further analysis of user and system behavior;
- support administrative and security auditing;
- provide end-to-end traceability of operations across services using `correlationId`.

The service is implemented as a serverless component based on AWS Lambda and is used by other system services for writing and reading audit events.

## Architecture

The Audit Service consists of two main Lambda functions and an SQS queue, connected to a MongoDB database:

- **Writer Function**
    - Triggered by messages from the **AuditQueue** (SQS)
    - Validates and stores audit events in MongoDB
    - Ensures idempotent writes using `correlationId`
    - Reports partial failures back to SQS for retry

- **Reader Function**
    - Provides filtered and paginated access to audit logs
    - Directly queries MongoDB
    - Supports filters such as `userId`, `role`, `entityId`, `startDate`, `endDate`

- **AuditQueue (SQS)**
    - Receives audit events from other services
    - Configured with a Dead Letter Queue (**AuditDLQ**) for failed messages
    - Supports batch processing (batch size = 10)

- **MongoDB Database**
    - Stores audit events in the `audit` collection
    - Holds fields like `entity`, `entityId`, `action`, `role`, `userId`, `metadata`, `timestamp`, `correlationId`

### Data Flow

1. Other services send audit events to **AuditQueue**.
2. **Writer Function** consumes SQS messages, validates them, and writes to MongoDB.
3. Any failed writes are recorded in **AuditDLQ**.
4. **Reader Function** queries MongoDB for audit logs based on filters and pagination.

## Service Components

### Writer Function
- **Trigger:** SQS messages from **AuditQueue**
- **Responsibility:**
    - Validate incoming audit events
    - Persist events to MongoDB
    - Ensure idempotency using `correlationId`
    - Log successes and failures
- **Error Handling:** Partial failures reported back to SQS; failed messages sent to **AuditDLQ** after 3 retries

### Reader Function
- **Trigger:** Direct invocation (API Gateway)
- **Responsibility:**
    - Query MongoDB for audit logs
    - Support filtering by `userId`, `role`, `entityId`, `startDate`, `endDate`
    - Support pagination with configurable page size
- **Output:** Returns both audit entries and pagination metadata (`totalCount`, `totalPages`, `limit`, `page`)

### AuditQueue (SQS)
- Receives audit events sent directly by backend services
- Configured with a Dead Letter Queue (**AuditDLQ**) for failed messages
- Supports batch processing (batch size = 10)

## Data Format

### The Writer Function expects messages in the following format:
```json
{
  "entity": "Incident",
  "entityId": "inc_001",
  "role": "ADMIN",
  "userId": "user_123",
  "action": "UPDATE_STATUS",
  "timestamp": "2024-01-01T10:00:00Z",
  "metadata": {
    "oldStatus": "open",
    "newStatus": "in_progress"
  },
  "correlationId": "uuid-123"
}
```
### The Reader Function expects
```json
{
  "userId": "user_123",
  "role": "ADMIN",
  "entityId": "inc_001",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "page": 1
}
```
All fields are optional.
### The Reader Function returns
```json
{
  "currentPageItems": [
    {
      "entity": "Incident",
      "entityId": "inc_001",
      "role": "ADMIN",
      "userId": "user_123",
      "action": "UPDATE_STATUS",
      "timestamp": "2024-01-01T10:00:00Z",
      "metadata": {
        "oldStatus": "open",
        "newStatus": "in_progress"
      },
      "correlationId": "uuid-123"
    }
  ],
  "pagination": {
    "totalCount": 42,
    "totalPages": 5,
    "limit": 10,
    "page": 1
  }
}
```

## Prerequisites
1. **AWS CLI** installed and configured
2. **AWS SAM CLI** installed
3. **Node.js 20+** installed
4. **MongoDB** instance accessible from AWS Lambda

## Installation
```bash
cd nos
npm install
```

## Configuration
The Audit service requires several configuration values to operate. Example of this values are in `env.example.json`.
Key variables:
- `MONGODB_URI` – connection string for MongoDB
- `LIMIT` - limit value in DB query

## Build
### 1. Build TypeScript with esbuild
Compile the Audit service TypeScript code to JavaScript:
```bash
npm run build
```
### 2. Build with SAM
```bash
sam build
```

## Local Testing

To test the Audit service Lambda locally, we use **AWS SAM** along with example events stored in the `events/` folder.  
Local environment variables are loaded from `env.json`.
```bash
sam local invoke WriterFunction -e events/event1.json --env-vars env.json
sam local invoke WriterFunction -e events/event2.json --env-vars env.json
sam local invoke ReaderFunction -e events/reader-entityId.json --env-vars env.json
sam local invoke ReaderFunction -e events/reader-pages.json --env-vars env.json
sam local invoke ReaderFunction -e events/reader-role.json --env-vars env.json
sam local invoke ReaderFunction -e events/reader-time.json --env-vars env.json
sam local invoke ReaderFunction -e events/reader-userId.json --env-vars env.json
```

## Deployment
### First Deployment (Guided)

```bash
sam deploy --guided
```

Follow prompts:
- **Stack Name**: `audit-service`
- **AWS Region**: `us-east-1`
- **Confirm changes**: Y
- **Allow SAM CLI IAM role creation**: Y
- **Save arguments to config**: Y

### Subsequent Deployments
```bash
sam deploy
```

## Monitoring & Alarms

The Audit Service is monitored using AWS CloudWatch Alarms to ensure reliability and prompt detection of issues:

- **Audit-Service-DLQ-Messages**
  - Alerts when messages appear in the Dead Letter Queue (**AuditDLQ**)
  - Helps detect unprocessed or malformed events

- **Audit-Service-Writer-Error**
  - Triggers on errors during Writer Lambda execution
  - Ensures failed writes are noticed quickly

- **Audit-Writer-High-Latency**
  - Alerts when Writer Lambda has abnormally long execution duration (p90)
  - Helps detect performance bottlenecks

- **Audit-Reader-Function-Error**
  - Triggers on Reader Lambda execution failures
  - Ensures read access problems are detected

**Alarm Actions:** All alarms send notifications via a configured SNS topic.

## Troubleshooting / Common Issues

### MongoDB Connection Fails
Check the following:
1. **MongoDB URI format** – ensure it matches: `mongodb+srv://user:pass@host/db`
2. **Network access** – Lambda needs internet access; if in VPC, ensure NAT Gateway or proper routing
3. **TLS/SSL requirements** – some MongoDB providers require `ssl=true` or `sslmode=require`

### Messages Stuck in DLQ
- Inspect messages in **AuditDLQ**
- Check Writer Lambda logs in CloudWatch for errors
- Verify that payload contains all required fields: `correlationId`, `entityId`, `action`

### Lambda Execution Errors
- Check CloudWatch logs for **WriterFunction** or **ReaderFunction**
- Ensure environment variables (`MONGODB_URI`, `LIMIT`) are correctly set
- Increase Lambda timeout if processing large batches

### High Latency / Performance Issues
- Monitor **Audit-Writer-High-Latency** CloudWatch Alarm
- Consider increasing memory allocation or batch size tuning

## Cleanup / Resource Deletion

To remove all resources created for the Audit Service and avoid unnecessary AWS charges:

### Using SAM CLI

```bash
sam delete
```