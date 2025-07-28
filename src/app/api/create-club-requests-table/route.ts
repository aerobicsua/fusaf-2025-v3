import { NextResponse } from 'next/server';
import { createPool } from '@/lib/mysql';

export async function POST() {
  try {
    console.log('🔧 Створення таблиці club_requests...');

    const pool = createPool();
    const connection = await pool.getConnection();

    // Створюємо таблицю club_requests
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS club_requests (
        id VARCHAR(36) PRIMARY KEY,

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

        INDEX idx_status (status),
        INDEX idx_user (user_id),
        INDEX idx_submitted (submitted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Таблиця club_requests створена');

    // Перевіряємо створену таблицю
    const [tables] = await connection.execute('SHOW TABLES LIKE "club_requests"');
    console.log('📋 Таблиця club_requests існує:', tables);

    // Перевіряємо структуру таблиці
    const [columns] = await connection.execute('DESCRIBE club_requests');
    console.log('📊 Структура таблиці club_requests:', columns);

    connection.release();

    return NextResponse.json({
      success: true,
      message: 'Таблиця club_requests успішно створена',
      table: 'club_requests',
      columns: columns
    });

  } catch (error) {
    console.error('❌ Помилка створення таблиці club_requests:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка створення таблиці club_requests',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
