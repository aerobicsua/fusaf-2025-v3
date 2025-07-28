import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, testConnection } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Перевірка статусу бази даних...');

    // Спочатку тестуємо з'єднання
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Не вдалося підключитися до MySQL'
      }, { status: 500 });
    }

    // Отримуємо список таблиць
    const tables = await executeQuery(`
      SELECT
        TABLE_NAME as name,
        TABLE_ROWS as rows,
        CREATE_TIME as created,
        UPDATE_TIME as updated,
        TABLE_COMMENT as comment
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [process.env.MYSQL_DATABASE]);

    // Отримуємо статистику по користувачам
    let userStats = { total: 0, admins: 0, athletes: 0 };
    try {
      const userCount = await executeQuery(`SELECT COUNT(*) as count FROM users`);
      userStats.total = userCount[0]?.count || 0;

      const adminCount = await executeQuery(`
        SELECT COUNT(*) as count
        FROM users
        WHERE JSON_CONTAINS(roles, '"admin"')
      `);
      userStats.admins = adminCount[0]?.count || 0;

      const athleteCount = await executeQuery(`
        SELECT COUNT(*) as count
        FROM users
        WHERE JSON_CONTAINS(roles, '"athlete"')
      `);
      userStats.athletes = athleteCount[0]?.count || 0;
    } catch (error) {
      console.warn('⚠️ Помилка отримання статистики користувачів:', error);
    }

    // Отримуємо статистику по змаганнях
    let competitionStats = { total: 0, active: 0, completed: 0 };
    try {
      const compCount = await executeQuery(`SELECT COUNT(*) as count FROM competitions`);
      competitionStats.total = compCount[0]?.count || 0;

      const activeCount = await executeQuery(`
        SELECT COUNT(*) as count
        FROM competitions
        WHERE status IN ('published', 'registration_open')
      `);
      competitionStats.active = activeCount[0]?.count || 0;

      const completedCount = await executeQuery(`
        SELECT COUNT(*) as count
        FROM competitions
        WHERE status = 'completed'
      `);
      competitionStats.completed = completedCount[0]?.count || 0;
    } catch (error) {
      console.warn('⚠️ Помилка отримання статистики змагань:', error);
    }

    return NextResponse.json({
      success: true,
      message: '✅ База даних працює!',
      database: {
        name: process.env.MYSQL_DATABASE,
        host: process.env.MYSQL_HOST,
        tablesCount: tables.length,
        tables: tables
      },
      statistics: {
        users: userStats,
        competitions: competitionStats
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Помилка перевірки статусу БД:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка перевірки статусу бази даних',
      details: error instanceof Error ? error.message : 'Невідома помилка',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
