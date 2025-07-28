import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Отримуємо інформацію з cookies або headers
    const authCookie = request.cookies.get('simple-auth-session');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cookies: {
        hasAuthCookie: !!authCookie,
        authCookieValue: authCookie?.value ? 'присутній' : 'відсутній'
      },
      headers: {
        userAgent: request.headers.get('user-agent') || 'unknown',
        referer: request.headers.get('referer') || 'unknown'
      },
      url: request.url,
      message: 'Тестовий API для діагностики працює'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Помилка тестового API',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
