import { NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { AthletesStorage, type Athlete } from '@/lib/athletes-storage';

// Демонстраційні спортсмени (поки не отримали реальних)
const DEMO_ATHLETES: Partial<Athlete>[] = [
  {
    id: 'demo-1',
    license: 'FUSAF-2024-001',
    title: 'Ms',
    lastName: 'Петренко',
    firstName: 'Марія',
    email: 'maria.petrenko@demo.com',
    gender: 'female',
    country: 'Україна',
    placeOfBirth: 'Київ',
    yearOfBirth: 2005,
    disciplines: ['Спортивна аеробіка'],
    club: 'Київський клуб аеробіки',
    coach: 'Олена Іванова',
    biography: 'Талановита спортсменка з Києва, займається аеробікою з 10 років.',
    media: [],
    results: [],
    achievements: [
      {
        id: 'ach-demo-1-1',
        title: 'Чемпіонка України 2023',
        description: 'Переможниця національного чемпіонату з спортивної аеробіки',
        date: '2023-06-15',
        type: 'medal',
        level: 'national'
      }
    ],
    personalBests: {},
    status: 'active',
    visibility: 'public'
  },
  {
    id: 'demo-2',
    license: 'FUSAF-2024-002',
    title: 'Ms',
    lastName: 'Коваленко',
    firstName: 'Анна',
    email: 'anna.kovalenko@demo.com',
    gender: 'female',
    country: 'Україна',
    placeOfBirth: 'Львів',
    yearOfBirth: 2003,
    disciplines: ['Фітнес аеробіка', 'Танцювальна аеробіка'],
    club: 'Львівські орлята',
    coach: 'Михайло Петров',
    biography: 'Багаторазова чемпіонка з Львова, спеціалізується на групових виступах.',
    media: [],
    results: [],
    achievements: [
      {
        id: 'ach-demo-2-1',
        title: 'Срібна призерка чемпіонату Європи 2023',
        description: 'Друге місце на континентальних змаганнях',
        date: '2023-09-20',
        type: 'medal',
        level: 'international'
      }
    ],
    personalBests: {},
    status: 'active',
    visibility: 'public'
  },
  {
    id: 'demo-3',
    license: 'FUSAF-2024-003',
    title: 'Mr',
    lastName: 'Сидоренко',
    firstName: 'Олександр',
    email: 'oleksandr.sydorenko@demo.com',
    gender: 'male',
    country: 'Україна',
    placeOfBirth: 'Одеса',
    yearOfBirth: 2001,
    disciplines: ['Спортивна аеробіка'],
    club: 'Одеський спортивний центр',
    coach: 'Віктор Кузнецов',
    biography: 'Досвідчений спортсмен, представляє Україну на міжнародних змаганнях.',
    media: [],
    results: [],
    achievements: [
      {
        id: 'ach-demo-3-1',
        title: 'Чемпіон України серед чоловіків 2023',
        description: 'Перше місце в індивідуальних змаганнях',
        date: '2023-08-10',
        type: 'medal',
        level: 'national'
      }
    ],
    personalBests: {},
    status: 'active',
    visibility: 'public'
  },
  {
    id: 'demo-4',
    license: 'FUSAF-2024-004',
    title: 'Ms',
    lastName: 'Лисенко',
    firstName: 'Софія',
    email: 'sofia.lysenko@demo.com',
    gender: 'female',
    country: 'Україна',
    placeOfBirth: 'Харків',
    yearOfBirth: 2006,
    disciplines: ['Степ аеробіка'],
    club: 'Харківський фітнес',
    coach: 'Тетяна Морозова',
    biography: 'Юна та перспективна спортсменка зі степ аеробіки.',
    media: [],
    results: [],
    achievements: [
      {
        id: 'ach-demo-4-1',
        title: 'Переможниця юніорського чемпіонату 2023',
        description: 'Золота медаль серед юніорів',
        date: '2023-05-15',
        type: 'medal',
        level: 'national'
      }
    ],
    personalBests: {},
    status: 'active',
    visibility: 'public'
  },
  {
    id: 'demo-5',
    license: 'FUSAF-2024-005',
    title: 'Ms',
    lastName: 'Іваненко',
    firstName: 'Дарина',
    email: 'daryna.ivanenko@demo.com',
    gender: 'female',
    country: 'Україна',
    placeOfBirth: 'Дніпро',
    yearOfBirth: 2004,
    disciplines: ['Хіп-хоп аеробіка'],
    club: 'Дніпро Данс',
    coach: 'Андрій Сергєєв',
    biography: 'Творча особистість, поєднує танці та спорт у хіп-хоп аеробіці.',
    media: [],
    results: [],
    achievements: [
      {
        id: 'ach-demo-5-1',
        title: 'Чемпіонка в категорії хіп-хоп 2023',
        description: 'Переможниця спеціалізованих змагань',
        date: '2023-07-20',
        type: 'medal',
        level: 'national'
      }
    ],
    personalBests: {},
    status: 'active',
    visibility: 'public'
  }
];

// POST - додати демонстраційних спортсменів
export async function POST(request: Request) {
  try {
    const session = await getApiSession(request);

    // Перевірка прав адміністратора
    if (!session?.user?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Доступ заборонено. Потрібні права адміністратора.' },
        { status: 403 }
      );
    }

    let addedCount = 0;
    const errors: string[] = [];

    for (const athleteData of DEMO_ATHLETES) {
      try {
        // Перевіряємо чи спортсмен вже існує
        const existing = AthletesStorage.findById(athleteData.id!);
        if (existing) {
          console.log(`Спортсмен ${athleteData.firstName} ${athleteData.lastName} вже існує`);
          continue;
        }

        // Створюємо повний об'єкт спортсмена
        const athlete: Athlete = {
          ...athleteData,
          media: athleteData.media || [],
          results: athleteData.results || [],
          achievements: athleteData.achievements || [],
          personalBests: athleteData.personalBests || {},
          registrationDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          status: 'active',
          visibility: 'public'
        } as Athlete;

        AthletesStorage.add(athlete);
        addedCount++;

        console.log(`✅ Додано спортсмена: ${athlete.firstName} ${athlete.lastName}`);
      } catch (error) {
        const errorMsg = `Помилка додавання ${athleteData.firstName} ${athleteData.lastName}: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    const stats = AthletesStorage.getStats();

    return NextResponse.json({
      message: `Демонстраційні спортсмени успішно додані`,
      addedCount,
      errors: errors.length > 0 ? errors : undefined,
      totalAthletes: stats.total,
      storageStats: stats
    });

  } catch (error) {
    console.error('❌ Помилка POST /api/athletes/demo:', error);
    return NextResponse.json(
      { error: 'Помилка додавання демонстраційних спортсменів' },
      { status: 500 }
    );
  }
}

// GET - інформація про демонстраційних спортсменів
export async function GET() {
  try {
    return NextResponse.json({
      message: 'Демонстраційні спортсмени готові до додавання',
      athletes: DEMO_ATHLETES.map(athlete => ({
        id: athlete.id,
        name: `${athlete.firstName} ${athlete.lastName}`,
        club: athlete.club,
        disciplines: athlete.disciplines
      })),
      total: DEMO_ATHLETES.length
    });
  } catch (error) {
    console.error('❌ Помилка GET /api/athletes/demo:', error);
    return NextResponse.json(
      { error: 'Помилка отримання інформації' },
      { status: 500 }
    );
  }
}
