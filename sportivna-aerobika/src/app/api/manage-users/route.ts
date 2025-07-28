import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    console.log('🔍 Перевірка користувачів у MySQL БД...');

    // Параметри підключення з .env.local
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ З\'єднання встановлено');

    // Перевіряємо чи існує таблиця users
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");

    if ((tables as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({
        success: true,
        message: 'Таблиця users не існує в базі даних',
        usersTable: false,
        users: []
      });
    }

    // Отримуємо всіх користувачів
    const [users] = await connection.execute('SELECT id, email, name, roles, status, created_at FROM users');

    console.log('📊 Знайдено користувачів:', (users as any[]).length);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: `Знайдено ${(users as any[]).length} користувачів у базі даних`,
      usersTable: true,
      users: users,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('❌ Помилка перевірки користувачів:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка перевірки користувачів',
      details: { message: error instanceof Error ? error.message : 'Unknown error' }
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log('🗑️ Очищення користувачів з MySQL БД (крім адміна)...');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ З\'єднання встановлено');

    // Перевіряємо чи існує таблиця users
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");

    if ((tables as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({
        success: true,
        message: 'Таблиця users не існує - нічого очищати',
        deletedCount: 0
      });
    }

    // Рахуємо користувачів до видалення
    const [usersBefore] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const countBefore = (usersBefore as any)[0].count;

    // Видаляємо всіх користувачів крім головного адміна ФУСАФ
    const [result] = await connection.execute(`
      DELETE FROM users
      WHERE email != 'aerobicsua@gmail.com'
    `);

    // Рахуємо користувачів після видалення
    const [usersAfter] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const countAfter = (usersAfter as any)[0].count;

    const deletedCount = countBefore - countAfter;

    console.log(`✅ Видалено ${deletedCount} користувачів, залишилось ${countAfter}`);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: `Очищено ${deletedCount} користувачів з бази даних`,
      deletedCount: deletedCount,
      remainingCount: countAfter,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('❌ Помилка очищення користувачів:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка очищення користувачів',
      details: { message: error instanceof Error ? error.message : 'Unknown error' }
    }, { status: 500 });
  }
}
