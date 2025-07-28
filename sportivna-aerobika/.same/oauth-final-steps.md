# 🔧 Google OAuth - Фінальне налаштування

## 📝 Що потрібно зробити:

### ✅ Крок 1: Google Cloud Console
```
URL: https://console.cloud.google.com/
Акаунт: andfedos@gmail.com
```

### ✅ Крок 2: Навігація
```
☰ Menu → APIs & Services → Credentials
```

### ✅ Крок 3: Знайти OAuth Client
```
Шукайте OAuth 2.0 Client ID:
554165133232-inhg24a1jtso90f96c5pasa2hopgrdvt
```

### ✅ Крок 4: Додати Redirect URI
```
Authorized redirect URIs:
https://same-eikk4fzfmr5-latest.netlify.app/api/auth/callback/google
```

### ✅ Крок 5: Збереження
```
1. Натиснути SAVE
2. Почекати 1-2 хвилини
3. Спробувати увійти
```

## 🧪 Після налаштування - тестування:

### 1. Відкрити сайт:
```
https://same-eikk4fzfmr5-latest.netlify.app
```

### 2. Натиснути "Увійти з Google"

### 3. Увійти як andfedos@gmail.com

### 4. Перевірити роль адміністратора

## 🎯 Альтернативний спосіб (якщо не працює):

### Створити новий OAuth Client:
1. У Google Cloud Console
2. Credentials → + CREATE CREDENTIALS
3. OAuth 2.0 Client ID
4. Application type: Web application
5. Name: FUSAF Production
6. Authorized redirect URIs:
   ```
   https://same-eikk4fzfmr5-latest.netlify.app/api/auth/callback/google
   ```
7. Скопіювати новий Client ID та Secret
8. Оновити в Netlify Environment Variables

## 🚨 Якщо виникають проблеми:

### Можливі помилки:
- `redirect_uri_mismatch` - неправильний URI
- `access_blocked` - потрібно налаштувати OAuth consent screen
- `invalid_client` - неправильний Client ID

### Рішення:
1. Перевірити точність URI
2. Налаштувати OAuth consent screen
3. Додати тестових користувачів (andfedos@gmail.com)
4. Опублікувати додаток

## ✅ Готово!
Після виправлення OAuth система ФУСАФ повністю функціональна!
