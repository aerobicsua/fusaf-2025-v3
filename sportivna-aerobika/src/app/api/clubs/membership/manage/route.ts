import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed

// Симуляція бази даних членства клубів
const clubMemberships = new Map<string, {
  id: string;
  clubId: string;
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  joinDate: string;
  status: 'active' | 'suspended';
  gender: 'male' | 'female';
  birthDate: string;
  categories: string[];
}>();

// Симуляція власників клубів
const clubOwners = new Map([
  ['club-1', 'competitions@fusaf.org.ua'], // СК "Грація"
  ['club-2', 'lviv@fusaf.org.ua'],        // Аеробіка Львів
  ['club-3', 'dnipro@fusaf.org.ua'],      // Фітнес-Динаміка
  ['club-4', 'odesa@fusaf.org.ua']        // Спорт-Арена
]);

// Демо-учасники клубів
const initializeDemoMembers = () => {
  const demoMembers = [
    {
      id: 'member-1',
      clubId: 'club-1',
      athleteId: 'athlete-1',
      athleteName: 'Петренко Анна Іванівна',
      athleteEmail: 'anna.petrenko@email.com',
      joinDate: '2024-09-15',
      status: 'active' as const,
      gender: 'female' as const,
      birthDate: '2008-03-15',
      categories: ['IW', 'MP']
    },
    {
      id: 'member-2',
      clubId: 'club-1',
      athleteId: 'athlete-2',
      athleteName: 'Коваленко Дмитро Олексійович',
      athleteEmail: 'dmytro.kovalenko@email.com',
      joinDate: '2024-08-20',
      status: 'active' as const,
      gender: 'male' as const,
      birthDate: '2007-11-22',
      categories: ['IM', 'MP']
    },
    {
      id: 'member-3',
      clubId: 'club-1',
      athleteId: 'athlete-3',
      athleteName: 'Сидоренко Марія Петрівна',
      athleteEmail: 'maria.sydorenko@email.com',
      joinDate: '2024-10-01',
      status: 'active' as const,
      gender: 'female' as const,
      birthDate: '2009-07-10',
      categories: ['IW', 'TR']
    },
    {
      id: 'member-4',
      clubId: 'club-1',
      athleteId: 'athlete-4',
      athleteName: 'Шевченко Олексій Миколайович',
      athleteEmail: 'oleksiy.shevchenko@email.com',
      joinDate: '2024-07-12',
      status: 'active' as const,
      gender: 'male' as const,
      birthDate: '2006-04-18',
      categories: ['IM', 'TR']
    },
    {
      id: 'member-5',
      clubId: 'club-1',
      athleteId: 'athlete-5',
      athleteName: 'Мельник Софія Андріївна',
      athleteEmail: 'sofia.melnyk@email.com',
      joinDate: '2024-11-03',
      status: 'active' as const,
      gender: 'female' as const,
      birthDate: '2008-12-05',
      categories: ['IW', 'GR']
    }
  ];

  demoMembers.forEach(member => {
    clubMemberships.set(member.id, member);
  });
};

// Ініціалізуємо демо-дані при завантаженні модуля
initializeDemoMembers();

// Отримання заявок для власника клубу
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    // Перевіряємо чи є користувач власником клубу
    const userClubs = Array.from(clubOwners.entries())
      .filter(([clubId, ownerEmail]) => ownerEmail === session.user.email)
      .map(([clubId]) => clubId);

    if (userClubs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Ви не є власником жодного клубу'
      }, { status: 403 });
    }

    // В реальній системі тут би був запит до бази даних заявок
    // Зараз повертаємо демо-заявки
    const demoRequests = [
      {
        id: 'req-demo-1',
        clubId: userClubs[0],
        clubName: 'СК "Грація"',
        athleteId: 'new-athlete-1',
        athleteName: 'Новий Спортсмен Один',
        athleteEmail: 'new.athlete1@email.com',
        status: 'pending',
        requestDate: '2025-01-10',
        message: 'Хочу приєднатися до вашого клубу для участі в змаганнях зі спортивної аеробіки'
      }
    ];

    // Отримуємо поточних учасників клубу
    const clubMembers = Array.from(clubMemberships.values())
      .filter(member => userClubs.includes(member.clubId));

    return NextResponse.json({
      success: true,
      requests: demoRequests,
      members: clubMembers,
      userClubs
    });

  } catch (error) {
    console.error('Помилка отримання заявок клубу:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}

// Обробка заявки (схвалення/відхилення)
export async function PUT(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    const { requestId, action, response } = await request.json();

    if (!requestId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Невірні параметри запиту'
      }, { status: 400 });
    }

    // В реальній системі тут би була перевірка що користувач є власником клубу
    // і обробка заявки в базі даних

    console.log('🏛️ Обробка заявки на вступ:', {
      requestId,
      action,
      processedBy: session.user.email,
      response
    });

    if (action === 'approve') {
      // Додаємо нового учасника до клубу
      const newMemberId = `member-${Date.now()}`;
      const newMember = {
        id: newMemberId,
        clubId: 'club-1', // В реальній системі отримуємо з заявки
        athleteId: 'new-athlete-1',
        athleteName: 'Новий Спортсмен Один',
        athleteEmail: 'new.athlete1@email.com',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active' as const,
        gender: 'female' as const, // В реальній системі отримуємо з профілю
        birthDate: '2009-01-01',
        categories: ['IW'] // За замовчуванням
      };

      clubMemberships.set(newMemberId, newMember);
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? 'Заявку схвалено. Спортсмен додано до клубу.'
        : 'Заявку відхилено.',
      action
    });

  } catch (error) {
    console.error('Помилка обробки заявки:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}
