# 🚀 Деплоймент сайту ФУСАФ на ADM.tools

## 📋 Крок за кроком інструкція

### 1. Завантаження файлів
1. Увійдіть в панель управління ADM.tools
2. Завантажте всі файли з цієї папки в корінь вашого сайту
3. Переконайтесь, що структура файлів така:
```
/
├── .next/          # Збірка Next.js
├── public/         # Статичні файли
├── package.json    # Залежності
├── next.config.js  # Конфігурація Next.js
├── .env           # Environment variables
└── README.md      # Ця інструкція
```

### 2. Налаштування Node.js
В панелі ADM.tools:
1. Оберіть версію Node.js: **18.x або новіше**
2. Встановіть стартовий скрипт: `npm start`
3. Або, якщо доступний Bun: `bun start`

### 3. Встановлення залежностей
Виконайте в терміналі хостингу:
```bash
npm install --production
# або якщо є bun:
# bun install --production
```

### 4. Оновлення Environment Variables
Відредагуйте файл `.env` і замініть:
```env
# Замініть на ваш реальний домен
NEXTAUTH_URL=https://fusaf.org.ua
APP_URL=https://fusaf.org.ua
FROM_EMAIL=noreply@fusaf.org.ua

# Додайте реальні ключі LiqPay (якщо потрібно)
LIQPAY_PUBLIC_KEY=ваш_публічний_ключ
LIQPAY_PRIVATE_KEY=ваш_приватний_ключ
LIQPAY_SANDBOX=false
```

### 5. Налаштування зовнішніх сервісів

#### Google OAuth:
1. Відкрийте [Google Cloud Console](https://console.cloud.google.com)
2. Перейдіть до вашого OAuth проекту
3. Додайте до **Authorized origins**: `https://fusaf.org.ua`
4. Додайте до **Redirect URIs**: `https://fusaf.org.ua/api/auth/callback/google`

#### Supabase:
1. Відкрийте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдіть до Authentication > URL Configuration
3. Встановіть **Site URL**: `https://fusaf.org.ua`
4. Додайте **Redirect URLs**: `https://fusaf.org.ua/auth/callback`

### 6. Запуск сайту
1. Перезапустіть Node.js додаток в панелі ADM.tools
2. Відкрийте ваш домен в браузері
3. Перевірте, що сайт працює коректно

### 7. Тестування
- ✅ Перевірте головну сторінку
- ✅ Протестуйте кнопку "Увійти з Google"
- ✅ Перевірте навігацію по всіх сторінках
- ✅ Протестуйте форми реєстрації

## 🆘 Можливі проблеми

### Помилка 500 Internal Server Error
- Перевірте, що Node.js версія 18+
- Перевірте логи сервера в панелі ADM.tools
- Переконайтесь, що всі залежності встановлені

### Помилка аутентифікації Google
- Перевірте правильність налаштування redirect URLs
- Переконайтесь, що домен збігається в Google Console та .env файлі

### Помилка підключення до Supabase
- Перевірте, що ключі Supabase в .env файлі правильні
- Переконайтесь, що Site URL в Supabase збігається з вашим доменом

## ✅ Готово!
Ваш сайт ФУСАФ готовий до роботи! 🎉

### Контакти для підтримки:
- Документація ADM.tools
- Supabase документація
- Next.js документація
