# 🚀 ДЕТАЛЬНА ІНСТРУКЦІЯ ДЕПЛОЙМЕНТУ НА ADM.TOOLS

## 📋 ПЕРЕДУМОВИ

Перед початком переконайтеся що у вас є:
- ✅ Доступ до панелі ADM.tools
- ✅ Домен fusaf.org.ua налаштований
- ✅ Всі файли з папки `fusaf-minimal/`

---

## 🎯 КРОК 1: ПІДГОТОВКА ФАЙЛІВ

### 1.1 Перевірте структуру файлів
```
fusaf-minimal/
├── .next/          ← Готова збірка (512MB+)
├── public/         ← Статичні файли
├── package.json    ← Залежності Node.js
├── next.config.js  ← Конфігурація Next.js
├── .env           ← Environment variables
└── README.md      ← Інструкції
```

### 1.2 Створіть ZIP архів
Якщо файли великі, створіть архів:
```bash
# На вашому комп'ютері:
cd fusaf-minimal/
zip -r fusaf-website.zip . -x "*.DS_Store" "*.git*"
```

---

## 🌐 КРОК 2: ЗАВАНТАЖЕННЯ НА ADM.TOOLS

### 2.1 Увійдіть в панель управління
1. Відкрийте https://adm.tools/
2. Увійдіть в ваш акаунт
3. Перейдіть до управління хостингом fusaf.org.ua

### 2.2 Завантаження через File Manager
1. У панелі знайдіть **"File Manager"** або **"Файловий менеджер"**
2. Перейдіть в **корінь сайту** (зазвичай `/public_html/` або `/www/`)
3. **Видаліть існуючі файли** (якщо є)
4. Завантажте всі файли з `fusaf-minimal/`:

**Опція A: Окремі файли**
- Завантажте папку `.next/` (може зайняти час)
- Завантажте папку `public/`
- Завантажте `package.json`
- Завантажте `next.config.js`
- Завантажте `.env`

**Опція B: ZIP архів**
- Завантажте `fusaf-website.zip`
- Розпакуйте архів в корінь сайту
- Видаліть ZIP файл після розпакування

### 2.3 Перевірте структуру
Після завантаження структура має бути:
```
/public_html/ (або /www/)
├── .next/
├── public/
├── package.json
├── next.config.js
└── .env
```

---

## ⚙️ КРОК 3: НАЛАШТУВАННЯ NODE.JS

### 3.1 Активуйте Node.js
1. У панелі ADM.tools знайдіть розділ **"Node.js"** або **"Node.js Applications"**
2. Натисніть **"Create Application"** або **"Додати додаток"**

### 3.2 Налаштування додатку
```
📝 Параметри Node.js додатку:
┌─────────────────────────┬─────────────────────────┐
│ Назва додатку           │ fusaf-website           │
│ Версія Node.js          │ 18.x або новіша         │
│ Корінь додатку          │ /public_html/           │
│ Стартовий файл         │ package.json            │
│ Команда запуску        │ npm start               │
│ Змінні середовища      │ Production              │
│ Автозапуск             │ Увімкнути               │
└─────────────────────────┴─────────────────────────┘
```

### 3.3 Встановіть залежності
У терміналі ADM.tools (або SSH):
```bash
cd /home/username/public_html/  # Замініть на ваш шлях
npm install --production --no-dev
```

**Примітка**: Процес може зайняти 3-5 хвилин.

---

## 🔧 КРОК 4: НАЛАШТУВАННЯ ENVIRONMENT VARIABLES

### 4.1 Перевірте .env файл
Відкрийте `.env` файл і переконайтеся:
```env
# Перевірте що домен правильний:
NEXTAUTH_URL=https://fusaf.org.ua
APP_URL=https://fusaf.org.ua
FROM_EMAIL=noreply@fusaf.org.ua

# Supabase налаштування готові:
NEXT_PUBLIC_SUPABASE_URL=https://wmdkymgpcitlnfiwmsuq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth готовий:
GOOGLE_CLIENT_ID=554165133232-inhg24a1jtso90f96c5pasa2hopgrdvt.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### 4.2 Додаткові змінні (за потреби)
Додайте до `.env` файлу:
```env
# Для production
NODE_ENV=production
PORT=3000

# Для логування
LOG_LEVEL=info

# Для безпеки
SESSION_SECRET=fusaf-ukraine-secure-session-2025
```

---

## 🌍 КРОК 5: НАЛАШТУВАННЯ ДОМЕНУ ТА SSL

### 5.1 Налаштування DNS
Переконайтеся що DNS записи вказують на ADM.tools:
```
fusaf.org.ua    A    IP_ADDRESS_ADM_TOOLS
www.fusaf.org.ua CNAME fusaf.org.ua
```

### 5.2 SSL сертифікат
1. У панелі ADM.tools перейдіть до **"SSL/TLS"**
2. Активуйте **Let's Encrypt** безкоштовний SSL
3. Увімкніть **"Force HTTPS"** (переадресація з HTTP на HTTPS)

---

## 🚀 КРОК 6: ЗАПУСК САЙТУ

### 6.1 Запустіть Node.js додаток
1. У розділі **"Node.js"** знайдіть ваш додаток
2. Натисніть **"Start"** або **"Запустити"**
3. Перевірте статус - має бути **"Running"** або **"Запущено"**

### 6.2 Перевірка роботи
Відкрийте у браузері:
- https://fusaf.org.ua
- Має з'явитися головна сторінка ФУСАФ

---

## ✅ КРОК 7: ТЕСТУВАННЯ

### 7.1 Перевірте основні сторінки
- ✅ Головна: https://fusaf.org.ua
- ✅ Членство: https://fusaf.org.ua/membership
- ✅ Змагання: https://fusaf.org.ua/competitions
- ✅ Курси: https://fusaf.org.ua/courses
- ✅ Новини: https://fusaf.org.ua/news
- ✅ Клуби: https://fusaf.org.ua/clubs
- ✅ Інструкції: https://fusaf.org.ua/instructions

### 7.2 Протестуйте функціональність
- ✅ Натисніть кнопку **"Увійти з Google"**
- ✅ Перевірте адаптивний дизайн (мобільні пристрої)
- ✅ Протестуйте навігацію

---

## 🔄 КРОК 8: НАЛАШТУВАННЯ ЗОВНІШНІХ СЕРВІСІВ

### 8.1 Google OAuth
1. Відкрийте [Google Cloud Console](https://console.cloud.google.com)
2. Перейдіть до вашого OAuth проекту
3. У розділі **"Credentials"** → **"OAuth 2.0 Client IDs"**
4. Додайте домени:
   - **Authorized JavaScript origins**: `https://fusaf.org.ua`
   - **Authorized redirect URIs**: `https://fusaf.org.ua/api/auth/callback/google`

### 8.2 Supabase
1. Відкрийте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдіть до проекту `wmdkymgpcitlnfiwmsuq`
3. **Authentication** → **URL Configuration**:
   - **Site URL**: `https://fusaf.org.ua`
   - **Redirect URLs**: `https://fusaf.org.ua/auth/callback`

---

## 🎉 ГОТОВО!

Сайт ФУСАФ успішно розгорнуто на https://fusaf.org.ua

### 📊 Наступні кроки:
1. ✅ Завантажте тестові дані в Supabase
2. ✅ Протестуйте реєстрацію користувачів
3. ✅ Налаштуйте моніторинг та резервне копіювання
4. ✅ Додайте додаткову функціональність

---

## 🆘 РОЗВ'ЯЗАННЯ ПРОБЛЕМ

### Node.js не запускається
```bash
# Перевірте логи:
npm run start

# Перевірте залежності:
npm install --production

# Перевірте порт:
netstat -tulpn | grep :3000
```

### Сайт не відкривається
1. Перевірте DNS записи
2. Перевірте SSL сертифікат
3. Перевірте статус Node.js додатку
4. Перевірте логи сервера

### Помилки аутентифікації
1. Перевірте Google OAuth налаштування
2. Перевірте Supabase URL конфігурацію
3. Перевірте environment variables в `.env`

---

**🇺🇦 Федерація України зі Спортивної Аеробіки і Фітнесу**
**© 2025 ФУСАФ | fusaf.org.ua**
