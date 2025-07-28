import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed

// Симуляція бази даних заявок
const membershipRequests = new Map<string, {
  id: string;
  clubId: string;
  clubName: string;
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  responseDate?: string;
  message: string;
  response?: string;
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

    const { clubId, message } = await request.json();

    if (!clubId || !message?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Не вказано клуб або повідомлення'
      }, { status: 400 });
    }

    // Демо-дані клубів для отримання назви
    const clubs = new Map([
      ['club-1', 'СК "Грація"'],
      ['club-2', 'Аеробіка Львів'],
      ['club-3', 'Фітнес-Динаміка'],
      ['club-4', 'Спорт-Арена']
    ]);

    const clubName = clubs.get(clubId);
    if (!clubName) {
      return NextResponse.json({
        success: false,
        error: 'Клуб не знайдено'
      }, { status: 404 });
    }

    // Перевіряємо чи немає активної заявки
    const existingRequest = Array.from(membershipRequests.values()).find(req =>
      req.athleteEmail === session.user.email &&
      req.clubId === clubId &&
      req.status === 'pending'
    );

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'У вас вже є активна заявка до цього клубу'
      }, { status: 400 });
    }

    // Створюємо нову заявку
    const requestId = `req-${Date.now()}`;
    const newRequest = {
      id: requestId,
      clubId,
      clubName,
      athleteId: session.user.email,
      athleteName: session.user.name || session.user.email,
      athleteEmail: session.user.email,
      status: 'pending' as const,
      requestDate: new Date().toISOString(),
      message: message.trim()
    };

    membershipRequests.set(requestId, newRequest);

    console.log('🏛️ Нова заявка на вступ до клубу:', {
      requestId,
      clubName,
      athleteName: newRequest.athleteName,
      message: message.substring(0, 50) + '...'
    });

    // В реальній системі тут би було:
    // 1. Збереження в базу даних
    // 2. Відправка сповіщення власнику клубу
    // 3. Логування дії

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: 'Заявку успішно подано! Очікуйте на відповідь від власника клубу.'
    });

  } catch (error) {
    console.error('Помилка подачі заявки на вступ:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}

// Отримання заявок користувача
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    // Фільтруємо заявки користувача
    const userRequests = Array.from(membershipRequests.values()).filter(
      req => req.athleteEmail === session.user.email
    );

    return NextResponse.json({
      success: true,
      requests: userRequests
    });

  } catch (error) {
    console.error('Помилка отримання заявок:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}
