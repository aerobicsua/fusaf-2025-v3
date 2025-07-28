-- ============================================
-- ФУСАФ - SQL СХЕМА БАЗИ ДАНИХ
-- Федерація України зі Спортивної Аеробіки і Фітнесу
-- ============================================

-- Таблиця користувачів (всі типи: спортсмени, тренери, власники клубів, адміни)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    roles JSON NOT NULL DEFAULT '[]',

    -- Особисті дані
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    date_of_birth DATE,
    gender ENUM('male', 'female'),
    phone VARCHAR(20),

    -- Адреса
    country VARCHAR(100) DEFAULT 'Україна',
    region VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(255),
    zip_code VARCHAR(10),

    -- Спортивна інформація
    club VARCHAR(255),
    coach VARCHAR(255),
    sport_category VARCHAR(100),
    experience TEXT,
    specialization VARCHAR(255),
    license VARCHAR(100),
    license_level VARCHAR(50),

    -- Особиста інформація
    bio TEXT,
    website VARCHAR(255),
    social_media JSON,
    achievements TEXT,
    interests JSON,
    languages JSON,

    -- Налаштування
    is_public_profile BOOLEAN DEFAULT FALSE,
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,

    -- Файли
    avatar TEXT,
    documents JSON,

    -- Метадані
    email_verified BOOLEAN DEFAULT FALSE,
    membership_paid BOOLEAN DEFAULT FALSE,
    membership_expiry_date DATE,
    status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,

    INDEX idx_email (email),
    INDEX idx_roles (roles(255)),
    INDEX idx_status (status),
    INDEX idx_region (region),
    INDEX idx_club (club)
);

-- Таблиця спортивних клубів
CREATE TABLE IF NOT EXISTS clubs (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(500),
    description TEXT,

    -- Адреса клубу
    address VARCHAR(500),
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Україна',

    -- Контактна інформація
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),

    -- Офіційна інформація
    legal_status VARCHAR(100),
    registration_number VARCHAR(100),
    founding_date DATE,

    -- Статистика
    members_count INT DEFAULT 0,
    coaches_count INT DEFAULT 0,
    achievements_count INT DEFAULT 0,

    -- Власник/представник клубу
    owner_id VARCHAR(36),

    -- Метадані
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    membership_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_region (region),
    INDEX idx_status (status),
    INDEX idx_owner (owner_id)
);

-- Таблиця змагань
CREATE TABLE IF NOT EXISTS competitions (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Дата та час
    date DATE NOT NULL,
    time TIME,
    registration_deadline DATE,

    -- Місце проведення
    location VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    region VARCHAR(100),

    -- Організатор
    organizing_club VARCHAR(255),
    organizer_id VARCHAR(36),

    -- Контактна особа
    contact_person JSON,

    -- Фінансові умови (по програмах)
    program_fees JSON,
    payment_details JSON,

    -- Технічні вимоги
    max_participants_by_program JSON,
    categories JSON,
    rules TEXT,
    equipment_requirements TEXT,

    -- Логістика
    accommodation JSON,
    meals JSON,
    transportation JSON,

    -- Медичні вимоги
    medical_requirements TEXT,
    insurance_required BOOLEAN DEFAULT TRUE,

    -- Додаткова інформація
    notes TEXT,
    website VARCHAR(255),

    -- Статус
    status ENUM('draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_region (region),
    INDEX idx_organizer (organizer_id)
);

-- Таблиця реєстрацій на змагання
CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(36) PRIMARY KEY,
    competition_id VARCHAR(36) NOT NULL,
    participant_id VARCHAR(36),

    -- Тип реєстрації
    registration_type ENUM('preliminary', 'individual') NOT NULL,

    -- Дані реєстрації
    program VARCHAR(100),
    category VARCHAR(100),
    participants_data JSON, -- для командних виступів

    -- Клуб та тренер
    club_name VARCHAR(255),
    coach_name VARCHAR(255),
    coach_phone VARCHAR(20),

    -- Фінанси
    registration_fee DECIMAL(10,2) DEFAULT 0,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    total_fee DECIMAL(10,2) DEFAULT 0,
    payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,

    -- Додаткова інформація
    notes TEXT,

    -- Статус
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_competition (competition_id),
    INDEX idx_participant (participant_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status)
);

-- Таблиця результатів змагань
CREATE TABLE IF NOT EXISTS competition_results (
    id VARCHAR(36) PRIMARY KEY,
    competition_id VARCHAR(36) NOT NULL,
    participant_id VARCHAR(36),
    registration_id VARCHAR(36),

    -- Програма та категорія
    program VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,

    -- Результати
    rank INT,
    total_score DECIMAL(6,3),
    technical_score DECIMAL(6,3),
    artistic_score DECIMAL(6,3),
    execution_score DECIMAL(6,3),
    difficulty_score DECIMAL(6,3),

    -- Деталі виступу
    routine_description TEXT,
    judges_scores JSON,
    deductions JSON,

    -- Нагороди
    medal ENUM('gold', 'silver', 'bronze') NULL,
    award VARCHAR(255),

    -- Метадані
    performance_date DATE,
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL,
    INDEX idx_competition (competition_id),
    INDEX idx_participant (participant_id),
    INDEX idx_program_category (program, category),
    INDEX idx_rank (rank)
);

-- Таблиця медіа файлів спортсменів
CREATE TABLE IF NOT EXISTS athlete_media (
    id VARCHAR(36) PRIMARY KEY,
    athlete_id VARCHAR(36) NOT NULL,

    -- Тип файлу
    type ENUM('photo', 'video', 'document') NOT NULL,
    filename VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,

    -- Метадані
    title VARCHAR(255),
    description TEXT,
    file_size INT,
    mime_type VARCHAR(100),

    -- Прапорці
    is_profile_image BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (athlete_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_athlete (athlete_id),
    INDEX idx_type (type),
    INDEX idx_profile_image (is_profile_image)
);

-- Таблиця сесій користувачів
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,

    -- Метадані сесії
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Часові дані
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- Таблиця логів системи
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(36),

    -- Деталі
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Результат
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- ============================================
-- ПОЧАТКОВІ ДАНІ
-- ============================================

-- Створення адміністратора (якщо не існує)
INSERT IGNORE INTO users (
    id, email, password_hash, name, roles,
    first_name, last_name, middle_name,
    country, region, city,
    status, email_verified, membership_paid,
    created_at
) VALUES (
    '1',
    'andfedos@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password123
    'Федосенко Андрій',
    '["admin", "user"]',
    'Андрій', 'Федосенко', 'Васильович',
    'Україна', 'м. Київ', 'Київ',
    'active', TRUE, TRUE,
    NOW()
);

-- Створення демо спортсмена (якщо не існує)
INSERT IGNORE INTO users (
    id, email, password_hash, name, roles,
    first_name, last_name, middle_name,
    date_of_birth, gender,
    country, region, city,
    sport_category, experience,
    status, email_verified, membership_paid,
    created_at
) VALUES (
    '2',
    'afedos@ukr.net',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password123
    'Федосенко Марія',
    '["athlete", "user"]',
    'Марія', 'Федосенко', 'Андріївна',
    '2011-10-19', 'female',
    'Україна', 'м. Київ', 'Київ',
    'юний спортсмен', '2 роки',
    'active', TRUE, TRUE,
    NOW()
);
