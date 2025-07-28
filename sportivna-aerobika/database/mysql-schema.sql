-- ФУСАФ - MySQL Database Schema
-- Федерація України зі Спортивної Аеробіки і Фітнесу

-- Використовуємо правильний charset
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Створюємо базу даних (якщо потрібно)
-- CREATE DATABASE IF NOT EXISTS gy563895_fusaf2025
-- CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Використовуємо базу
-- USE gy563895_fusaf2025;

-- ========================================
-- КОРИСТУВАЧІ (USERS)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    middle_name VARCHAR(255),
    role ENUM('athlete', 'club_owner', 'coach_judge', 'admin') NOT NULL DEFAULT 'athlete',
    phone VARCHAR(20),
    date_of_birth DATE,
    city VARCHAR(255),
    region VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- КЛУБИ (CLUBS)
-- ========================================
CREATE TABLE IF NOT EXISTS clubs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    type ENUM('club', 'subdivision') DEFAULT 'club',
    description TEXT,
    address VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    legal_status VARCHAR(100),
    registration_number VARCHAR(100),
    founding_date DATE,

    owner_id VARCHAR(36) NOT NULL,
    logo_url VARCHAR(500),

    status ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'pending',
    approved_at TIMESTAMP NULL,
    approved_by VARCHAR(36) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_name (name),
    INDEX idx_city (city),
    INDEX idx_status (status),
    INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ЗАЯВКИ НА РЕЄСТРАЦІЮ КЛУБІВ
-- ========================================
CREATE TABLE IF NOT EXISTS club_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    -- Інформація користувача
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,

    -- Інформація клубу
    club_name VARCHAR(255) NOT NULL,
    club_type ENUM('club', 'subdivision') DEFAULT 'club',
    club_address VARCHAR(500) NOT NULL,
    club_city VARCHAR(255) NOT NULL,
    club_region VARCHAR(255) NOT NULL,
    club_zip_code VARCHAR(10) NOT NULL,
    club_description TEXT,
    club_experience TEXT,
    club_legal_status VARCHAR(100) NOT NULL,
    club_website VARCHAR(500),

    -- Документи
    documents JSON,

    -- Статус заявки
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(36) NULL,
    review_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- СПОРТСМЕНИ (ATHLETES)
-- ========================================
CREATE TABLE IF NOT EXISTS athletes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) UNIQUE NOT NULL,

    -- Особиста інформація
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    first_name_en VARCHAR(255),
    last_name_en VARCHAR(255),
    date_of_birth DATE NOT NULL,
    passport VARCHAR(50),

    -- Контакти
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,

    -- Спортивна інформація
    sport_level ENUM('beginner', 'amateur', 'professional', 'elite') DEFAULT 'beginner',
    club_id VARCHAR(36),
    coach_name VARCHAR(255),
    achievements TEXT,
    medical_certificate_date DATE,

    -- Додаткова інформація
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,

    INDEX idx_user (user_id),
    INDEX idx_club (club_id),
    INDEX idx_level (sport_level),
    INDEX idx_name (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ТРЕНЕРИ/СУДДІ (COACHES_JUDGES)
-- ========================================
CREATE TABLE IF NOT EXISTS coaches_judges (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) UNIQUE NOT NULL,

    -- Особиста інформація
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    first_name_en VARCHAR(255),
    last_name_en VARCHAR(255),
    passport VARCHAR(50),

    -- Контакти
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,

    -- Професійна інформація
    roles JSON, -- ['coach', 'judge']
    education TEXT NOT NULL,
    specialization TEXT NOT NULL,
    experience TEXT NOT NULL,
    certificates TEXT,
    achievements TEXT,

    -- Суддівські дані (якщо є)
    judge_category ENUM('national', 'international') NULL,
    judge_license VARCHAR(100) NULL,

    -- Клуб
    preferred_club_id VARCHAR(36),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_club_id) REFERENCES clubs(id) ON DELETE SET NULL,

    INDEX idx_user (user_id),
    INDEX idx_club (preferred_club_id),
    INDEX idx_name (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ЗАЯВКИ ТРЕНЕРІВ/СУДДІВ
-- ========================================
CREATE TABLE IF NOT EXISTS coach_judge_applications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    -- Особиста інформація
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    region VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,

    -- Професійна інформація
    roles JSON NOT NULL, -- ['coach', 'judge']
    education TEXT NOT NULL,
    specialization TEXT NOT NULL,
    experience TEXT NOT NULL,
    certificates TEXT,
    achievements TEXT,

    -- Суддівські дані
    judge_info JSON,

    -- Додаткові поля
    first_name_en VARCHAR(255),
    last_name_en VARCHAR(255),
    passport VARCHAR(50),

    -- Клуб
    preferred_club_id VARCHAR(36) NOT NULL,
    preferred_club_name VARCHAR(255) NOT NULL,
    application_message TEXT,

    -- Статус
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(36) NULL,
    review_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (preferred_club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_status (status),
    INDEX idx_club (preferred_club_id),
    INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ЗМАГАННЯ (COMPETITIONS)
-- ========================================
CREATE TABLE IF NOT EXISTS competitions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Дати
    competition_date DATE NOT NULL,
    registration_start DATE NOT NULL,
    registration_end DATE NOT NULL,

    -- Місце проведення
    venue VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address VARCHAR(500),

    -- Організація
    organizer_id VARCHAR(36) NOT NULL,
    organizer_name VARCHAR(255) NOT NULL,

    -- Налаштування
    categories JSON, -- список категорій
    program_fees JSON, -- вартість по програмах
    max_participants INT DEFAULT 0,
    current_participants INT DEFAULT 0,

    -- Статус
    status ENUM('draft', 'published', 'registration_open', 'registration_closed', 'completed', 'cancelled') DEFAULT 'draft',

    -- Додаткова інформація
    rules TEXT,
    contact_info TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_status (status),
    INDEX idx_date (competition_date),
    INDEX idx_city (city),
    INDEX idx_organizer (organizer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- РЕЄСТРАЦІЇ НА ЗМАГАННЯ
-- ========================================
CREATE TABLE IF NOT EXISTS competition_registrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    competition_id VARCHAR(36) NOT NULL,
    athlete_id VARCHAR(36) NOT NULL,

    -- Дані реєстрації
    programs JSON NOT NULL, -- список програм
    total_fee DECIMAL(10,2) NOT NULL,

    -- Статус
    status ENUM('pending', 'confirmed', 'paid', 'cancelled') DEFAULT 'pending',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Платіж
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    payment_date TIMESTAMP NULL,
    payment_transaction_id VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,

    UNIQUE KEY unique_registration (competition_id, athlete_id),
    INDEX idx_competition (competition_id),
    INDEX idx_athlete (athlete_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- РЕЗУЛЬТАТИ ЗМАГАНЬ
-- ========================================
CREATE TABLE IF NOT EXISTS competition_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    competition_id VARCHAR(36) NOT NULL,
    athlete_id VARCHAR(36) NOT NULL,
    program VARCHAR(255) NOT NULL,

    -- Результати
    score DECIMAL(5,2),
    place INT,
    award VARCHAR(50), -- 'gold', 'silver', 'bronze', 'diploma'

    -- Додаткова інформація
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,

    INDEX idx_competition (competition_id),
    INDEX idx_athlete (athlete_id),
    INDEX idx_program (program),
    INDEX idx_place (place)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ЗАЯВКИ НА РОЛІ (ROLE REQUESTS)
-- ========================================
CREATE TABLE IF NOT EXISTS role_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,

    current_role ENUM('athlete', 'club_owner', 'coach_judge', 'admin') NOT NULL,
    requested_role ENUM('athlete', 'club_owner', 'coach_judge', 'admin') NOT NULL,
    reason TEXT NOT NULL,

    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(36) NULL,
    review_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- НОВИНИ (NEWS)
-- ========================================
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,

    author_id VARCHAR(36) NOT NULL,
    author_name VARCHAR(255) NOT NULL,

    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,

    image_url VARCHAR(500),
    tags JSON,

    views_count INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_status (status),
    INDEX idx_published (published_at),
    INDEX idx_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- КУРСИ (COURSES)
-- ========================================
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,

    instructor_id VARCHAR(36) NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,

    -- Дати
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_end DATE NOT NULL,

    -- Місце
    location VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,

    -- Налаштування
    max_participants INT DEFAULT 0,
    current_participants INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    credits INT DEFAULT 0,

    status ENUM('draft', 'published', 'registration_open', 'registration_closed', 'completed', 'cancelled') DEFAULT 'draft',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_status (status),
    INDEX idx_city (city),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- РЕЄСТРАЦІЇ НА КУРСИ
-- ========================================
CREATE TABLE IF NOT EXISTS course_registrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    course_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,

    status ENUM('pending', 'confirmed', 'paid', 'completed', 'cancelled') DEFAULT 'pending',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Платіж
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    payment_date TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE KEY unique_course_registration (course_id, user_id),
    INDEX idx_course (course_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ФАЙЛИ/ДОКУМЕНТИ
-- ========================================
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INT NOT NULL,

    -- Зберігання
    storage_path VARCHAR(500) NOT NULL,
    storage_type ENUM('local', 'cloud') DEFAULT 'local',

    -- Метадані
    uploaded_by VARCHAR(36) NOT NULL,
    entity_type VARCHAR(50), -- 'athlete', 'club', 'competition', etc.
    entity_id VARCHAR(36),

    is_public BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_uploader (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- НАЛАШТУВАННЯ СИСТЕМИ
-- ========================================
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',

    description TEXT,
    category VARCHAR(100),

    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_category (category),
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ЛОГИ АКТИВНОСТІ
-- ========================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    user_id VARCHAR(36),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(36),

    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ПОЧАТКОВІ ДАНІ
-- ========================================

-- Створюємо суперадміністратора
INSERT IGNORE INTO users (id, email, password_hash, name, role, is_verified, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'aerobicsua@gmail.com',
    '$2b$10$8O8KvK8GvK8GvK8GvK8GvOt6wX8wX8wX8wX8wX8wX8wX8wX8wX8w.',
    'Суперадміністратор ФУСАФ',
    'admin',
    TRUE,
    TRUE
);

-- Системні налаштування
INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES
('site_name', 'ФУСАФ', 'string', 'Назва сайту', 'general'),
('site_description', 'Федерація України зі Спортивної Аеробіки і Фітнесу', 'string', 'Опис сайту', 'general'),
('registration_enabled', 'true', 'boolean', 'Чи дозволена реєстрація', 'registration'),
('competition_registration_fee', '100', 'number', 'Базова вартість реєстрації на змагання', 'competitions'),
('max_file_size', '5242880', 'number', 'Максимальний розмір файлу в байтах (5MB)', 'files');

-- Завершено
SELECT 'MySQL схема для ФУСАФ успішно створена!' as message;
