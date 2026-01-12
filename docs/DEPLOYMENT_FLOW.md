# Deployment Flow (Multi-Account, HTTP API)

This document describes the deployment order and responsibilities
for a multi-account setup where:

- Hub AWS account owns the central HTTP API Gateway and frontend hosting
- Each service team deploys its Lambda in its own AWS account
- Hub HTTP API routes requests to service Lambdas using cross-account ARNs

---

## Overview

### Architecture Rules
1. Hub account owns:
    - HTTP API Gateway (single entry point for the frontend)
    - Frontend hosting (S3 or S3 + CloudFront)
2. Service accounts own:
    - Their Lambda functions and related resources
3. Integration happens via:
    - Hub HTTP API routes -> Lambda ARN (cross-account)
    - Service Lambda resource-based policy allowing invocation from the Hub API

---

## Roles & Responsibilities

### Hub Owner (Max)
- Maintains `infrastructure/hub/` stack and parameters
- Deploys Hub HTTP API stack
- Publishes the Hub HTTP API ID / invoke URL to the team
- Coordinates which services are connected in each environment (dev/prod)

### Service Owner (each team)
- Deploys service stack from `infrastructure/services/<service>/`
- Obtains `LambdaArn` from CloudFormation Outputs
- Updates `docs/ACCOUNTS.md` via PR with:
    - account_id, region, lambda_name, lambda_arn, owner
- (If required by templates) configures permission to allow the Hub HTTP API to invoke the Lambda

---

## Required Inputs

### Hub Inputs
- Hub AWS Account ID: `251522454523`
- Region: `il-central-1`
- HTTP API ID: `TBD` (becomes available after hub stack deployment)

### Service Inputs (per service)
Each service must provide:
- Service AWS Account ID
- Region
- Lambda name
- Lambda ARN (from stack Outputs)

---

## Deployment Order

### Step 1 — Deploy Hub Infrastructure (creates HTTP API)
**Actor:** Hub Owner (Max)

1. Deploy `infrastructure/hub/template.yaml` into the Hub AWS account
2. Capture outputs:
    - HTTP API ID
    - Invoke URL (optional output)
3. Update `docs/ACCOUNTS.md`:
    - Set `api_id` for Hub account

Result:
- Hub has a stable HTTP API that will later route to service Lambdas.

---

### Step 2 — Each Service Team Deploys Their Service Stack
**Actor:** Service Owner

For each service (`auth`, `users`, `core`, ...):
1. Deploy `infrastructure/services/<service>/template.yaml` in the service owner's AWS account
2. Capture CloudFormation Outputs:
    - `LambdaArn` (required)
    - (Optional) function name/version/alias

3. Update `docs/ACCOUNTS.md` via PR:
    - account_id
    - region
    - lambda_name
    - lambda_arn
    - owner

Result:
- Each service has a deployed Lambda and a known Lambda ARN.

---

### Step 3 — Connect Services to Hub HTTP API
**Actor:** Hub Owner (Max)

1. Update hub parameters file:
    - `infrastructure/hub/params/dev.json` (and/or `prod.json`)
    - Fill in `...LambdaArn` parameters with the values from `docs/ACCOUNTS.md`

2. Deploy (or update) the Hub stack
3. Verify routing:
    - requests to `/auth/*` reach auth Lambda
    - requests to `/users/*` reach users Lambda
    - etc.

Result:
- The Hub HTTP API becomes a single stable endpoint for the frontend.

---

### Step 4 — Frontend Deployment
**Actor:** Hub Owner (Max) or CI

1. Deploy frontend hosting stack:
    - `infrastructure/frontend-hosting/template.yaml`
2. Configure the frontend environment:
    - Base API URL -> Hub HTTP API invoke URL
3. Deploy the frontend build artifacts

Result:
- Frontend calls a single API endpoint owned by the Hub account.

---

## Environments

### Recommended Stages
- `dev` for active integration
- `prod` for stable demo

Service owners may deploy to their own `dev` environments first.
Only ARNs approved for the Hub environment should be added to hub params.

---

## PR Checklist (for service owners)

When a service is ready to integrate:
- [ ] Service stack deployed successfully in the service AWS account
- [ ] Lambda ARN copied from stack Outputs
- [ ] `docs/ACCOUNTS.md` updated with real values (no `TBD`)
- [ ] Hub parameters updated (by Hub owner or via agreed flow)
- [ ] Integration tested via Hub HTTP API endpoint
