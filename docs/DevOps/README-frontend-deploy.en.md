# Frontend (React) Deployment in the AWS Educational Project

This document describes the deployment process for the React application in the project's multi-account architecture.  
The frontend is hosted as a static website on **Amazon S3** with delivery via **Amazon CloudFront**.  
The S3 bucket and CloudFront distribution reside in the **Shared Services Account**, while deployment is performed from the **Frontend Account**.

## Prerequisites
- React application (create-react-app, Vite, etc.) with `npm run build` script (output folder: `build` or `dist`).
- AWS CLI installed and configured.
- Access to both accounts (via AWS profiles or switch role).
- In the Shared Services Account:
  - S3 bucket for static hosting
  - CloudFront distribution (preferably with Origin Access Control)

## Infrastructure Setup (one-time, in Shared Services Account)

### Option 1: AWS Console (quick start)
1. **S3 bucket**
   - Create a bucket with a unique name (e.g., `my-project-frontend-2026`).
   - Region: preferably `us-east-1` (for ACM certificates).
   - Keep **Block all public access** enabled.

2. **CloudFront distribution**
   - Origin: your S3 bucket.
   - Origin access: **Origin Access Control (OAC)** — recommended.
   - Viewer protocol: Redirect HTTP to HTTPS.
   - Default root object: `index.html`.
   - **Custom error responses** for 403 and 404 → redirect to `/index.html` with HTTP 200 (critical for SPA routing).
   - Add CNAME and ACM certificate if needed.
   - Deploy (takes ~15 minutes).

### Option 2: Terraform (recommended)
```hcl
module "frontend_hosting" {
  source  = "terraform-aws-modules/s3-cloudfront-website/aws"
  version = "~> 3.0"

  bucket_name         = "my-project-frontend-2026"
  cloudfront_aliases  = ["frontend.myproject.example"]  # optional
  error_document      = "index.html"
  index_document      = "index.html"
}
Cross-Account Deployment Permissions
Allow the Frontend Account to upload files to the shared bucket.
In Shared Services Account:

Create an IAM policy granting s3:PutObject, s3:ListBucket, s3:DeleteObject on the bucket.
Or add a bucket policy allowing the Frontend Account role/user.

In Frontend Account:

Create an IAM role (e.g., FrontendDeployRole) assumable by GitHub Actions or your user.
Attach permissions to assume the role in the Shared Account and perform S3 actions.

Manual Deployment (for testing)
Bash# 1. Build the app
npm ci
npm run build

# 2. Sync to S3 (use shared profile or assume-role)
aws s3 sync build/ s3://my-project-frontend-2026/ --delete --profile shared

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id EXXXXXXX \
    --paths "/*" \
    --profile shared
The site will be available at the CloudFront domain.
Automated Deployment with GitHub Actions (recommended)
Create .github/workflows/deploy-frontend.yml:
YAMLname: Deploy React to AWS S3 + CloudFront

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install and Build
        run: |
          npm ci
          npm run build

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::SHARED_ACCOUNT_ID:role/FrontendDeployRole
          aws-region: us-east-1
          role-session-name: github-frontend-deploy

      - name: Upload to S3
        run: aws s3 sync build/ s3://my-project-frontend-2026/ --delete --cache-control max-age=60

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
GitHub Secrets:

CLOUDFRONT_DISTRIBUTION_ID

Now every push to main automatically builds and deploys the app.
Tips

Create separate bucket/distribution for staging.
CORS is configured in API Gateway, not S3.
Set API URL in .env.production.
Costs are minimal — almost free under Free Tier for educational usage.
