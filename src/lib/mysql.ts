import Database from 'better-sqlite3';

// Simple SQLite database for development
let db: Database.Database | null = null;

function getDatabase() {
  if (!db) {
    db = new Database('./fusaf_dev.db');

    // Create tables if they don't exist
    initializeTables();
  }
  return db;
}

function initializeTables() {
  if (!db) return;

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      roles TEXT DEFAULT '["user"]',
      status TEXT DEFAULT 'active',
      firstName TEXT,
      lastName TEXT,
      phone TEXT,
      emailVerified INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Competitions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS competitions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATETIME,
      end_date DATETIME,
      registration_deadline DATETIME,
      location TEXT,
      categories TEXT,
      registration_fee REAL DEFAULT 0,
      max_participants INTEGER,
      current_participants INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      organizer TEXT,
      rules TEXT,
      prizes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT UNIQUE NOT NULL,
      competition_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'UAH',
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'liqpay',
      customer_email TEXT,
      customer_phone TEXT,
      customer_user_id TEXT,
      liqpay_payment_id TEXT,
      liqpay_transaction_id TEXT,
      liqpay_data TEXT,
      liqpay_signature TEXT,
      liqpay_status TEXT,
      liqpay_err_code TEXT,
      liqpay_err_description TEXT,
      registration_data TEXT,
      callback_data TEXT,
      sender_card_mask TEXT,
      sender_card_bank TEXT,
      sender_phone TEXT,
      expires_at DATETIME,
      paid_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (competition_id) REFERENCES competitions(id)
    )
  `);

  // Athlete registrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS athlete_registrations (
      id TEXT PRIMARY KEY,
      competition_id TEXT,
      athlete_email TEXT,
      firstName TEXT,
      lastName TEXT,
      middleName TEXT,
      phone TEXT,
      dateOfBirth TEXT,
      gender TEXT,
      category TEXT,
      club TEXT,
      city TEXT,
      region TEXT,
      notes TEXT,
      payment_id TEXT,
      registration_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (competition_id) REFERENCES competitions(id),
      FOREIGN KEY (payment_id) REFERENCES payments(id)
    )
  `);

  // Admin logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      admin_email TEXT,
      action TEXT,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database tables initialized');
}

export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const database = getDatabase();

  try {
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = database.prepare(query);
      return stmt.all(...params) as T[];
    } else {
      const stmt = database.prepare(query);
      const result = stmt.run(...params);
      return [result] as any;
    }
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Insert demo data for testing
export async function insertDemoData() {
  try {
    // Insert demo admin user
    await executeQuery(`
      INSERT OR IGNORE INTO users (id, email, password, roles, firstName, lastName, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'admin-001',
      'admin@fusaf.org.ua',
      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYe/2jS9TojmQoO', // password: admin123
      '["admin"]',
      'Адмін',
      'ФУСАФ',
      'active'
    ]);

    // Insert demo competition
    await executeQuery(`
      INSERT OR IGNORE INTO competitions (
        id, title, description, start_date, end_date, registration_deadline,
        location, categories, registration_fee, max_participants, status, organizer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'comp-001',
      'Чемпіонат України зі Спортивної Аеробіки 2024',
      'Національний чемпіонат зі спортивної аеробіки серед усіх вікових категорій',
      '2024-12-01 10:00:00',
      '2024-12-03 18:00:00',
      '2024-11-25 23:59:59',
      '{"city": "Київ", "venue": "Палац Спорту", "address": "вул. Спортивна, 1"}',
      '[{"name": "Юніори", "ageFrom": 16, "ageTo": 18}, {"name": "Дорослі", "ageFrom": 18, "ageTo": 35}]',
      250.00,
      100,
      'registration_open',
      'ФУСАФ'
    ]);

    console.log('✅ Demo data inserted');
  } catch (error) {
    console.error('Error inserting demo data:', error);
  }
}

// Initialize demo data on first load
setTimeout(() => {
  insertDemoData();
}, 1000);
