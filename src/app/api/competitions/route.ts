import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Демонстраційні дані змагань
const demoCompetitions = [
  {
    id: 'comp-1',
    title: 'Кубок України зі спортивної аеробіки 2025',
    description: 'Офіційні змагання федерації України зі спортивної аеробіки та фітнесу. Змагання проводяться згідно з міжнародними правилами FIG.',
    date: '2025-04-15',
    time: '10:00',
    location: 'Палац спорту "Україна"',
    address: 'вул. Велика Васильківська, 55, Київ, 03150',
    registration_fee: 300,
    entry_fee: 200,
    max_participants: 200,
    registration_deadline: '2025-04-01',
    status: 'registration_open',
    club: {
      name: 'СК "Грація"',
      city: 'Київ'
    },
    preliminary_registrations: [{ count: 5 }],
    individual_registrations: [{ count: 12 }]
  },
  {
    id: 'comp-2',
    title: 'Чемпіонат Львівської області',
    description: 'Регіональний чемпіонат з різних категорій та вікових груп.',
    date: '2025-03-20',
    time: '09:30',
    location: 'Спорткомплекс "Арена Львів"',
    address: 'вул. Стрийська, 199, Львів',
    registration_fee: 250,
    entry_fee: 150,
    max_participants: 150,
    registration_deadline: '2025-03-10',
    status: 'registration_open',
    club: {
      name: 'Аеробіка Львів',
      city: 'Львів'
    },
    preliminary_registrations: [{ count: 3 }],
    individual_registrations: [{ count: 8 }]
  },
  {
    id: 'comp-3',
    title: 'Першість Дніпропетровської області',
    description: 'Відкрита першість для всіх вікових груп та категорій.',
    date: '2025-05-10',
    time: '11:00',
    location: 'ПК "Метеор"',
    address: 'пр. Гагаріна, 99, Дніпро',
    registration_fee: 200,
    entry_fee: 100,
    max_participants: 120,
    registration_deadline: '2025-04-25',
    status: 'published',
    club: {
      name: 'Фітнес-Динаміка',
      city: 'Дніпро'
    },
    preliminary_registrations: [{ count: 2 }],
    individual_registrations: [{ count: 4 }]
  }
];

// GET /api/competitions - отримання списку змагань
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const clubId = searchParams.get('club_id');

    let competitions = [...demoCompetitions];

    // Фільтрація за статусом
    if (status && status !== 'all') {
      competitions = competitions.filter(comp => comp.status === status);
    }

    // Фільтрація за клубом
    if (clubId) {
      competitions = competitions.filter(comp => comp.id === clubId);
    }

    return NextResponse.json({
      success: true,
      competitions,
      message: '🎯 Демонстраційні дані змагань. В реальному проекті дані будуть з бази даних.'
    });

  } catch (error) {
    console.error('Competitions API error:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}

// POST /api/competitions - створення нового змагання
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    // Перевіряємо права доступу - тільки власники клубів та адміністратори
    if (!['club_owner', 'admin'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Недостатньо прав для створення змагань' },
        { status: 403 }
      );
    }

    const competitionData = await request.json();

    // Валідація обов'язкових полів
    const requiredFields = ['title', 'date', 'time', 'location', 'registration_deadline'];
    const missingFields = requiredFields.filter(field => !competitionData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Відсутні обов'язкові поля: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Демонстраційне створення змагання
    const newCompetition = {
      id: `comp-${Date.now()}`,
      ...competitionData,
      created_by: session.user.id,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      club: {
        name: 'Тестовий клуб',
        city: 'Київ'
      },
      preliminary_registrations: [{ count: 0 }],
      individual_registrations: [{ count: 0 }]
    };

    console.log('Demo competition created:', newCompetition);

    return NextResponse.json({
      success: true,
      message: '✅ Змагання створено успішно (демонстраційний режим)',
      competition: newCompetition
    });

  } catch (error) {
    console.error('Create competition error:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
