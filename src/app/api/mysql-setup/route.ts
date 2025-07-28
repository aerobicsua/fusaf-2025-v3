import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, testConnection } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Початок налаштування MySQL бази даних...');

    // Спочатку тестуємо з'єднання
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Не вдалося підключитися до MySQL'
      }, { status: 500 });
    }

    // SQL команди для створення таблиць
    const sqlCommands = [
      // Таблиця користувачів
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        roles JSON NOT NULL,

        first_name VARCHAR(100),
        last_name VARCHAR(100),
        middle_name VARCHAR(100),
        date_of_birth DATE,
        gender ENUM('male', 'female'),
        phone VARCHAR(20),

        country VARCHAR(100) DEFAULT 'Україна',
        region VARCHAR(100),
        city VARCHAR(100),
        address VARCHAR(255),
        zip_code VARCHAR(10),

        club VARCHAR(255),
        coach VARCHAR(255),
        sport_category VARCHAR(100),
        experience TEXT,
        specialization VARCHAR(255),
        license VARCHAR(100),
        license_level VARCHAR(50),

        bio TEXT,
        website VARCHAR(255),
        social_media JSON,
        achievements TEXT,
        interests JSON,
        languages JSON,

        is_public_profile BOOLEAN DEFAULT FALSE,
        show_email BOOLEAN DEFAULT FALSE,
        show_phone BOOLEAN DEFAULT FALSE,
        email_notifications BOOLEAN DEFAULT TRUE,

        avatar TEXT,
        documents JSON,

        email_verified BOOLEAN DEFAULT FALSE,
        membership_paid BOOLEAN DEFAULT FALSE,
        membership_expiry_date DATE,
        status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,

        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_region (region),
        INDEX idx_club (club)
      )`,

      // Таблиця клубів
      `CREATE TABLE IF NOT EXISTS clubs (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        full_name VARCHAR(500),
        description TEXT,

        address VARCHAR(500),
        city VARCHAR(100),
        region VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Україна',

        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),

        legal_status VARCHAR(100),
        registration_number VARCHAR(100),
        founding_date DATE,

        members_count INT DEFAULT 0,
        coaches_count INT DEFAULT 0,
        achievements_count INT DEFAULT 0,

        owner_id VARCHAR(36),

        status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
        membership_paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_region (region),
        INDEX idx_status (status),
        INDEX idx_owner (owner_id)
      )`,

      // Таблиця змагань
      `CREATE TABLE IF NOT EXISTS competitions (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,

        date DATE NOT NULL,
        time TIME,
        registration_deadline DATE,

        location VARCHAR(255) NOT NULL,
        address VARCHAR(500),
        city VARCHAR(100),
        region VARCHAR(100),

        organizing_club VARCHAR(255),
        organizer_id VARCHAR(36),

        contact_person JSON,
        program_fees JSON,
        payment_details JSON,
        max_participants_by_program JSON,
        categories JSON,
        rules TEXT,
        equipment_requirements TEXT,

        accommodation JSON,
        meals JSON,
        transportation JSON,

        medical_requirements TEXT,
        insurance_required BOOLEAN DEFAULT TRUE,

        notes TEXT,
        website VARCHAR(255),

        status ENUM('draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_date (date),
        INDEX idx_status (status),
        INDEX idx_region (region),
        INDEX idx_organizer (organizer_id)
      )`,

      // Таблиця реєстрацій
      `CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(36) PRIMARY KEY,
        competition_id VARCHAR(36) NOT NULL,
        participant_id VARCHAR(36),

        registration_type ENUM('preliminary', 'individual') NOT NULL,

        program VARCHAR(100),
        category VARCHAR(100),
        participants_data JSON,

        club_name VARCHAR(255),
        coach_name VARCHAR(255),
        coach_phone VARCHAR(20),

        registration_fee DECIMAL(10,2) DEFAULT 0,
        entry_fee DECIMAL(10,2) DEFAULT 0,
        total_fee DECIMAL(10,2) DEFAULT 0,
        payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        payment_date TIMESTAMP NULL,

        notes TEXT,

        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_competition (competition_id),
        INDEX idx_participant (participant_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status)
      )`,

      // Таблиця результатів
      `CREATE TABLE IF NOT EXISTS competition_results (
        id VARCHAR(36) PRIMARY KEY,
        competition_id VARCHAR(36) NOT NULL,
        participant_id VARCHAR(36),
        registration_id VARCHAR(36),

        program VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,

        rank_position INT,
        total_score DECIMAL(6,3),
        technical_score DECIMAL(6,3),
        artistic_score DECIMAL(6,3),
        execution_score DECIMAL(6,3),
        difficulty_score DECIMAL(6,3),

        routine_description TEXT,
        judges_scores JSON,
        deductions JSON,

        medal ENUM('gold', 'silver', 'bronze') NULL,
        award VARCHAR(255),

        performance_date DATE,
        notes TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_competition (competition_id),
        INDEX idx_participant (participant_id),
        INDEX idx_program_category (program, category),
        INDEX idx_rank (rank_position)
      )`,

      // Початкові дані - адміністратор
      `INSERT IGNORE INTO users (
        id, email, password_hash, name, roles,
        first_name, last_name, middle_name,
        country, region, city,
        status, email_verified, membership_paid,
        created_at
      ) VALUES (
        '1',
        'andfedos@gmail.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Федосенко Андрій',
        '["admin", "user"]',
        'Андрій', 'Федосенко', 'Васильович',
        'Україна', 'м. Київ', 'Київ',
        'active', TRUE, TRUE,
        NOW()
      )`,

      // Початкові дані - демо спортсмен
      `INSERT IGNORE INTO users (
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
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Федосенко Марія',
        '["athlete", "user"]',
        'Марія', 'Федосенко', 'Андріївна',
        '2011-10-19', 'female',
        'Україна', 'м. Київ', 'Київ',
        'юний спортсмен', '2 роки',
        'active', TRUE, TRUE,
        NOW()
      )`
    ];

    console.log(`📊 Виконуємо ${sqlCommands.length} SQL команд`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Виконуємо кожну SQL команду
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];

      try {
        console.log(`⚡ Виконуємо команду ${i + 1}/${sqlCommands.length}`);

        await executeQuery(command);

        results.push({
          command: i + 1,
          status: 'success',
          description: i < 5 ? `Таблиця ${i + 1}` : `Початкові дані ${i - 4}`
        });

        successCount++;

      } catch (error) {
        console.error(`❌ Помилка в команді ${i + 1}:`, error);

        results.push({
          command: i + 1,
          status: 'error',
          description: i < 5 ? `Таблиця ${i + 1}` : `Початкові дані ${i - 4}`,
          error: error instanceof Error ? error.message : 'Невідома помилка'
        });

        errorCount++;
      }
    }

    // Перевіряємо створені таблиці
    const tables = await executeQuery(`
      SELECT TABLE_NAME as name, TABLE_ROWS as rows
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [process.env.MYSQL_DATABASE]);

    console.log('✅ Налаштування MySQL завершено!');
    console.log(`📊 Успішно: ${successCount}, Помилок: ${errorCount}`);
    console.log(`🗂️ Створено таблиць: ${tables.length}`);

    return NextResponse.json({
      success: true,
      message: '✅ MySQL база даних налаштована успішно!',
      statistics: {
        totalCommands: sqlCommands.length,
        successCount,
        errorCount,
        tablesCreated: tables.length
      },
      tables: tables,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Критична помилка налаштування MySQL:', error);

    return NextResponse.json({
      success: false,
      error: 'Критична помилка налаштування MySQL',
      details: error instanceof Error ? error.message : 'Невідома помилка',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Перевіряємо існуючі таблиці
    const tables = await executeQuery(`
      SELECT
        TABLE_NAME as name,
        TABLE_ROWS as rows,
        CREATE_TIME as created,
        UPDATE_TIME as updated
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [process.env.MYSQL_DATABASE]);

    return NextResponse.json({
      success: true,
      database: process.env.MYSQL_DATABASE,
      tablesCount: tables.length,
      tables: tables,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Помилка перевірки таблиць:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка перевірки таблиць',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
