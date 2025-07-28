# 🚀 Деплоймент сайту ФУСАФ на ADM.tools

## 📋 Покрокова інструкція

### Крок 1: Завантаження коду з GitHub
```bash
# На вашому локальному комп'ютері або сервері
git clone https://github.com/ваш-username/fusaf-website.git
cd fusaf-website
```

### Крок 2: Налаштування Environment Variables
```bash
# Скопіюйте приклад конфігурації
cp .env.example .env

# Відредагуйте .env файл з вашими налаштуваннями
nano .env
```

**Перевірте ці параметри в .env:**
- `NEXTAUTH_URL=https://fusaf.org.ua`
- `APP_URL=https://fusaf.org.ua`
- Додайте ваші LiqPay ключі (якщо потрібні)

### Крок 3: Встановлення на ADM.tools

#### 3.1 Налаштування Node.js
В панелі ADM.tools:
- **Node.js версія**: 18.x або новіше
- **Стартовий файл**: `package.json`
- **Команда запуску**: `npm start`

#### 3.2 Завантаження файлів
Завантажте всі файли проекту в кореневу папку сайту через:
- FTP/SFTP
- File Manager в панелі ADM.tools
- Git (якщо доступний)

#### 3.3 Встановлення залежностей
В терміналі ADM.tools виконайте:
```bash
npm install --production
```

#### 3.4 Збірка проекту
```bash
npm run build
```

### Крок 4: Запуск сайту
```bash
npm start
```

Сайт буде доступний за адресою https://fusaf.org.ua

---

## 🔧 Налаштування зовнішніх сервісів

### Google OAuth
1. Відкрийте [Google Cloud Console](https://console.cloud.google.com)
2. Перейдіть до Credentials > OAuth 2.0 Client IDs
3. Редагуйте ваш client ID:
   - **Authorized JavaScript origins**: `https://fusaf.org.ua`
   - **Authorized redirect URIs**: `https://fusaf.org.ua/api/auth/callback/google`

### Supabase
1. Відкрийте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдіть до Authentication > URL Configuration
3. Налаштуйте:
   - **Site URL**: `https://fusaf.org.ua`
   - **Redirect URLs**: `https://fusaf.org.ua/auth/callback`

---

## ✅ Перевірка роботи

Після деплойменту перевірте:

1. **Головна сторінка**: https://fusaf.org.ua
2. **Google OAuth**: Кнопка "Увійти з Google" в header
3. **Навігація**: Всі розділи (Членство, Змагання, Курси, Новини, Клуби, Інструкції)
4. **База даних**: Сторінка /test-db для перевірки підключення

---

## 🆘 Можливі проблеми

### Помилка "Module not found"
```bash
# Повторно встановіть залежності
rm -rf node_modules package-lock.json
npm install
```

### Помилка Google OAuth
- Перевірте правильність redirect URLs в Google Console
- Переконайтесь, що домен збігається в .env та Google Console

### Помилка Supabase
- Перевірте правильність URL та ключів в .env
- Переконайтесь, що Site URL налаштований в Supabase

### Проблеми з портом
ADM.tools автоматично призначає порт. Переконайтесь, що в package.json:
```json
"scripts": {
  "start": "next start"
}
```

---

## 📊 Додавання тестових даних

Для демонстрації функціональності виконайте SQL скрипт:
1. Відкрийте Supabase Dashboard
2. Перейдіть до SQL Editor
3. Виконайте код з файлу `.same/simple-test-data.sql`

Це створить тестових користувачів та змагання.

---

## 🎯 Готово!

Ваш сайт ФУСАФ готовий до роботи на https://fusaf.org.ua! 🎉

### Функціональність:
- ✅ Українська локалізація
- ✅ Google OAuth аутентифікація
- ✅ Система ролей та dashboard
- ✅ Управління змаганнями
- ✅ Платіжна система LiqPay
- ✅ Повний функціонал федерації

**Успішного запуску! 🚀**
