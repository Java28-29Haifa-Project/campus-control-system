# Incident Service Lambda

Serverless Incident Management Service built with AWS SAM, TypeScript, and PostgreSQL.

##  Prerequisites

1. **AWS CLI** installed and configured
2. **AWS SAM CLI** installed
3. **Node.js 20+** installed
4. **PostgreSQL database** (Neon) with connection string

## Installation

```bash
cd incident-service
npm install
```

## Configuration


```toml
parameter_overrides = "DatabaseUrl=\"postgresql://user:pass@host/db\" Environment=\"production\""
```


## Build

Build TypeScript to JavaScript:

```bash
npm run build

```

Build with SAM:

```bash
sam build
```

##  Local Testing

Test Lambda function locally:

```bash
sam local invoke IncidentFunction -e events/create-incident.json

sam local invoke IncidentFunction -e events/assign-incident.json

sam local invoke IncidentFunction -e events/update-status.json

sam local invoke IncidentFunction -e events/get-incidents.json
```

## Deployment

### First Deployment (Guided)

```bash
sam deploy --guided
```

Follow prompts:
- **Stack Name**: `incident-service-stack`
- **AWS Region**: `us-east-1`
- **Confirm changes**: Y
- **Allow SAM CLI IAM role creation**: Y
- **Save arguments to config**: Y

### Subsequent Deployments

```bash
sam deploy
```

## Verify Deployment

```bash
aws lambda get-function --function-name incident-service-lambda --query 'Configuration.FunctionArn'

aws lambda invoke \
  --function-name incident-service-lambda \
  --payload file://events/create-incident.json \
  response.json

cat response.json
```

## CloudWatch Logs

View Lambda logs:

```bash
sam logs --name IncidentFunction --tail

aws logs tail /aws/lambda/incident-service-lambda --follow
```

## Actions Supported

### CREATE_INCIDENT
```json
{
  "action": "CREATE_INCIDENT",
  "data": {
    "ticketIds": ["req_001"],
    "impact": "high",
    "urgency": "high",
    "category": "network",
    "description": "Wi-fi issues",
    "createdBy": "support_001"
  }
}
```

### ASSIGN_INCIDENT
```json
{
  "action": "ASSIGN_INCIDENT",
  "data": {
    "incidentId": "inc_001",
    "assignedBy": "engineer_001"
  }
}
```

### UPDATE_STATUS
```json
{
  "action": "UPDATE_STATUS",
  "data": {
    "incidentId": "inc_001",
    "status": "in_progress",
    "comment": "Working on it",
    "updatedBy": "engineer_001"
  }
}
```

### UPDATE_PRIORITY
```json
{
  "action": "UPDATE_PRIORITY",
  "data": {
    "incidentId": "inc_001",
    "priority": 1,
    "comment": "Escalating",
    "updatedBy": "engineer_001"
  }
}
```

### GET_INCIDENTS
```json
{
  "action": "GET_INCIDENTS",
  "data": {
    "filters": {
      "status": "in_progress",
      "priority": 1
    }
  }
}
```

### GET_INCIDENT_BY_ID
```json
{
  "action": "GET_INCIDENT_BY_ID",
  "data": {
    "incidentId": "inc_001"
  }
}
```


## 🛠 Troubleshooting

### Build Fails

```bash
npm run clean
npm install
npm run build
sam build
```

### Deployment Fails

```bash
aws cloudformation delete-stack --stack-name incident-service-stack
aws cloudformation wait stack-delete-complete --stack-name incident-service-stack
sam deploy --guided
```

### Database Connection Fails

Check:
1. Database URL format: `postgresql://user:pass@host:port/db?sslmode=require`
2. Network: Lambda needs internet access (use NAT Gateway if in VPC)
3. SSL: Neon requires SSL (`sslmode=require`)

### Lambda Timeout

Increase timeout in `template.yaml`:

```yaml
Globals:
  Function:
    Timeout: 60  # Increase from 30
```

## Environment Variables

Set in `template.yaml`:

```yaml
Environment:
  Variables:
    DATABASE_URL: !Ref DatabaseUrl
    NODE_ENV: !Ref Environment
```

## IAM Permissions

Lambda has permissions for:
- CloudWatch Logs (read/write)
- No VPC access (uses public internet)

## Cleanup

Delete all resources:

```bash
sam delete
```

Or via CloudFormation:

```bash
aws cloudformation delete-stack --stack-name incident-service-stack
```
