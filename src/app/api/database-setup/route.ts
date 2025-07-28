import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@/lib/mysql';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    console.log('🔍 Тестування підключення до MySQL...');

    const pool = createPool();

    // Тестуємо підключення
    const connection = await pool.getConnection();
    console.log('✅ Підключення до MySQL успішне');

    // Отримуємо інформацію про базу
    const [dbInfo] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as version');
    console.log('📊 Інформація про базу:', dbInfo);

    // Перевіряємо існуючі таблиці
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Існуючі таблиці:', tables);

    connection.release();

    return NextResponse.json({
      success: true,
      message: 'Підключення до MySQL успішне',
      database: dbInfo,
      tables: tables,
      connection: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      }
    });

  } catch (error) {
    console.error('❌ Помилка підключення до MySQL:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка підключення до MySQL',
      details: error instanceof Error ? error.message : 'Невідома помилка',
      connection: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'create_tables') {
      return await createTables();
    }

    if (action === 'reset_database') {
      return await resetDatabase();
    }

    return NextResponse.json({
      success: false,
      error: 'Невідома дія'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Помилка виконання дії:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка виконання дії',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

async function createTables() {
  try {
    console.log('🚀 Створення таблиць MySQL...');

    const pool = createPool();
    const connection = await pool.getConnection();

    // Читаємо SQL схему
    const schemaPath = join(process.cwd(), 'database', 'mysql-schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Розбиваємо на окремі запити
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Виконання ${statements.length} SQL запитів...`);

    const results = [];
    for (const statement of statements) {
      try {
        if (statement.includes('CREATE TABLE') || statement.includes('INSERT')) {
          await connection.execute(statement);
          const tableName = statement.match(/CREATE TABLE.*?(\w+)\s*\(/)?.[1] ||
                           statement.match(/INSERT.*?INTO\s+(\w+)/)?.[1] || 'unknown';
          results.push(`✅ ${tableName}`);
          console.log(`✅ Виконано: ${tableName}`);
        }
      } catch (error) {
        console.warn(`⚠️ Пропущено запит (можливо вже існує):`, error);
        results.push(`⚠️ Пропущено (можливо існує)`);
      }
    }

    // Перевіряємо створені таблиці
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Створені таблиці:', tables);

    connection.release();

    return NextResponse.json({
      success: true,
      message: 'Таблиці MySQL успішно створені',
      results: results,
      tables: tables
    });

  } catch (error) {
    console.error('❌ Помилка створення таблиць:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка створення таблиць',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

async function resetDatabase() {
  try {
    console.log('🔄 Скидання бази даних...');

    const pool = createPool();
    const connection = await pool.getConnection();

    // Отримуємо список таблиць
    const [tables] = await connection.execute('SHOW TABLES') as any[];

    if (tables.length > 0) {
      // Відключаємо перевірку foreign keys
      await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

      // Видаляємо всі таблиці
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        await connection.execute(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`🗑️ Видалено таблицю: ${tableName}`);
      }

      // Включаємо перевірку foreign keys
      await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    }

    connection.release();

    return NextResponse.json({
      success: true,
      message: `База даних скинута. Видалено ${tables.length} таблиць`,
      deletedTables: tables.length
    });

  } catch (error) {
    console.error('❌ Помилка скидання бази:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка скидання бази даних',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
