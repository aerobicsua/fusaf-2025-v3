import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Helper функції для парсингу адреси
function extractCityFromAddress(address: string): string {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim());
  return parts[0] || '';
}

function extractRegionFromAddress(address: string): string {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim());
  return parts[1] || '';
}

export async function GET() {
  try {
    console.log('🏢 GET /api/clubs/approved - завантаження з MySQL...');

    // Спочатку пробуємо нову таблицю clubs
    try {
      const clubs = await executeQuery(`
        SELECT
          c.id,
          c.name,
          c.description,
          c.address,
          c.phone,
          c.email,
          c.website,
          c.founded,
          c.avatar,
          c.owner_id,
          c.owner_name,
          c.members_count,
          c.achievements,
          c.is_active,
          c.created_at,
          c.updated_at
        FROM clubs c
        WHERE c.is_active = true
        ORDER BY c.created_at DESC
      `);

      if (clubs.length > 0) {
        console.log(`✅ Завантажено ${clubs.length} схвалених клубів з нової таблиці clubs`);
        console.log('🔍 Перший клуб:', clubs[0]);

        // Форматуємо дані для фронтенду
        const formattedClubs = clubs.map((club: any) => {
          console.log('🔄 Форматуємо клуб:', club.name);
          try {
            const result = {
              id: club.id,
              name: club.name,
              type: 'club',
              address: club.address || '',
              city: extractCityFromAddress(club.address || ''),
              region: extractRegionFromAddress(club.address || ''),
              zipCode: '',
              description: club.description || '',
              legalStatus: 'active',
              website: club.website || '',
              founded: club.founded || club.created_at, // Дата заснування
              avatar: club.avatar || '', // Аватар клубу
              owner: {
                name: club.owner_name || '',
                email: club.owner_id || '',
                phone: club.phone || ''
              },
              approvedAt: club.created_at,
              status: club.is_active ? 'active' : 'inactive'
            };
            console.log('✅ Клуб сформатовано:', result.name);
            return result;
          } catch (formatError) {
            console.error('❌ Помилка форматування клубу:', formatError);
            throw formatError;
          }
        });

        console.log('✅ Форматування завершено, повертаємо результат');
        return NextResponse.json({
          success: true,
          clubs: formattedClubs,
          total: formattedClubs.length,
          timestamp: new Date().toISOString()
        });
      }
    } catch (newTableError) {
      console.warn('⚠️ Нова таблиця clubs недоступна, пробуємо fallback');
    }

    // Fallback до старої логіки через таблицю users
    const clubOwners = await executeQuery(`
      SELECT
        id,
        name,
        email,
        phone,
        club,
        roles,
        city,
        region,
        address,
        website,
        created_at,
        status
      FROM users
      WHERE roles LIKE '%club_owner%' AND status = 'approved'
      ORDER BY created_at DESC
    `);

    console.log(`✅ Завантажено ${clubOwners.length} схвалених клубів з fallback (users)`);

    // Форматуємо дані для фронтенду
    const formattedClubs = clubOwners.map((owner: any) => ({
      id: owner.id,
      name: owner.club || `Клуб ${owner.name}`,
      type: 'club',
      address: owner.address || '',
      city: owner.city || '',
      region: owner.region || '',
      zipCode: '',
      description: `Спортивний клуб під керівництвом ${owner.name}`,
      legalStatus: 'active',
      website: owner.website || '',
      owner: {
        name: owner.name,
        email: owner.email,
        phone: owner.phone || ''
      },
      approvedAt: owner.created_at,
      status: 'active'
    }));

    return NextResponse.json({
      success: true,
      clubs: formattedClubs,
      total: formattedClubs.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Помилка отримання схвалених клубів з MySQL:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Помилка завантаження клубів з бази даних',
        details: error instanceof Error ? error.message : 'Невідома помилка'
      },
      { status: 500 }
    );
  }
}
