import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to, type, data = {} } = await request.json();

    // Валідація
    if (!to) {
      return NextResponse.json({
        success: false,
        error: 'Email отримувача обов\'язковий'
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Тип email обов\'язковий'
      }, { status: 400 });
    }

    console.log('📧 Тестування email сервісу:', { to, type });

    // Тестові дані за типом
    let testData = {};

    switch (type) {
      case 'welcome':
        testData = {
          name: data.name || 'Тестовий Користувач',
          email: to,
          role: data.role || 'athlete',
          registrationDate: new Date().toISOString()
        };
        break;

      case 'club_registration':
        testData = {
          name: data.name || 'Іван Петрович Сидоренко',
          email: to,
          clubName: data.clubName || 'Спортивний клуб "Перемога"',
          clubType: data.clubType || 'club',
          password: data.password || 'testpass123',
          registrationDate: new Date().toISOString()
        };
        break;

      case 'admin_notification':
        testData = {
          clubOwnerName: data.name || 'Іван Петрович Сидоренко',
          clubName: data.clubName || 'Спортивний клуб "Перемога"',
          clubType: data.clubType || 'club',
          email: data.email || 'test@example.com',
          phone: data.phone || '+380501234567',
          registrationDate: new Date().toISOString()
        };
        break;

      case 'approval':
        testData = {
          name: data.name || 'Іван Петрович Сидоренко',
          email: to,
          clubName: data.clubName || 'Спортивний клуб "Перемога"',
          loginUrl: 'https://fusaf.org.ua/login',
          approved: true
        };
        break;

      case 'rejection':
        testData = {
          name: data.name || 'Іван Петрович Сидоренко',
          email: to,
          clubName: data.clubName || 'Спортивний клуб "Перемога"',
          reason: data.reason || 'Неповні документи',
          approved: false
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Невідомий тип email'
        }, { status: 400 });
    }

    // Відправляємо тестовий email
    const result = await EmailService.sendEmail({
      to,
      type,
      data: testData
    });

    if (result.success) {
      console.log('✅ Тестовий email відправлено успішно');
      return NextResponse.json({
        success: true,
        message: 'Тестовий email відправлено успішно',
        type,
        to
      });
    } else {
      console.error('❌ Помилка відправки тестового email:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Помилка відправки email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Помилка API тестування email:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутрішня помилка сервера'
    }, { status: 500 });
  }
}

// GET для отримання доступних типів email
export async function GET() {
  return NextResponse.json({
    availableTypes: [
      'welcome',
      'club_registration',
      'admin_notification',
      'approval',
      'rejection'
    ],
    description: 'Доступні типи email для тестування',
    example: {
      method: 'POST',
      body: {
        to: 'test@example.com',
        type: 'welcome',
        data: {
          name: 'Тестовий Користувач',
          role: 'athlete'
        }
      }
    }
  });
}
