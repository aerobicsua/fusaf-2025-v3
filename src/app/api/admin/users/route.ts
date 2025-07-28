import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Перевірка прав адміністратора
async function checkAdminPermissions(request: NextRequest) {
  // TODO: В реальному проекті тут була б перевірка JWT токена
  // Поки що робимо заглушку, в production додати перевірку токена
  return true;
}

// GET - отримати список всіх користувачів
export async function GET(request: NextRequest) {
  try {
    // Перевіряємо права доступу
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено. Потрібні права адміністратора.'
      }, { status: 403 });
    }

    const url = new URL(request.url);

    // Параметри фільтрації
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role');
    const region = url.searchParams.get('region');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    console.log('👨‍💼 Admin GET /api/admin/users з фільтрами:', {
      status, role, region, search, page, limit
    });

    // Базовий запит
    let query = `
      SELECT
        id, email, name,
        first_name, last_name, middle_name,
        date_of_birth, gender, phone,
        country, region, city, address, zip_code,
        club, coach, sport_category, experience,
        roles, status, email_verified, membership_paid,
        created_at, updated_at, last_login
      FROM users
      WHERE 1=1
    `;

    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const queryParams: any[] = [];
    const countParams: any[] = [];

    // Додаємо фільтри
    if (status) {
      query += ` AND status = ?`;
      countQuery += ` AND status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    if (role) {
      query += ` AND JSON_CONTAINS(roles, ?)`;
      countQuery += ` AND JSON_CONTAINS(roles, ?)`;
      queryParams.push(`"${role}"`);
      countParams.push(`"${role}"`);
    }

    if (region) {
      query += ` AND region LIKE ?`;
      countQuery += ` AND region LIKE ?`;
      queryParams.push(`%${region}%`);
      countParams.push(`%${region}%`);
    }

    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
      countQuery += ` AND (name LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Сортування та пагінація
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log('📊 Виконуємо MySQL запит:', query);

    // Виконуємо запити
    const [users, countResult] = await Promise.all([
      executeQuery<any>(query, queryParams),
      executeQuery<any>(countQuery, countParams)
    ]);

    const total = countResult[0]?.total || 0;

    console.log(`✅ Знайдено ${users.length} користувачів з ${total} загалом`);

    // Обробляємо дані користувачів
    const processedUsers = users.map(user => {
      // Парсимо ролі
      let roles = [];
      try {
        if (typeof user.roles === 'string') {
          roles = JSON.parse(user.roles);
        } else if (Array.isArray(user.roles)) {
          roles = user.roles;
        }
      } catch (e) {
        roles = ['user'];
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        middleName: user.middle_name || '',
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        phone: user.phone,

        country: user.country,
        region: user.region,
        city: user.city,
        address: user.address,
        zipCode: user.zip_code,

        club: user.club,
        coach: user.coach,
        sportCategory: user.sport_category,
        experience: user.experience,

        roles: roles,
        status: user.status,
        emailVerified: user.email_verified,
        membershipPaid: user.membership_paid,

        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      };
    });

    // Статистика
    const stats = await executeQuery<any>(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
        COUNT(CASE WHEN JSON_CONTAINS(roles, '"athlete"') THEN 1 END) as athletes,
        COUNT(CASE WHEN JSON_CONTAINS(roles, '"admin"') THEN 1 END) as admins,
        COUNT(CASE WHEN JSON_CONTAINS(roles, '"coach_judge"') THEN 1 END) as coaches
      FROM users
    `);

    return NextResponse.json({
      success: true,
      users: processedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: stats[0] || {},
      filters: { status, role, region, search },
      debug: {
        storageType: 'MYSQL_ADMIN',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Помилка Admin GET /api/admin/users:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження користувачів',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// PUT - оновити користувача
export async function PUT(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ID користувача обов\'язковий'
      }, { status: 400 });
    }

    console.log('👨‍💼 Admin PUT /api/admin/users для:', userId);

    // Підготовка оновлень
    const updateFields = [];
    const updateValues = [];

    // Дозволені поля для оновлення адміністратором
    const allowedFields = [
      'name', 'first_name', 'last_name', 'middle_name',
      'date_of_birth', 'gender', 'phone',
      'country', 'region', 'city', 'address', 'zip_code',
      'club', 'coach', 'sport_category', 'experience',
      'status', 'email_verified', 'membership_paid'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    }

    // Ролі (JSON поле)
    if (updates.roles !== undefined) {
      updateFields.push('roles = ?');
      updateValues.push(JSON.stringify(updates.roles));
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Немає даних для оновлення'
      }, { status: 400 });
    }

    // Додаємо updated_at
    updateFields.push('updated_at = NOW()');
    updateValues.push(userId);

    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateValues);

    console.log('✅ Користувача оновлено адміністратором');

    return NextResponse.json({
      success: true,
      message: 'Користувача успішно оновлено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin PUT /api/admin/users:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка оновлення користувача',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// DELETE - видалити користувача
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ID користувача обов\'язковий'
      }, { status: 400 });
    }

    console.log('👨‍💼 Admin DELETE /api/admin/users для:', userId);

    // Перевіряємо чи існує користувач
    const users = await executeQuery<any>(`
      SELECT id, email, roles FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Користувача не знайдено'
      }, { status: 404 });
    }

    const user = users[0];

    // Перевіряємо чи це не останній адмін
    let roles = [];
    try {
      roles = JSON.parse(user.roles);
    } catch (e) {
      roles = [];
    }

    if (roles.includes('admin')) {
      const adminCount = await executeQuery<any>(`
        SELECT COUNT(*) as count
        FROM users
        WHERE JSON_CONTAINS(roles, '"admin"') AND status = 'active'
      `);

      if (adminCount[0]?.count <= 1) {
        return NextResponse.json({
          success: false,
          error: 'Неможливо видалити останнього адміністратора'
        }, { status: 400 });
      }
    }

    // Видаляємо користувача (каскадне видалення потрібно для реєстрацій)
    await executeQuery(`DELETE FROM users WHERE id = ?`, [userId]);

    console.log('✅ Користувача видалено адміністратором:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Користувача успішно видалено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin DELETE /api/admin/users:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка видалення користувача',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
