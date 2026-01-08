# Деплой Backend (Микросервисы на AWS Lambda) в учебном проекте

Этот документ описывает процесс деплоя микросервисов на AWS Lambda в multi-account архитектуре.  
Каждый микросервис — отдельная Lambda-функция (или группа), разворачивается в своём **Backend Account**.  
Интеграция с API Gateway в **Shared Services Account** через cross-account permissions.

## Предварительные требования
- Код микросервиса (например, Node.js/Python с handler'ом, package.json/requirements.txt).
- AWS CLI установлен.
- Доступ к Backend Account и Shared Account.
- В Shared Account уже создан API Gateway.
- Для деплоя используйте Serverless Framework или AWS SAM (рекомендуется SAM для AWS-native).

## Настройка инфраструктуры (в Backend Account)

### Вариант 1: Через AWS Console (быстро)
1. **Создайте Lambda функцию**
   - Имя: `my-microservice-function`.
   - Runtime: Node.js 20 / Python 3.12.
   - Загрузите код как ZIP (или используйте ECR для контейнеров).
   - Environment variables: если нужны (DB_URL, secrets).

2. **IAM Role для Lambda**
   - Создайте role с basic Lambda execution + нужные policies (e.g., RDS access).
   - Добавьте trust policy для cross-account: allow Shared Account ID to assume/invoke.

3. **Cross-account permission**
   - На Lambda добавьте permission: `lambda:AddPermission` для API Gateway (principal: apigateway.amazonaws.com, source-arn из Shared).

### Вариант 2: Terraform (рекомендуется)
Пример для одного микросервиса:
```hcl
module "lambda_microservice" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "~> 7.0"

  function_name = "my-microservice"
  handler       = "index.handler"  # для Node.js
  runtime       = "nodejs20.x"
  source_path   = "../services/my-service"  # путь к коду

  # Environment vars
  environment_variables = {
    DB_HOST = "rds-endpoint"
  }

  # IAM policy
  attach_policies = true
  policies = ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]

  # Cross-account invoke
  create_lambda_function_url = false
}
Cross-account интеграция с API Gateway
В Backend Account:

Добавьте permission на Lambda:Bashaws lambda add-permission --function-name my-microservice \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:region:shared-account-id:api-id/*" \
  --profile backend

В Shared Account: Интегрируйте в API Gateway (см. инструкцию по API Gateway).
Ручной деплой
Bash# Для SAM: в services/my-service/
sam build
sam deploy --guided  # следуйте инструкциям, укажите backend stack

# Или Serverless Framework
sls deploy --aws-profile backend
Автоматический деплой через GitHub Actions
Файл .github/workflows/deploy-microservice.yml (адаптируйте для каждого сервиса):
YAMLname: Deploy Lambda Microservice

on:
  push:
    branches: [ main ]
    paths: [ 'services/my-service/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup SAM
        uses: aws-actions/setup-sam@v2

      - name: Configure AWS Credentials (Backend Account)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::BACKEND_ACCOUNT_ID:role/GitHubActions-LambdaDeploy
          aws-region: us-east-1

      - name: Build and Deploy
        working-directory: services/my-service
        run: |
          sam build
          sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
Полезные советы

Тестируйте локально: sam local invoke.
Logs: CloudWatch Logs в Backend Account.
Стоимость: Почти бесплатно в Free Tier (1M requests/месяц).
