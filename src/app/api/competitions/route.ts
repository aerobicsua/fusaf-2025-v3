import { type NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Інтерфейс змагання для API
interface CompetitionResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  city: string;
  region: string;
  registration_deadline: string;
  organizing_club: string;
  organizer_id: string;
  contact_person: any;
  program_fees: any;
  max_participants_by_program: any;
  categories: string[];
  rules: string;
  status: string;
  created_at: string;
  updated_at: string;

  // Статистика реєстрацій
  preliminary_registrations: Array<{ count: number }>;
  individual_registrations: Array<{ count: number }>;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    // Параметри фільтрації
    const status = url.searchParams.get('status');
    const region = url.searchParams.get('region');
    const organizer = url.searchParams.get('organizer');
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');
    const search = url.searchParams.get('search');

    console.log('🏆 GET /api/competitions з MySQL фільтрами:', {
      status, region, organizer, date_from, date_to, search
    });

    // Базовий запит для змагань
    let query = `
      SELECT
        id, title, description, date, time, registration_deadline,
        location, address, city, region,
        organizing_club, organizer_id,
        contact_person, program_fees, max_participants_by_program,
        categories, rules, status,
        created_at, updated_at
      FROM competitions
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Додаємо фільтри
    if (status) {
      query += ` AND status = ?`;
      queryParams.push(status);
    }

    if (region) {
      query += ` AND region LIKE ?`;
      queryParams.push(`%${region}%`);
    }

    if (organizer) {
      query += ` AND organizing_club LIKE ?`;
      queryParams.push(`%${organizer}%`);
    }

    if (date_from) {
      query += ` AND date >= ?`;
      queryParams.push(date_from);
    }

    if (date_to) {
      query += ` AND date <= ?`;
      queryParams.push(date_to);
    }

    if (search) {
      query += ` AND (title LIKE ? OR description LIKE ? OR location LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Сортування за датою
    query += ` ORDER BY date ASC, created_at DESC`;

    console.log('📊 Виконуємо MySQL запит:', query);
    console.log('📊 Параметри:', queryParams);

    // Виконуємо запит
    const competitions = await executeQuery<any>(query, queryParams);

    console.log(`✅ Знайдено ${competitions.length} змагань`);

    // Отримуємо статистику реєстрацій для кожного змагання
    const competitionsWithStats: CompetitionResponse[] = [];

    for (const competition of competitions) {
      try {
        // Отримуємо кількість попередніх реєстрацій
        const preliminaryStats = await executeQuery<any>(`
          SELECT COUNT(*) as count
          FROM registrations
          WHERE competition_id = ? AND registration_type = 'preliminary' AND status != 'cancelled'
        `, [competition.id]);

        // Отримуємо кількість іменних реєстрацій
        const individualStats = await executeQuery<any>(`
          SELECT COUNT(*) as count
          FROM registrations
          WHERE competition_id = ? AND registration_type = 'individual' AND status != 'cancelled'
        `, [competition.id]);

        // Парсимо JSON поля (можуть прийти як об'єкти або рядки)
        let contactPerson = {};
        let programFees = {};
        let maxParticipants = {};
        let categories: string[] = [];

        try {
          if (typeof competition.contact_person === 'string') {
            contactPerson = JSON.parse(competition.contact_person);
          } else if (typeof competition.contact_person === 'object') {
            contactPerson = competition.contact_person || {};
          }
        } catch (e) {
          console.warn('⚠️ Помилка парсингу contact_person, використовуємо default:', e);
          contactPerson = {};
        }

        try {
          if (typeof competition.program_fees === 'string') {
            programFees = JSON.parse(competition.program_fees);
          } else if (typeof competition.program_fees === 'object') {
            programFees = competition.program_fees || {};
          }
        } catch (e) {
          console.warn('⚠️ Помилка парсингу program_fees, використовуємо default:', e);
          programFees = {};
        }

        try {
          if (typeof competition.max_participants_by_program === 'string') {
            maxParticipants = JSON.parse(competition.max_participants_by_program);
          } else if (typeof competition.max_participants_by_program === 'object') {
            maxParticipants = competition.max_participants_by_program || {};
          }
        } catch (e) {
          console.warn('⚠️ Помилка парсингу max_participants, використовуємо default:', e);
          maxParticipants = {};
        }

        try {
          if (typeof competition.categories === 'string') {
            categories = JSON.parse(competition.categories);
          } else if (Array.isArray(competition.categories)) {
            categories = competition.categories;
          } else {
            categories = [];
          }
        } catch (e) {
          console.warn('⚠️ Помилка парсингу categories, використовуємо default:', e);
          categories = [];
        }

        // Формуємо відповідь
        competitionsWithStats.push({
          id: competition.id,
          title: competition.title,
          description: competition.description,
          date: competition.date,
          time: competition.time,
          location: competition.location,
          address: competition.address,
          city: competition.city,
          region: competition.region,
          registration_deadline: competition.registration_deadline,
          organizing_club: competition.organizing_club,
          organizer_id: competition.organizer_id,
          contact_person: contactPerson,
          program_fees: programFees,
          max_participants_by_program: maxParticipants,
          categories: categories,
          rules: competition.rules,
          status: competition.status,
          created_at: competition.created_at,
          updated_at: competition.updated_at,

          // Статистика реєстрацій
          preliminary_registrations: [{ count: preliminaryStats[0]?.count || 0 }],
          individual_registrations: [{ count: individualStats[0]?.count || 0 }]
        });

      } catch (error) {
        console.warn('⚠️ Помилка обробки змагання:', competition.id, error);

        // Додаємо змагання без статистики у разі помилки
        competitionsWithStats.push({
          ...competition,
          contact_person: {},
          program_fees: {},
          max_participants_by_program: {},
          categories: [],
          preliminary_registrations: [{ count: 0 }],
          individual_registrations: [{ count: 0 }]
        });
      }
    }

    // Отримуємо загальну статистику
    const totalStats = await executeQuery<any>(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'registration_open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM competitions
    `);

    const regionStats = await executeQuery<any>(`
      SELECT region, COUNT(*) as count
      FROM competitions
      WHERE region IS NOT NULL
      AND region != ''
      GROUP BY region
      ORDER BY count DESC
      LIMIT 10
    `);

    const stats = {
      total: totalStats[0]?.total || 0,
      open: totalStats[0]?.open || 0,
      published: totalStats[0]?.published || 0,
      completed: totalStats[0]?.completed || 0,
      byRegion: regionStats.reduce((acc: any, item) => {
        acc[item.region] = item.count;
        return acc;
      }, {})
    };

    console.log('📊 Статистика змагань:', stats);

    return NextResponse.json({
      competitions: competitionsWithStats,
      total: competitionsWithStats.length,
      filters: { status, region, organizer, date_from, date_to, search },
      stats,
      debug: {
        storageType: 'MYSQL_DATABASE',
        database: process.env.MYSQL_DATABASE,
        timestamp: new Date().toISOString(),
        queryExecuted: query.split('\n')[0] + '...'
      }
    });

  } catch (error) {
    console.error('❌ Помилка GET /api/competitions:', error);

    return NextResponse.json({
      error: 'Помилка завантаження змагань з бази даних',
      details: error instanceof Error ? error.message : 'Невідома помилка',
      debug: {
        storageType: 'MYSQL_DATABASE_ERROR',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
