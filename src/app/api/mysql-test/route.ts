import { NextRequest, NextResponse } from 'next/server';
import { testConnection, getDatabaseInfo } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Тестування підключення до MySQL...');

    // Тестуємо з'єднання
    const isConnected = await testConnection();

    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Не вдалося підключитися до MySQL'
      }, { status: 500 });
    }

    // Отримуємо інформацію про БД
    const dbInfo = await getDatabaseInfo();

    return NextResponse.json({
      success: true,
      message: '✅ З\'єднання з MySQL успішне!',
      database: {
        name: dbInfo.database,
        host: dbInfo.host,
        tablesCount: dbInfo.tables.length,
        tables: dbInfo.tables
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Помилка тестування MySQL:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка підключення до MySQL',
      details: error instanceof Error ? error.message : 'Невідома помилка',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
