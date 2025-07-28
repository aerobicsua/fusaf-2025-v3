import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed

// Використовуємо ту саму симуляцію бази даних
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    const { email } = await request.json();

    // Валідація email
    if (!email || email !== session.user.email) {
      return NextResponse.json({
        success: false,
        error: 'Невірний email'
      }, { status: 400 });
    }

    // Видалення підписки
    const wasSubscribed = subscriptions.has(email);
    subscriptions.delete(email);

    console.log('📧 Відписка від сповіщень:', {
      email,
      wasSubscribed,
      timestamp: new Date().toISOString()
    });

    // В реальній системі тут би було:
    // 1. Видалення з бази даних
    // 2. Відправка email підтвердження відписки
    // 3. Логування для аналітики

    return NextResponse.json({
      success: true,
      message: wasSubscribed ? 'Ви успішно відписались від сповіщень' : 'Ви не були підписані',
      wasSubscribed
    });

  } catch (error) {
    console.error('Помилка відписки від сповіщень:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}
