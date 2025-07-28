# 🚀 Інструкція деплойменту ФУСАФ на ADM.tools

Покрокова інструкція для розгортання сайту на вашому хостингу fusaf.org.ua

---

## 📋 КРОК 1: Завантаження коду з GitHub

### 1.1 Завантажте код
Оберіть один із способів:

**Варіант A: Завантажити ZIP**
1. Натисніть зелену кнопку **"Code"** на GitHub
2. Натисніть **"Download ZIP"**
3. Розпакуйте архів на вашому комп'ютері

**Варіант B: Git клонування**
```bash
git clone https://github.com/ваш-username/fusaf-website.git
cd fusaf-website
```

### 1.2 Підготуйте файли
- Видаліть папки: `.git`, `node_modules` (якщо є)
- Залишіть тільки потрібні файли для продакшн

---

## 📂 КРОК 2: Завантаження на ADM.tools хостинг

### 2.1 Увійдіть в панель ADM.tools
1. Відкрийте https://adm.tools/hosting/563895/
2. Увійдіть у вашу панель управління

### 2.2 Завантажте файли проекту
1. У файловому менеджері перейдіть в **корінь сайту**
2. Завантажте всі файли проекту:
   ```
   📁 Завантажте ці файли/папки:
   ├── src/                    # Вихідний код
   ├── public/                 # Статичні файли (якщо є)
   ├── package.json           # Залежності проекту
   ├── next.config.js         # Конфігурація Next.js
   ├── .env.production        # Environment variables
   ├── tailwind.config.ts     # Налаштування Tailwind
   ├── tsconfig.json          # TypeScript конфігурація
   └── README.md              # Документація
   ```

### 2.3 Перейменуйте .env файл
- Перейменуйте `.env.production` на `.env`

---

## ⚙️ КРОК 3: Налаштування Node.js на ADM.tools

### 3.1 Увімкніть Node.js
1. У панелі управління знайдіть розділ **"Node.js"**
2. **Увімкніть Node.js**
3. Оберіть версію: **18.x або новішу**

### 3.2 Налаштуйте параметри запуску
```
📝 Налаштування Node.js:
- Стартовий файл: package.json
- Команда запуску: npm start
- Порт: 3000 (або будь-який доступний)
- Автозапуск: Увімкнути
```

### 3.3 Встановіть залежності
У терміналі ADM.tools виконайте:
```bash
cd /path/to/your/website  # Перейдіть в папку сайту
npm install --production  # Встановіть залежності
```

### 3.4 Зберіть проект
```bash
npm run build  # Створіть продакшн збірку
```

---

## 🔧 КРОК 4: Оновіть домен в налаштуваннях

### 4.1 Відредагуйте .env файл
Відкрийте файл `.env` і **перевірте домен**:
```env
# Переконайтесь, що домен правильний
NEXTAUTH_URL=https://fusaf.org.ua
APP_URL=https://fusaf.org.ua
FROM_EMAIL=noreply@fusaf.org.ua
```

### 4.2 Якщо домен інший
Якщо ваш домен НЕ fusaf.org.ua, **замініть усі входження**:
```env
# Замініть на ваш реальний домен
NEXTAUTH_URL=https://ваш-домен.ua
APP_URL=https://ваш-домен.ua
FROM_EMAIL=noreply@ваш-домен.ua
```

---

## 🌐 КРОК 5: Налаштування зовнішніх сервісів

### 5.1 Google OAuth
1. Відкрийте [Google Cloud Console](https://console.cloud.google.com)
2. Перейдіть до вашого OAuth проекту (або створіть новий)
3. У розділі **"Credentials"** знайдіть ваш OAuth 2.0 Client ID
4. **Додайте домени**:
   - **Authorized JavaScript origins**: `https://fusaf.org.ua`
   - **Authorized redirect URIs**: `https://fusaf.org.ua/api/auth/callback/google`

### 5.2 Supabase
1. Відкрийте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдіть до вашого проекту
3. Перейдіть до **Authentication → URL Configuration**
4. **Оновіть налаштування**:
   - **Site URL**: `https://fusaf.org.ua`
   - **Redirect URLs**: `https://fusaf.org.ua/auth/callback`

---

## 🚀 КРОК 6: Запуск сайту

### 6.1 Запустіть Node.js
1. У панелі ADM.tools перейдіть до розділу **Node.js**
2. Натисніть **"Старт"** або **"Перезапуск"**
3. Перевірте статус - має бути **"Запущено"**

### 6.2 Перевірте роботу
1. Відкрийте https://fusaf.org.ua у браузері
2. Перевірте, що сайт завантажується
3. Протестуйте кнопку **"Увійти з Google"**

---

## ✅ КРОК 7: Тестування та перевірка

### 7.1 Перевірте основні сторінки
- ✅ Головна сторінка: https://fusaf.org.ua
- ✅ Членство: https://fusaf.org.ua/membership
- ✅ Змагання: https://fusaf.org.ua/competitions
- ✅ Курси: https://fusaf.org.ua/courses
- ✅ Новини: https://fusaf.org.ua/news
- ✅ Клуби: https://fusaf.org.ua/clubs
- ✅ Інструкції: https://fusaf.org.ua/instructions

### 7.2 Протестуйте функціональність
- ✅ Google OAuth аутентифікація
- ✅ Навігація по всіх сторінках
- ✅ Адаптивний дизайн (мобільні пристрої)
- ✅ Швидкість завантаження

---

## 🆘 Розв'язання проблем

### Помилка 500 (Internal Server Error)
```bash
# Перевірте логи Node.js в панелі ADM.tools
# Переконайтесь, що залежності встановлені:
npm install --production

# Перевірте, що збірка створена:
npm run build

# Перезапустіть Node.js додаток
```

### Помилка аутентифікації Google
1. Перевірте правильність налаштування URL в Google Console
2. Переконайтесь, що `GOOGLE_CLIENT_ID` та `GOOGLE_CLIENT_SECRET` правильні в `.env`
3. Перевірте, що домен збігається у всіх налаштуваннях

### Помилка підключення до Supabase
1. Перевірте URL та ключі Supabase в `.env`
2. Переконайтесь, що Site URL в Supabase налаштований правильно

---

## 🎉 Готово!

Ваш сайт ФУСАФ має працювати на https://fusaf.org.ua

### 📞 Підтримка
- **Технічні питання**: GitHub Issues
- **Загальні питання**: info@fusaf.org.ua

---

**© 2025 Федерація України зі Спортивної Аеробіки і Фітнесу**
