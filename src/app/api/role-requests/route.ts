import { NextResponse } from 'next/server';

// Простий in-memory storage для демо
let roleRequests: any[] = [];

// GET - отримати всі запити
export async function GET() {
  try {
    return NextResponse.json({
      requests: roleRequests.sort((a, b) =>
        new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
      ),
      total: roleRequests.length
    });

  } catch (error) {
    console.error('Помилка при отриманні запитів на ролі:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// POST - створити новий запит на роль
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestedRole, reason, userEmail, userName } = body;

    // Валідація
    if (!requestedRole || !['club_owner', 'coach_judge'].includes(requestedRole)) {
      return NextResponse.json(
        { error: 'Некоректна роль для запиту' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Опис причини має містити мінімум 10 символів' },
        { status: 400 }
      );
    }

    // Створюємо новий запит
    const newRequest = {
      id: Date.now().toString(),
      userEmail: userEmail || 'demo@example.com',
      userName: userName || 'Demo User',
      currentRole: 'athlete',
      requestedRole,
      reason: reason.trim(),
      status: 'pending',
      requestDate: new Date().toISOString()
    };

    // Додаємо до простого масиву
    roleRequests.push(newRequest);

    return NextResponse.json({
      message: 'Запит на роль успішно створено',
      request: newRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Помилка при створенні запиту на роль:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// PUT - оновити статус запиту
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status, comment } = body;

    // Валідація
    if (!requestId || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Некоректні дані запиту' },
        { status: 400 }
      );
    }

    // Знаходимо запит
    const requestIndex = roleRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      return NextResponse.json(
        { error: 'Запит не знайдено' },
        { status: 404 }
      );
    }

    // Оновлюємо статус запиту
    roleRequests[requestIndex] = {
      ...roleRequests[requestIndex],
      status,
      reviewedBy: 'admin',
      reviewDate: new Date().toISOString(),
      reviewComment: comment || ''
    };

    return NextResponse.json({
      message: `Запит успішно ${status === 'approved' ? 'схвалено' : 'відхилено'}`,
      request: roleRequests[requestIndex]
    });

  } catch (error) {
    console.error('Помилка при оновленні запиту на роль:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
