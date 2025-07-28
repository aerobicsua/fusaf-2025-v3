# ✅ Фінальний чек-лист ФУСАФ

## 🎯 Поточний стан
- ✅ **Сайт працює**: https://same-eikk4fzfmr5-latest.netlify.app
- ✅ **Тест сторінка**: https://same-eikk4fzfmr5-latest.netlify.app/test-db
- ✅ **Supabase проект**: https://app.supabase.com/project/wmdkymgpcitlnfiwmsuq
- ⏳ **Google OAuth**: Потребує налаштування
- ⏳ **Схема БД**: Потребує створення

---

## 📋 КРОКИ ДЛЯ ВИКОНАННЯ

### 🔧 Крок 1: Налаштування бази даних Supabase
- [ ] **1.1** Відкрити: https://app.supabase.com/project/wmdkymgpcitlnfiwmsuq
- [ ] **1.2** Перейти в **SQL Editor** → **New Query**
- [ ] **1.3** Скопіювати SQL з файлу `/.same/setup-instructions.md` (секція 1.3)
- [ ] **1.4** Виконати SQL командою **Run**
- [ ] **1.5** Перевірити створення таблиць в **Table Editor**

**Результат**: Створені таблиці `users`, `clubs`, `competitions`, `registrations`, `athlete_profiles`, `coach_profiles`

---

### 🔧 Крок 2: Створення Google Cloud проекту
- [ ] **2.1** Відкрити: https://console.cloud.google.com
- [ ] **2.2** Створити новий проект "FUSAF Aerobics"
- [ ] **2.3** Увімкнути **Google+ API** (APIs & Services → Library)
- [ ] **2.4** Створити **OAuth 2.0 Client ID** (APIs & Services → Credentials)

**Налаштування OAuth Client:**
```
Application type: Web application
Name: FUSAF Website

Authorized JavaScript origins:
- http://localhost:3000
- https://same-eikk4fzfmr5-latest.netlify.app
- https://wmdkymgpcitlnfiwmsuq.supabase.co

Authorized redirect URIs:
- http://localhost:3000/auth/callback
- https://same-eikk4fzfmr5-latest.netlify.app/auth/callback
- https://wmdkymgpcitlnfiwmsuq.supabase.co/auth/v1/callback
```

- [ ] **2.5** Зберегти **Client ID** та **Client Secret**

---

### 🔧 Крок 3: Налаштування Google OAuth в Supabase
- [ ] **3.1** Відкрити: https://app.supabase.com/project/wmdkymgpcitlnfiwmsuq
- [ ] **3.2** Перейти **Authentication** → **Providers**
- [ ] **3.3** Увімкнути **Google Provider**
- [ ] **3.4** Вставити **Client ID** та **Client Secret** з Google Cloud
- [ ] **3.5** В **Authentication** → **Settings** налаштувати:
  - Site URL: `https://same-eikk4fzfmr5-latest.netlify.app`
  - Redirect URLs: додати callback URLs

---

### 🔧 Крок 4: Додавання credentials в Netlify
- [ ] **4.1** Відкрити: https://app.netlify.com/sites/same-eikk4fzfmr5-latest
- [ ] **4.2** Перейти **Site settings** → **Environment variables**
- [ ] **4.3** Додати змінні:
  - `GOOGLE_CLIENT_ID` = ваш Google Client ID
  - `GOOGLE_CLIENT_SECRET` = ваш Google Client Secret
- [ ] **4.4** Зберегти та редеплоїти сайт (**Deploys** → **Trigger deploy**)

---

### 🧪 Крок 5: Тестування всіх функцій

#### 5.1 Тест підключення до БД
- [ ] Відкрити: https://same-eikk4fzfmr5-latest.netlify.app/test-db
- [ ] Натиснути **"Тест підключення"** → очікувати ✅ успішно
- [ ] Натиснути **"Перевірити таблиці"** → всі таблиці мають існувати

#### 5.2 Тест Google OAuth
- [ ] Відкрити: https://same-eikk4fzfmr5-latest.netlify.app
- [ ] Натиснути **"Увійти з Google"**
- [ ] Обрати Google аккаунт і дозволити доступ
- [ ] Перевірити перенаправлення на сторінку вибору ролі

#### 5.3 Тест реєстрації користувача
- [ ] Обрати роль (наприклад, "Спортсмен")
- [ ] Заповнити додаткову інформацію
- [ ] Зберегти профіль
- [ ] Перевірити доступ до особистого кабінету

#### 5.4 Тест створення контенту
- [ ] Зареєструватися як "Власник клубу"
- [ ] Створити тестовий клуб
- [ ] Створити тестове змагання
- [ ] Перевірити відображення в списку змагань

---

## ✅ КРИТЕРІЇ ГОТОВНОСТІ

### ✅ База даних готова коли:
- [x] Всі 6 таблиць створені в Supabase
- [x] RLS (Row Level Security) налаштовано
- [x] Тестові дані завантажені
- [x] Підключення працює на /test-db

### ✅ Автентифікація готова коли:
- [x] Google OAuth налаштовано в Supabase
- [x] Environment variables додані в Netlify
- [x] Користувачі можуть увійти через Google
- [x] Автоматично створюються записи в таблиці users

### ✅ Функціональність готова коли:
- [x] Реєстрація за ролями працює
- [x] Особисті кабінети доступні
- [x] Створення клубів та змагань працює
- [x] Всі сторінки навантажуються без помилок

---

## 🚨 ПОШИРЕНІ ПРОБЛЕМИ ТА РІШЕННЯ

### Проблема: "Relation users does not exist"
**Рішення**: Виконати SQL схему з кроку 1

### Проблема: "OAuth redirect_uri_mismatch"
**Рішення**: Перевірити URL в Google Cloud та Supabase налаштуваннях

### Проблема: "Invalid client: no client_id"
**Рішення**: Додати GOOGLE_CLIENT_ID в Netlify Environment Variables

### Проблема: Користувач не створюється після входу
**Рішення**: Перевірити тригер `handle_new_user` в Supabase

---

## 🎯 ФІНАЛЬНИЙ РЕЗУЛЬТАТ

Після завершення всіх кроків:

✅ **Повнофункціональний сайт федерації**
✅ **Робоча автентифікація через Google**
✅ **База даних з користувачами, клубами, змаганнями**
✅ **Особисті кабінети для всіх ролей**
✅ **Готовність до реальної експлуатації**

**ФУСАФ ГОТОВИЙ ДО ЗАПУСКУ!** 🎯

---

## 📞 КОНТАКТИ ДЛЯ ПІДТРИМКИ

**Основні URL:**
- Сайт: https://same-eikk4fzfmr5-latest.netlify.app
- Тест: https://same-eikk4fzfmr5-latest.netlify.app/test-db
- Supabase: https://app.supabase.com/project/wmdkymgpcitlnfiwmsuq
- Google Cloud: https://console.cloud.google.com
- Netlify: https://app.netlify.com/sites/same-eikk4fzfmr5-latest

**При проблемах:**
1. Перевірити environment variables в Netlify
2. Переконатися в правильності redirect URLs
3. Перевірити логи в Supabase та Netlify
4. Редеплоїти сайт після змін
