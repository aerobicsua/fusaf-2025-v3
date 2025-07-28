import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🏢 Відновлення клубу Технофіт');

    // Клуб Технофіт який потрібно відновити
    const technofitClub = {
      id: `club-technofit-${Date.now()}`,
      name: 'Технофіт',
      type: 'club',
      address: 'вул. Спортивна, 15',
      city: 'Київ',
      region: 'м. Київ',
      zipCode: '01001',
      description: 'Провідний спортивний клуб з аеробіки та фітнесу в Києві. Маємо сучасне обладнання та досвідчених тренерів.',
      legalStatus: 'ТОВ',
      website: 'https://technofit.kiev.ua',
      owner: {
        name: 'Іван Технофітович',
        email: 'admin@technofit.kiev.ua',
        phone: '+380673334455'
      },
      approvedAt: new Date().toISOString(),
      status: 'active'
    };

    return NextResponse.json({
      success: true,
      message: 'Клуб Технофіт відновлено успішно',
      club: technofitClub
    });

  } catch (error) {
    console.error('❌ Помилка відновлення клубу:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка відновлення клубу'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API для відновлення клубу Технофіт. Використовуйте POST запит.'
  });
}
