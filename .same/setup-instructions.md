# 🚀 Фінальне налаштування ФУСАФ

## 📌 Поточний стан
- ✅ Сайт розгорнутий: https://same-eikk4fzfmr5-latest.netlify.app
- ✅ Supabase проект створений: https://wmdkymgpcitlnfiwmsuq.supabase.co
- ✅ Схема БД підготовлена в файлі `database/schema.sql`
- ⏳ Потрібно налаштувати Google OAuth та створити таблиці

## 🔧 Крок 1: Налаштування схеми бази даних в Supabase

### 1.1 Відкрийте Supabase Dashboard
- Перейдіть за посиланням: https://app.supabase.com/project/wmdkymgpcitlnfiwmsuq
- Увійдіть у свій аккаунт

### 1.2 Створіть схему БД
1. В лівому меню натисніть **SQL Editor**
2. Натисніть **New Query**
3. Скопіюйте весь вміст файлу `database/schema.sql` (нижче)
4. Вставте в редактор і натисніть **Run**

### 1.3 SQL схема для виконання:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('athlete', 'club_owner', 'coach_judge', 'admin');
CREATE TYPE sport_level AS ENUM ('beginner', 'amateur', 'professional', 'elite');
CREATE TYPE competition_category AS ENUM ('open', 'junior', 'senior', 'professional', 'amateur');
CREATE TYPE competition_status AS ENUM ('draft', 'published', 'registration_open', 'registration_closed', 'completed', 'cancelled');
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'paid');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'athlete',
    phone TEXT,
    date_of_birth DATE,
    city TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Clubs table
CREATE TABLE public.clubs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Competitions table
CREATE TABLE public.competitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    max_participants INTEGER,
    entry_fee DECIMAL(10,2),
    category competition_category NOT NULL DEFAULT 'open',
    prizes TEXT,
    rules TEXT,
    contact_info TEXT,
    status competition_status NOT NULL DEFAULT 'draft',
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Registrations table
CREATE TABLE public.registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status registration_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    UNIQUE(competition_id, user_id)
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Athlete profiles table
CREATE TABLE public.athlete_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
    sport_level sport_level NOT NULL DEFAULT 'beginner',
    coach_name TEXT,
    achievements TEXT,
    medical_clearance BOOLEAN DEFAULT FALSE,
    insurance_valid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;

-- Coach profiles table
CREATE TABLE public.coach_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    certifications TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    experience_years INTEGER,
    education TEXT,
    coaching_philosophy TEXT,
    available_for_judging BOOLEAN DEFAULT FALSE,
    judge_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON public.competitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_athlete_profiles_updated_at BEFORE UPDATE ON public.athlete_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coach_profiles_updated_at BEFORE UPDATE ON public.coach_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view public user info" ON public.users FOR SELECT USING (true);

-- Clubs policies
CREATE POLICY "Anyone can view clubs" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Club owners can update their clubs" ON public.clubs FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Club owners can create clubs" ON public.clubs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Club owners can delete their clubs" ON public.clubs FOR DELETE USING (auth.uid() = owner_id);

-- Competitions policies
CREATE POLICY "Anyone can view published competitions" ON public.competitions FOR SELECT USING (status != 'draft');
CREATE POLICY "Club owners can view their own draft competitions" ON public.competitions FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Club owners can create competitions" ON public.competitions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Club owners can update their competitions" ON public.competitions FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Club owners can delete their competitions" ON public.competitions FOR DELETE USING (auth.uid() = created_by);

-- Registrations policies
CREATE POLICY "Users can view their own registrations" ON public.registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Competition organizers can view registrations for their competitions" ON public.registrations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.competitions c
        WHERE c.id = registrations.competition_id AND c.created_by = auth.uid()
    )
);
CREATE POLICY "Users can register for competitions" ON public.registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own registrations" ON public.registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Competition organizers can update registrations" ON public.registrations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.competitions c
        WHERE c.id = registrations.competition_id AND c.created_by = auth.uid()
    )
);

-- Athlete profiles policies
CREATE POLICY "Users can view their own athlete profile" ON public.athlete_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own athlete profile" ON public.athlete_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own athlete profile" ON public.athlete_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view basic athlete profiles" ON public.athlete_profiles FOR SELECT USING (true);

-- Coach profiles policies
CREATE POLICY "Users can view their own coach profile" ON public.coach_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own coach profile" ON public.coach_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own coach profile" ON public.coach_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view basic coach profiles" ON public.coach_profiles FOR SELECT USING (true);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_city ON public.users(city);
CREATE INDEX idx_clubs_owner_id ON public.clubs(owner_id);
CREATE INDEX idx_clubs_city ON public.clubs(city);
CREATE INDEX idx_competitions_status ON public.competitions(status);
CREATE INDEX idx_competitions_date ON public.competitions(date);
CREATE INDEX idx_competitions_club_id ON public.competitions(club_id);
CREATE INDEX idx_competitions_category ON public.competitions(category);
CREATE INDEX idx_registrations_competition_id ON public.registrations(competition_id);
CREATE INDEX idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_athlete_profiles_user_id ON public.athlete_profiles(user_id);
CREATE INDEX idx_athlete_profiles_club_id ON public.athlete_profiles(club_id);
CREATE INDEX idx_coach_profiles_user_id ON public.coach_profiles(user_id);

-- Insert sample data for development
INSERT INTO public.users (id, email, name, role, city) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@fusaf.org.ua', 'Адміністратор ФУСАФ', 'admin', 'Київ'),
    ('00000000-0000-0000-0000-000000000002', 'club@example.com', 'Петро Іваненко', 'club_owner', 'Київ'),
    ('00000000-0000-0000-0000-000000000003', 'athlete@example.com', 'Марія Петренко', 'athlete', 'Львів'),
    ('00000000-0000-0000-0000-000000000004', 'coach@example.com', 'Олексій Коваленко', 'coach_judge', 'Одеса')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.clubs (id, name, city, owner_id, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Спортивний клуб "Олімп"', 'Київ', '00000000-0000-0000-0000-000000000002', 'Провідний клуб спортивної аеробіки в Україні')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.athlete_profiles (user_id, sport_level, medical_clearance, insurance_valid) VALUES
    ('00000000-0000-0000-0000-000000000003', 'professional', TRUE, TRUE)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.coach_profiles (user_id, certifications, specializations, experience_years, available_for_judging) VALUES
    ('00000000-0000-0000-0000-000000000004', ARRAY['Тренер з аеробіки категорії А', 'Міжнародний суддя'], ARRAY['Спортивна аеробіка', 'Фітнес'], 10, TRUE)
ON CONFLICT (user_id) DO NOTHING;
```

### 1.4 Перевірте результат
Після виконання SQL:
1. Перейдіть у **Table Editor**
2. Переконайтеся, що створені таблиці: `users`, `clubs`, `competitions`, `registrations`, `athlete_profiles`, `coach_profiles`

## 🔧 Крок 2: Створення Google Cloud проекту

### 2.1 Створіть проект
1. Перейдіть у Google Cloud Console: https://console.cloud.google.com
2. Натисніть **Select a project** → **New Project**
3. Назва проекту: `FUSAF Aerobics`
4. Натисніть **Create**

### 2.2 Увімкніть API
1. У навігації відкрийте **APIs & Services** → **Library**
2. Знайдіть і увімкніть **Google+ API**

### 2.3 Створіть OAuth 2.0 Client ID
1. Перейдіть у **APIs & Services** → **Credentials**
2. Натисніть **+ Create Credentials** → **OAuth client ID**
3. Налаштування:
   - **Application type**: Web application
   - **Name**: FUSAF Website
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://same-eikk4fzfmr5-latest.netlify.app`
     - `https://wmdkymgpcitlnfiwmsuq.supabase.co`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback`
     - `https://same-eikk4fzfmr5-latest.netlify.app/auth/callback`
     - `https://wmdkymgpcitlnfiwmsuq.supabase.co/auth/v1/callback`

4. Натисніть **Create**
5. **Збережіть Client ID та Client Secret** - вони знадобляться далі!

## 🔧 Крок 3: Налаштування Google OAuth в Supabase

### 3.1 Налаштуйте провайдера
1. Перейдіть у Supabase Dashboard: https://app.supabase.com/project/wmdkymgpcitlnfiwmsuq
2. Перейдіть у **Authentication** → **Providers**
3. Знайдіть **Google** і увімкніть його
4. Вставте **Client ID** та **Client Secret** з Google Cloud
5. Натисніть **Save**

### 3.2 Налаштуйте redirect URLs
1. У тому ж розділі **Authentication** → **Settings**
2. У **Site URL** вкажіть: `https://same-eikk4fzfmr5-latest.netlify.app`
3. У **Redirect URLs** додайте:
   - `http://localhost:3000/auth/callback`
   - `https://same-eikk4fzfmr5-latest.netlify.app/auth/callback`

## 🔧 Крок 4: Додавання credentials у Netlify

### 4.1 Налаштуйте змінні середовища
1. Перейдіть у Netlify Dashboard сайту: https://app.netlify.com/sites/same-eikk4fzfmr5-latest
2. Перейдіть у **Site settings** → **Environment variables**
3. Додайте нові змінні:
   - **Variable**: `GOOGLE_CLIENT_ID`
   - **Value**: ваш Google Client ID (з Google Cloud)

   - **Variable**: `GOOGLE_CLIENT_SECRET`
   - **Value**: ваш Google Client Secret (з Google Cloud)

4. Натисніть **Save**

### 4.2 Редеплойте сайт
1. Перейдіть у **Deploys**
2. Натисніть **Trigger deploy** → **Deploy site**
3. Дочекайтеся завершення деплою

## 🧪 Крок 5: Тестування

### 5.1 Протестуйте підключення до БД
1. Перейдіть на: https://same-eikk4fzfmr5-latest.netlify.app/test-db
2. Натисніть **Тест підключення** - має показати ✅ успішно
3. Натисніть **Перевірити таблиці** - всі таблиці мають існувати

### 5.2 Протестуйте Google OAuth
1. Перейдіть на головну сторінку: https://same-eikk4fzfmr5-latest.netlify.app
2. Натисніть **Увійти з Google**
3. Виберіть Google аккаунт і дозвольте доступ
4. Має відбутися перенаправлення на сторінку вибору ролі

### 5.3 Протестуйте реєстрацію
1. Оберіть роль (наприклад, "Спортсмен")
2. Заповніть додаткову інформацію
3. Збережіть профіль
4. Перейдіть у особистий кабінет

## ✅ Результат

Після завершення всіх кроків у вас буде:
- ✅ Повністю робоча база даних Supabase
- ✅ Налаштована Google автентифікація
- ✅ Реєстрація користувачів з ролями
- ✅ Особисті кабінети для всіх типів користувачів
- ✅ Готовність до використання всіх функцій сайту

**ФУСАФ готовий до повноцінної роботи!** 🎯

## 📞 Підтримка

Якщо виникнуть проблеми:
1. Перевірте всі URL в налаштуваннях
2. Переконайтеся, що environment variables збережені
3. Перевірте логи в Netlify Functions
4. Протестуйте знову після редеплою
