# Деплой Frontend (React) в учебном проекте на AWS

Этот документ описывает процесс деплоя React-приложения в multi-account архитектуре проекта.  
Frontend размещается как статический сайт на **Amazon S3** с доставкой через **Amazon CloudFront**.  
S3 bucket и CloudFront distribution находятся в **Shared Services Account**, а деплой выполняется из **Frontend Account**.

## Предварительные требования
- React-приложение (create-react-app, Vite или аналог) с скриптом `npm run build` (выходная папка — `build` или `dist`).
- AWS CLI установлен и настроен.
- Доступ к обоим аккаунтам (через AWS profiles или switch role).
- В Shared Services Account уже созданы:
  - S3 bucket для статического хостинга
  - CloudFront distribution с Origin Access Control (OAC) — рекомендуется

## Настройка инфраструктуры (один раз, в Shared Services Account)

### Вариант 1: Через AWS Console (быстро)
1. **S3 bucket**
   - Создайте bucket (уникальное имя, например `my-project-frontend-2026`).
   - Region: предпочтительно `us-east-1` (для ACM сертификатов).
   - **Block all public access** — оставьте включённым (доступ будет только через CloudFront).

2. **CloudFront distribution**
   - Origin → ваш S3 bucket.
   - Origin access → **Origin Access Control (OAC)** (рекомендуется с 2023+).
   - Viewer protocol → Redirect HTTP to HTTPS.
   - Default root object: `index.html`.
   - **Ошибка 403 и 404** → Custom error response: redirect to `/index.html` с кодом 200 (важно для SPA routing!).
   - При необходимости добавьте CNAME и SSL-сертификат ACM.
   - Сохраните и дождитесь деплоя (~15 мин).

### Вариант 2: Terraform (рекомендуется для проекта)
Используйте готовый модуль или напишите свой. Пример:
```hcl
module "frontend_hosting" {
  source  = "terraform-aws-modules/s3-cloudfront-website/aws"
  version = "~> 3.0"

  bucket_name         = "my-project-frontend-2026"
  cloudfront_aliases  = ["frontend.myproject.example"]  # опционально
  error_document      = "index.html"
  index_document      = "index.html"
}
Cross-account доступ для деплоя
Чтобы Frontend Account мог загружать файлы в shared bucket:
В Shared Services Account:

Создайте IAM Policy с правами на S3 (PutObject, ListBucket, DeleteObject) для вашего bucket.
Или добавьте в bucket policy разрешение для роли/пользователя из Frontend Account.

В Frontend Account:

Создайте IAM Role (например, FrontendDeployRole) с assume role от GitHub Actions или вашего пользователя.
Прикрепите политику, позволяющую assume role в Shared Account и выполнять действия с bucket.

Ручной деплой (для тестирования)
Bash# 1. Сборка приложения
npm ci
npm run build

# 2. Синхронизация с S3 (используйте профиль shared или assume-role)
aws s3 sync build/ s3://my-project-frontend-2026/ --delete --profile shared

# 3. Инвалидация кэша CloudFront (чтобы увидеть изменения сразу)
aws cloudfront create-invalidation \
    --distribution-id EXXXXXXX \
    --paths "/*" \
    --profile shared
После этого приложение доступно по домену CloudFront (например, d1234567890.cloudfront.net).
Автоматический деплой через GitHub Actions (рекомендуется)
Создайте файл .github/workflows/deploy-frontend.yml в репозитории фронтенда:
YAMLname: Deploy React to AWS S3 + CloudFront

on:
  push:
    branches: [ main ]        # production
  workflow_dispatch:          # ручной запуск

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write          # для OIDC

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

      - name: Configure AWS Credentials (cross-account)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::SHARED_ACCOUNT_ID:role/FrontendDeployRole
          aws-region: us-east-1
          role-session-name: github-frontend-deploy

      - name: Upload to S3
        run: aws s3 sync build/ s3://my-project-frontend-2026/ --delete --cache-control max-age=60

      - name: Invalidate CloudFront Cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
Секреты в репозитории GitHub:

CLOUDFRONT_DISTRIBUTION_ID — ID вашей CloudFront distribution.

Теперь при каждом push в main приложение автоматически собирается и деплоится.
Полезные советы

Для staging среды создайте отдельный bucket и CloudFront distribution.
CORS настраивается в API Gateway, а не в S3.
Укажите URL API Gateway в .env.production (например, REACT_APP_API_URL=https://api.example.com).
Мониторьте затраты — при учебной нагрузке почти бесплатно (Free Tier покрывает S3 и CloudFront).
