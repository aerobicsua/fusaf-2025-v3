-- ============================================================================
-- ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу
-- Повна SQL схема бази даних
-- ============================================================================

-- Видалення існуючих типів і таблиць (якщо потрібно)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS registration_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS competition_status CASCADE;
DROP TYPE IF EXISTS competition_category CASCADE;

-- ============================================================================
-- 1. СТВОРЕННЯ КАСТОМНИХ ТИПІВ
-- ============================================================================

-- Тип ролі користувача
CREATE TYPE user_role AS ENUM (
    'athlete',      -- Спортсмен
    'coach',        -- Тренер
    'judge',        -- Суддя
    'club_owner'    -- Власник клубу
);

-- Статус реєстрації на змагання
CREATE TYPE registration_status AS ENUM (
    'pending',      -- Очікує підтвердження
    'confirmed',    -- Підтверджено
    'cancelled',    -- Скасовано
    'waitlist'      -- Лист очікування
);

-- Статус оплати
CREATE TYPE payment_status AS ENUM (
    'pending',      -- Очікує оплати
    'paid',         -- Оплачено
    'failed',       -- Оплата не вдалася
    'refunded'      -- Повернено кошти
);

-- Статус змагання
CREATE TYPE competition_status AS ENUM (
    'draft',                -- Чернетка
    'published',            -- Опубліковано
    'registration_open',    -- Реєстрація відкрита
    'registration_closed',  -- Реєстрація закрита
    'in_progress',          -- Проводиться
    'completed',            -- Завершено
    'cancelled'             -- Скасовано
);

-- Категорія змагання
CREATE TYPE competition_category AS ENUM (
    'open',         -- Відкрита
    'junior',       -- Юніори
    'senior',       -- Сеніори
    'professional', -- Професіонали
    'amateur'       -- Аматори
);

-- ============================================================================
-- 2. СТВОРЕННЯ ТАБЛИЦЬ
-- ============================================================================

-- Таблиця користувачів
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'athlete',
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця клубів
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    founded_year INTEGER,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця змагань
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    entry_fee DECIMAL(10,2),
    max_participants INTEGER,
    age_groups TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    category competition_category DEFAULT 'open',
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status competition_status DEFAULT 'draft',
    registration_deadline TIMESTAMP WITH TIME ZONE,
    rules_and_regulations TEXT,
    contact_info TEXT,
    prizes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця реєстрацій на змагання
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    status registration_status DEFAULT 'pending',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    age_group VARCHAR(50),
    category VARCHAR(50),
    payment_status payment_status DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, competition_id)
);

-- Таблиця профілів спортсменів
CREATE TABLE IF NOT EXISTS athlete_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    coach_id UUID REFERENCES users(id) ON DELETE SET NULL,
    level VARCHAR(50) DEFAULT 'beginner',
    achievements TEXT,
    medical_clearance BOOLEAN DEFAULT FALSE,
    medical_clearance_date DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    blood_type VARCHAR(10),
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця профілів тренерів/суддів
CREATE TABLE IF NOT EXISTS coach_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    license_number VARCHAR(100) UNIQUE,
    license_expiry DATE,
    specializations TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    qualifications TEXT,
    bio TEXT,
    education TEXT,
    certifications TEXT[],
    languages TEXT[] DEFAULT '{"українська"}',
    hourly_rate DECIMAL(8,2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця результатів змагань
CREATE TABLE IF NOT EXISTS competition_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50),
    position INTEGER,
    score DECIMAL(6,3),
    technical_score DECIMAL(6,3),
    artistic_score DECIMAL(6,3),
    penalty_points DECIMAL(6,3) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(competition_id, user_id, category)
);

-- Таблиця документів
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    document_type VARCHAR(100), -- 'license', 'certificate', 'medical', 'passport', etc.
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця новин
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100) DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця курсів
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    price DECIMAL(10,2) DEFAULT 0,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    requirements TEXT,
    certificate_provided BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'planned', -- planned, active, completed, cancelled
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. НАЛАШТУВАННЯ ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Увімкнення RLS для всіх таблиць
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. ПОЛІТИКИ БЕЗПЕКИ (RLS POLICIES)
-- ============================================================================

-- Політики для users
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Політики для clubs
CREATE POLICY "Anyone can read active clubs" ON clubs
    FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Club owners can manage their clubs" ON clubs
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Service role can manage clubs" ON clubs
    FOR ALL USING (auth.role() = 'service_role');

-- Політики для competitions
CREATE POLICY "Anyone can read published competitions" ON competitions
    FOR SELECT TO authenticated USING (status IN ('published', 'registration_open', 'registration_closed', 'in_progress', 'completed'));

CREATE POLICY "Competition creators can manage their competitions" ON competitions
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Club owners can manage club competitions" ON competitions
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM clubs WHERE clubs.id = competitions.club_id
        )
    );

CREATE POLICY "Service role can manage competitions" ON competitions
    FOR ALL USING (auth.role() = 'service_role');

-- Політики для registrations
CREATE POLICY "Users can read own registrations" ON registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own registrations" ON registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations" ON registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Competition organizers can view registrations" ON registrations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT created_by FROM competitions WHERE competitions.id = registrations.competition_id
        )
    );

CREATE POLICY "Service role can manage registrations" ON registrations
    FOR ALL USING (auth.role() = 'service_role');

-- Політики для athlete_profiles
CREATE POLICY "Athletes can read own profile" ON athlete_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Athletes can manage own profile" ON athlete_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Coaches can read their athletes profiles" ON athlete_profiles
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Service role can manage athlete profiles" ON athlete_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Політики для coach_profiles
CREATE POLICY "Anyone can read coach profiles" ON coach_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage own profile" ON coach_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage coach profiles" ON coach_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Політики для competition_results
CREATE POLICY "Anyone can read published results" ON competition_results
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Competition organizers can manage results" ON competition_results
    FOR ALL USING (
        auth.uid() IN (
            SELECT created_by FROM competitions WHERE competitions.id = competition_results.competition_id
        )
    );

CREATE POLICY "Service role can manage results" ON competition_results
    FOR ALL USING (auth.role() = 'service_role');

-- Політики для documents
CREATE POLICY "Users can read own documents" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own documents" ON documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage documents" ON documents
    FOR ALL USING (auth.role() = 'service_role');

-- Політики для news
CREATE POLICY "Anyone can read published news" ON news
    FOR SELECT TO authenticated USING (is_published = true);

CREATE POLICY "Authors can manage own news" ON news
    FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Service role can manage news" ON news
    FOR ALL USING (auth.role() = 'service_role');

-- Політики для courses
CREATE POLICY "Anyone can read courses" ON courses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Instructors can manage own courses" ON courses
    FOR ALL USING (auth.uid() = instructor_id);

CREATE POLICY "Service role can manage courses" ON courses
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 5. ТРИГЕРИ ДЛЯ АВТОМАТИЧНОГО ОНОВЛЕННЯ updated_at
-- ============================================================================

-- Функція для оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригери для всіх таблиць
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at
    BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_profiles_updated_at
    BEFORE UPDATE ON athlete_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_profiles_updated_at
    BEFORE UPDATE ON coach_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_results_updated_at
    BEFORE UPDATE ON competition_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ФУНКЦІЯ ДЛЯ ОБРОБКИ НОВИХ КОРИСТУВАЧІВ
-- ============================================================================

-- Функція для автоматичного створення користувача після OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    last_login = NOW(),
    updated_at = NOW();

  RETURN new;
END;
$$ language plpgsql security definer;

-- Тригер для обробки нових користувачів
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Тригер для оновлення last_login при вході
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users
  SET last_login = NOW(), updated_at = NOW()
  WHERE id = new.id;

  RETURN new;
END;
$$ language plpgsql security definer;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.handle_user_login();

-- ============================================================================
-- 7. ІНДЕКСИ ДЛЯ ОПТИМІЗАЦІЇ ПРОДУКТИВНОСТІ
-- ============================================================================

-- Індекси для users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Індекси для clubs
CREATE INDEX IF NOT EXISTS idx_clubs_owner ON clubs(owner_id);
CREATE INDEX IF NOT EXISTS idx_clubs_city ON clubs(city);
CREATE INDEX IF NOT EXISTS idx_clubs_active ON clubs(is_active);

-- Індекси для competitions
CREATE INDEX IF NOT EXISTS idx_competitions_club ON competitions(club_id);
CREATE INDEX IF NOT EXISTS idx_competitions_creator ON competitions(created_by);
CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(date);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_category ON competitions(category);

-- Індекси для registrations
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_competition ON registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);

-- Індекси для profiles
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_user ON athlete_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_club ON athlete_profiles(club_id);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_user ON coach_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_club ON coach_profiles(club_id);

-- Індекси для results
CREATE INDEX IF NOT EXISTS idx_results_competition ON competition_results(competition_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON competition_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_position ON competition_results(position);

-- ============================================================================
-- 8. ТЕСТОВІ ДАНІ (ОПЦІОНАЛЬНО)
-- ============================================================================

-- Вставка тестового адміністратора
INSERT INTO users (
    id,
    email,
    full_name,
    role
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@fusaf.org.ua',
    'Адміністратор ФУСАФ',
    'club_owner'
) ON CONFLICT (id) DO NOTHING;

-- Вставка тестового клубу
INSERT INTO clubs (
    id,
    name,
    address,
    city,
    owner_id,
    description
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ФУСАФ Головний Офіс',
    'вул. Спортивна, 1',
    'Київ',
    '00000000-0000-0000-0000-000000000001',
    'Головний офіс Федерації України зі Спортивної Аеробіки і Фітнесу'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ЗАВЕРШЕННЯ НАЛАШТУВАННЯ
-- ============================================================================

-- Надання прав на читання публічних даних для анонімних користувачів
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON news TO anon;

-- Повідомлення про завершення
DO $$
BEGIN
    RAISE NOTICE '✅ ФУСАФ Database Schema успішно створено!';
    RAISE NOTICE '📊 Створено таблиці: users, clubs, competitions, registrations, athlete_profiles, coach_profiles, competition_results, documents, news, courses';
    RAISE NOTICE '🔒 Налаштовано Row Level Security для всіх таблиць';
    RAISE NOTICE '⚡ Створено індекси для оптимізації продуктивності';
    RAISE NOTICE '🔧 Налаштовано тригери для автоматичного оновлення';
    RAISE NOTICE '👤 Готово до інтеграції з OAuth автентифікацією';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Наступний крок: Налаштування Google OAuth в Supabase Auth';
END $$;
