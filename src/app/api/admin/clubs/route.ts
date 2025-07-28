import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// Перевірка прав адміністратора
async function checkAdminPermissions(request: NextRequest) {
  // TODO: В реальному проекті тут була б перевірка JWT токена
  return true;
}

// GET - отримати список всіх клубів
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
    const status = url.searchParams.get('status');
    const region = url.searchParams.get('region');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    console.log('🏢 Admin GET /api/admin/clubs з фільтрами:', {
      status, region, search, page, limit
    });

    // Базовий запит для клубів
    let query = `
      SELECT
        c.id, c.name, c.full_name, c.description,
        c.address, c.city, c.region, c.country,
        c.phone, c.email, c.website,
        c.legal_status, c.registration_number, c.founding_date,
        c.members_count, c.coaches_count, c.achievements_count,
        c.owner_id, c.status, c.membership_paid,
        c.created_at, c.updated_at,
        u.name as owner_name, u.email as owner_email
      FROM clubs c
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE 1=1
    `;

    let countQuery = `SELECT COUNT(*) as total FROM clubs WHERE 1=1`;
    const queryParams: any[] = [];
    const countParams: any[] = [];

    // Додаємо фільтри
    if (status) {
      query += ` AND c.status = ?`;
      countQuery += ` AND status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    if (region) {
      query += ` AND c.region LIKE ?`;
      countQuery += ` AND region LIKE ?`;
      queryParams.push(`%${region}%`);
      countParams.push(`%${region}%`);
    }

    if (search) {
      query += ` AND (c.name LIKE ? OR c.full_name LIKE ? OR c.city LIKE ?)`;
      countQuery += ` AND (name LIKE ? OR full_name LIKE ? OR city LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Сортування та пагінація
    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log('📊 Виконуємо MySQL запит для клубів');

    // Виконуємо запити
    const [clubs, countResult] = await Promise.all([
      executeQuery<any>(query, queryParams),
      executeQuery<any>(countQuery, countParams)
    ]);

    const total = countResult[0]?.total || 0;

    console.log(`✅ Знайдено ${clubs.length} клубів з ${total} загалом`);

    // Обробляємо дані клубів
    const processedClubs = clubs.map(club => ({
      id: club.id,
      name: club.name,
      fullName: club.full_name,
      description: club.description,

      address: club.address,
      city: club.city,
      region: club.region,
      country: club.country,

      phone: club.phone,
      email: club.email,
      website: club.website,

      legalStatus: club.legal_status,
      registrationNumber: club.registration_number,
      foundingDate: club.founding_date,

      membersCount: club.members_count || 0,
      coachesCount: club.coaches_count || 0,
      achievementsCount: club.achievements_count || 0,

      ownerId: club.owner_id,
      ownerName: club.owner_name,
      ownerEmail: club.owner_email,

      status: club.status,
      membershipPaid: club.membership_paid,

      createdAt: club.created_at,
      updatedAt: club.updated_at
    }));

    // Статистика клубів
    const stats = await executeQuery<any>(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN membership_paid = 1 THEN 1 END) as paid_members,
        AVG(members_count) as avg_members
      FROM clubs
    `);

    const regionStats = await executeQuery<any>(`
      SELECT region, COUNT(*) as count
      FROM clubs
      WHERE region IS NOT NULL AND region != ''
      GROUP BY region
      ORDER BY count DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      clubs: processedClubs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: {
        ...stats[0],
        byRegion: regionStats.reduce((acc: any, item) => {
          acc[item.region] = item.count;
          return acc;
        }, {})
      },
      filters: { status, region, search }
    });

  } catch (error) {
    console.error('❌ Помилка Admin GET /api/admin/clubs:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження клубів',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// POST - створити новий клуб
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const clubData = await request.json();

    console.log('🏢 Admin POST /api/admin/clubs - створення клубу');

    // Валідація обов'язкових полів
    if (!clubData.name) {
      return NextResponse.json({
        success: false,
        error: 'Назва клубу обов\'язкова'
      }, { status: 400 });
    }

    // Перевіряємо унікальність назви
    const existingClubs = await executeQuery<any>(`
      SELECT id FROM clubs WHERE name = ?
    `, [clubData.name]);

    if (existingClubs.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Клуб з такою назвою вже існує'
      }, { status: 409 });
    }

    const clubId = uuidv4();

    // Створюємо клуб
    await executeQuery(`
      INSERT INTO clubs (
        id, name, full_name, description,
        address, city, region, country,
        phone, email, website,
        legal_status, registration_number, founding_date,
        members_count, coaches_count, achievements_count,
        owner_id, status, membership_paid,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      clubId,
      clubData.name,
      clubData.fullName || '',
      clubData.description || '',
      clubData.address || '',
      clubData.city || '',
      clubData.region || '',
      clubData.country || 'Україна',
      clubData.phone || '',
      clubData.email || '',
      clubData.website || '',
      clubData.legalStatus || '',
      clubData.registrationNumber || '',
      clubData.foundingDate || null,
      clubData.membersCount || 0,
      clubData.coachesCount || 0,
      clubData.achievementsCount || 0,
      clubData.ownerId || null,
      clubData.status || 'pending',
      clubData.membershipPaid || false
    ]);

    console.log('✅ Клуб створено адміністратором:', clubData.name);

    return NextResponse.json({
      success: true,
      message: 'Клуб успішно створено',
      clubId: clubId
    });

  } catch (error) {
    console.error('❌ Помилка Admin POST /api/admin/clubs:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка створення клубу',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// PUT - оновити клуб
export async function PUT(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { clubId, updates } = await request.json();

    if (!clubId) {
      return NextResponse.json({
        success: false,
        error: 'ID клубу обов\'язковий'
      }, { status: 400 });
    }

    console.log('🏢 Admin PUT /api/admin/clubs для:', clubId);

    // Підготовка оновлень
    const updateFields = [];
    const updateValues = [];

    // Дозволені поля для оновлення
    const allowedFields = [
      'name', 'full_name', 'description',
      'address', 'city', 'region', 'country',
      'phone', 'email', 'website',
      'legal_status', 'registration_number', 'founding_date',
      'members_count', 'coaches_count', 'achievements_count',
      'owner_id', 'status', 'membership_paid'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Немає даних для оновлення'
      }, { status: 400 });
    }

    // Додаємо updated_at
    updateFields.push('updated_at = NOW()');
    updateValues.push(clubId);

    const updateQuery = `
      UPDATE clubs
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateValues);

    console.log('✅ Клуб оновлено адміністратором');

    return NextResponse.json({
      success: true,
      message: 'Клуб успішно оновлено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin PUT /api/admin/clubs:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка оновлення клубу',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// DELETE - видалити клуб
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { clubId } = await request.json();

    if (!clubId) {
      return NextResponse.json({
        success: false,
        error: 'ID клубу обов\'язковий'
      }, { status: 400 });
    }

    console.log('🏢 Admin DELETE /api/admin/clubs для:', clubId);

    // Перевіряємо чи існує клуб
    const clubs = await executeQuery<any>(`
      SELECT id, name FROM clubs WHERE id = ?
    `, [clubId]);

    if (clubs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Клуб не знайдено'
      }, { status: 404 });
    }

    const club = clubs[0];

    // Видаляємо клуб
    await executeQuery(`DELETE FROM clubs WHERE id = ?`, [clubId]);

    console.log('✅ Клуб видалено адміністратором:', club.name);

    return NextResponse.json({
      success: true,
      message: 'Клуб успішно видалено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin DELETE /api/admin/clubs:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка видалення клубу',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
