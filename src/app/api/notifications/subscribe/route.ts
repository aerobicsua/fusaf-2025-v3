import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed

// Симуляція бази даних підписок
const subscriptions = new Map<string, {
  email: string;
  settings: {
    newCompetitions: boolean;
    registrationReminders: boolean;
    competitionUpdates: boolean;
    results: boolean;
    emailFrequency: 'immediate' | 'daily' | 'weekly';
  };
  subscribedAt: string;
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

    const { email, settings } = await request.json();

    // Валідація email
    if (!email || email !== session.user.email) {
      return NextResponse.json({
        success: false,
        error: 'Невірний email'
      }, { status: 400 });
    }

    // Валідація налаштувань
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Невірні налаштування'
      }, { status: 400 });
    }

    // Збереження підписки (в реальній системі це буде база даних)
    subscriptions.set(email, {
      email,
      settings,
      subscribedAt: new Date().toISOString()
    });

    console.log('📧 Нова підписка на сповіщення:', {
      email,
      settings,
      timestamp: new Date().toISOString()
    });

    // В реальній системі тут би було:
    // 1. Збереження в базу даних
    // 2. Відправка вітального email
    // 3. Інтеграція з email-сервісом

    return NextResponse.json({
      success: true,
      message: 'Підписка успішно активована',
      subscription: {
        email,
        settings,
        subscribedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Помилка підписки на сповіщення:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    const subscription = subscriptions.get(session.user.email);

    return NextResponse.json({
      success: true,
      subscription: subscription || null,
      isSubscribed: !!subscription
    });

  } catch (error) {
    console.error('Помилка отримання підписки:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}
