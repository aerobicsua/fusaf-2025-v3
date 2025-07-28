import mysql from 'mysql2/promise';

// Конфігурація підключення до MySQL
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectTimeout: 10000,
  // SSL налаштування для безпечного з'єднання
  ssl: {
    rejectUnauthorized: false
  }
};

// Pool з'єднань для оптимізації
let pool: mysql.Pool | null = null;

// Створення pool з'єднань
export function createPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

// Отримання з'єднання з базою даних
export async function getConnection() {
  try {
    const pool = createPool();
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('❌ Помилка підключення до MySQL:', error);
    throw error;
  }
}

// Виконання SQL запиту
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  let connection;

  try {
    connection = await getConnection();
    const [rows] = await connection.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('❌ Помилка виконання запиту MySQL:', error);
    console.error('📝 Запит:', query);
    console.error('📊 Параметри:', params);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Виконання запиту з поверненням метаданих
export async function executeQueryWithMeta<T = any>(
  query: string,
  params: any[] = []
): Promise<{ rows: T[], insertId?: number, affectedRows?: number }> {
  let connection;

  try {
    connection = await getConnection();
    const [rows, fields] = await connection.execute(query, params);

    const result: any = rows;
    const meta = fields as any;

    return {
      rows: result,
      insertId: meta.insertId,
      affectedRows: meta.affectedRows
    };
  } catch (error) {
    console.error('❌ Помилка виконання запиту MySQL:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Тестування підключення до БД
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();

    console.log('✅ З\'єднання з MySQL успішне!');
    console.log(`📊 База даних: ${dbConfig.database}`);
    console.log(`🖥️ Хост: ${dbConfig.host}`);

    return true;
  } catch (error) {
    console.error('❌ Помилка тестування підключення:', error);
    return false;
  }
}

// Отримання інформації про БД
export async function getDatabaseInfo() {
  try {
    const tables = await executeQuery(`
      SELECT TABLE_NAME as name, TABLE_ROWS as rows
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
    `, [dbConfig.database]);

    return {
      database: dbConfig.database,
      host: dbConfig.host,
      tables: tables
    };
  } catch (error) {
    console.error('❌ Помилка отримання інформації про БД:', error);
    throw error;
  }
}

// Закриття всіх з'єднань
export async function closeConnections() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ З\'єднання з MySQL закрито');
  }
}
