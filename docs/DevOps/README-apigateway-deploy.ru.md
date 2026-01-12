# Деплой API Gateway в учебном проекте на AWS

API Gateway — центральная точка входа, размещается в **Shared Services Account**.  
Он маршрутизирует запросы к Lambda в backend accounts, добавляет auth, throttling.

## Предварительные требования
- Lambda функции в backend accounts с permissions.
- AWS CLI/Terraform.
- Опционально: Cognito для auth.

## Настройка инфраструктуры

### Вариант 1: AWS Console
1. **Создайте REST API**
   - Тип: HTTP API (дешевле) или REST API (больше фич).
   - Добавьте methods (GET/POST) и paths (/users, /orders).

2. **Интеграция с Lambda**
   - Для каждого route: Integration type — Lambda proxy.
   - Lambda ARN: из backend account (cross-account OK).

3. **Deploy API**
   - Создайте stage (prod/staging).
   - Получите invoke URL.

### Вариант 2: Terraform
```hcl
module "api_gateway" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "~> 5.0"

  name          = "my-project-api"
  protocol_type = "HTTP"

  integrations = {
    "GET /users" = {
      lambda_arn = "arn:aws:lambda:region:backend-account-id:function:my-users-lambda"
    }
    # Добавьте другие routes
  }

  domain_name = "api.myproject.com"  # опционально
}
Cross-account настройка

Lambda в backend уже имеют permissions (см. backend инструкцию).

Ручной деплой
Bash# Если используете AWS CDK или Terraform — apply
terraform apply
Автоматический деплой
В GitHub Actions: После деплоя Lambda обновите API Gateway routes через CLI или Terraform.
Пример workflow:
YAMLname: Update API Gateway

on:
  workflow_dispatch:  # Ручной, или после backend deploy

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS (Shared)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::SHARED_ID:role/GitHubActions-APIDeploy
          aws-region: us-east-1

      - name: Deploy API
        run: terraform apply -auto-approve  # из infra/shared/
Полезные советы

CORS: Включите для frontend.
Auth: Добавьте Cognito authorizer.
Monitoring: API Gateway metrics в CloudWatch.
