import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email не вказано'
      }, { status: 400 });
    }

    console.log(`🗑️ Видалення користувача з email: ${email}`);

    // Видаляємо користувача з localStorage (виконається на клієнті)
    // Тут просто повертаємо успіх, оскільки видалення відбувається на клієнті

    return NextResponse.json({
      success: true,
      message: `Користувача з email ${email} видалено з системи`
    });

  } catch (error) {
    console.error('❌ Помилка видалення користувача:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка видалення користувача'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API для видалення конкретного користувача. Використовуйте POST запит з email.'
  });
}
