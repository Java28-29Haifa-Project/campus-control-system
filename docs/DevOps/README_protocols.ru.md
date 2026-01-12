# Взаимодействие Frontend ↔ API Gateway

## Протоколы, безопасность и multi-account архитектура

В этом документе описано, как frontend-приложения взаимодействуют с AWS API Gateway в архитектуре с несколькими аккаунтами, какие протоколы используются и почему HTTPS является обязательным.

---

## 1. Транспортный протокол

Всё взаимодействие между Frontend (Browser / SPA) и AWS API Gateway происходит по:

- Только HTTPS
- HTTP/1.1 или HTTP/2 поверх TLS 1.2+
- JSON / REST (или WebSocket API в отдельных случаях)

Публичные endpoint API Gateway всегда имеют вид:

https://{api-id}.execute-api.{region}.amazonaws.com

Опубликовать HTTP (без TLS) endpoint через API Gateway невозможно.

---

## 2. Возможен ли HTTP вообще?

### Технически
HTTP допустим только внутри приватных сетей:
- EC2 ↔ EC2 в одной VPC
- Internal ALB ↔ EC2
- Сервис ↔ сервис без участия браузера

### Сценарий Frontend + Browser
HTTP неприменим:
- Браузеры блокируют mixed content (https → http)
- Secure-cookie не передаются по HTTP
- JWT и токены по HTTP небезопасны
- API Gateway не предоставляет публичных HTTP endpoint

Вывод: HTTP не подходит для Frontend ↔ API Gateway.

---

## 3. API Gateway и HTTPS

API Gateway:
- Всегда использует TLS
- Всегда предоставляет HTTPS endpoint
- Не требует ручной настройки TLS
- Использует управляемые AWS сертификаты

Пользовательские домены также работают только по HTTPS (через ACM).

---

## 4. Доверие аккаунтов и протокол

Важно понимать:

Доверие между AWS аккаунтами не реализуется через HTTP или HTTPS.

- HTTPS — транспортный уровень
- IAM / JWT — уровень авторизации и доверия
- AWS аккаунты — административные границы

Это разные уровни, решающие разные задачи.

---

## 5. Авторизация поверх HTTPS

Наиболее распространённые варианты:
- JWT authorizer (основной вариант для браузеров)
- Lambda authorizer (кастомная логика, дороже)
- IAM SigV4 (service-to-service, не для браузеров)

---

## 6. Cookies, CORS и HTTPS

При использовании cookie:
- Флаг Secure требует HTTPS
- SameSite=None требует HTTPS
- CORS должен явно разрешать credentials

---

## 7. Итог

- Frontend ↔ API Gateway работает только по HTTPS
- HTTP не используется для публичного доступа
- Доверие аккаунтов решается IAM/JWT, а не протоколом
- HTTPS включён по умолчанию и не требует оплаты
