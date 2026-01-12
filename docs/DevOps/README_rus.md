# Учебный проект: Serverless-приложение на AWS (React + Lambda + API Gateway + PostgreSQL)

## Общая архитектура

Проект реализует современную serverless-архитектуру на AWS с использованием multi-account подхода для изоляции работы отдельных групп.
     
### Компоненты
- **Frontend**: Single Page Application на React, хостинг на Amazon S3 + CloudFront (CDN, HTTPS).
- **Backend**:   Микросервисы на AWS Lambda (serverless functions).
- **API**: Amazon API Gateway — единая точка входа, маршрутизация запросов к Lambda-функциям.
- **База данных**: Amazon RDS for PostgreSQL (управляемая реляционная СУБД).
- **Аутентификация** (опционально): Amazon Cognito.

### Multi-account структура (рекомендуется AWS Best Practices)
- **Shared Services Account** — центральный аккаунт:
  - Amazon API Gateway
  - S3 bucket для frontend
  - CloudFront distribution
  - RDS PostgreSQL
  - Cognito User Pool (если нужна аутентификация)
- **Frontend Account** — группа, отвечающая за React-приложение.
- **Backend Accounts** — по одному аккаунту на каждую группу микросервисов (свои Lambda-функции).

Такой подход обеспечивает:
- Изоляцию ресурсов и ответственности
- Безопасность (least privilege)
- Независимый деплой каждой части
- Простое управление биллингом

### Интеграция между аккаунтами
- Lambda-функции в backend-аккаунтах вызываются API Gateway из shared-аккаунта через cross-account IAM roles.
- Frontend получает доступ к S3 bucket через bucket policy.
- Доступ к RDS — через Security Groups и cross-account VPC (или публичный доступ только для разработки с ограничениями).

### DevOps-подход
- **Infrastructure as Code**: Terraform или AWS CloudFormation.
- **CI/CD**: AWS CodePipeline + CodeBuild (или GitHub Actions с cross-account assume role).
- Каждая группа отвечает за деплой своей части через собственный pipeline.
- Staging и Production среды разделены.

### Стоимость
Проект спроектирован с учётом минимизации затрат:
- Использование AWS Free Tier (RDS db.t3.micro, EC2, S3 и др.).
- RDS PostgreSQL на db.t3.micro — бесплатно в Free Tier (750 часов/месяц + 20 GB storage).
- Lambda и API Gateway — pay-per-use, при учебной нагрузке почти бесплатно.

### Как начать
1. Создать AWS Organization и необходимые аккаунты.
2. В Shared Services аккаунте развернуть API Gateway, S3, CloudFront, RDS.
3. Каждая группа разрабатывает и деплоит свою часть с использованием IaC.
4. Настроить cross-account permissions.
