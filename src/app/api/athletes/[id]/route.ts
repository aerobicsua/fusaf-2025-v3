import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🏃‍♂️ Завантаження публічного профілю спортсмена: ${id}`);

    // Завантажуємо спортсменів з localStorage (в реальному проекті тут буде база даних)
    // Оскільки це серверний код, використовуємо тестові дані для демонстрації
    // В реальному проекті дані передавалися б з клієнта або з бази даних

    // Створюємо тестового спортсмена з повною публічною інформацією
    const testAthleteId = `athlete-test-${Date.now()}`;
    const now = Date.now();

    const testAthlete = {
      id: id, // Використовуємо переданий ID
      firstName: 'Марія',
      lastName: 'Спортсменко',
      name: 'Марія Спортсменко',
      gender: 'female',
      yearOfBirth: 1999,
      country: 'Україна',
      city: 'Київ',
      region: 'м. Київ',
      placeOfBirth: 'Київ',

      // Спортивна інформація (ПУБЛІЧНА)
      club: 'Київський Центр Аеробіки',
      clubName: 'Київський Центр Аеробіки',
      coach: 'Ірина Тренерська',
      trainingSite: 'Спортивний комплекс "Олімпійський"',
      disciplines: ['Спортивна аеробіка', 'Індивідуальні змагання'],
      status: 'active',
      licenseLevel: 'advanced',
      license: 'UKR2024001',
      title: 'Майстер спорту України',
      height: 165,
      weight: 55,

      // Біографія та інтереси (ПУБЛІЧНІ)
      biography: 'Талановита спортсменка з багаторічним досвідом у спортивній аеробіці. Розпочала займатися аеробікою у віці 8 років. Постійно працює над удосконаленням техніки та досягненням нових висот у спорті.',

      interests: ['Танці', 'Фітнес', 'Здоровий спосіб життя', 'Музика', 'Подорожі'],
      languages: ['Українська', 'Англійська', 'Російська'],

      // Досягнення (ПУБЛІЧНІ)
      achievements: [
        {
          title: 'Чемпіон України зі спортивної аеробіки 2023',
          description: 'Перше місце в індивідуальних змаганнях серед жінок',
          type: 'Competition',
          level: 'National',
          date: '2023-06-15'
        },
        {
          title: 'Призер Європейського кубку 2023',
          description: 'Третє місце в індивідуальних змаганнях',
          type: 'Competition',
          level: 'International',
          date: '2023-03-20'
        },
        {
          title: 'Майстер спорту України',
          description: 'Отримання звання "Майстер спорту України" з аеробіки',
          type: 'Title',
          level: 'National',
          date: '2022-12-10'
        },
        {
          title: 'Переможець національних змагань 2022',
          description: 'Золота медаль на національному чемпіонаті',
          type: 'Competition',
          level: 'National',
          date: '2022-08-15'
        }
      ],

      // Соціальні мережі (ПУБЛІЧНІ)
      socialMedia: {
        instagram: '@maria_aerobics_ukr',
        facebook: 'maria.aerobics.ukraine',
        youtube: 'Maria Aerobics UA',
        tiktok: '@maria_sports_ua'
      },

      // Персональні рекорди (ПУБЛІЧНІ)
      personalBests: {
        totalScore: {
          score: 18.850,
          competition: 'Чемпіонат України 2023',
          date: '2023-06-15'
        },
        technicScore: {
          score: 9.200,
          competition: 'Європейський кубок 2023',
          date: '2023-03-20'
        },
        artisticScore: {
          score: 9.650,
          competition: 'Чемпіонат України 2023',
          date: '2023-06-15'
        }
      },

      // Статистика (ПУБЛІЧНА)
      stats: {
        totalCompetitions: 15,
        wins: 6,
        podiums: 11,
        bestScore: 18.850,
        averageScore: 17.450,
        medalsByType: {
          gold: 6,
          silver: 3,
          bronze: 2
        },
        disciplineStats: {
          'Спортивна аеробіка': {
            competitions: 15,
            bestRank: 1,
            averageScore: 17.450
          }
        },
        competitionsByYear: {
          '2024': 5,
          '2023': 7,
          '2022': 3
        }
      },

      // Медіа файли (можуть бути пустими для демо)
      media: [
        {
          id: 'photo1',
          type: 'image',
          url: 'https://ext.same-assets.com/2725761375/athlete-profile.jpg',
          isProfileImage: true,
          caption: 'Офіційне фото профілю'
        }
      ],

      // Результати змагань (публічні)
      competitionResults: [
        {
          id: 'comp1',
          title: 'Чемпіонат України 2023',
          date: '2023-06-15',
          location: 'Київ, Україна',
          discipline: 'Спортивна аеробіка',
          category: 'Індивідуальні змагання, жінки',
          rank: 1,
          score: 18.850,
          technicScore: 9.200,
          artisticScore: 9.650,
          notes: 'Новий особистий рекорд'
        },
        {
          id: 'comp2',
          title: 'Європейський кубок 2023',
          date: '2023-03-20',
          location: 'Будапешт, Угорщина',
          discipline: 'Спортивна аеробіка',
          category: 'Індивідуальні змагання, жінки',
          rank: 3,
          score: 18.200,
          technicScore: 9.100,
          artisticScore: 9.100,
          notes: 'Перші міжнародні змагання сезону'
        }
      ],

      registeredAt: '2022-01-15T10:00:00Z',
      updatedAt: new Date().toISOString(),

      // ВАЖЛИВО: Приватні дані НЕ включаємо в публічний профіль
      // НЕ показуємо: email, phone, passport, address, documents, medical info
    };

    return NextResponse.json({
      success: true,
      athlete: testAthlete
    });

  } catch (error) {
    console.error('❌ Помилка завантаження профілю спортсмена:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка сервера'
    }, { status: 500 });
  }
}
