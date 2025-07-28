import { NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { AthletesStorage, type CompetitionResult } from '@/lib/athletes-storage';

// POST - додати новий результат змагання
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(request);
    const { id: athleteId } = await params;

    // Перевірка авторизації
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    const athlete = AthletesStorage.findById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Спортсмена не знайдено' },
        { status: 404 }
      );
    }

    const isAdmin = session.user?.roles?.includes('admin');
    const isOwnProfile = session.user?.email === athlete.email;
    const canEditResults = isAdmin || isOwnProfile || session.user?.roles?.includes('coach_judge');

    if (!canEditResults) {
      return NextResponse.json(
        { error: 'Недостатньо прав для додавання результатів' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      competitionName,
      competitionType,
      date,
      location,
      venue,
      category,
      discipline,
      rank,
      totalScore,
      technicScore,
      artisticScore,
      executionScore,
      difficultyScore,
      participantsCount,
      notes,
      photos,
      videoUrl,
      judgesCount,
      deductions
    } = body;

    // Валідація обов'язкових полів
    if (!competitionName || !date || !location || !category || !discipline) {
      return NextResponse.json(
        { error: 'Обов\'язкові поля: competitionName, date, location, category, discipline' },
        { status: 400 }
      );
    }

    // Створюємо новий результат
    const result: CompetitionResult = {
      id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      competitionName,
      competitionType: competitionType || 'Other',
      date,
      location,
      venue: venue || '',
      category,
      discipline,
      rank: rank || undefined,
      totalScore: totalScore || undefined,
      technicScore: technicScore || undefined,
      artisticScore: artisticScore || undefined,
      executionScore: executionScore || undefined,
      difficultyScore: difficultyScore || undefined,
      participantsCount: participantsCount || undefined,
      isPersonalBest: false, // Буде обчислено автоматично
      notes: notes || '',
      photos: photos || [],
      videoUrl: videoUrl || '',
      judgesCount: judgesCount || undefined,
      deductions: deductions || undefined
    };

    const success = AthletesStorage.addResult(athleteId, result);

    if (!success) {
      return NextResponse.json(
        { error: 'Помилка додавання результату' },
        { status: 500 }
      );
    }

    console.log('🏅 Додано результат змагання:', {
      athleteId,
      resultId: result.id,
      competition: result.competitionName,
      rank: result.rank,
      score: result.totalScore
    });

    return NextResponse.json({
      message: 'Результат успішно додано',
      result
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Помилка POST /api/athletes/[id]/results:', error);
    return NextResponse.json(
      { error: 'Помилка додавання результату' },
      { status: 500 }
    );
  }
}

// GET - отримати результати спортсмена з фільтрацією
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: athleteId } = await params;
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    const discipline = url.searchParams.get('discipline');
    const competitionType = url.searchParams.get('competitionType');
    const limit = Number.parseInt(url.searchParams.get('limit') || '50');
    const includeStats = url.searchParams.get('includeStats') === 'true';

    const athlete = AthletesStorage.findById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Спортсмена не знайдено' },
        { status: 404 }
      );
    }

    let results = athlete.results || [];

    // Фільтрація по року
    if (year) {
      results = results.filter(result =>
        new Date(result.date).getFullYear().toString() === year
      );
    }

    // Фільтрація по дисципліні
    if (discipline) {
      results = results.filter(result => result.discipline === discipline);
    }

    // Фільтрація по типу змагання
    if (competitionType) {
      results = results.filter(result => result.competitionType === competitionType);
    }

    // Сортуємо по даті (нові спочатку)
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Обмежуємо кількість
    results = results.slice(0, limit);

    const response: any = {
      athleteId,
      results,
      total: results.length,
      filters: { year, discipline, competitionType, limit }
    };

    // Додаємо статистику якщо потрібно
    if (includeStats) {
      response.stats = athlete.stats;
      response.personalBests = athlete.personalBests;

      // Статистика результатів
      response.resultStats = {
        totalCompetitions: results.length,
        wins: results.filter(r => r.rank === 1).length,
        podiums: results.filter(r => r.rank && r.rank <= 3).length,
        averageRank: results.filter(r => r.rank).length > 0
          ? results.filter(r => r.rank).reduce((sum, r) => sum + (r.rank || 0), 0) / results.filter(r => r.rank).length
          : 0,
        bestRank: results.filter(r => r.rank).length > 0
          ? Math.min(...results.filter(r => r.rank).map(r => r.rank!))
          : 0,
        averageScore: results.filter(r => r.totalScore).length > 0
          ? results.filter(r => r.totalScore).reduce((sum, r) => sum + (r.totalScore || 0), 0) / results.filter(r => r.totalScore).length
          : 0,
        bestScore: results.filter(r => r.totalScore).length > 0
          ? Math.max(...results.filter(r => r.totalScore).map(r => r.totalScore!))
          : 0,
        competitionsByYear: results.reduce((acc, r) => {
          const year = new Date(r.date).getFullYear().toString();
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        medalsByType: {
          gold: results.filter(r => r.rank === 1).length,
          silver: results.filter(r => r.rank === 2).length,
          bronze: results.filter(r => r.rank === 3).length
        }
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Помилка GET /api/athletes/[id]/results:', error);
    return NextResponse.json(
      { error: 'Помилка завантаження результатів' },
      { status: 500 }
    );
  }
}
