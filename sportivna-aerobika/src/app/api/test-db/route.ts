import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    console.log('🔌 Перевірка підключення до бази даних...');

    // Параметри підключення з .env.local
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false // Для деяких хостингів MySQL
      }
    });

    console.log('✅ З\'єднання встановлено!');

    // Тестовий запит для перевірки
    console.log('🔍 Виконуємо тестовий запит...');
    const [rows] = await connection.execute('SELECT 1 as test');

    console.log('✅ Тестовий запит виконано:', rows);

    // Перевіряємо структуру бази даних
    console.log('🔍 Отримуємо список таблиць...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Таблиці в базі даних:', tables);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Підключення до бази даних успішне!',
      database: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        port: process.env.DB_PORT
      },
      testResult: rows,
      tables: tables,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Помилка підключення до бази даних:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка підключення до бази даних',
      details: {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      },
      config: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        port: process.env.DB_PORT
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
