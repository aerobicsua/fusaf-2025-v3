import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// Перевірка прав адміністратора
async function checkAdminPermissions(request: NextRequest) {
  // TODO: В реальному проекті тут була б перевірка JWT токена
  return true;
}

// Функція для логування дій адміністратора
export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  details: any = {},
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const logId = uuidv4();

    await executeQuery(`
      INSERT INTO admin_logs (
        id, admin_id, admin_email, action, target_type, target_id,
        details, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      logId,
      adminId,
      adminEmail,
      action,
      targetType,
      targetId,
      JSON.stringify(details),
      ipAddress || 'unknown',
      userAgent || 'unknown'
    ]);

    console.log(`📝 Admin action logged: ${action} by ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Помилка логування дії адміністратора:', error);
    return false;
  }
}

// GET - отримати логи дій адміністраторів
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено. Потрібні права адміністратора.'
      }, { status: 403 });
    }

    const url = new URL(request.url);

    // Параметри фільтрації
    const adminEmail = url.searchParams.get('admin_email');
    const action = url.searchParams.get('action');
    const targetType = url.searchParams.get('target_type');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;

    console.log('📝 Admin GET /api/admin/logs з фільтрами:', {
      adminEmail, action, targetType, dateFrom, dateTo, page, limit
    });

    // Спочатку створимо таблицю, якщо вона не існує
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id VARCHAR(36) PRIMARY KEY,
        admin_id VARCHAR(36) NOT NULL,
        admin_email VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(36),
        details JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_admin_email (admin_email),
        INDEX idx_action (action),
        INDEX idx_target_type (target_type),
        INDEX idx_created_at (created_at)
      )
    `);

    // Базовий запит для логів
    let query = `
      SELECT
        id, admin_id, admin_email, action, target_type, target_id,
        details, ip_address, user_agent, created_at
      FROM admin_logs
      WHERE 1=1
    `;

    let countQuery = `SELECT COUNT(*) as total FROM admin_logs WHERE 1=1`;
    const queryParams: any[] = [];
    const countParams: any[] = [];

    // Додаємо фільтри
    if (adminEmail) {
      query += ` AND admin_email LIKE ?`;
      countQuery += ` AND admin_email LIKE ?`;
      queryParams.push(`%${adminEmail}%`);
      countParams.push(`%${adminEmail}%`);
    }

    if (action) {
      query += ` AND action = ?`;
      countQuery += ` AND action = ?`;
      queryParams.push(action);
      countParams.push(action);
    }

    if (targetType) {
      query += ` AND target_type = ?`;
      countQuery += ` AND target_type = ?`;
      queryParams.push(targetType);
      countParams.push(targetType);
    }

    if (dateFrom) {
      query += ` AND DATE(created_at) >= ?`;
      countQuery += ` AND DATE(created_at) >= ?`;
      queryParams.push(dateFrom);
      countParams.push(dateFrom);
    }

    if (dateTo) {
      query += ` AND DATE(created_at) <= ?`;
      countQuery += ` AND DATE(created_at) <= ?`;
      queryParams.push(dateTo);
      countParams.push(dateTo);
    }

    // Сортування та пагінація
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log('📊 Виконуємо MySQL запит для логів');

    // Виконуємо запити
    const [logs, countResult] = await Promise.all([
      executeQuery<any>(query, queryParams),
      executeQuery<any>(countQuery, countParams)
    ]);

    const total = countResult[0]?.total || 0;

    console.log(`✅ Знайдено ${logs.length} логів з ${total} загалом`);

    // Обробляємо дані логів
    const processedLogs = logs.map(log => {
      let details = {};
      try {
        details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details || {};
      } catch (e) {
        details = {};
      }

      return {
        id: log.id,
        adminId: log.admin_id,
        adminEmail: log.admin_email,
        action: log.action,
        targetType: log.target_type,
        targetId: log.target_id,
        details: details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: log.created_at
      };
    });

    // Статистика логів
    const stats = await executeQuery<any>(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT admin_email) as unique_admins,
        COUNT(CASE WHEN action LIKE '%CREATE%' THEN 1 END) as creates,
        COUNT(CASE WHEN action LIKE '%UPDATE%' THEN 1 END) as updates,
        COUNT(CASE WHEN action LIKE '%DELETE%' THEN 1 END) as deletes,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today
      FROM admin_logs
    `);

    const actionStats = await executeQuery<any>(`
      SELECT action, COUNT(*) as count
      FROM admin_logs
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `);

    const adminStats = await executeQuery<any>(`
      SELECT admin_email, COUNT(*) as count
      FROM admin_logs
      GROUP BY admin_email
      ORDER BY count DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      logs: processedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: {
        ...stats[0],
        byAction: actionStats.reduce((acc: any, item) => {
          acc[item.action] = item.count;
          return acc;
        }, {}),
        byAdmin: adminStats.reduce((acc: any, item) => {
          acc[item.admin_email] = item.count;
          return acc;
        }, {})
      },
      filters: { adminEmail, action, targetType, dateFrom, dateTo }
    });

  } catch (error) {
    console.error('❌ Помилка Admin GET /api/admin/logs:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження логів',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// POST - записати лог дії адміністратора
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const {
      adminId,
      adminEmail,
      action,
      targetType,
      targetId,
      details = {}
    } = await request.json();

    console.log('📝 Admin POST /api/admin/logs - запис логу:', action);

    // Валідація обов'язкових полів
    if (!adminId || !adminEmail || !action || !targetType) {
      return NextResponse.json({
        success: false,
        error: 'adminId, adminEmail, action та targetType обов\'язкові'
      }, { status: 400 });
    }

    // Отримуємо IP та User-Agent з заголовків
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Записуємо лог
    const success = await logAdminAction(
      adminId,
      adminEmail,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
      userAgent
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Лог успішно записано'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Помилка запису логу'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Помилка Admin POST /api/admin/logs:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка запису логу',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// DELETE - очистити старі логи (тільки для суперадміністратора)
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { days = 90 } = await request.json();

    console.log(`🗑️ Admin DELETE /api/admin/logs - очистка логів старше ${days} днів`);

    // Видаляємо логи старше вказаної кількості днів
    const result = await executeQuery(`
      DELETE FROM admin_logs
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);

    console.log('✅ Старі логи очищено');

    return NextResponse.json({
      success: true,
      message: `Логи старше ${days} днів успішно видалено`,
      deletedCount: (result as any).affectedRows || 0
    });

  } catch (error) {
    console.error('❌ Помилка очистки логів:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка очистки логів',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
