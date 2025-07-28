import { NextRequest, NextResponse } from 'next/server';
import { ClubRequestsStorage } from '@/lib/club-requests-storage';

export async function GET() {
  try {
    const requests = await ClubRequestsStorage.getAll();
    const stats = await ClubRequestsStorage.getStats();

    console.log('📋 GET /api/clubs/requests - поточні заявки:', stats.total);
    console.log('📋 Заявки в storage:', requests.map(r => ({ id: r.id, club: r.club.name, status: r.status })));

    return NextResponse.json({
      success: true,
      requests: requests.sort((a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ),
      total: stats.total,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Помилка отримання заявок:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    console.log('📝 POST /api/clubs/requests - ОТРИМАНО нову заявку:', requestData.id || 'no-id');
    console.log('📝 Деталі заявки:', {
      id: requestData.id,
      clubName: requestData.club?.name,
      userEmail: requestData.user?.email,
      status: requestData.status
    });

    // Додаємо заявку до спільного сховища
    await ClubRequestsStorage.add(requestData);

    const stats = await ClubRequestsStorage.getStats();
    console.log('📊 Після додавання - статистика:', stats);

    return NextResponse.json({
      success: true,
      message: 'Заявка збережена успішно',
      requestId: requestData.id,
      totalRequests: stats.total,
      stats: stats
    });
  } catch (error) {
    console.error('❌ Помилка збереження заявки:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { requestId, status, reviewNotes, reviewedBy } = await request.json();

    // Оновлюємо заявку через спільне сховище
    const updatedRequest = await ClubRequestsStorage.update(requestId, {
      status,
      reviewNotes,
      reviewedBy,
      reviewedAt: new Date().toISOString()
    });

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Заявку не знайдено' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Заявка оновлена успішно',
      request: updatedRequest
    });
  } catch (error) {
    console.error('❌ Помилка оновлення заявки:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
