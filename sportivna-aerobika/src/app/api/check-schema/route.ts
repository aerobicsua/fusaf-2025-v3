import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    console.log('🔍 Перевірка схеми MySQL...');

    // Показуємо всі таблиці
    const tables = await executeQuery('SHOW TABLES');
    console.log('📊 Таблиці в БД:', tables);

    // Показуємо структуру таблиці clubs якщо вона є
    const clubsTableExists = tables.some((row: any) =>
      Object.values(row).includes('clubs')
    );

    let clubsStructure = null;
    if (clubsTableExists) {
      clubsStructure = await executeQuery('DESCRIBE clubs');
      console.log('🏢 Структура таблиці clubs:', clubsStructure);
    } else {
      console.log('❌ Таблиця clubs не існує');
    }

    // Показуємо структуру таблиці users
    const usersTableExists = tables.some((row: any) =>
      Object.values(row).includes('users')
    );

    let usersStructure = null;
    if (usersTableExists) {
      usersStructure = await executeQuery('DESCRIBE users');
      console.log('👥 Структура таблиці users:', usersStructure);
    } else {
      console.log('❌ Таблиця users не існує');
    }

    return NextResponse.json({
      success: true,
      tables: tables,
      clubsTable: {
        exists: clubsTableExists,
        structure: clubsStructure
      },
      usersTable: {
        exists: usersTableExists,
        structure: usersStructure
      }
    });

  } catch (error) {
    console.error('❌ Помилка перевірки схеми:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
