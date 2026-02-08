# Incident Service Lambda

Serverless Incident Management Service built with AWS SAM, TypeScript, and PostgreSQL.

## 📁 Project Structure

```
incident-service/
├── template.yaml              # SAM CloudFormation template
├── samconfig.toml            # SAM deployment configuration
├── package.json              # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
├── events/                   # Test event payloads
│   ├── create-incident.json
│   ├── assign-incident.json
│   ├── update-status.json
│   └── get-incidents.json
└── src/
    ├── index.ts              # Main Lambda handler
    ├── handlers/             # Action handlers
    │   ├── createIncident.ts
    │   ├── assignIncident.ts
    │   ├── updateStatus.ts
    │   ├── updatePriority.ts
    │   ├── getIncidents.ts
    │   └── getIncidentById.ts
    ├── services/
    │   ├── priorityCalculator.ts  # Priority matrix logic
    │   └── incidentRepository.ts  # Database operations
    ├── types/
    │   └── incident.ts       # TypeScript types
    └── utils/
        └── db.ts             # PostgreSQL connection
```

## 🚀 Prerequisites

1. **AWS CLI** installed and configured
2. **AWS SAM CLI** installed ([Install Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
3. **Node.js 20+** installed
4. **PostgreSQL database** (Neon) with connection string

## 📦 Installation

```bash
# Navigate to project folder
cd incident-service

# Install dependencies
npm install
```

## 🔧 Configuration

### Update Database URL

Edit `samconfig.toml` and replace `YOUR_DATABASE_URL` with your actual Neon PostgreSQL connection string:

```toml
parameter_overrides = "DatabaseUrl=\"postgresql://user:pass@host/db\" Environment=\"production\""
```

**OR** provide it during deployment (more secure):

```bash
sam deploy --parameter-overrides DatabaseUrl="postgresql://..."
```

## 🏗️ Build

Build TypeScript to JavaScript:

```bash
# Build once
npm run build

# Watch for changes (development)
npm run watch
```

Build with SAM:

```bash
sam build
```

## 🧪 Local Testing

Test Lambda function locally:

```bash
# Test create incident
sam local invoke IncidentFunction -e events/create-incident.json

# Test assign incident
sam local invoke IncidentFunction -e events/assign-incident.json

# Test update status
sam local invoke IncidentFunction -e events/update-status.json

# Test get incidents
sam local invoke IncidentFunction -e events/get-incidents.json
```

## 🚢 Deployment

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

## 📋 Deployment Checklist

- [ ] Database URL configured in `samconfig.toml`
- [ ] AWS credentials configured (`aws configure`)
- [ ] SAM CLI installed (`sam --version`)
- [ ] Code built (`npm run build`)
- [ ] SAM build successful (`sam build`)
- [ ] Deploy (`sam deploy`)
- [ ] Test deployed Lambda

## 🔍 Verify Deployment

```bash
# Get Lambda ARN
aws lambda get-function --function-name incident-service-lambda --query 'Configuration.FunctionArn'

# Invoke deployed Lambda
aws lambda invoke \
  --function-name incident-service-lambda \
  --payload file://events/create-incident.json \
  response.json

# View response
cat response.json
```

## 📊 CloudWatch Logs

View Lambda logs:

```bash
# Tail logs (SAM)
sam logs --name IncidentFunction --tail

# Tail logs (AWS CLI)
aws logs tail /aws/lambda/incident-service-lambda --follow
```

## 🔄 Actions Supported

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

## 🗄️ Database Schema

Required tables:

```sql
-- incidents table
CREATE TABLE incidents (
  incident_id VARCHAR(50) PRIMARY KEY,
  priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 4),
  status VARCHAR(20) NOT NULL CHECK (status IN ('new', 'assigned', 'in_progress', 'resolved', 'closed')),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_by VARCHAR(50) NOT NULL,
  assigned_by VARCHAR(50),
  resolved_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- incident_requests junction table
CREATE TABLE incident_requests (
  incident_id VARCHAR(50) REFERENCES incidents(incident_id),
  request_id VARCHAR(50) REFERENCES requests(request_id),
  PRIMARY KEY (incident_id, request_id)
);
```

## 🛠️ Troubleshooting

### Build Fails

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
sam build
```

### Deployment Fails

```bash
# Delete stack and redeploy
aws cloudformation delete-stack --stack-name incident-service-stack
# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name incident-service-stack
# Redeploy
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

## 📝 Environment Variables

Set in `template.yaml`:

```yaml
Environment:
  Variables:
    DATABASE_URL: !Ref DatabaseUrl
    NODE_ENV: !Ref Environment
```

## 🔐 IAM Permissions

Lambda has permissions for:
- CloudWatch Logs (read/write)
- No VPC access (uses public internet)

## 🧹 Cleanup

Delete all resources:

```bash
sam delete
```

Or via CloudFormation:

```bash
aws cloudformation delete-stack --stack-name incident-service-stack
```

## 📚 Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Neon PostgreSQL](https://neon.tech/docs)

## 🆘 Support

For issues:
1. Check CloudWatch Logs
2. Test locally with `sam local invoke`
3. Verify database connection
4. Check IAM permissions
