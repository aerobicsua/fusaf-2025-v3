-- 🇺🇦 ТЕСТОВІ ДАНІ ДЛЯ САЙТУ ФУСАФ
-- Демонстраційні користувачі та дані для показу функціональності

-- Очищаємо існуючі тестові дані (якщо потрібно)
-- DELETE FROM registrations WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test.fusaf%');
-- DELETE FROM athlete_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test.fusaf%');
-- DELETE FROM coach_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test.fusaf%');
-- DELETE FROM competitions WHERE club_id IN (SELECT id FROM clubs WHERE email LIKE '%test.fusaf%');
-- DELETE FROM clubs WHERE email LIKE '%test.fusaf%';
-- DELETE FROM users WHERE email LIKE '%test.fusaf%';

-- 1. ТЕСТОВІ КОРИСТУВАЧІ

-- Спортсмени
INSERT INTO users (id, email, full_name, role, phone, date_of_birth, address, created_at, updated_at) VALUES
('test-athlete-001', 'oksana.petrenko@test.fusaf.ua', 'Петренко Оксана Володимирівна', 'athlete', '+380671234567', '2005-03-15', 'м. Київ, вул. Хрещатик, 22', NOW(), NOW()),
('test-athlete-002', 'andrii.kovalenko@test.fusaf.ua', 'Коваленко Андрій Сергійович', 'athlete', '+380502345678', '2003-07-22', 'м. Львів, вул. Личаківська, 15', NOW(), NOW()),
('test-athlete-003', 'mariya.shevchenko@test.fusaf.ua', 'Шевченко Марія Олександрівна', 'athlete', '+380633456789', '2006-11-08', 'м. Одеса, вул. Дерибасівська, 10', NOW(), NOW()),
('test-athlete-004', 'dmytro.bondarenko@test.fusaf.ua', 'Бондаренко Дмитро Іванович', 'athlete', '+380994567890', '2004-01-30', 'м. Харків, пр. Науки, 45', NOW(), NOW());

-- Тренери/Судді
INSERT INTO users (id, email, full_name, role, phone, date_of_birth, address, created_at, updated_at) VALUES
('test-coach-001', 'elena.moroz@test.fusaf.ua', 'Мороз Олена Петрівна', 'coach', '+380675678901', '1985-09-12', 'м. Київ, вул. Саксаганського, 33', NOW(), NOW()),
('test-judge-001', 'viktor.lysenko@test.fusaf.ua', 'Лисенко Віктор Михайлович', 'judge', '+380506789012', '1978-04-25', 'м. Дніпро, вул. Європейська, 18', NOW(), NOW()),
('test-coach-002', 'svetlana.kovaleva@test.fusaf.ua', 'Ковальова Світлана Анатоліївна', 'coach', '+380637890123', '1982-12-03', 'м. Запоріжжя, пр. Соборний, 67', NOW(), NOW());

-- Власники клубів
INSERT INTO users (id, email, full_name, role, phone, date_of_birth, address, created_at, updated_at) VALUES
('test-owner-001', 'sergiy.melnyk@test.fusaf.ua', 'Мельник Сергій Володимирович', 'club_owner', '+380678901234', '1975-06-18', 'м. Київ, вул. Володимирська, 54', NOW(), NOW()),
('test-owner-002', 'tetyana.savchenko@test.fusaf.ua', 'Савченко Тетяна Григорівна', 'club_owner', '+380509012345', '1980-10-14', 'м. Львів, вул. Городоцька, 28', NOW(), NOW());

-- 2. ТЕСТОВІ КЛУБИ

INSERT INTO clubs (id, name, address, city, phone, email, website, owner_id, description, founded_year, created_at, updated_at) VALUES
('test-club-001', 'Спортивний клуб "Грація"', 'вул. Спортивна, 15', 'Київ', '+380444567890', 'info@gracia.test.fusaf.ua', 'https://gracia-kiev.ua', 'test-owner-001', 'Провідний клуб спортивної аеробіки в Києві. Готуємо чемпіонів України та Європи.', 2010, NOW(), NOW()),
('test-club-002', 'Аеробіка Львів', 'вул. Стрийська, 89', 'Львів', '+380322123456', 'contact@aerobics-lviv.test.fusaf.ua', 'https://aerobics-lviv.ua', 'test-owner-002', 'Сучасний центр спортивної аеробіки у Львові з 15-річним досвідом.', 2008, NOW(), NOW()),
('test-club-003', 'Фітнес-Динаміка', 'пр. Гагаріна, 12', 'Дніпро', '+380563456789', 'info@fit-dinamics.test.fusaf.ua', 'https://fit-dinamics.dp.ua', 'test-owner-001', 'Клуб спортивної аеробіки та фітнесу для всіх вікових груп.', 2015, NOW(), NOW());

-- 3. ПРОФІЛІ СПОРТСМЕНІВ

INSERT INTO athlete_profiles (id, user_id, club_id, coach_id, level, achievements, medical_clearance, emergency_contact_name, emergency_contact_phone, created_at, updated_at) VALUES
('test-ath-prof-001', 'test-athlete-001', 'test-club-001', 'test-coach-001', 'КМС', 'Чемпіонка України серед юніорів 2023, 3 місце на Кубку Європи 2024', true, 'Петренко Володимир Іванович', '+380671234500', NOW(), NOW()),
('test-ath-prof-002', 'test-athlete-002', 'test-club-002', 'test-coach-002', 'І розряд', 'Переможець першості області 2023, учасник чемпіонату України 2024', true, 'Коваленко Сергій Петрович', '+380502345600', NOW(), NOW()),
('test-ath-prof-003', 'test-athlete-003', 'test-club-001', 'test-coach-001', 'ІІ розряд', 'Призер обласних змагань 2024', true, 'Шевченко Олександр Миколайович', '+380633456700', NOW(), NOW()),
('test-ath-prof-004', 'test-athlete-004', 'test-club-003', 'test-coach-002', 'І розряд', 'Чемпіон міста 2023, учасник всеукраїнських змагань', true, 'Бондаренко Іван Степанович', '+380994567800', NOW(), NOW());

-- 4. ПРОФІЛІ ТРЕНЕРІВ

INSERT INTO coach_profiles (id, user_id, club_id, license_number, specializations, experience_years, qualifications, bio, created_at, updated_at) VALUES
('test-coach-prof-001', 'test-coach-001', 'test-club-001', 'UA-FUSAF-2018-001', ARRAY['спортивна аеробіка', 'акробатична аеробіка', 'степ-аеробіка'], 12, 'Заслужений тренер України, суддя національної категорії', 'Досвідчений тренер з підготовки спортсменів високого рівня. Випускниця НУФВіС України.', NOW(), NOW()),
('test-judge-prof-001', 'test-judge-001', NULL, 'UA-FUSAF-2015-007', ARRAY['суддівство', 'методика тренувань'], 18, 'Міжнародний суддя FIG, кандидат наук з фізичного виховання', 'Провідний суддя України з спортивної аеробіки, учасник міжнародних семінарів.', NOW(), NOW()),
('test-coach-prof-002', 'test-coach-002', 'test-club-002', 'UA-FUSAF-2020-015', ARRAY['фітнес-аеробіка', 'спортивна аеробіка'], 8, 'Тренер вищої категорії, майстер спорту України', 'Спеціаліст з роботи з молоддю та початківцями. Сертифікований інструктор FIG.', NOW(), NOW());

-- 5. ТЕСТОВІ ЗМАГАННЯ

INSERT INTO competitions (id, title, description, date, time, location, address, registration_fee, entry_fee, max_participants, age_groups, categories, category, club_id, status, registration_deadline, rules_and_regulations, contact_info, prizes, created_by, created_at, updated_at) VALUES
('test-comp-001', 'Кубок України зі спортивної аеробіки 2025', 'Національні змагання з спортивної аеробіки серед усіх вікових груп. Відбірковий турнір до чемпіонату Європи.', '2025-03-15', '10:00', 'Палац спорту "Україна"', 'м. Київ, пр. Червонозоряний, 1', 500.00, 200.00, 150, ARRAY['8-10', '11-13', '14-16', '17-21', '22+'], ARRAY['індивідуальна', 'пара змішана', 'тріо', 'група'], 'professional', 'test-club-001', 'registration_open', '2025-03-01', 'Змагання проводяться за правилами FIG та ФУСАФ. Обов''язкове медичне забезпечення.', 'Організатор: СК "Грація", тел: +380444567890', 'Переможці отримують кубки, медалі та грошові призи', 'test-owner-001', NOW(), NOW()),

('test-comp-002', 'Відкритий чемпіонат Львова з фітнес-аеробіки', 'Традиційні міські змагання з фітнес-аеробіки для аматорів та професіоналів.', '2025-02-22', '09:30', 'Спорткомплекс "Львів"', 'м. Львів, вул. Стрийська, 199', 300.00, 150.00, 80, ARRAY['12-15', '16-18', '19+'], ARRAY['індивідуальна', 'пара'], 'amateur', 'test-club-002', 'registration_open', '2025-02-15', 'Змагання для спортсменів-аматорів та професіоналів. Категорії за віком та рівнем підготовки.', 'Контакт: Аеробіка Львів, email: contact@aerobics-lviv.test.fusaf.ua', 'Медалі та дипломи для призерів', 'test-owner-002', NOW(), NOW()),

('test-comp-003', 'Першість Дніпропетровської області', 'Обласні змагання з спортивної аеробіки серед юнаків та дівчат.', '2025-04-12', '11:00', 'Центр олімпійської підготовки', 'м. Дніпро, пр. Гагаріна, 30', 250.00, 100.00, 60, ARRAY['10-12', '13-15', '16-18'], ARRAY['індивідуальна', 'пара'], 'junior', 'test-club-003', 'published', '2025-04-05', 'Обласний турнір для юних спортсменів. Нагородження переможців та призерів.', 'Фітнес-Динаміка: +380563456789', 'Кубки та медалі', 'test-owner-001', NOW(), NOW());

-- 6. ТЕСТОВІ РЕЄСТРАЦІЇ

INSERT INTO registrations (id, user_id, competition_id, status, registration_date, age_group, category, payment_status, notes, created_at, updated_at) VALUES
('test-reg-001', 'test-athlete-001', 'test-comp-001', 'confirmed', '2025-01-15 14:30:00', '17-21', 'індивідуальна', 'paid', 'Діючий КМС, готова до участі в національному турнірі', NOW(), NOW()),
('test-reg-002', 'test-athlete-002', 'test-comp-002', 'confirmed', '2025-01-20 16:45:00', '19+', 'індивідуальна', 'paid', 'Представник Львова, досвід участі в обласних змаганнях', NOW(), NOW()),
('test-reg-003', 'test-athlete-003', 'test-comp-001', 'pending', '2025-01-25 12:15:00', '14-16', 'індивідуальна', 'pending', 'Очікує підтвердження медичної довідки', NOW(), NOW()),
('test-reg-004', 'test-athlete-004', 'test-comp-003', 'confirmed', '2025-01-18 09:20:00', '16-18', 'індивідуальна', 'paid', 'Місцевий фаворит, чемпіон міста', NOW(), NOW()),
('test-reg-005', 'test-athlete-001', 'test-comp-002', 'waitlist', '2025-01-28 18:00:00', '19+', 'пара змішана', 'pending', 'В очікуванні партнера для парної категорії', NOW(), NOW());

-- 7. ДОДАТКОВІ ТЕСТОВІ ДАНІ (статистика)

-- Додаємо кілька завершених змагань для історії
INSERT INTO competitions (id, title, description, date, time, location, address, registration_fee, entry_fee, max_participants, age_groups, categories, category, club_id, status, registration_deadline, rules_and_regulations, contact_info, prizes, created_by, created_at, updated_at) VALUES
('test-comp-completed-001', 'Кубок ФУСАФ 2024 (завершено)', 'Минулорічний турнір - успішно проведений', '2024-12-15', '10:00', 'Палац спорту', 'м. Київ', 400.00, 150.00, 120, ARRAY['всі'], ARRAY['всі'], 'professional', 'test-club-001', 'completed', '2024-12-01', 'Завершені змагання', 'Архівний турнір', 'Розіграно призовий фонд', 'test-owner-001', '2024-11-01', '2024-12-20');

-- Реєстрації на завершений турнір
INSERT INTO registrations (id, user_id, competition_id, status, registration_date, age_group, category, payment_status, notes, created_at, updated_at) VALUES
('test-reg-completed-001', 'test-athlete-001', 'test-comp-completed-001', 'confirmed', '2024-11-15 14:30:00', '17-21', 'індивідуальна', 'paid', '1 місце - Чемпіонка турніру!', '2024-11-15', '2024-12-15'),
('test-reg-completed-002', 'test-athlete-002', 'test-comp-completed-001', 'confirmed', '2024-11-20 16:45:00', '17-21', 'індивідуальна', 'paid', '3 місце - Бронзовий призер', '2024-11-20', '2024-12-15');

COMMIT;

-- 🎯 ІНСТРУКЦІЇ ДЛЯ ВИКОРИСТАННЯ ТЕСТОВИХ ДАНИХ:

-- 1. Виконайте цей скрипт в Supabase SQL Editor
-- 2. Тестові користувачі зможуть увійти через Google OAuth (потрібно створити Google акаунти з цими email)
-- 3. Або використовуйте ці дані для демонстрації в адмін панелі

-- 📧 ТЕСТОВІ EMAIL АДРЕСИ:
-- Спортсмени: oksana.petrenko@test.fusaf.ua, andrii.kovalenko@test.fusaf.ua
-- Тренери: elena.moroz@test.fusaf.ua, viktor.lysenko@test.fusaf.ua
-- Власники: sergiy.melnyk@test.fusaf.ua, tetyana.savchenko@test.fusaf.ua

-- 🏆 ЩО ДЕМОНСТРУЮТЬ ЦІ ДАНІ:
-- ✅ Різні ролі користувачів (спортсмен, тренер, суддя, власник клубу)
-- ✅ Клуби з повною інформацією
-- ✅ Активні та завершені змагання
-- ✅ Реєстрації з різними статусами (підтверджено, очікування, waitlist)
-- ✅ Профілі спортсменів з досягненнями
-- ✅ Профілі тренерів з кваліфікаціями
-- ✅ Реалістичні українські дані (міста, вулиці, телефони)
-- ✅ Історичні дані для демонстрації статистики
