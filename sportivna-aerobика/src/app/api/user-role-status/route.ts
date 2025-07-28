import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { roleRequests, initializeRequests } from '@/app/api/role-requests/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    // Ініціалізуємо запити
    const allRequests = initializeRequests();

    // Знаходимо активний запит користувача
    const userRequest = allRequests.find(
      req => req.userEmail === session.user.email && req.status === 'pending'
    );

    console.log('🔍 Статус користувача:', {
      email: session.user.email,
      hasRequest: !!userRequest,
      total: allRequests.length
    });

    return NextResponse.json({
      hasActiveRequest: !!userRequest,
      roleRequest: userRequest || null
    });

  } catch (error) {
    console.error('Помилка перевірки статусу:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
