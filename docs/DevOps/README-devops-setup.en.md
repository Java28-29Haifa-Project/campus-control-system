# DevOps Setup (CI/CD, IaC) in the AWS Educational Project

DevOps automates deployment via GitHub Actions and Terraform.  
For monorepo: paths filtering for selective deploys.

## Prerequisites
- GitHub repo with monorepo structure.
- OIDC in AWS accounts for Actions.

## OIDC Setup
In each account:
- Create IAM OIDC provider: token.actions.githubusercontent.com.
- Role: Trust repo (subject: "repo:your-org/my-project:ref:refs/heads/main").

## CI/CD Pipelines
- Separate workflows for frontend, backend, infra (as in prior guides).
- For monorepo: Add paths in on: push.

Example master workflow for infra:
```yaml
name: Deploy Shared Infra

on:
  push:
    branches: [ main ]
    paths: [ 'infra/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::SHARED_ID:role/GitHubActions-InfraDeploy
          aws-region: us-east-1

      - name: Terraform Init & Apply
        working-directory: infra/shared
        run: |
          terraform init
          terraform apply -auto-approve
IaC Best Practices

Modules for reusable components.
State in S3 backend.
Variables/secrets in GitHub.

Tips

Prod approvals: GitHub Environments.
Add test steps.
