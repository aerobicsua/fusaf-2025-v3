import { NextRequest, NextResponse } from 'next/server';
import { generateWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || 'Тестовий користувач';
    const email = searchParams.get('email') || 'test@example.com';

    // Генеруємо HTML шаблон
    const welcomeEmailHtml = generateWelcomeEmail({
      name: name,
      email: email,
      role: 'athlete',
      registrationDate: new Date().toISOString()
    });

    // Повертаємо HTML напряму
    return new Response(welcomeEmailHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('❌ Помилка генерації email шаблону:', error);
    return new Response('Помилка генерації email шаблону', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}
