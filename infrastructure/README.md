## Шаг 1. Зафиксировать модель multi-account и “контракт интеграции”

Цель: один входной API в твоём аккаунте, а команды деплоят свои лямбды у себя, и дают разрешение на вызов из твоего API Gateway.

### Что добавляем в репозиторий

1. `docs/ACCOUNTS.md` — таблица аккаунтов и обязательные параметры
- `ACCOUNT_ID, REGION`
- `SERVICE_NAME`
- `LAMBDA_ARN` (после деплоя)
- `STAGE` (dev/prod)
- кто владелец сервиса
2. `docs/INTEGRATION_CONTRACT.md`
- как формируется base path (`/auth`, `/core`, `/users`, …)
- требования к Lambda handler (JSON, CORS, ошибки)
- требования к логированию (CloudWatch)
- обязательные env-переменные (DB_URL, JWT_SECRET и т.п.)

✅ Это превращает “знания в чатах” в нормальный контракт.

## Шаг 2. Разделить IaC на “hub” и “services”

Цель: чтобы у тебя был 1 стек, а у каждого участника — свой стек, но всё живёт в одном репо.

### Рекомендуемая структура (монорепо)
```
campus-control-system/
  README.md

  docs/
    ACCOUNTS.md
    INTEGRATION_CONTRACT.md
    DEPLOYMENT_FLOW.md
    TROUBLESHOOTING.md

  infrastructure/
    hub/
      README.md
      template.yaml              # CloudFormation/SAM: API Gateway + (опционально) authorizer + shared resources
      params/
        dev.json
        prod.json

    frontend-hosting/
      README.md
      template.yaml              # S3 + (опционально) CloudFront + Route53 (по ситуации)
      params/
        dev.json
        prod.json

    services-contract/
      README.md
      openapi/
        hub.openapi.yaml         # агрегированный контракт (опционально)
      examples/
        lambda-response.json

  services/                      # сервисы команд (каждый деплоит в СВОЙ аккаунт)
    auth/
      README.md
      template.yaml              # SAM: Lambda + permission allow invoke from HUB api
      src/
    core/
      README.md
      template.yaml
      src/
    users/
      README.md
      template.yaml
      src/

  frontend/
    README.md
    src/

  backend/                       # если есть общий backend-слой или shared libs
    README.md

  lambdas/                       # если у вас исторически тут лежит код
    README.md
```

Ключевая идея:
- `infrastructure/hub/template.yaml` — единый API Gateway и интеграции на чужие Lambda ARN
- `services/<service>/template.yaml` — аккаунт конкретной команды, там Lambda и AWS::Lambda::Permission, разрешающая вызов из hub’а

## Шаг 3. Ввести “единый источник правды” для ARNs (без магии)

Проблема multi-account всегда одна: где хранить чужие ARN, чтобы hub-стек мог их использовать.

### Практичный способ для учебного проекта
- В `docs/ACCOUNTS.md` храните “человеческие” значения.
- В `infrastructure/hub/params/dev.json` храните реальные ARNs как параметры стека:
  - `AuthLambdaArn`
  - `CoreLambdaArn`

и т.д.

То есть hub-stack не “угадывает”, а получает ARNs как входные параметры.

## Шаг 4. Шаблон SAM для сервисов участников: Lambda + Permission “для hub API”

Каждый сервис в `services/<name>/template.yaml` должен делать 2 вещи:

1. создать Lambda
2. добавить `AWS::Lambda::Permission`, чтобы твой API Gateway мог вызывать эту Lambda

Именно это обеспечивает “интеграцию аккаунтов”.

В README сервиса фиксируем:
- как деплоить в своём аккаунте
- какую ARN копировать в infrastructure/hub/params/dev.json

## Шаг 5. Hub-stack: API Gateway routes → integrations на чужие Lambda

В `infrastructure/hub/template.yaml` описываем:
- API (REST или HTTP API — что вы выбрали)
- routes `/auth/*`, `/core/*` и т.п.
- integration URI = параметр `...LambdaArn`

Важно: hub-stack — это только твой аккаунт, без попыток создать что-то у ребят.

## Шаг 6. Deployment flow (чтобы команда не ломалась)

Добавляем `docs/DEPLOYMENT_FLOW.md` — строго по шагам:
1. участник деплоит `services/<service>`
2. получает `LambdaArn` (из output)
3. открывает PR, обновляет `infrastructure/hub/params/dev.json` (вписывает ARN)
4. деплой hub-stack
5. фронт работает через один API endpoint

Это делает интеграцию дисциплинированной.

## Шаг 7. README-структура: чтобы ваши текущие README “сошлись” в одну систему

README приводим к единому стандарту.

### Единый шаблон README для каждого компонента (hub, service, frontend)

- Purpose
- Architecture diagram (ссылка на composer screenshot / exports)
- Deploy (локально и через CI)
- Required parameters (ARNs, region, env vars)
- Outputs (что отдаёт stack)
- Troubleshooting