import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubName: string }> }
) {
  try {
    const resolvedParams = await params;
    const clubName = decodeURIComponent(resolvedParams.clubName);
    console.log(`🏃‍♂️ Завантаження спортсменів клубу: ${clubName}`);

    // Отримуємо спортсменів цього клубу
    const athletes = await executeQuery(`
      SELECT
        id, name, email, phone, avatar,
        first_name, last_name, middle_name,
        bio, sport_category, experience, specialization,
        achievements, coach, created_at, updated_at
      FROM users
      WHERE club = ?
        AND (roles LIKE '%athlete%' OR roles = 'athlete')
        AND status = 'active'
      ORDER BY name ASC
    `, [clubName]);

    console.log(`✅ Знайдено ${athletes.length} спортсменів для клубу "${clubName}"`);

    // Форматуємо дані спортсменів
    const formattedAthletes = athletes.map((athlete: any) => ({
      id: athlete.id,
      name: athlete.name,
      firstName: athlete.first_name || '',
      lastName: athlete.last_name || '',
      middleName: athlete.middle_name || '',
      email: athlete.email,
      phone: athlete.phone || '',
      avatar: athlete.avatar || '',
      bio: athlete.bio || '',
      sportCategory: athlete.sport_category || '',
      experience: athlete.experience || '',
      specialization: athlete.specialization || '',
      achievements: athlete.achievements || '',
      coach: athlete.coach || '',
      profileUrl: `/membership/athletes/${athlete.id}`, // URL для переходу в профіль
      joinedAt: athlete.created_at
    }));

    return NextResponse.json({
      success: true,
      athletes: formattedAthletes,
      total: formattedAthletes.length,
      clubName: clubName
    });

  } catch (error) {
    console.error('❌ Помилка отримання спортсменів клубу:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Помилка завантаження спортсменів клубу',
        details: error instanceof Error ? error.message : 'Невідома помилка'
      },
      { status: 500 }
    );
  }
}
