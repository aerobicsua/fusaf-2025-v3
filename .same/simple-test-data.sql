-- Simple test data for testing authentication and registration
-- Clean previous test data (optional)
DELETE FROM competition_registrations WHERE true;
DELETE FROM competitions WHERE true;
DELETE FROM users WHERE email LIKE '%@test.com' OR email LIKE '%@gmail.com';
DELETE FROM clubs WHERE name LIKE '%Test%';

-- Insert test clubs
INSERT INTO clubs (id, name, description, address, city, region, website, phone, email, verified, logo_url) VALUES
('test-club-1', 'Київський Клуб Аеробіки', 'Провідний клуб спортивної аеробіки в Києві', 'вул. Спортивна, 10', 'Київ', 'Київська область', 'https://kyiv-aerobics.ua', '+380441234567', 'info@kyiv-aerobics.ua', true, null),
('test-club-2', 'Львівський Фітнес Центр', 'Сучасний фітнес центр з програмами аеробіки', 'вул. Центральна, 25', 'Львів', 'Львівська область', 'https://lviv-fitness.ua', '+380321234567', 'contact@lviv-fitness.ua', true, null),
('test-club-3', 'Одеський Спортивний Клуб "Граційність"', 'Клуб для розвитку спортивної аеробіки та гімнастики', 'пр. Шевченка, 45', 'Одеса', 'Одеська область', null, '+380481234567', 'graceful@odesa.ua', false, null);

-- Insert test users with different roles
INSERT INTO users (id, email, name, avatar_url, role, phone, date_of_birth, gender, club_id, registration_number, registration_status, insurance_expiry, updated_at) VALUES
('test-athlete-1', 'maria.kovalenko@gmail.com', 'Марія Коваленко', null, 'athlete', '+380671234567', '2000-05-15', 'female', 'test-club-1', 'ATH2025001', 'approved', '2025-12-31', now()),
('test-athlete-2', 'oleksandr.petrenko@gmail.com', 'Олександр Петренко', null, 'athlete', '+380501234567', '1998-08-22', 'male', 'test-club-1', 'ATH2025002', 'approved', '2025-12-31', now()),
('test-coach-1', 'ivan.coach@gmail.com', 'Іван Тренерович', null, 'coach', '+380631234567', '1985-12-10', 'male', 'test-club-1', 'TCH2025001', 'approved', '2025-12-31', now()),
('test-judge-1', 'elena.judge@gmail.com', 'Олена Суддівна', null, 'judge', '+380951234567', '1980-03-18', 'female', null, 'JDG2025001', 'approved', '2025-12-31', now()),
('test-owner-1', 'owner.kyiv@gmail.com', 'Петро Власник', null, 'club_owner', '+380441234567', '1975-11-05', 'male', 'test-club-1', 'OWN2025001', 'approved', '2025-12-31', now()),
('test-owner-2', 'owner.lviv@gmail.com', 'Анна Керівник', null, 'club_owner', '+380321234567', '1982-07-20', 'female', 'test-club-2', 'OWN2025002', 'approved', '2025-12-31', now());

-- Insert a test competition
INSERT INTO competitions (id, title, description, date, location, type, discipline, max_participants, registration_deadline, entry_fee, status, organizer_id, created_at) VALUES
('test-comp-1', 'Чемпіонат України зі Спортивної Аеробіки 2025', 'Національний чемпіонат для всіх категорій спортсменів', '2025-09-15', 'Палац Спорту, Київ', 'championship', 'aerobics', 200, '2025-08-15', 150.00, 'upcoming', 'test-owner-1', now()),
('test-comp-2', 'Відкритий Кубок Львова', 'Регіональні змагання для юніорів та дорослих', '2025-10-22', 'Спортивний Комплекс "Україна", Львів', 'open', 'fitness', 100, '2025-10-01', 100.00, 'upcoming', 'test-owner-2', now());

-- Insert some test registrations
INSERT INTO competition_registrations (id, competition_id, user_id, category, notes, status, registered_at) VALUES
('test-reg-1', 'test-comp-1', 'test-athlete-1', 'women_senior', 'Попередня реєстрація', 'registered', now()),
('test-reg-2', 'test-comp-1', 'test-athlete-2', 'men_senior', 'Готовий до участі', 'registered', now()),
('test-reg-3', 'test-comp-2', 'test-athlete-1', 'women_senior', 'Буду виступати в двох дисциплінах', 'registered', now());

-- Confirm data inserted
SELECT 'Test data inserted successfully!' as message;
