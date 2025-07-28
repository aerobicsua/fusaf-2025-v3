import { NextResponse } from 'next/server';
import { createPool } from '@/lib/mysql';

export async function GET() {
  try {
    console.log('🔍 Перевірка структури таблиці users...');

    const pool = createPool();
    const connection = await pool.getConnection();

    // Перевіряємо структуру таблиці users
    const [columns] = await connection.execute('DESCRIBE users') as any[];
    console.log('📋 Структура таблиці users:', columns);

    connection.release();

    return NextResponse.json({
      success: true,
      message: 'Структура таблиці users отримана',
      table: 'users',
      columns: columns,
      columnNames: columns.map((col: any) => col.Field)
    });

  } catch (error) {
    console.error('❌ Помилка перевірки таблиці:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка перевірки таблиці users',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
