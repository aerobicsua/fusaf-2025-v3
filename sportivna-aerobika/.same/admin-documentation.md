# 📚 ДОКУМЕНТАЦІЯ АДМІНІСТРАТОРА САЙТУ ФУСАФ

## 🎯 ЗАГАЛЬНА ІНФОРМАЦІЯ

### Про систему
Сайт ФУСАФ - це повноцінна платформа для управління Федерацією України зі Спортивної Аеробіки і Фітнесу, що включає:

- ✅ Система реєстрації користувачів (спортсмени, тренери, судді, власники клубів)
- ✅ Управління змаганнями та реєстраціями
- ✅ Платіжна система (LiqPay)
- ✅ Email розсилки та сповіщення
- ✅ Аналітика та звітність
- ✅ Резервне копіювання та безпека

### Технічний стек
```
Frontend: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
Backend: Next.js API Routes
Database: Supabase (PostgreSQL)
Authentication: NextAuth.js + Google OAuth
Email: Resend API
Payments: LiqPay
Hosting: ADM.tools (Node.js)
```

---

## 🔐 ДОСТУП ТА БЕЗПЕКА

### Рівні доступу
1. **Супер-адміністратор** - повний доступ до всіх функцій
2. **Адміністратор** - управління користувачами та змаганнями
3. **Модератор** - перегляд та базове редагування

### Аутентифікація
- **Google OAuth** - основний метод входу
- **Session management** - через NextAuth.js
- **Role-based access** - перевірка ролей на рівні API

### Безпека системи
```typescript
// Перевірка ролі адміністратора в API роутах
const session = await getServerSession(authOptions);
if (!session || session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

---

## 👥 УПРАВЛІННЯ КОРИСТУВАЧАМИ

### Ролі користувачів
- **athlete** - спортсмен
- **coach** - тренер
- **judge** - суддя
- **club_owner** - власник клубу

### Операції з користувачами

#### Перегляд користувачів
```sql
-- Всі користувачі
SELECT * FROM users ORDER BY created_at DESC;

-- Користувачі за роллю
SELECT * FROM users WHERE role = 'athlete';

-- Активні користувачі (заходили за останні 30 днів)
SELECT * FROM users WHERE updated_at > NOW() - INTERVAL '30 days';
```

#### Створення користувача
1. Користувач реєструється через Google OAuth
2. Автоматично створюється запис в таблиці `users`
3. Відправляється welcome email
4. Користувач заповнює профіль в залежності від ролі

#### Видалення користувача
⚠️ **УВАГА**: Видалення користувача також видаляє всі пов'язані дані!

```sql
-- Перед видаленням перевірити залежності
SELECT
  (SELECT COUNT(*) FROM registrations WHERE user_id = 'USER_ID') as registrations,
  (SELECT COUNT(*) FROM clubs WHERE owner_id = 'USER_ID') as owned_clubs;

-- Видалення користувача (каскадно видалить пов'язані дані)
DELETE FROM users WHERE id = 'USER_ID';
```

---

## 🏆 УПРАВЛІННЯ ЗМАГАННЯМИ

### Статуси змагань
- **draft** - чернетка
- **published** - опубліковано
- **registration_open** - відкрита реєстрація
- **registration_closed** - реєстрація закрита
- **in_progress** - проходить
- **completed** - завершено
- **cancelled** - скасовано

### Створення змагання

#### Через адмін панель
1. Перейти в розділ "Змагання"
2. Натиснути "Створити змагання"
3. Заповнити форму:
   - Назва та опис
   - Дата, час, місце
   - Категорії та вікові групи
   - Реєстраційний внесок
   - Правила та контакти

#### Через API
```typescript
POST /api/competitions
{
  "title": "Кубок України 2025",
  "description": "Національні змагання",
  "date": "2025-03-15",
  "time": "10:00",
  "location": "Палац спорту Україна",
  "address": "м. Київ, пр. Червонозоряний, 1",
  "registration_fee": 500,
  "entry_fee": 200,
  "max_participants": 150,
  "age_groups": ["8-10", "11-13", "14-16", "17-21", "22+"],
  "categories": ["індивідуальна", "пара", "група"],
  "category": "professional",
  "club_id": "club-id",
  "status": "published",
  "registration_deadline": "2025-03-01T23:59:59Z"
}
```

### Управління реєстраціями

#### Статуси реєстрацій
- **pending** - очікує підтвердження
- **confirmed** - підтверджено
- **cancelled** - скасовано
- **waitlist** - список очікування

#### Статуси платежів
- **pending** - очікує оплати
- **paid** - оплачено
- **failed** - помилка оплати
- **refunded** - повернено

#### Робота з реєстраціями
```sql
-- Всі реєстрації на змагання
SELECT r.*, u.full_name, u.email
FROM registrations r
JOIN users u ON r.user_id = u.id
WHERE r.competition_id = 'COMPETITION_ID'
ORDER BY r.created_at;

-- Підтвердження реєстрації
UPDATE registrations
SET status = 'confirmed'
WHERE id = 'REGISTRATION_ID';

-- Підтвердження платежу
UPDATE registrations
SET payment_status = 'paid'
WHERE id = 'REGISTRATION_ID';
```

---

## 💳 ПЛАТІЖНА СИСТЕМА

### Налаштування LiqPay

#### Environment Variables
```env
LIQPAY_PUBLIC_KEY=your_public_key
LIQPAY_PRIVATE_KEY=your_private_key
LIQPAY_SANDBOX=false  # true для тестування
```

#### Процес платежу
1. Користувач реєструється на змагання
2. Система генерує платіжну форму LiqPay
3. Користувач сплачує
4. LiqPay відправляє callback на `/api/payments/liqpay/callback`
5. Система оновлює статус платежу
6. Відправляється email підтвердження

#### Тестування платежів
```typescript
// Тестові дані для LiqPay Sandbox
const testCard = {
  number: "4000000000000002",
  expiry: "12/25",
  cvv: "123"
};
```

### Обробка помилок платежів
```sql
-- Платежі з помилками
SELECT r.*, c.title as competition_title, u.email
FROM registrations r
JOIN competitions c ON r.competition_id = c.id
JOIN users u ON r.user_id = u.id
WHERE r.payment_status = 'failed'
ORDER BY r.created_at DESC;
```

---

## 📧 EMAIL СИСТЕМА

### Налаштування Resend

#### Environment Variables
```env
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@fusaf.org.ua
```

### Типи email повідомлень
- **WELCOME** - привітання нових користувачів
- **REGISTRATION_CONFIRMATION** - підтвердження реєстрації
- **PAYMENT_SUCCESS** - успішна оплата
- **COMPETITION_REMINDER** - нагадування про змагання
- **NEWSLETTER** - новини та оголошення
- **PASSWORD_RESET** - скидання паролю
- **CLUB_INVITE** - запрошення до клубу

### Відправка email через API
```typescript
POST /api/emails/send
{
  "to": "user@example.com",
  "type": "WELCOME",
  "data": {
    "name": "Іван Петренко",
    "role": "athlete",
    "dashboardUrl": "https://fusaf.org.ua/dashboard",
    "unsubscribeUrl": "https://fusaf.org.ua/unsubscribe"
  }
}
```

### Масова розсилка
```typescript
// Розсилка всім спортсменам
const athletes = await getUserEmailsByRole('athlete');
await EmailService.sendNewsletter(athletes, {
  title: "Новини ФУСАФ",
  content: "<p>Контент новини...</p>",
  textContent: "Текстова версія...",
  readMoreUrl: "https://fusaf.org.ua/news/article-id",
  unsubscribeUrl: "https://fusaf.org.ua/unsubscribe"
});
```

---

## 📊 АНАЛІТИКА ТА ЗВІТИ

### Доступні звіти

#### Статистика користувачів
```
GET /api/analytics?type=users&period=month
```
Повертає:
- Загальна кількість користувачів
- Нові користувачі за період
- Активні користувачі
- Розподіл за ролями
- Графік росту

#### Статистика змагань
```
GET /api/analytics?type=competitions&period=month
```
Повертає:
- Кількість змагань
- Кількість реєстрацій
- Популярні категорії
- Середня кількість учасників

#### Фінансова статистика
```
GET /api/analytics?type=financial&period=month
```
Повертає:
- Загальний дохід
- Успішні/невдалі платежі
- Середній розмір внеску
- Дохід по місяцях

### Експорт звітів
```
GET /api/analytics?type=full&format=csv
GET /api/analytics?type=full&format=pdf
```

### Автоматичні звіти
```typescript
// Налаштування автоматичних звітів
POST /api/analytics/reports
{
  "reportType": "weekly",
  "emails": ["admin@fusaf.org.ua"],
  "schedule": "0 9 * * 1"  // Щопонеділка о 9:00
}
```

---

## 💾 РЕЗЕРВНЕ КОПІЮВАННЯ

### Автоматичне резервне копіювання

#### Налаштування
```typescript
const backupConfig = {
  frequency: 'daily',      // daily, weekly, monthly
  retentionDays: 30,       // зберігати 30 днів
  includeFiles: true,      // включати файли
  compression: true,       // стискати
  encryption: true,        // шифрувати
  notifications: {
    onSuccess: ['admin@fusaf.org.ua'],
    onFailure: ['admin@fusaf.org.ua']
  }
};
```

#### Створення резервної копії
```
POST /api/backup
{
  "type": "full"  // full або incremental
}
```

#### Список резервних копій
```
GET /api/backup
```

#### Відновлення з резервної копії
⚠️ **УВАГА**: Відновлення перезапише існуючі дані!

```typescript
POST /api/backup/restore
{
  "backupId": "backup_1234567890_abc123"
}
```

### Ручне резервне копіювання
```sql
-- Експорт важливих таблиць
\copy users TO 'users_backup.csv' CSV HEADER;
\copy competitions TO 'competitions_backup.csv' CSV HEADER;
\copy registrations TO 'registrations_backup.csv' CSV HEADER;
```

---

## 🚨 МОНІТОРИНГ ТА ЛОГИ

### Системні логи

#### Категорії логів
- **auth** - аутентифікація та авторизація
- **database** - операції з базою даних
- **api** - API запити
- **backup** - резервне копіювання
- **system** - системні події

#### Рівні важливості
- **info** - інформаційні повідомлення
- **warning** - попередження
- **error** - помилки
- **critical** - критичні події

### Перегляд логів
```sql
-- Останні критичні події
SELECT * FROM security_logs
WHERE level = 'critical'
ORDER BY timestamp DESC
LIMIT 50;

-- Події аутентифікації за останню добу
SELECT * FROM security_logs
WHERE category = 'auth'
AND timestamp > NOW() - INTERVAL '1 day'
ORDER BY timestamp DESC;
```

### Моніторинг здоров'я системи
```
GET /api/analytics?type=health
```
Повертає:
- Статус бази даних
- Статус email сервісу
- Статус аутентифікації
- Час відповіді
- Uptime

---

## 🛠️ ТЕХНІЧНЕ ОБСЛУГОВУВАННЯ

### Щоденні завдання
- [ ] Перевірити статус системи
- [ ] Переглянути критичні логи
- [ ] Перевірити стан резервних копій
- [ ] Перевірити email доставку

### Тижневі завдання
- [ ] Аналіз статистики користувачів
- [ ] Перевірка безпеки (підозріла активність)
- [ ] Очистка старих логів
- [ ] Перевірка продуктивності

### Місячні завдання
- [ ] Повний звіт аналітики
- [ ] Аудит безпеки
- [ ] Оновлення документації
- [ ] Планування розвитку

### Оновлення системи

#### Оновлення залежностей
```bash
# Перевірка оновлень
bun outdated

# Оновлення залежностей
bun update

# Тестування після оновлення
bun test
bun build
```

#### Оновлення бази даних
```sql
-- Створення міграції
-- migrations/001_add_new_table.sql
CREATE TABLE new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Відкат міграції
DROP TABLE IF EXISTS new_feature;
```

---

## 🆘 РОЗВ'ЯЗАННЯ ПРОБЛЕМ

### Типові проблеми

#### Сайт не відкривається
1. Перевірити статус Node.js додатку в ADM.tools
2. Перевірити логи сервера
3. Перевірити DNS записи
4. Перевірити SSL сертифікат

#### Помилки аутентифікації
1. Перевірити Google OAuth налаштування
2. Перевірити Supabase URL та ключі
3. Перевірити NEXTAUTH_URL в environment variables

#### Проблеми з email
1. Перевірити Resend API ключ
2. Перевірити DNS записи домену
3. Перевірити логи email сервісу

#### Проблеми з платежами
1. Перевірити LiqPay налаштування
2. Перевірити callback URL доступність
3. Перевірити логи платіжних транзакцій

### Контакти для підтримки

#### Технічна підтримка
- **Hosting**: ADM.tools support
- **Database**: Supabase support
- **Email**: Resend support
- **Payments**: LiqPay support

#### Розробка
- **GitHub**: (посилання на репозиторій)
- **Documentation**: Ця документація
- **Bug reports**: GitHub Issues

---

## 📝 ДОДАТКОВІ РЕСУРСИ

### Корисні посилання
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [LiqPay Documentation](https://www.liqpay.ua/documentation)

### SQL запити для адміністраторів
```sql
-- Статистика по місяцях
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as count
FROM users
GROUP BY month
ORDER BY month DESC;

-- Топ клуби за кількістю учасників
SELECT
  c.name,
  c.city,
  COUNT(ap.user_id) as athletes_count
FROM clubs c
LEFT JOIN athlete_profiles ap ON c.id = ap.club_id
GROUP BY c.id, c.name, c.city
ORDER BY athletes_count DESC;

-- Змагання з найбільшою кількістю реєстрацій
SELECT
  c.title,
  c.date,
  COUNT(r.id) as registrations_count,
  SUM(CASE WHEN r.payment_status = 'paid' THEN c.registration_fee ELSE 0 END) as revenue
FROM competitions c
LEFT JOIN registrations r ON c.id = r.competition_id
GROUP BY c.id, c.title, c.date, c.registration_fee
ORDER BY registrations_count DESC;
```

---

**© 2025 Федерація України зі Спортивної Аеробіки і Фітнесу**
**Документація версія 1.0 - Січень 2025**
