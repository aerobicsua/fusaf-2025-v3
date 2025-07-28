import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    console.log('🔍 Перевірка структури таблиці users...');

    // Отримуємо структуру таблиці users
    const schema = await executeQuery(`
      DESCRIBE users
    `);

    console.log('📋 Структура таблиці users:', schema);

    // Отримуємо приклад користувача для перевірки даних
    const sampleUser = await executeQuery(`
      SELECT
        email, first_name, last_name, middle_name,
        date_of_birth, gender, club, coach
      FROM users
      WHERE email = 'andfedos@gmail.com'
      LIMIT 1
    `);

    console.log('👤 Приклад користувача:', sampleUser);

    return NextResponse.json({
      success: true,
      schema: schema,
      sampleUser: sampleUser[0] || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Помилка перевірки схеми:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка перевірки структури бази даних',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
