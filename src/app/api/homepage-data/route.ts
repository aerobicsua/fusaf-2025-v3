import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Завантаження даних для головної сторінки...');

    // Отримуємо статистику
    let clubsCount = [{ count: 0 }];

    // Спочатку пробуємо нову таблицю clubs
    try {
      clubsCount = await executeQuery(`SELECT COUNT(*) as count FROM clubs WHERE is_active = true`);
    } catch (clubsError) {
      console.warn('⚠️ Нова таблиця clubs недоступна, пробуємо fallback');
      // Fallback до таблиці users
      clubsCount = await executeQuery(`SELECT COUNT(*) as count FROM users WHERE roles LIKE '%club_owner%' AND status = 'approved'`);
    }

    // Отримуємо статистику змагань та користувачів
    let competitionsCount = [{ count: 0 }];
    let usersCount = [{ count: 0 }];

    try {
      const [compCount, userCount] = await Promise.all([
        executeQuery(`SELECT COUNT(*) as count FROM competitions WHERE status IN ('registration_open', 'published')`).catch(() => [{ count: 0 }]),
        executeQuery(`SELECT COUNT(*) as count FROM users WHERE status = 'active'`)
      ]);
      competitionsCount = compCount;
      usersCount = userCount;
    } catch (error) {
      console.warn('⚠️ Помилка отримання статистики змагань/користувачів:', error);
      usersCount = await executeQuery(`SELECT COUNT(*) as count FROM users WHERE status = 'active'`);
    }

    // Отримуємо унікальні міста учасників
    const citiesResult = await executeQuery(`
      SELECT COUNT(DISTINCT city) as count FROM users
      WHERE status = 'active' AND city IS NOT NULL AND city != ''
    `);

    // Отримуємо найближчі змагання (максимум 4)
    let upcomingCompetitions = [];
    try {
      upcomingCompetitions = await executeQuery(`
        SELECT
          id, title, date, time,
          location, city, status,
          (SELECT COUNT(*) FROM registrations WHERE competition_id = competitions.id) as participants_count
        FROM competitions
        WHERE status IN ('registration_open', 'published')
          AND date >= CURDATE()
        ORDER BY date ASC
        LIMIT 4
      `);
    } catch (competitionsError) {
      console.warn('⚠️ Таблиця competitions недоступна, пропускаємо змагання');
      upcomingCompetitions = [];
    }

    // Формуємо статистику
    const stats = {
      activeCompetitions: competitionsCount[0]?.count || 0,
      registeredAthletes: usersCount[0]?.count || 0,
      clubsCount: clubsCount[0]?.count || 0,
      citiesCount: citiesResult[0]?.count || 0
    };

    // Формуємо змагання з правильною структурою
    const competitions = upcomingCompetitions.map((comp: any) => ({
      id: comp.id,
      title: comp.title,
      date: comp.date,
      time: comp.time,
      location: comp.location + (comp.city ? `, ${comp.city}` : ''),
      status: comp.status === 'registration_open' ? 'Реєстрація відкрита' : 'Опубліковано',
      participants: comp.participants_count || 0
    }));

    console.log('✅ Дані для головної сторінки завантажено:', {
      stats,
      competitionsCount: competitions.length
    });

    return NextResponse.json({
      success: true,
      data: {
        stats,
        competitions
      }
    });

  } catch (error) {
    console.error('❌ Помилка завантаження даних головної сторінки:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження даних',
      data: {
        stats: {
          activeCompetitions: 0,
          registeredAthletes: 0,
          clubsCount: 0,
          citiesCount: 0
        },
        competitions: []
      }
    });
  }
}
