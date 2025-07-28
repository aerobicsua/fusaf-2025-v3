import { type NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailType, validateEmailAddress } from '@/lib/email';
import { getApiSession } from '@/lib/auth';
// authOptions removed

// POST /api/emails/send
export async function POST(request: NextRequest) {
  try {
    // Перевіряємо аутентифікацію
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { to, type, data } = body;

    // Валідація вхідних даних
    if (!to || !type || !data) {
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові поля: to, type, data' },
        { status: 400 }
      );
    }

    // Валідація email адрес
    const emails = Array.isArray(to) ? to : [to];
    for (const email of emails) {
      if (!validateEmailAddress(email)) {
        return NextResponse.json(
          { error: `Неправильний формат email: ${email}` },
          { status: 400 }
        );
      }
    }

    // Перевіряємо тип email
    if (!Object.values(EmailType).includes(type)) {
      return NextResponse.json(
        { error: `Невірний тип email: ${type}` },
        { status: 400 }
      );
    }

    // Відправляємо email
    const result = await EmailService.sendEmail({
      to,
      type,
      data
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email успішно відправлено'
    });

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}

// GET /api/emails/send - показати можливі типи email
export async function GET() {
  return NextResponse.json({
    availableTypes: Object.values(EmailType),
    examples: {
      welcome: {
        type: EmailType.WELCOME,
        data: {
          name: 'Іван Петренко',
          role: 'athlete',
          dashboardUrl: 'https://fusaf.org.ua/dashboard',
          unsubscribeUrl: 'https://fusaf.org.ua/unsubscribe'
        }
      },
      registration_confirmation: {
        type: EmailType.REGISTRATION_CONFIRMATION,
        data: {
          participantName: 'Марія Коваленко',
          competitionTitle: 'Кубок України 2025',
          competitionDate: '15 березня 2025',
          competitionTime: '10:00',
          location: 'Палац спорту "Україна"',
          address: 'м. Київ, пр. Червонозоряний, 1',
          category: 'індивідуальна',
          ageGroup: '17-21',
          contactPerson: 'Тетяна Іванівна (+380441234567)',
          competitionUrl: 'https://fusaf.org.ua/competitions/cup-2025',
          dashboardUrl: 'https://fusaf.org.ua/dashboard'
        }
      }
    }
  });
}
