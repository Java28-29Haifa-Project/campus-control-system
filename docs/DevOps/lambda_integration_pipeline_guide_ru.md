# Мини-гайд: Интеграция AWS Lambda и тестирование полного pipeline (русский)

## Цель
Обеспечить корректное соединение API Gateway с Lambda и тестирование полного pipeline Frontend → Gateway → Lambda → База данных.

---

## 1. Проверка Lambda

1. Убедиться, что Lambda готова принимать `event` от API Gateway.
2. Проверить IAM Role Lambda:
   - Gateway должен иметь право вызывать функцию (`lambda:InvokeFunction`).
3. Убедиться, что Lambda имеет доступ к тестовой базе данных (через IAM Role или credentials).

---

## 2. Настройка интеграции Gateway → Lambda

1. В API Gateway выбрать маршрут → Integration → Lambda.
2. Указать нужную Lambda функцию.
3. Применить JWT Authorizer (если ещё не применен).
4. Деплоить Stage (`dev` или `prod`).

> После этого Gateway будет корректно передавать запросы на Lambda.

---

## 3. Тестирование интеграции

### 3.1. Gateway → Lambda

1. Использовать Postman или curl:
   ```bash
   curl -X GET https://api.example.com/prod/users/123 \
   -H "Authorization: Bearer <JWT>" \
   -H "Content-Type: application/json"
   ```
2. Проверить, что Lambda получает `event` с query, headers, path и body.
3. Проверить ошибки:
   - 401/403 → JWT невалиден
   - 404 → неверный маршрут

### 3.2. Lambda → База данных

1. Lambda подключается к тестовой базе (например, Supabase).
2. Проверить чтение/запись данных.
3. Проверить ошибки подключения и авторизации.

### 3.3. Frontend → Gateway → Lambda → DB

1. Запустить фронт на Amplify.
2. Отправить тестовый запрос.
3. Проверить корректный ответ JSON.
4. Проверить CORS: браузер не должен блокировать запрос.

---

## 4. Рекомендации

- Использовать тестовую базу (Supabase / ElephantSQL) для учебного проекта.
- Проверять IAM роли и права на вызов Lambda.
- Деплоить Stage после каждого изменения.
- Логировать запросы в CloudWatch для отслеживания проблем.

---

## Итог
После выполнения всех шагов весь pipeline работает: Frontend → API Gateway (CORS + JWT) → Lambda → База данных.