# Налаштування Supabase для ФУСАФ

## 📋 Покрокова інструкція

### 1. Створення проекту Supabase

1. **Перейдіть на https://supabase.com**
2. **Натисніть "Start your project"**
3. **Увійдіть через GitHub** (рекомендовано)
4. **Створіть новий проект:**
   - Organization: оберіть свою
   - Name: `fusaf-aerobics`
   - Database Password: **створіть надійний пароль і збережіть його!**
   - Region: `Europe (eu-central-1)` - найближчий до України
   - Pricing Plan: Free tier (до 50MB, 500MB bandwidth)

5. **Дочекайтеся завершення** (2-3 хвилини)

### 2. Налаштування бази даних

1. **Перейдіть у SQL Editor**
2. **Скопіюйте та виконайте SQL схему** (файл `database/schema.sql`)
3. **Натисніть RUN** для виконання

### 3. Отримання API ключів

1. **Перейдіть у Settings → API**
2. **Скопіюйте:**
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: починається з `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: секретний ключ (показується при натисканні на око)

### 4. Налаштування Google OAuth

1. **У Supabase перейдіть у Authentication → Providers**
2. **Увімкніть Google Provider**
3. **Налаштуйте redirect URLs:**
   - `http://localhost:3000/auth/callback/google` (для розробки)
   - `https://your-domain.com/auth/callback/google` (для продакшн)

### 5. Створення Google OAuth App

1. **Перейдіть у Google Cloud Console**: https://console.cloud.google.com
2. **Створіть новий проект** або оберіть існуючий
3. **Увімкніть Google+ API**
4. **Створіть OAuth 2.0 Client ID:**
   - Application type: Web application
   - Name: FUSAF Website
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.com/api/auth/callback/google`
     - `https://xxxxx.supabase.co/auth/v1/callback`

5. **Скопіюйте Client ID та Client Secret**

### 6. Environment Variables

Створіть файл `.env.local` з такими змінними:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_string_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App
APP_NAME=ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу
APP_URL=http://localhost:3000
```

### 7. Генерація NEXTAUTH_SECRET

Виконайте в терміналі:
```bash
openssl rand -base64 32
```

### 8. Тестування підключення

1. **Запустіть dev server**: `bun run dev`
2. **Перейдіть на http://localhost:3000**
3. **Спробуйте увійти через Google**
4. **Перевірте чи створюється користувач у Supabase**

## 🔧 Налаштування Row Level Security (RLS)

Після створення таблиць увімкніть RLS:

1. **У Supabase перейдіть у Authentication → Policies**
2. **Перевірте що policies створені** для всіх таблиць
3. **Протестуйте доступ** через додаток

## 📊 Моніторинг

- **Database**: перегляд таблиць та даних
- **Authentication**: користувачі та сесії
- **API**: логи запитів
- **Storage**: файли (якщо використовуєте)

## 🚀 Деплой

Для продакшн-середовища оновіть:
- `NEXTAUTH_URL` на ваш домен
- `APP_URL` на ваш домен
- Redirect URLs у Google OAuth
- Supabase Auth redirect URLs

## ❗ Важливо

- **Ніколи не коммітьте .env.local** у git
- **Використовуйте environment variables** у Netlify/Vercel
- **Регулярно бекапте базу даних**
- **Моніторьте usage limits** на Free tier
