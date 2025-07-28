import { NextResponse } from 'next/server';
import { AthletesStorage } from '@/lib/athletes-storage';

// GET - отримати детальну статистику спортсмена
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: athleteId } = await params;
    const url = new URL(request.url);
    const period = url.searchParams.get('period'); // year, all, last5years
    const discipline = url.searchParams.get('discipline');

    const athlete = AthletesStorage.findById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Спортсмена не знайдено' },
        { status: 404 }
      );
    }

    let results = athlete.results || [];

    // Фільтрація по періоду
    if (period) {
      const currentYear = new Date().getFullYear();
      if (period === 'year') {
        results = results.filter(r =>
          new Date(r.date).getFullYear() === currentYear
        );
      } else if (period === 'last5years') {
        results = results.filter(r =>
          new Date(r.date).getFullYear() >= currentYear - 4
        );
      }
    }

    // Фільтрація по дисципліні
    if (discipline) {
      results = results.filter(r => r.discipline === discipline);
    }

    // Базова статистика
    const totalCompetitions = results.length;
    const wins = results.filter(r => r.rank === 1).length;
    const podiums = results.filter(r => r.rank && r.rank <= 3).length;
    const medalsByType = {
      gold: results.filter(r => r.rank === 1).length,
      silver: results.filter(r => r.rank === 2).length,
      bronze: results.filter(r => r.rank === 3).length
    };

    // Статистика балів
    const scoresWithValues = results.filter(r => r.totalScore);
    const averageScore = scoresWithValues.length > 0
      ? scoresWithValues.reduce((sum, r) => sum + (r.totalScore || 0), 0) / scoresWithValues.length
      : 0;
    const bestScore = scoresWithValues.length > 0
      ? Math.max(...scoresWithValues.map(r => r.totalScore!))
      : 0;

    // Статистика по рокам
    const competitionsByYear = results.reduce((acc, r) => {
      const year = new Date(r.date).getFullYear().toString();
      if (!acc[year]) acc[year] = { competitions: 0, wins: 0, podiums: 0, bestScore: 0 };
      acc[year].competitions++;
      if (r.rank === 1) acc[year].wins++;
      if (r.rank && r.rank <= 3) acc[year].podiums++;
      if (r.totalScore && r.totalScore > acc[year].bestScore) {
        acc[year].bestScore = r.totalScore;
      }
      return acc;
    }, {} as Record<string, any>);

    // Статистика по дисциплінах
    const disciplineStats = results.reduce((acc, r) => {
      if (!acc[r.discipline]) {
        acc[r.discipline] = {
          competitions: 0,
          wins: 0,
          podiums: 0,
          bestRank: Number.POSITIVE_INFINITY,
          averageScore: 0,
          bestScore: 0,
          scores: []
        };
      }

      acc[r.discipline].competitions++;
      if (r.rank === 1) acc[r.discipline].wins++;
      if (r.rank && r.rank <= 3) acc[r.discipline].podiums++;
      if (r.rank && r.rank < acc[r.discipline].bestRank) {
        acc[r.discipline].bestRank = r.rank;
      }
      if (r.totalScore) {
        acc[r.discipline].scores.push(r.totalScore);
        if (r.totalScore > acc[r.discipline].bestScore) {
          acc[r.discipline].bestScore = r.totalScore;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    // Обчислюємо середні бали по дисциплінах
    Object.keys(disciplineStats).forEach(disc => {
      const scores = disciplineStats[disc].scores;
      disciplineStats[disc].averageScore = scores.length > 0
        ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
        : 0;
      delete disciplineStats[disc].scores; // Видаляємо тимчасовий масив
    });

    // Статистика по типах змагань
    const competitionTypeStats = results.reduce((acc, r) => {
      if (!acc[r.competitionType]) {
        acc[r.competitionType] = { competitions: 0, wins: 0, podiums: 0, bestScore: 0 };
      }
      acc[r.competitionType].competitions++;
      if (r.rank === 1) acc[r.competitionType].wins++;
      if (r.rank && r.rank <= 3) acc[r.competitionType].podiums++;
      if (r.totalScore && r.totalScore > acc[r.competitionType].bestScore) {
        acc[r.competitionType].bestScore = r.totalScore;
      }
      return acc;
    }, {} as Record<string, any>);

    // Найкращі та найгірші виступи
    const rankedResults = results.filter(r => r.rank).sort((a, b) => (a.rank || 0) - (b.rank || 0));
    const scoredResults = results.filter(r => r.totalScore).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    const bestPerformances = {
      byRank: rankedResults.slice(0, 5),
      byScore: scoredResults.slice(0, 5)
    };

    // Прогрес по часу (останні 5 результатів)
    const recentResults = results
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .reverse(); // Від старших до новіших

    const progressTrend = recentResults.map(r => ({
      date: r.date,
      competition: r.competitionName,
      rank: r.rank,
      score: r.totalScore,
      discipline: r.discipline
    }));

    // Персональні рекорди
    const personalBests = athlete.personalBests || {};

    // Цікаві факти
    const interestingFacts = [];

    if (wins > 0) {
      interestingFacts.push(`🥇 ${wins} перемог у змаганнях`);
    }

    if (podiums > 0) {
      const podiumRate = Math.round((podiums / totalCompetitions) * 100);
      interestingFacts.push(`🏆 ${podiumRate}% змагань завершено в топ-3`);
    }

    if (scoresWithValues.length > 0) {
      interestingFacts.push(`📊 Середній бал: ${averageScore.toFixed(1)}`);
    }

    const yearSpan = results.length > 0 ?
      new Date().getFullYear() - Math.min(...results.map(r => new Date(r.date).getFullYear())) + 1 : 0;

    if (yearSpan > 1) {
      interestingFacts.push(`⏳ ${yearSpan} років спортивної кар'єри`);
    }

    const response = {
      athleteId,
      athlete: {
        name: `${athlete.firstName} ${athlete.lastName}`,
        country: athlete.country,
        disciplines: athlete.disciplines,
        club: athlete.club
      },
      period: period || 'all',
      discipline: discipline || 'all',

      // Основна статистика
      overview: {
        totalCompetitions,
        wins,
        podiums,
        winRate: totalCompetitions > 0 ? Math.round((wins / totalCompetitions) * 100) : 0,
        podiumRate: totalCompetitions > 0 ? Math.round((podiums / totalCompetitions) * 100) : 0,
        averageScore: Math.round(averageScore * 10) / 10,
        bestScore,
        medalsByType
      },

      // Статистика по рокам, дисциплінах, типах змагань
      breakdown: {
        byYear: competitionsByYear,
        byDiscipline: disciplineStats,
        byCompetitionType: competitionTypeStats
      },

      // Найкращі виступи
      bestPerformances,

      // Прогрес
      progressTrend,

      // Персональні рекорди
      personalBests,

      // Цікаві факти
      interestingFacts,

      // Загальна статистика спортсмена
      athleteStats: athlete.stats,

      // Метадані
      metadata: {
        totalResultsInDatabase: athlete.results.length,
        filteredResults: results.length,
        lastUpdated: athlete.lastUpdated,
        calculatedAt: new Date().toISOString()
      }
    };

    console.log('📊 Статистика спортсмена:', {
      athleteId,
      name: `${athlete.firstName} ${athlete.lastName}`,
      period,
      discipline,
      totalCompetitions,
      wins,
      podiums
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Помилка GET /api/athletes/[id]/stats:', error);
    return NextResponse.json(
      { error: 'Помилка обчислення статистики' },
      { status: 500 }
    );
  }
}
