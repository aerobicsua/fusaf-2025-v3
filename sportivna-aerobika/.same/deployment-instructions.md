# 🚀 Інструкції для завантаження сайту ФУСАФ на хостинг

## 📋 Підготовка перед завантаженням

### 1. Оновіть файл `.env.production`
```bash
# Замініть fusaf.org.ua на ваш реальний домен
NEXTAUTH_URL=https://ваш-домен.ua
APP_URL=https://ваш-домен.ua
```

### 2. Налаштуйте Google OAuth
В Google Cloud Console додайте ваш домен до:
- Authorized JavaScript origins: `https://ваш-домен.ua`
- Authorized redirect URIs: `https://ваш-домен.ua/api/auth/callback/google`

### 3. Налаштуйте Supabase
В Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://ваш-домен.ua`
- Redirect URLs: `https://ваш-домен.ua/auth/callback`

---

## 🎯 Варіант 1: Node.js хостинг (VPS/Сервер)

### Збірка для Node.js:
```bash
cd sportivna-aerobika
bun install
bun run build
```

### Файли для завантаження:
```
📁 Завантажте всю папку проекту на сервер
├── .next/          # Збірка
├── public/         # Статичні файли
├── package.json    # Залежності
├── next.config.js  # Конфігурація
└── .env.production # Environment variables
```

### Команди на сервері:
```bash
npm install
npm start
# або
bun install
bun start
```

---

## 🎯 Варіант 2: Статичний хостинг (cPanel/HTML)

### Підготовка:
1. Розкоментуйте рядки в `next.config.js`:
```javascript
output: 'export',
distDir: 'dist',
trailingSlash: true,
images: { unoptimized: true }
```

### Збірка:
```bash
cd sportivna-aerobika
bun install
bun run build
```

### Завантаження:
```
📁 Завантажте вміст папки dist/ в корінь сайту
├── index.html
├── _next/
├── competitions/
├── membership/
└── ...
```

---

## 🎯 Варіант 3: Готова збірка для завантаження

Створимо архів з готовими файлами:

### Для Node.js хостингу:
- Файл: `fusaf-nodejs.zip`
- Розпакувати на сервер
- Встановити залежності: `npm install`
- Запустити: `npm start`

### Для статичного хостингу:
- Файл: `fusaf-static.zip`
- Розпакувати в корінь сайту
- Готово!

---

## ⚙️ Налаштування після завантаження

### 1. SSL сертифікат
Увімкніть HTTPS для вашого домену

### 2. Перевірте роботу:
- Відкрийте https://ваш-домен.ua
- Протестуйте кнопку "Увійти з Google"
- Перевірте навігацію

### 3. База даних
Виконайте SQL скрипт з `.same/simple-test-data.sql` в Supabase для тестових даних

---

## 🆘 Підтримка
Якщо виникнуть проблеми:
1. Перевірте логи сервера
2. Переконайтеся, що всі environment variables налаштовані
3. Перевірте, що домен додано в Google OAuth та Supabase

**Ваш сайт готовий до запуску! 🎉**
