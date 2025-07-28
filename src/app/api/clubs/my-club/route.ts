import { NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    // Отримуємо схвалені клуби з API
    const clubsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/clubs/requests`);
    const clubsData = await clubsResponse.json();

    // Знаходимо схвалений клуб користувача
    const userClubRequest = clubsData.requests?.find((req: any) =>
      req.user.email === userEmail && req.status === 'approved'
    );

    let userClub = null;
    if (userClubRequest) {
      userClub = {
        id: `club-${userClubRequest.id}`,
        name: userClubRequest.club.name,
        type: userClubRequest.club.type,
        address: userClubRequest.club.address,
        city: userClubRequest.club.city,
        region: userClubRequest.club.region,
        zipCode: userClubRequest.club.zipCode,
        description: userClubRequest.club.description,
        legalStatus: userClubRequest.club.legalStatus,
        website: userClubRequest.club.website,
        owner: {
          name: userClubRequest.user.name,
          email: userClubRequest.user.email,
          phone: userClubRequest.user.phone
        },
        approvedAt: userClubRequest.reviewedAt || new Date().toISOString(),
        status: 'active'
      };
    }

    if (!userClub) {
      return NextResponse.json({
        success: true,
        club: null,
        message: 'Клуб не знайдено або ще не схвалений'
      });
    }

    return NextResponse.json({
      success: true,
      club: userClub
    });

  } catch (error) {
    console.error('❌ Помилка отримання інформації про клуб:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
