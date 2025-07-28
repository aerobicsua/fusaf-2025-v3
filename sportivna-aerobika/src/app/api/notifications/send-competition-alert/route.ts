import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { sendEmail, EmailType } from '@/lib/email';

// Симуляція бази даних підписок (має бути синхронізована з іншими API)
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    // Перевіряємо права - тільки власники клубів та адміни можуть викликати цей API
    const canSendNotifications = session.user.roles?.some((role: string) =>
      ['admin', 'club_owner'].includes(role)
    );

    if (!canSendNotifications) {
      return NextResponse.json({
        success: false,
        error: 'Недостатньо прав для відправки сповіщень'
      }, { status: 403 });
    }

    const { competition } = await request.json();

    if (!competition) {
      return NextResponse.json({
        success: false,
        error: 'Дані змагання не надано'
      }, { status: 400 });
    }

    // Отримуємо всіх підписників, які хочуть отримувати сповіщення про нові змагання
    const subscribersToNotify = Array.from(subscriptions.values()).filter(
      sub => sub.settings.newCompetitions && sub.settings.emailFrequency === 'immediate'
    );

    console.log(`📧 Відправка сповіщень про нове змагання "${competition.title}" для ${subscribersToNotify.length} підписників`);

    // Симуляція відправки email-ів
    const emailResults = [];

    for (const subscriber of subscribersToNotify) {
      try {
        // В реальній системі тут би була інтеграція з email-сервісом
        const emailResult = await sendEmailSimulation({
          to: subscriber.email,
          subject: `🏆 Нове змагання: ${competition.title}`,
          template: 'newCompetition',
          data: {
            competitionTitle: competition.title,
            competitionDate: competition.date,
            competitionLocation: competition.location,
            registrationDeadline: competition.registration_deadline,
            organizingClub: competition.organizing_club,
            competitionUrl: `${process.env.NEXTAUTH_URL}/competitions`,
            unsubscribeUrl: `${process.env.NEXTAUTH_URL}/api/notifications/unsubscribe`
          }
        });

        emailResults.push({
          email: subscriber.email,
          success: emailResult.success,
          error: emailResult.error
        });

      } catch (error) {
        emailResults.push({
          email: subscriber.email,
          success: false,
          error: error instanceof Error ? error.message : 'Невідома помилка'
        });
      }
    }

    const successCount = emailResults.filter(result => result.success).length;
    const failureCount = emailResults.filter(result => !result.success).length;

    return NextResponse.json({
      success: true,
      message: `Сповіщення надіслано: ${successCount} успішно, ${failureCount} помилок`,
      stats: {
        totalSubscribers: subscribersToNotify.length,
        successCount,
        failureCount,
        results: emailResults
      },
      competition: {
        id: competition.id,
        title: competition.title,
        date: competition.date
      }
    });

  } catch (error) {
    console.error('Помилка відправки сповіщень про змагання:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}

// Симуляція відправки email
async function sendEmailSimulation(emailData: {
  to: string;
  subject: string;
  template: string;
  data: any;
}): Promise<{ success: boolean; error?: string }> {

  // Логування email для демонстрації
  console.log('📧 Відправка email:', {
    to: emailData.to,
    subject: emailData.subject,
    template: emailData.template,
    timestamp: new Date().toISOString()
  });

  // Симуляція затримки відправки
  await new Promise(resolve => setTimeout(resolve, 100));

  // Симуляція успішної відправки (95% успіху)
  if (Math.random() > 0.05) {
    return { success: true };
  } else {
    return {
      success: false,
      error: 'Симуляція помилки відправки email'
    };
  }
}
