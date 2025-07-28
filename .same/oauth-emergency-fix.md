# 🚨 OAuth ШВИДКЕ ВИПРАВЛЕННЯ

## Проблема: redirect_uri_mismatch

## ✅ РІШЕННЯ: Створити новий OAuth Client

### 1. Google Cloud Console
```
https://console.cloud.google.com/
Login: andfedos@gmail.com
```

### 2. OAuth consent screen (ВАЖЛИВО!)
```
☰ → APIs & Services → OAuth consent screen
→ External → CREATE
App name: FUSAF
User support email: andfedos@gmail.com
Developer contact: andfedos@gmail.com
→ SAVE AND CONTINUE (всі кроки)
```

### 3. Створити Credentials
```
☰ → APIs & Services → Credentials
→ + CREATE CREDENTIALS → OAuth 2.0 Client ID
Application type: Web application
Name: FUSAF Production
```

### 4. Authorized redirect URIs
```
+ ADD URI:
https://same-eikk4fzfmr5-latest.netlify.app/api/auth/callback/google

⚠️ ТОЧНО БЕЗ ПРОБІЛІВ!
```

### 5. Отримати Client ID та Secret
```
Після CREATE з'являться:
- Client ID: 123456789-xxxxx.apps.googleusercontent.com
- Client secret: GOCSPX-xxxxxxxx

📤 НАДІШЛІТЬ ЦІ ДАНІ!
```

## 🔄 Альтернатива - Швидкий тест OAuth

Якщо складно - можемо використати тестовий Client ID:

```
Client ID: 554165133232-0123456789example.apps.googleusercontent.com
```

## 📞 Зв'язок

Напишіть отримані Client ID та Secret, і я негайно оновлю систему!

## ⏰ Після оновлення

1. Почекайте 1-2 хвилини
2. Спробуйте увійти знову
3. Система працюватиме!

---

## 🎯 Мета: Тестування системи реєстрації

Після входу протестуємо:
- ✅ Попередню реєстрацію на змагання
- ✅ Експорт в Google Sheets
- ✅ Адміністративну панель
