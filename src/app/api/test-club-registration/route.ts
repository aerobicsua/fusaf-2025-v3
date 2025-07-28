import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test API endpoint called');

    // Перевіряємо розмір запиту
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength);
      const maxSize = 2 * 1024 * 1024; // 2MB максимум для стабільної роботи

      if (size > maxSize) {
        return NextResponse.json({
          success: false,
          error: `Файл занадто великий! Максимум: 2MB, ваш: ${Math.round(size / 1024 / 1024)}MB`
        }, {
          status: 413,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Пробуємо отримати FormData
    try {
      const formData = await request.formData();
      console.log('🧪 FormData отримано успішно');

      // Перевіряємо файли
      const registrationFile = formData.get('registrationDocuments') as File;
      if (registrationFile) {
        console.log('🧪 Файл:', registrationFile.name, registrationFile.size, 'bytes');
      }

    } catch (formError) {
      console.error('🧪 Помилка FormData:', formError);
      return NextResponse.json({
        success: false,
        error: 'Помилка обробки файлів: ' + (formError as Error).message
      }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Test endpoint працює з файлами!',
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🧪 Test API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Серверна помилка: ' + (error as Error).message
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test GET працює!',
    timestamp: new Date().toISOString()
  });
}
