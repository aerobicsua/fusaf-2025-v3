import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubName: string }> }
) {
  try {
    const resolvedParams = await params;
    const clubName = decodeURIComponent(resolvedParams.clubName);
    console.log(`👨‍🏫 Завантаження тренерів клубу: ${clubName}`);

    // Отримуємо тренерів цього клубу
    const coaches = await executeQuery(`
      SELECT
        id, name, email, phone, avatar,
        first_name, last_name, middle_name,
        bio, specialization, experience, sport_category,
        created_at, updated_at
      FROM users
      WHERE club = ?
        AND roles LIKE '%coach%'
        AND status = 'active'
      ORDER BY name ASC
    `, [clubName]);

    console.log(`✅ Знайдено ${coaches.length} тренерів для клубу "${clubName}"`);

    // Форматуємо дані тренерів
    const formattedCoaches = coaches.map((coach: any) => ({
      id: coach.id,
      name: coach.name,
      firstName: coach.first_name || '',
      lastName: coach.last_name || '',
      middleName: coach.middle_name || '',
      email: coach.email,
      phone: coach.phone || '',
      avatar: coach.avatar || '',
      bio: coach.bio || '',
      specialization: coach.specialization || '',
      experience: coach.experience || '',
      sportCategory: coach.sport_category || '',
      profileUrl: `/membership/athletes/${coach.id}`, // URL для переходу в профіль
      joinedAt: coach.created_at
    }));

    return NextResponse.json({
      success: true,
      coaches: formattedCoaches,
      total: formattedCoaches.length,
      clubName: clubName
    });

  } catch (error) {
    console.error('❌ Помилка отримання тренерів клубу:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Помилка завантаження тренерів клубу',
        details: error instanceof Error ? error.message : 'Невідома помилка'
      },
      { status: 500 }
    );
  }
}
