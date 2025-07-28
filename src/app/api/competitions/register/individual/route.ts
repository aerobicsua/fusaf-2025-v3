import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed

interface RegistrationData {
  competitionId: string;
  program: string;
  category: string;
  participants: Array<{
    memberId: string;
    athleteName: string;
    gender: 'male' | 'female';
    age: number;
    categories: string[];
  }>;
  coach: {
    name: string;
    phone: string;
  };
  club: string;
  notes: string;
  registrationFee: number;
  entryFee: number;
  totalFee: number;
}

// Симуляція бази даних реєстрацій
const individualRegistrations = new Map<string, {
  id: string;
  competitionId: string;
  program: string;
  category: string;
  participants: Array<{
    memberId: string;
    athleteName: string;
    gender: 'male' | 'female';
    age: number;
    categories: string[];
  }>;
  coach: {
    name: string;
    phone: string;
  };
  club: string;
  notes: string;
  registrationFee: number;
  entryFee: number;
  totalFee: number;
  registeredBy: string;
  registrationDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}>();

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    const registrationData: RegistrationData = await request.json();

    // Валідація обов'язкових полів
    if (!registrationData.competitionId) {
      return NextResponse.json({
        success: false,
        error: 'Не вказано змагання'
      }, { status: 400 });
    }

    if (!registrationData.program) {
      return NextResponse.json({
        success: false,
        error: 'Не вказано програму змагань'
      }, { status: 400 });
    }

    if (!registrationData.category) {
      return NextResponse.json({
        success: false,
        error: 'Не вказано вікову категорію'
      }, { status: 400 });
    }

    if (!registrationData.participants || registrationData.participants.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Не вказано учасників'
      }, { status: 400 });
    }

    if (!registrationData.coach?.name || !registrationData.coach?.phone) {
      return NextResponse.json({
        success: false,
        error: 'Не вказано дані тренера'
      }, { status: 400 });
    }

    if (!registrationData.club) {
      return NextResponse.json({
        success: false,
        error: 'Не вказано клуб'
      }, { status: 400 });
    }

    // Валідація кількості учасників для програми
    const CATEGORY_LIMITS = {
      IW: { count: 1, genders: ['female'], name: 'Individual Women' },
      IM: { count: 1, genders: ['male'], name: 'Individual Men' },
      MP: { count: 2, genders: ['male', 'female'], name: 'Mixed Pairs', genderRequirement: 'mixed' },
      TR: { count: 3, genders: ['male', 'female'], name: 'Trio' },
      GR: { count: 5, genders: ['male', 'female'], name: 'Group' },
      AD: { count: 8, genders: ['male', 'female'], name: 'Aerobic Dance' },
      AS: { count: 8, genders: ['male', 'female'], name: 'Aerobic Step' }
    };

    const limits = CATEGORY_LIMITS[registrationData.program as keyof typeof CATEGORY_LIMITS];
    if (!limits) {
      return NextResponse.json({
        success: false,
        error: 'Невідома програма змагань'
      }, { status: 400 });
    }

    // Перевіряємо кількість учасників
    if (registrationData.participants.length !== limits.count) {
      return NextResponse.json({
        success: false,
        error: `Для ${limits.name} потрібно рівно ${limits.count} учасників`
      }, { status: 400 });
    }

    // Для Mixed Pairs перевіряємо різні статі
    if (registrationData.program === 'MP') {
      const genders = registrationData.participants.map(p => p.gender);
      if (!genders.includes('male') || !genders.includes('female')) {
        return NextResponse.json({
          success: false,
          error: 'Mixed Pairs повинні складатися з 1 хлопця та 1 дівчини'
        }, { status: 400 });
      }
    }

    // Перевіряємо чи немає дублюючих реєстрацій
    const existingRegistration = Array.from(individualRegistrations.values()).find(reg =>
      reg.competitionId === registrationData.competitionId &&
      reg.program === registrationData.program &&
      reg.category === registrationData.category &&
      reg.registeredBy === session.user.email &&
      reg.status !== 'cancelled'
    );

    if (existingRegistration) {
      return NextResponse.json({
        success: false,
        error: 'Ви вже зареєстровані на цю програму в даній категорії'
      }, { status: 400 });
    }

    // Створюємо реєстрацію
    const registrationId = `reg-${Date.now()}`;
    const newRegistration = {
      id: registrationId,
      ...registrationData,
      registeredBy: session.user.email,
      registrationDate: new Date().toISOString(),
      status: 'pending' as const
    };

    individualRegistrations.set(registrationId, newRegistration);

    console.log('🏆 Нова іменна реєстрація:', {
      registrationId,
      competition: registrationData.competitionId,
      program: registrationData.program,
      category: registrationData.category,
      participants: registrationData.participants.map(p => p.athleteName).join(', '),
      club: registrationData.club,
      registeredBy: session.user.email
    });

    // В реальній системі тут би було:
    // 1. Збереження в базу даних
    // 2. Відправка сповіщення організаторам
    // 3. Генерація квитанції про оплату
    // 4. Логування дії

    return NextResponse.json({
      success: true,
      registration: newRegistration,
      message: 'Іменну реєстрацію успішно подано!',
      paymentInfo: {
        amount: registrationData.totalFee,
        currency: 'UAH',
        description: `Реєстрація на змагання - ${registrationData.program} (${registrationData.category})`
      }
    });

  } catch (error) {
    console.error('Помилка іменної реєстрації:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}

// Отримання реєстрацій користувача
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');

    // Фільтруємо реєстрації користувача
    const userRegistrations = Array.from(individualRegistrations.values()).filter(reg => {
      const matchesUser = reg.registeredBy === session.user.email;
      const matchesCompetition = competitionId ? reg.competitionId === competitionId : true;
      return matchesUser && matchesCompetition;
    });

    return NextResponse.json({
      success: true,
      registrations: userRegistrations
    });

  } catch (error) {
    console.error('Помилка отримання реєстрацій:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}
