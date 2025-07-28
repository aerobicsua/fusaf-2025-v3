-- ============================================================================
-- ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу
-- Повна SQL схема бази даних для Supabase
-- ============================================================================

-- Створення кастомних типів
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('athlete', 'coach', 'judge', 'club_owner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waitlist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE competition_status AS ENUM ('draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- ТАБЛИЦІ
-- ============================================================================

-- Таблиця користувачів (розширює auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'athlete',
  phone VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця клубів
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  founded_year INTEGER,
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
  age_groups TEXT[],
  categories TEXT[],
  category VARCHAR(50),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  status competition_status DEFAULT 'draft',
  registration_deadline TIMESTAMP WITH TIME ZONE,
  rules_and_regulations TEXT,
  contact_info TEXT,
  prizes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця реєстрацій
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  status registration_status DEFAULT 'pending',
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  age_group VARCHAR(50),
  category VARCHAR(50),
  payment_status payment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

-- Таблиця профілів спортсменів
CREATE TABLE IF NOT EXISTS athlete_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  club_id UUID REFERENCES clubs(id),
  coach_id UUID REFERENCES users(id),
  level VARCHAR(50),
  achievements TEXT,
  medical_clearance BOOLEAN DEFAULT FALSE,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця профілів тренерів/суддів
CREATE TABLE IF NOT EXISTS coach_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  club_id UUID REFERENCES clubs(id),
  license_number VARCHAR(100),
  specializations TEXT[],
  experience_years INTEGER,
  qualifications TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- БЕЗПЕКА (RLS - Row Level Security)
-- ============================================================================

-- Увімкнення RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;

-- Політики для users
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Політики для clubs
DROP POLICY IF EXISTS "Anyone can read clubs" ON clubs;
CREATE POLICY "Anyone can read clubs" ON clubs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Club owners can manage their clubs" ON clubs;
CREATE POLICY "Club owners can manage their clubs" ON clubs FOR ALL USING (auth.uid() = owner_id);

-- Політики для competitions
DROP POLICY IF EXISTS "Anyone can read published competitions" ON competitions;
CREATE POLICY "Anyone can read published competitions" ON competitions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Competition creators can manage their competitions" ON competitions;
CREATE POLICY "Competition creators can manage their competitions" ON competitions FOR ALL USING (auth.uid() = created_by);

-- Політики для registrations
DROP POLICY IF EXISTS "Users can read own registrations" ON registrations;
CREATE POLICY "Users can read own registrations" ON registrations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own registrations" ON registrations;
CREATE POLICY "Users can create own registrations" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own registrations" ON registrations;
CREATE POLICY "Users can update own registrations" ON registrations FOR UPDATE USING (auth.uid() = user_id);

-- Політики для athlete_profiles
DROP POLICY IF EXISTS "Athletes can read own profile" ON athlete_profiles;
CREATE POLICY "Athletes can read own profile" ON athlete_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can manage own profile" ON athlete_profiles;
CREATE POLICY "Athletes can manage own profile" ON athlete_profiles FOR ALL USING (auth.uid() = user_id);

-- Політики для coach_profiles
DROP POLICY IF EXISTS "Coaches can read own profile" ON coach_profiles;
CREATE POLICY "Coaches can read own profile" ON coach_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can manage own profile" ON coach_profiles;
CREATE POLICY "Coaches can manage own profile" ON coach_profiles FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- ТРИГЕРИ
-- ============================================================================

-- Функція для оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригери для оновлення updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clubs_updated_at ON clubs;
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitions_updated_at ON competitions;
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_athlete_profiles_updated_at ON athlete_profiles;
CREATE TRIGGER update_athlete_profiles_updated_at BEFORE UPDATE ON athlete_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coach_profiles_updated_at ON coach_profiles;
CREATE TRIGGER update_coach_profiles_updated_at BEFORE UPDATE ON coach_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- АВТОМАТИЧНЕ СТВОРЕННЯ КОРИСТУВАЧІВ
-- ============================================================================

-- Функція для обробки нових користувачів після OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();

  RETURN new;
END;
$$ language plpgsql security definer;

-- Тригер для нових користувачів
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ЗАВЕРШЕННЯ
-- ============================================================================

-- Повідомлення про успіх
DO $$
BEGIN
    RAISE NOTICE '✅ ФУСАФ Database Schema успішно створено!';
    RAISE NOTICE '📊 Створено таблиці: users, clubs, competitions, registrations, athlete_profiles, coach_profiles';
    RAISE NOTICE '🔒 Налаштовано Row Level Security для всіх таблиць';
    RAISE NOTICE '🔧 Налаштовано тригери для автоматичного оновлення';
    RAISE NOTICE '👤 Готово до інтеграції з OAuth автентифікацією';
END $$;
