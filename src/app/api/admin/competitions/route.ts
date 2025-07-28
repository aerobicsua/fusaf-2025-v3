import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// Перевірка прав адміністратора
async function checkAdminPermissions(request: NextRequest) {
  // TODO: В реальному проекті тут була б перевірка JWT токена
  return true;
}

// GET - отримати список всіх змагань для адміністратора
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
    const organizer = url.searchParams.get('organizer');
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    console.log('🏆 Admin GET /api/admin/competitions з фільтрами:', {
      status, region, organizer, date_from, date_to, search, page, limit
    });

    // Базовий запит для змагань з додатковою інформацією для адміна
    let query = `
      SELECT
        c.id, c.title, c.description, c.date, c.time, c.registration_deadline,
        c.location, c.address, c.city, c.region,
        c.organizing_club, c.organizer_id,
        c.contact_person, c.program_fees, c.max_participants_by_program,
        c.categories, c.rules, c.status,
        c.created_at, c.updated_at,
        u.name as organizer_name, u.email as organizer_email
      FROM competitions c
      LEFT JOIN users u ON c.organizer_id = u.id
      WHERE 1=1
    `;

    let countQuery = `SELECT COUNT(*) as total FROM competitions WHERE 1=1`;
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

    if (organizer) {
      query += ` AND c.organizing_club LIKE ?`;
      countQuery += ` AND organizing_club LIKE ?`;
      queryParams.push(`%${organizer}%`);
      countParams.push(`%${organizer}%`);
    }

    if (date_from) {
      query += ` AND c.date >= ?`;
      countQuery += ` AND date >= ?`;
      queryParams.push(date_from);
      countParams.push(date_from);
    }

    if (date_to) {
      query += ` AND c.date <= ?`;
      countQuery += ` AND date <= ?`;
      queryParams.push(date_to);
      countParams.push(date_to);
    }

    if (search) {
      query += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.location LIKE ?)`;
      countQuery += ` AND (title LIKE ? OR description LIKE ? OR location LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Сортування та пагінація
    query += ` ORDER BY c.date ASC, c.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log('📊 Виконуємо MySQL запит для змагань');

    // Виконуємо запити
    const [competitions, countResult] = await Promise.all([
      executeQuery<any>(query, queryParams),
      executeQuery<any>(countQuery, countParams)
    ]);

    const total = countResult[0]?.total || 0;

    console.log(`✅ Знайдено ${competitions.length} змагань з ${total} загалом`);

    // Обробляємо дані змагань для адміна
    const processedCompetitions = [];

    for (const competition of competitions) {
      try {
        // Отримуємо статистику реєстрацій
        const [preliminaryStats, individualStats] = await Promise.all([
          executeQuery<any>(`
            SELECT COUNT(*) as count
            FROM registrations
            WHERE competition_id = ? AND registration_type = 'preliminary' AND status != 'cancelled'
          `, [competition.id]),
          executeQuery<any>(`
            SELECT COUNT(*) as count
            FROM registrations
            WHERE competition_id = ? AND registration_type = 'individual' AND status != 'cancelled'
          `, [competition.id])
        ]);

        // Парсимо JSON поля безпечно
        let contactPerson = {};
        let programFees = {};
        let maxParticipants = {};
        let categories: string[] = [];

        try {
          contactPerson = typeof competition.contact_person === 'string'
            ? JSON.parse(competition.contact_person)
            : competition.contact_person || {};
        } catch (e) {
          contactPerson = {};
        }

        try {
          programFees = typeof competition.program_fees === 'string'
            ? JSON.parse(competition.program_fees)
            : competition.program_fees || {};
        } catch (e) {
          programFees = {};
        }

        try {
          maxParticipants = typeof competition.max_participants_by_program === 'string'
            ? JSON.parse(competition.max_participants_by_program)
            : competition.max_participants_by_program || {};
        } catch (e) {
          maxParticipants = {};
        }

        try {
          categories = typeof competition.categories === 'string'
            ? JSON.parse(competition.categories)
            : Array.isArray(competition.categories) ? competition.categories : [];
        } catch (e) {
          categories = [];
        }

        processedCompetitions.push({
          id: competition.id,
          title: competition.title,
          description: competition.description,
          date: competition.date,
          time: competition.time,
          registrationDeadline: competition.registration_deadline,

          location: competition.location,
          address: competition.address,
          city: competition.city,
          region: competition.region,

          organizingClub: competition.organizing_club,
          organizerId: competition.organizer_id,
          organizerName: competition.organizer_name,
          organizerEmail: competition.organizer_email,

          contactPerson: contactPerson,
          programFees: programFees,
          maxParticipantsByProgram: maxParticipants,
          categories: categories,
          rules: competition.rules,

          status: competition.status,

          // Статистика реєстрацій
          registrations: {
            preliminary: preliminaryStats[0]?.count || 0,
            individual: individualStats[0]?.count || 0,
            total: (preliminaryStats[0]?.count || 0) + (individualStats[0]?.count || 0)
          },

          createdAt: competition.created_at,
          updatedAt: competition.updated_at
        });

      } catch (error) {
        console.warn('⚠️ Помилка обробки змагання:', competition.id, error);

        // Додаємо змагання з мінімальними даними
        processedCompetitions.push({
          ...competition,
          contactPerson: {},
          programFees: {},
          maxParticipantsByProgram: {},
          categories: [],
          registrations: { preliminary: 0, individual: 0, total: 0 }
        });
      }
    }

    // Статистика змагань
    const stats = await executeQuery<any>(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'registration_open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'registration_closed' THEN 1 END) as closed,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM competitions
    `);

    const regionStats = await executeQuery<any>(`
      SELECT region, COUNT(*) as count
      FROM competitions
      WHERE region IS NOT NULL AND region != ''
      GROUP BY region
      ORDER BY count DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      competitions: processedCompetitions,
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
      filters: { status, region, organizer, date_from, date_to, search }
    });

  } catch (error) {
    console.error('❌ Помилка Admin GET /api/admin/competitions:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження змагань',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// POST - створити нове змагання
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const competitionData = await request.json();

    console.log('🏆 Admin POST /api/admin/competitions - створення змагання');

    // Валідація обов'язкових полів
    if (!competitionData.title || !competitionData.date || !competitionData.location) {
      return NextResponse.json({
        success: false,
        error: 'Назва, дата та місце проведення обов\'язкові'
      }, { status: 400 });
    }

    const competitionId = uuidv4();

    // Створюємо змагання
    await executeQuery(`
      INSERT INTO competitions (
        id, title, description, date, time, registration_deadline,
        location, address, city, region,
        organizing_club, organizer_id,
        contact_person, program_fees, max_participants_by_program,
        categories, rules, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      competitionId,
      competitionData.title,
      competitionData.description || '',
      competitionData.date,
      competitionData.time || '10:00:00',
      competitionData.registrationDeadline || null,
      competitionData.location,
      competitionData.address || '',
      competitionData.city || '',
      competitionData.region || '',
      competitionData.organizingClub || '',
      competitionData.organizerId || null,
      JSON.stringify(competitionData.contactPerson || {}),
      JSON.stringify(competitionData.programFees || {}),
      JSON.stringify(competitionData.maxParticipantsByProgram || {}),
      JSON.stringify(competitionData.categories || []),
      competitionData.rules || '',
      competitionData.status || 'draft'
    ]);

    console.log('✅ Змагання створено адміністратором:', competitionData.title);

    return NextResponse.json({
      success: true,
      message: 'Змагання успішно створено',
      competitionId: competitionId
    });

  } catch (error) {
    console.error('❌ Помилка Admin POST /api/admin/competitions:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка створення змагання',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// PUT - оновити змагання
export async function PUT(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { competitionId, updates } = await request.json();

    if (!competitionId) {
      return NextResponse.json({
        success: false,
        error: 'ID змагання обов\'язковий'
      }, { status: 400 });
    }

    console.log('🏆 Admin PUT /api/admin/competitions для:', competitionId);

    // Підготовка оновлень
    const updateFields = [];
    const updateValues = [];

    // Дозволені поля для оновлення
    const allowedFields = [
      'title', 'description', 'date', 'time', 'registration_deadline',
      'location', 'address', 'city', 'region',
      'organizing_club', 'organizer_id', 'rules', 'status'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    }

    // JSON поля
    if (updates.contactPerson !== undefined) {
      updateFields.push('contact_person = ?');
      updateValues.push(JSON.stringify(updates.contactPerson));
    }

    if (updates.programFees !== undefined) {
      updateFields.push('program_fees = ?');
      updateValues.push(JSON.stringify(updates.programFees));
    }

    if (updates.maxParticipantsByProgram !== undefined) {
      updateFields.push('max_participants_by_program = ?');
      updateValues.push(JSON.stringify(updates.maxParticipantsByProgram));
    }

    if (updates.categories !== undefined) {
      updateFields.push('categories = ?');
      updateValues.push(JSON.stringify(updates.categories));
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Немає даних для оновлення'
      }, { status: 400 });
    }

    // Додаємо updated_at
    updateFields.push('updated_at = NOW()');
    updateValues.push(competitionId);

    const updateQuery = `
      UPDATE competitions
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateValues);

    console.log('✅ Змагання оновлено адміністратором');

    return NextResponse.json({
      success: true,
      message: 'Змагання успішно оновлено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin PUT /api/admin/competitions:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка оновлення змагання',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// DELETE - видалити змагання
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { competitionId } = await request.json();

    if (!competitionId) {
      return NextResponse.json({
        success: false,
        error: 'ID змагання обов\'язковий'
      }, { status: 400 });
    }

    console.log('🏆 Admin DELETE /api/admin/competitions для:', competitionId);

    // Перевіряємо чи існує змагання
    const competitions = await executeQuery<any>(`
      SELECT id, title FROM competitions WHERE id = ?
    `, [competitionId]);

    if (competitions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Змагання не знайдено'
      }, { status: 404 });
    }

    const competition = competitions[0];

    // Видаляємо змагання (каскадне видалення для реєстрацій та результатів)
    await executeQuery(`DELETE FROM competitions WHERE id = ?`, [competitionId]);

    console.log('✅ Змагання видалено адміністратором:', competition.title);

    return NextResponse.json({
      success: true,
      message: 'Змагання успішно видалено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin DELETE /api/admin/competitions:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка видалення змагання',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
