# Інструкція з тестування Email системи ФУСАФ

## 🚀 Готово до використання!

Email система ФУСАФ повністю налаштована та інтегрована в проект. Версія **420** включає:

- ✅ **Реальне надсилання через Gmail**
- ✅ **5 типів email шаблонів**
- ✅ **API для тестування**
- ✅ **Автоматичні сповіщення в реєстрації клубів**

## 📧 Типи email що працюють:

### 1. **club_registration** - Підтвердження реєстрації клубу
- **Отримувач:** Новий керівник клубу
- **Зміст:** Підтвердження подання заявки, терміни розгляду
- **Автоматично:** При реєстрації через форму

### 2. **admin_notification** - Сповіщення адміністратора
- **Отримувач:** aerobicsua@gmail.com
- **Зміст:** Інформація про нову заявку клубу
- **Автоматично:** При реєстрації клубу

### 3. **welcome** - Вітальний лист
- **Отримувач:** Новий користувач
- **Зміст:** Привітання, інструкції, наступні кроки

### 4. **approval** - Схвалення заявки
- **Отримувач:** Керівник клубу
- **Зміст:** Повідомлення про схвалення, посилання для входу

### 5. **rejection** - Відхилення заявки
- **Отримувач:** Керівник клубу
- **Зміст:** Причина відхилення, можливості повторного звернення

## 🧪 Тестування через API

### GET доступні типи
```bash
curl http://localhost:3000/api/test-email
```

### POST тестовий email
```bash
curl -X POST "http://localhost:3000/api/test-email" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your_test@email.com",
    "type": "club_registration",
    "data": {
      "name": "Іван Петрович Сидоренко",
      "clubName": "Спортивний клуб Перемога",
      "clubType": "club"
    }
  }'
```

### Приклади тестування кожного типу:

#### 1. Тест реєстрації клубу:
```bash
curl -X POST "http://localhost:3000/api/test-email" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "type": "club_registration",
    "data": {
      "name": "Марія Олександрівна Коваленко",
      "email": "test@example.com",
      "clubName": "Фітнес центр Енергія",
      "clubType": "subdivision"
    }
  }'
```

#### 2. Тест сповіщення адміна:
```bash
curl -X POST "http://localhost:3000/api/test-email" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "admin@fusaf.org.ua",
    "type": "admin_notification",
    "data": {
      "clubOwnerName": "Олександр Сергійович Петренко",
      "clubName": "Аеробіка Плюс",
      "clubType": "club",
      "email": "owner@example.com",
      "phone": "+380501234567"
    }
  }'
```

#### 3. Тест схвалення:
```bash
curl -X POST "http://localhost:3000/api/test-email" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "approved@example.com",
    "type": "approval",
    "data": {
      "name": "Анна Василівна Мельник",
      "email": "approved@example.com",
      "clubName": "Динамік Спорт",
      "loginUrl": "https://fusaf.org.ua/login"
    }
  }'
```

#### 4. Тест відхилення:
```bash
curl -X POST "http://localhost:3000/api/test-email" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "rejected@example.com",
    "type": "rejection",
    "data": {
      "name": "Сергій Миколайович Бондаренко",
      "email": "rejected@example.com",
      "clubName": "Старт",
      "reason": "Неповні документи про реєстрацію. Будь ласка, надішліть довідку з податкової."
    }
  }'
```

## 🛠️ Налаштування Gmail

### Перевірка конфігурації:
```bash
# Перевірити що env змінні встановлені
echo $GMAIL_USER
echo $GMAIL_APP_PASSWORD
```

### Якщо email не надсилаються:
1. **Перевірте .env.local:**
   ```
   GMAIL_USER=aerobicsua@gmail.com
   GMAIL_APP_PASSWORD=your_16_char_app_password
   ```

2. **Перезапустіть сервер:**
   ```bash
   bun run dev
   ```

3. **Перевірте логи консолі** під час тестування

## 🎯 Реальне тестування

### Тестування через форму реєстрації:
1. Відкрийте http://localhost:3000/membership/club-owner/registration
2. Заповніть форму з ВАШИМ реальним email
3. Подайте заявку
4. Перевірте:
   - ✉️ **Ваш email** - лист підтвердження
   - ✉️ **aerobicsua@gmail.com** - сповіщення адміна

### Перевірка логів:
```bash
# У консолі розробки побачите:
📧 Надсилаємо email підтвердження користувачу...
✅ Email користувачу надіслано успішно
📧 Надсилаємо сповіщення адміністратору...
✅ Email адміністратору надіслано успішно
```

## 🚨 Можливі помилки

### Email не надсилаються:
- Перевірте `GMAIL_APP_PASSWORD` в .env.local
- Переконайтеся що 2FA увімкнена в Gmail
- Перевірте що App Password створений правильно

### Помилка авторизації Gmail:
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Рішення:** Створіть новий App Password в Google Account

### Timeout помилки:
```
Error: Connection timeout
```
**Рішення:** Перевірте інтернет з'єднання та налаштування firewall

## 📊 Моніторинг

### Логи в консолі:
```bash
📧 Тестування email сервісу: { to: 'test@example.com', type: 'welcome' }
✅ Тестовий email відправлено успішно
```

### Помилки в консолі:
```bash
❌ Помилка відправки тестового email: [деталі помилки]
```

## 🎉 Готово!

Email система ФУСАФ готова до production використання:

- **Автоматичні сповіщення** при реєстрації клубів
- **Красиві HTML шаблони** на українській мові
- **Відправка через Gmail** з професійного адреса
- **API для тестування** всіх типів листів
- **Обробка помилок** та логування

Наступні кроки: додання email при схваленні/відхиленні заявок в адмін-панелі.

## 📞 Підтримка

Якщо виникають проблеми:
1. Перевірте .env.local файл
2. Подивіться логи консолі
3. Протестуйте через API
4. Перезапустіть сервер development

Система готова до роботи! 🚀
