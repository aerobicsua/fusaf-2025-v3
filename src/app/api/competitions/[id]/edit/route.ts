import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    // Перевіряємо права - тільки власники клубів та адміни можуть редагувати змагання
    const canEdit = (session.user as any)?.roles?.some((role: string) =>
      ['admin', 'club_owner'].includes(role)
    );

    if (!canEdit) {
      return NextResponse.json({
        success: false,
        error: 'Недостатньо прав для редагування змагань'
      }, { status: 403 });
    }

    const { id: competitionId } = await params;
    const updatedData = await request.json();

    // Валідація обов'язкових полів
    if (!updatedData.title?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Назва змагання є обов\'язковою'
      }, { status: 400 });
    }

    if (!updatedData.date) {
      return NextResponse.json({
        success: false,
        error: 'Дата змагання є обов\'язковою'
      }, { status: 400 });
    }

    if (!updatedData.location?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Місце проведення є обов\'язковим'
      }, { status: 400 });
    }

    if (!updatedData.contact_person?.name?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Контактна особа є обов\'язковою'
      }, { status: 400 });
    }

    if (!updatedData.categories || updatedData.categories.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Оберіть хоча б одну категорію'
      }, { status: 400 });
    }

    // В реальній системі тут би було оновлення в БД
    // Зараз симулюємо успішне збереження
    const updatedCompetition = {
      id: competitionId,
      ...updatedData,
      updated_by: session.user.email,
      updated_at: new Date().toISOString()
    };

    console.log('🏆 Оновлення змагання:', {
      id: competitionId,
      title: updatedData.title,
      status: updatedData.status,
      updatedBy: session.user.email,
      timestamp: new Date().toISOString()
    });

    // Якщо статус змінився на опублікований, можемо відправити сповіщення
    if (updatedData.status === 'published' || updatedData.status === 'registration_open') {
      try {
        // Викликаємо API сповіщень асинхронно
        fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send-competition-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({
            competition: updatedCompetition
          })
        }).then(response => {
          if (response.ok) {
            console.log('✅ Сповіщення про оновлення змагання відправлено');
          } else {
            console.error('❌ Помилка відправки сповіщень про оновлення');
          }
        }).catch(error => {
          console.error('❌ Помилка при відправці сповіщень про оновлення:', error);
        });
      } catch (error) {
        console.error('❌ Помилка при ініціації відправки сповіщень про оновлення:', error);
      }
    }

    return NextResponse.json({
      success: true,
      competition: updatedCompetition,
      message: 'Змагання успішно оновлено!',
      notifications: (updatedData.status === 'published' || updatedData.status === 'registration_open')
        ? 'Сповіщення надіслано підписникам про оновлення'
        : 'Сповіщення будуть надіслані після публікації'
    });

  } catch (error) {
    console.error('Помилка редагування змагання:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}

// Отримання даних змагання для редагування
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    const { id: competitionId } = await params;

    // В реальній системі тут би був запит до БД
    // Зараз повертаємо демо-дані
    const demoCompetition = {
      id: competitionId,
      title: 'Кубок України зі спортивної аеробіки 2025',
      description: 'Офіційні змагання федерації України зі спортивної аеробіки та фітнесу.',
      date: '2025-04-15',
      time: '10:00',
      location: 'Палац спорту "Україна"',
      address: 'вул. Велика Васільківська, 55, Київ, 03150',
      city: 'Київ',
      organizing_club: 'СК "Грація"',
      status: 'registration_open',
      contact_person: {
        name: 'Іваненко Марія Петрівна',
        position: 'Директор змагань',
        phone: '+380 67 123 45 67',
        email: 'competitions@fusaf.org.ua'
      },
      program_fees: {
        iw_im: 500,
        mp: 600,
        tr: 800,
        gr: 1000,
        ad: 1200,
        as: 1200
      },
      payment_details: {
        bank_name: 'ПриватБанк',
        account_number: 'UA123456789012345678901234567',
        account_holder: 'СК "Грація"',
        swift_code: 'PBANUA2X'
      },
      max_participants_by_program: {
        iw: 3,
        im: 3,
        mp: 2,
        tr: 2,
        gr: 1,
        ad: 1,
        as: 1
      },
      categories: [
        'YOUTH / 12-14 YEARS',
        'JUNIORS / 15-17 YEARS',
        'SENIORS 18+ YEARS'
      ],
      rules: 'Змагання проводяться згідно з правилами FIG та ФУСАФ.',
      equipment_requirements: 'Мінімум 2 килимки одного виробника',
      accommodation: {
        available: true,
        details: 'Готель "Прем\'єр Палац"',
        cost_per_night: 800
      },
      meals: {
        available: true,
        details: 'Трьохразове харчування',
        cost_per_meal: 150
      },
      transportation: {
        available: true,
        details: 'Трансфер від готелю'
      },
      medical_requirements: 'Обов\'язкова медична довідка',
      insurance_required: true,
      notes: 'Додаткова інформація для учасників',
      website: 'https://competition.fusaf.org.ua',
      registration_deadline: '2025-03-15'
    };

    return NextResponse.json({
      success: true,
      competition: demoCompetition
    });

  } catch (error) {
    console.error('Помилка отримання змагання для редагування:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}
