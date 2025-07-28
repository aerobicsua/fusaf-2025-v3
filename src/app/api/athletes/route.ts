import { NextResponse } from 'next/server';

// Інтерфейс спортсмена для API
interface AthleteResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  club: string;
  registeredAt: string;
  status: string;
}

// GET - отримати список спортсменів з localStorage
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    // Параметри фільтрації
    const region = url.searchParams.get('region');
    const club = url.searchParams.get('club');
    const license = url.searchParams.get('license');
    const surname = url.searchParams.get('surname');
    const status = url.searchParams.get('status');

    console.log('🏆 GET /api/athletes з localStorage фільтрами:', {
      region, club, license, surname, status
    });

    // ТИМЧАСОВЕ РІШЕННЯ: Повертаємо дані які відповідають тестовим даним з головної сторінки
    // В реальному проекті тут буде база даних або localStorage через передачу даних з клієнта
    const now = Date.now();
    const testAthleteId = `athlete-test-${now}`;

    const athletes: AthleteResponse[] = [
      {
        id: testAthleteId,
        name: 'Марія Спортсменко',
        email: 'maria@example.com', // Приховуємо у публічному списку
        phone: '+380501234569', // Приховуємо у публічному списку
        city: 'Київ',
        club: 'Київський Центр Аеробіки',
        registeredAt: new Date().toISOString(),
        status: 'active'
      }
    ];

    // Фільтрація (базова)
    let filteredAthletes = athletes;

    if (surname) {
      filteredAthletes = filteredAthletes.filter(athlete =>
        athlete.name.toLowerCase().includes(surname.toLowerCase())
      );
    }

    if (region) {
      filteredAthletes = filteredAthletes.filter(athlete =>
        athlete.city.includes(region)
      );
    }

    if (club && club !== 'all') {
      filteredAthletes = filteredAthletes.filter(athlete =>
        athlete.club === club
      );
    }

    if (status && status !== 'all') {
      filteredAthletes = filteredAthletes.filter(athlete =>
        athlete.status === status
      );
    }

    // Статистика
    const stats = {
      total: filteredAthletes.length,
      active: filteredAthletes.filter(a => a.status === 'active').length,
      aerobics: filteredAthletes.length, // Всі для демо
      fromUkraine: filteredAthletes.length
    };

    return NextResponse.json({
      athletes: filteredAthletes,
      total: filteredAthletes.length,
      stats
    });

  } catch (error) {
    console.error('❌ Помилка завантаження спортсменів:', error);

    return NextResponse.json({
      athletes: [],
      total: 0,
      stats: {
        total: 0,
        active: 0,
        aerobics: 0,
        fromUkraine: 0
      }
    }, { status: 500 });
  }
}
