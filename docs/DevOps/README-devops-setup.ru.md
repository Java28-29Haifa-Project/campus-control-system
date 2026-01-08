# Настройка DevOps (CI/CD, IaC) в учебном проекте на AWS

DevOps — автоматизация деплоя через GitHub Actions и Terraform.  
Для монопо: paths filtering для selective deploy.

## Предварительные требования
- GitHub repo с монопо структурой.
- OIDC в AWS accounts для Actions.

## Настройка OIDC
В каждом account:
- Создайте IAM OIDC provider: token.actions.githubusercontent.com.
- Role: Trust на repo (subject: "repo:your-org/my-project:ref:refs/heads/main").

## CI/CD Pipelines
- Отдельные workflows для frontend, backend, infra (как в предыдущих инструкциях).
- Для монопо: Добавьте paths в on: push.

Пример master workflow для infra:
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

      - name: Configure AWS (Shared)
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

Модули для reusable components.
State в S3 backend.
Variables/secrets в GitHub.

Полезные советы

Approvals для prod: GitHub Environments.
Testing: Добавьте test steps.
