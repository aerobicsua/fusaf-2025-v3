# Налаштування Gmail для надсилання email

## Поточний статус
- **Email відправника:** aerobicsua@gmail.com ✅
- **Конфігурація:** готова ✅
- **Проблема:** потрібен App Password для Gmail ❌

## Кроки налаштування:

### 1. Включити 2-Step Verification
1. Перейдіть на https://myaccount.google.com/security
2. Увійдіть в акаунт `aerobicsua@gmail.com`
3. В розділі "Signing in to Google" → "2-Step Verification" → увімкніть
4. Налаштуйте через SMS або Authenticator

### 2. Створити App Password
1. Перейдіть на https://myaccount.google.com/apppasswords
2. Оберіть "Mail" або "Other (Custom name)"
3. Введіть назву: "FUSAF Website"
4. Скопіюйте згенерований 16-символьний пароль

### 3. Додати до .env.local
```bash
GMAIL_USER=aerobicsua@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password_here
```

### 4. Перезапустити сервер
```bash
bun run dev
```

## Тестування після налаштування:
```bash
curl -X POST "http://localhost:3000/api/test-email-service" \
  -H "Content-Type: application/json" \
  -d '{"to":"ваш_email@example.com","type":"test"}'
```

## Альтернативні рішення:

### 1. Використання SMTP2GO або SendGrid
Якщо Gmail не підходить, можна використати інші сервіси.

### 2. Логування замість відправки
Для розробки можна просто логувати email в консоль замість реальної відправки.

## Поточний код
Email сервіс налаштований правильно і готовий до роботи після додавання App Password.
