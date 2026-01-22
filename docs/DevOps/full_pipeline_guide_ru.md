# Полный мини-гайд по интеграции Frontend, API Gateway, Lambda и базы данных (русский)

## Цель
Создать единую рабочую цепочку проекта: **Frontend → API Gateway (CORS + JWT) → Lambda → База данных**, с тестовой базой для учебного проекта.

---

## 1. Frontend (Amplify)

- URL: `https://main.d2q14890n6r4m7.amplifyapp.com`
- Отправляет HTTP запросы к API Gateway
- Отправляет JWT в заголовке `Authorization`
- Не знает про Lambda и базу данных

> Задача Frontend команды: тестировать вызовы API по контракту.

---

## 2. API Gateway

### Настройка CORS
- `Access-Control-Allow-Origin: https://main.d2q14890n6r4m7.amplifyapp.com`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Authorization, Content-Type`
- `Access-Control-Allow-Credentials: true`
- Метод `OPTIONS` должен быть настроен для preflight
- Деплой Stage (`dev` или `prod`)

### JWT авторизация
- Identity source: `Authorization` header
- JWT issuer: сервис авторизации
- Audience: идентификатор приложения
- Применить к нужным маршрутам

### Интеграция с Lambda
- Указать Lambda функцию для каждого маршрута
- Проверить IAM Role Lambda (`lambda:InvokeFunction`)
- Деплой Stage после изменений

---

## 3. Lambda

- Принимает `event` от Gateway
- Подключается к базе данных через credentials или IAM
- Обрабатывает бизнес-логику
- Возвращает JSON в Gateway

### Тестирование
1. Gateway → Lambda: curl / Postman с JWT
2. Lambda → база: read/write operations
3. Frontend → Gateway → Lambda → база: полный flow

---

## 4. База данных

- Рекомендуется бесплатная тестовая база: Supabase или ElephantSQL
- Lambda использует credentials для подключения
- Gateway не знает о базе данных

---

## 5. Рекомендации координации

- Проверять IAM роли и права вызова Lambda
- Деплой Stage после любых изменений
- Использовать CloudWatch для логов
- Документировать все endpoint, методы и авторизацию

---

## Итог
Все части проекта работают согласованно:
```
Frontend (Amplify) → API Gateway (CORS + JWT) → Lambda → Database
```