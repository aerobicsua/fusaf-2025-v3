import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;
    console.log(`🏢 GET /api/clubs/${clubId} - завантаження з MySQL...`);

    // Отримуємо клуб з MySQL
    const clubs = await executeQuery(`
      SELECT
        c.id,
        c.name,
        c.full_name,
        c.address,
        c.city,
        c.region,
        c.description,
        c.legal_status as legalStatus,
        c.website,
        c.status,
        c.created_at as approvedAt,
        u.name as ownerName,
        u.email as ownerEmail,
        u.phone as ownerPhone
      FROM clubs c
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.id = ? AND c.status = 'active'
      LIMIT 1
    `, [clubId]);

    if (clubs.length === 0) {
      console.log(`❌ Клуб ${clubId} не знайдено в MySQL`);
      return NextResponse.json({
        success: false,
        error: 'Клуб не знайдено'
      }, { status: 404 });
    }

    const club = clubs[0];

    // Форматуємо дані для фронтенду
    const formattedClub = {
      id: club.id,
      name: club.name,
      type: 'club', // Значення за замовчуванням
      address: club.address || '',
      city: club.city || '',
      region: club.region || '',
      description: club.description || '',
      legalStatus: club.legalStatus || '',
      website: club.website || '',
      owner: {
        name: club.ownerName || '',
        email: club.ownerEmail || '',
        phone: club.ownerPhone || ''
      },
      approvedAt: club.approvedAt,
      status: club.status
    };

    console.log(`✅ Клуб ${clubId} завантажено з MySQL`);

    return NextResponse.json({
      success: true,
      club: formattedClub
    });

  } catch (error) {
    console.error('❌ Помилка отримання клубу:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження клубу з бази даних',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
