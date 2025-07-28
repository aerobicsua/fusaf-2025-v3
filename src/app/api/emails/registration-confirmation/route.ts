import { type NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Перевіряємо авторизацію
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      userEmail,
      userName,
      competitionTitle,
      competitionDate,
      competitionLocation,
      requiresPayment,
      entryFee
    } = await request.json();

    // Валідація даних
    if (!userEmail || !userName || !competitionTitle || !competitionDate || !competitionLocation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Відправляємо email
    await EmailService.sendRegistrationConfirmation(userEmail, {
      participantName: userName,
      competitionTitle,
      competitionDate,
      competitionTime: '10:00',
      location: competitionLocation,
      address: competitionLocation,
      category: 'індивідуальна',
      ageGroup: '18+',
      contactPerson: 'Адміністратор (+380441234567)',
      competitionUrl: 'https://fusaf.org.ua/competitions',
      dashboardUrl: 'https://fusaf.org.ua/dashboard'
    });

    return NextResponse.json({
      success: true,
      message: 'Registration confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error sending registration confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
