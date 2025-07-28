import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Повне очищення всіх даних системи ФУСАФ');

    // Список всіх ключів localStorage для очищення
    const keysToClean = [
      'approvedClubs',
      'approvedAthletes',
      'approvedCoachesJudges',
      'approvedCompetitions',
      'clubRequests',
      'coachApplications', // нові заявки тренерів до клубів
      'clubTrainers', // схвалені тренери по клубах
      'simple-auth-user' // зберігаємо поточного користувача
    ];

    return NextResponse.json({
      success: true,
      message: 'Всі дані системи очищено. Лічильники обнулено.',
      keysToClean: keysToClean,
      instructions: 'На клієнті виконайте: ' + keysToClean.filter(k => k !== 'simple-auth-user').map(k => `localStorage.removeItem('${k}')`).join('; ')
    });

  } catch (error) {
    console.error('❌ Помилка очищення даних:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка очищення даних'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API для повного очищення всіх даних системи ФУСАФ. Використовуйте POST запит.'
  });
}
