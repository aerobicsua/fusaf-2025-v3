import { NextResponse } from 'next/server';
import { createPool } from '@/lib/mysql';

export async function POST() {
  try {
    console.log('🧹 Очищення демо даних...');

    const pool = createPool();
    const connection = await pool.getConnection();

    // Перевіряємо які таблиці існують
    const [tables] = await connection.execute('SHOW TABLES') as any[];
    const existingTables = tables.map((table: any) => Object.values(table)[0]);
    console.log('📋 Існуючі таблиці:', existingTables);

    // Відключаємо перевірку foreign keys
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Очищаємо тільки існуючі таблиці
    console.log('🗑️ Очищення таблиць...');

    const tablesToClear = [
      'club_requests',
      'registrations',
      'competitions',
      'clubs',
      'users'
    ];

    for (const tableName of tablesToClear) {
      if (existingTables.includes(tableName)) {
        await connection.execute(`DELETE FROM ${tableName}`);
        console.log(`✅ Таблицю ${tableName} очищено`);
      } else {
        console.log(`⏭️ Таблиця ${tableName} не існує, пропускаємо`);
      }
    }

    console.log('✅ Всі демо дані видалено');

    // Створюємо тільки суперадміністратора
    console.log('👑 Створення суперадміністратора...');

    // Спробуємо спочатку простий INSERT з мінімальними полями
    try {
      await connection.execute(`
        INSERT INTO users (
          id,
          email,
          name
        ) VALUES (
          '550e8400-e29b-41d4-a716-446655440000',
          'aerobicsua@gmail.com',
          'Суперадміністратор ФУСАФ'
        )
      `);
    } catch (insertError) {
      console.log('⚠️ Помилка створення користувача з ID:', insertError);

      // Спробуємо без ID
      await connection.execute(`
        INSERT INTO users (email, name) VALUES ('aerobicsua@gmail.com', 'Суперадміністратор ФУСАФ')
      `);
    }

    console.log('✅ Суперадміністратор створений: aerobicsua@gmail.com');

    // Включаємо перевірку foreign keys
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Перевіряємо стан бази після очищення
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users') as any[];
    const [clubCount] = await connection.execute(
      existingTables.includes('clubs') ? 'SELECT COUNT(*) as count FROM clubs' : 'SELECT 0 as count'
    ) as any[];
    const [requestCount] = await connection.execute(
      existingTables.includes('club_requests') ? 'SELECT COUNT(*) as count FROM club_requests' : 'SELECT 0 as count'
    ) as any[];

    connection.release();

    return NextResponse.json({
      success: true,
      message: 'Демо дані очищено успішно',
      data: {
        users: userCount[0].count,
        clubs: clubCount[0].count,
        club_requests: requestCount[0].count,
        superadmin: {
          email: 'aerobicsua@gmail.com',
          password: 'fusaf2025',
          note: 'Єдиний користувач в системі'
        },
        existingTables: existingTables
      }
    });

  } catch (error) {
    console.error('❌ Помилка очищення демо даних:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка очищення демо даних',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
