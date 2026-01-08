# AWS Accounts Registry

This file is the single source of truth for:
- The Hub AWS account (central HTTP API + frontend hosting)
- Service AWS accounts (each service is deployed in its owner's AWS account)
- Cross-account integration inputs (Lambda ARNs that the Hub HTTP API routes to)

> Important:
> - Service fields may be `TBD` until the service is deployed.
> - After deployment, each service owner MUST update this file via PR.

---

## Hub Account

| Field       | Value |
|------------|-------|
| purpose    | Central HTTP API + Frontend |
| account_id | 251522454523 |
| region     | il-central-1 |
| owner      | Max Burlutsky |
| api_id     | TBD |

### Notes
- The Hub account owns the HTTP API Gateway and routes requests to service Lambdas (cross-account).
- The Hub account may also own shared resources (e.g., frontend hosting, monitoring topics), depending on the final design.

---

## Services

> These services are integrated into the Hub HTTP API.
> Each service is deployed in its own AWS account and must grant invoke permission to the Hub API.

### Service: auth

| Field        | Value |
|-------------|-------|
| service     | auth |
| account_id  | TBD |
| region      | TBD |
| lambda_name | TBD |
| lambda_arn  | TBD |
| owner       | TBD |

### Service: users

| Field        | Value |
|-------------|-------|
| service     | users |
| account_id  | TBD |
| region      | TBD |
| lambda_name | TBD |
| lambda_arn  | TBD |
| owner       | TBD |

### Service: core

| Field        | Value |
|-------------|-------|
| service     | core |
| account_id  | TBD |
| region      | TBD |
| lambda_name | TBD |
| lambda_arn  | TBD |
| owner       | TBD |

### Service: request

| Field        | Value |
|-------------|-------|
| service     | request |
| account_id  | TBD |
| region      | TBD |
| lambda_name | TBD |
| lambda_arn  | TBD |
| owner       | TBD |

### Service: monitoring

| Field        | Value |
|-------------|-------|
| service     | monitoring |
| account_id  | TBD |
| region      | TBD |
| lambda_name | TBD |
| lambda_arn  | TBD |
| owner       | TBD |

### Service: audit

| Field        | Value |
|-------------|-------|
| service     | audit |
| account_id  | TBD |
| region      | TBD |
| lambda_name | TBD |
| lambda_arn  | TBD |
| owner       | TBD |

### Service: incident

| Field        | Value |
|-------------|-------|
| service     | incident |
| account_id  | TBD |
| region      | TBD |
| lambda_name | TBD |
| lambda_arn  | TBD |
| owner       | TBD |

### Service: health

| Field        | Value |
|-------------|-------|
| service     | health |
| account_id  | TBD |
| region      | TBD |
| lambda_name | TBD |
| lambda_arn  | TBD |
| owner       | TBD |
