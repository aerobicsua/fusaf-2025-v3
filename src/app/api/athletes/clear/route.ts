import { NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { AthletesStorage } from '@/lib/athletes-storage';

// POST - очистити всіх спортсменів крім адміна
export async function POST(request: Request) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Недостатньо прав для очистки бази даних' },
        { status: 403 }
      );
    }

    console.log('🧹 CLEAR athletes: початок очистки бази спортсменів');

    // Отримуємо статистику ДО очистки
    const beforeStats = AthletesStorage.getStats();

    // Очищуємо всіх крім адміна
    AthletesStorage.clearExceptAdmin();

    // Отримуємо статистику ПІСЛЯ очистки
    const afterStats = AthletesStorage.getStats();

    console.log('✅ CLEAR athletes завершено:', {
      before: beforeStats.total,
      after: afterStats.total,
      removed: beforeStats.total - afterStats.total
    });

    return NextResponse.json({
      success: true,
      message: 'База спортсменів очищена (крім адміністратора)',
      statistics: {
        before: beforeStats,
        after: afterStats,
        removed: beforeStats.total - afterStats.total
      },
      debug: {
        storageType: 'ATHLETES_STORAGE',
        timestamp: new Date().toISOString(),
        admin: 'andfedos@gmail.com залишений'
      }
    });

  } catch (error) {
    console.error('❌ Помилка CLEAR athletes:', error);
    return NextResponse.json(
      { error: 'Помилка очистки бази спортсменів' },
      { status: 500 }
    );
  }
}

// GET - інформація про операцію очистки
export async function GET() {
  try {
    const stats = AthletesStorage.getStats();

    return NextResponse.json({
      message: 'API для очистки бази спортсменів',
      instructions: 'POST запит для очистки всіх спортсменів крім andfedos@gmail.com',
      currentState: stats,
      warning: 'Операція незворотна! Використовуйте обережно.'
    });

  } catch (error) {
    console.error('❌ Помилка GET clear info:', error);
    return NextResponse.json(
      { error: 'Помилка отримання інформації' },
      { status: 500 }
    );
  }
}
