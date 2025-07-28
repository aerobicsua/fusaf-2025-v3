import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { googleSheetsService, type ExportConfig } from '@/lib/google-sheets';
import DemoGoogleSheetsService from '@/lib/demo-google-sheets';

// POST /api/export/google-sheets
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

    // TODO: Перевірити права адміністратора
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Недостатньо прав доступу' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const config: ExportConfig = body;

    // Валідація вхідних даних
    if (!config.title || !config.type) {
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові поля: title, type' },
        { status: 400 }
      );
    }

    const validTypes = ['users', 'competitions', 'registrations', 'financial', 'clubs', 'analytics'];
    if (!validTypes.includes(config.type)) {
      return NextResponse.json(
        { error: `Неправильний тип експорту. Дозволені: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Логуємо спробу експорту
    console.log(`Export request by ${session.user?.email}: ${config.type} - ${config.title}`);

    // Використовуємо демонстраційний сервіс для показу функціональності
    // В реальному проекті тут буде: const result = await googleSheetsService.exportData(config);
    const result = await DemoGoogleSheetsService.exportData(config);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Помилка експорту' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '✅ Демонстраційний експорт в Google Sheets завершено успішно!',
      spreadsheetId: result.spreadsheetId,
      spreadsheetUrl: result.spreadsheetUrl,
      totalRows: result.totalRows,
      exportedBy: session.user?.email,
      exportedAt: result.exportedAt,
      demo: true,
      note: 'Це демонстраційний експорт. В реальному проекті буде створена справжня Google Sheets таблиця.'
    });

  } catch (error) {
    console.error('Google Sheets export error:', error);
    return NextResponse.json(
      { error: 'Помилка сервера при експорті' },
      { status: 500 }
    );
  }
}

// GET /api/export/google-sheets - інформація про доступні експорти
export async function GET() {
  return NextResponse.json({
    availableExports: [
      {
        type: 'users',
        title: 'Користувачі',
        description: 'Експорт всіх користувачів системи з їх ролями та контактною інформацією',
        columns: ['ID', 'Email', 'Повне ім\'я', 'Роль', 'Телефон', 'Дата народження', 'Адреса', 'Дата реєстрації']
      },
      {
        type: 'competitions',
        title: 'Змагання',
        description: 'Експорт всіх змагань з деталями та статистикою реєстрацій',
        columns: ['Назва', 'Дата', 'Місце', 'Організатор', 'Статус', 'Кількість реєстрацій', 'Внески']
      },
      {
        type: 'registrations',
        title: 'Реєстрації',
        description: 'Експорт всіх реєстрацій учасників на змагання',
        columns: ['Учасник', 'Змагання', 'Статус реєстрації', 'Статус оплати', 'Дата реєстрації']
      },
      {
        type: 'clubs',
        title: 'Клуби',
        description: 'Експорт всіх зареєстрованих клубів з контактною інформацією',
        columns: ['Назва', 'Місто', 'Власник', 'Кількість спортсменів', 'Контакти']
      },
      {
        type: 'financial',
        title: 'Фінансовий звіт',
        description: 'Експорт фінансової звітності з усіма оплаченими реєстраціями',
        columns: ['Учасник', 'Змагання', 'Сума оплати', 'Дата оплати', 'Статус']
      }
    ],
    requirements: {
      authentication: 'required',
      adminRights: 'recommended',
      googleSheetsPermissions: 'Service Account with Sheets API access'
    },
    examples: {
      exportUsers: {
        title: 'Експорт користувачів ФУСАФ',
        type: 'users',
        includeHeaders: true
      },
      exportCompetitions: {
        title: 'Змагання 2025',
        type: 'competitions',
        dateRange: {
          start: '2025-01-01',
          end: '2025-12-31'
        }
      },
      financialReport: {
        title: 'Фінансовий звіт за січень 2025',
        type: 'financial',
        dateRange: {
          start: '2025-01-01',
          end: '2025-01-31'
        }
      }
    }
  });
}

// DELETE /api/export/google-sheets - очистка експортованих файлів (майбутня функція)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    // TODO: Реалізувати видалення старих експортованих файлів
    // Можна зберігати список створених файлів та видаляти їх через певний час

    return NextResponse.json({
      success: true,
      message: 'Функціональність очистки буде додана в наступних версіях'
    });

  } catch (error) {
    console.error('Export cleanup error:', error);
    return NextResponse.json(
      { error: 'Помилка при очищенні експортів' },
      { status: 500 }
    );
  }
}
