import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
import { AnalyticsService, ReportService } from '@/lib/analytics';

// GET /api/analytics?type=users|competitions|financial|clubs|health|full&period=week|month|quarter|year&format=json|csv|pdf
export async function GET(request: NextRequest) {
  try {
    // Перевіряємо аутентифікацію та права доступу
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    // TODO: Додати перевірку ролі адміністратора
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Недостатньо прав доступу' },
    //     { status: 403 }
    //   );
    // }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'full';
    const period = searchParams.get('period') || 'month';
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Встановлюємо період за замовчуванням
    const analyticsData = {
      period: period as 'week' | 'month' | 'quarter' | 'year',
      startDate: startDate || getDefaultStartDate(period),
      endDate: endDate || new Date().toISOString()
    };

    let result;

    // Отримуємо дані в залежності від типу
    switch (type) {
      case 'users':
        result = await AnalyticsService.getUserStats(analyticsData);
        break;

      case 'competitions':
        result = await AnalyticsService.getCompetitionStats(analyticsData);
        break;

      case 'financial':
        result = await AnalyticsService.getFinancialStats(analyticsData);
        break;

      case 'clubs':
        result = await AnalyticsService.getClubStats();
        break;

      case 'health':
        result = await AnalyticsService.getSystemHealth();
        break;

      case 'full':
        result = await AnalyticsService.generateFullReport(analyticsData);
        break;

      default:
        return NextResponse.json(
          { error: `Невідомий тип аналітики: ${type}` },
          { status: 400 }
        );
    }

    // Експортуємо в потрібному форматі
    if (format === 'csv') {
      const csvData = await ReportService.exportReport(result, 'csv');
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="fusaf-analytics-${type}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (format === 'pdf') {
      const pdfData = await ReportService.exportReport(result, 'pdf');
      return new NextResponse(pdfData, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="fusaf-analytics-${type}-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      });
    }

    // За замовчуванням повертаємо JSON
    return NextResponse.json({
      success: true,
      type,
      period: analyticsData.period,
      startDate: analyticsData.startDate,
      endDate: analyticsData.endDate,
      generatedAt: new Date().toISOString(),
      data: result
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Помилка при отриманні аналітики' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/reports - генерація звітів
export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportType, emails, schedule } = body;

    let report;

    // Генеруємо звіт в залежності від типу
    switch (reportType) {
      case 'daily':
        report = await ReportService.generateDailyReport();
        break;

      case 'weekly':
        report = await ReportService.generateWeeklyReport();
        break;

      case 'monthly':
        report = await ReportService.generateMonthlyReport();
        break;

      default:
        return NextResponse.json(
          { error: `Невідомий тип звіту: ${reportType}` },
          { status: 400 }
        );
    }

    // Якщо вказані email адреси, відправляємо звіт
    if (emails && emails.length > 0) {
      // TODO: Відправити звіт на email
      console.log('Sending report to emails:', emails);
    }

    // Якщо вказаний розклад, налаштовуємо автоматичну генерацію
    if (schedule) {
      // TODO: Налаштувати cron job для автоматичної генерації
      console.log('Setting up schedule:', schedule);
    }

    return NextResponse.json({
      success: true,
      reportType,
      generatedAt: report.reportDate,
      summary: report.summary,
      reportId: generateReportId()
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Помилка при генерації звіту' },
      { status: 500 }
    );
  }
}

// Допоміжні функції
function getDefaultStartDate(period: string): string {
  const now = new Date();

  switch (period) {
    case 'week':
      now.setDate(now.getDate() - 7);
      break;
    case 'month':
      now.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      now.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      now.setFullYear(now.getFullYear() - 1);
      break;
    default:
      now.setMonth(now.getMonth() - 1);
  }

  return now.toISOString();
}

function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
