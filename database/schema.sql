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
