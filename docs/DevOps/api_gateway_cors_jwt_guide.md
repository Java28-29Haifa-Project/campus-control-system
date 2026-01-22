# Мини-гайд: Настройка CORS + JWT в AWS API Gateway для фронтенда на Amplify (русский)

## Цель
Обеспечить корректное взаимодействие фронтенда на Amplify с API Gateway с использованием JWT авторизации и правильных CORS заголовков.

---

## 1. Уточняем Frontend Origin

- Фронтенд живет на Amplify: `https://main.d2q14890n6r4m7.amplifyapp.com`
- Этот адрес нужно использовать в `Access-Control-Allow-Origin`.

---

## 2. Настройка CORS в API Gateway

1. Открыть AWS API Gateway → нужный API → Routes → выбранный маршрут.
2. Включить CORS.
3. Настроить заголовки:
   ```
   Access-Control-Allow-Origin: https://main.d2q14890n6r4m7.amplifyapp.com
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Authorization, Content-Type
   Access-Control-Allow-Credentials: true
   ```
4. Убедиться, что метод OPTIONS существует и обрабатывает preflight запросы.
5. Деплоить Stage (`dev` или `prod`).

---

## 3. Настройка JWT авторизации

1. В API Gateway выбрать JWT Authorizer.
2. Указать:
   - Identity source: `Authorization` header
   - JWT issuer: URL сервиса авторизации
   - Audience: идентификатор вашего приложения
3. Применить Authorizer к нужным маршрутам.

> После настройки Gateway будет проверять JWT перед вызовом Lambda.

---

## 4. Тестирование

1. Проверить preflight OPTIONS запрос с браузера → должны приходить корректные CORS заголовки.
2. Отправить GET/POST запрос с JWT → Lambda должна получать `event`.
3. Проверить ошибки:
   - `401/403` → неверный или отсутствующий JWT
   - `CORS policy` → неверный origin или Stage не деплоен

---

## 5. Итог
- Frontend на Amplify может безопасно делать запросы к API Gateway.
- JWT авторизация проверяет права пользователя на уровне Gateway.
- CORS настроен для конкретного origin, чтобы браузер не блокировал запросы.

