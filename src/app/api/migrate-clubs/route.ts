import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Міграція клубів з localStorage в MySQL...');

    const { clubs } = await request.json();

    if (!clubs || !Array.isArray(clubs)) {
      return NextResponse.json({
        success: false,
        error: 'Список клубів не надіслано або невірний формат'
      }, { status: 400 });
    }

    console.log(`📊 Отримано ${clubs.length} клубів для міграції`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const club of clubs) {
      try {
        console.log(`🏢 Обробка клубу: ${club.name}`);

        // Перевіряємо чи клуб вже існує в MySQL
        const existingClubs = await executeQuery(`
          SELECT id FROM clubs WHERE name = ? LIMIT 1
        `, [club.name]);

        if (existingClubs.length > 0) {
          console.log(`⏭️ Клуб "${club.name}" вже існує в MySQL, пропускаємо`);
          skippedCount++;
          continue;
        }

        // Знаходимо власника клубу за email
        let ownerId = null;
        if (club.owner?.email) {
          const ownerUsers = await executeQuery(`
            SELECT id FROM users WHERE email = ? LIMIT 1
          `, [club.owner.email]);

          if (ownerUsers.length > 0) {
            ownerId = ownerUsers[0].id;
          }
        }

        // Якщо власника не знайдено, створюємо тимчасового
        if (!ownerId) {
          console.log(`👤 Створюємо тимчасового власника для клубу "${club.name}"`);
          ownerId = `user-migrated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          await executeQuery(`
            INSERT INTO users (
              id, email, password_hash, name, roles, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
          `, [
            ownerId,
            club.owner?.email || `owner-${club.id}@migrated.fusaf`,
            '$2b$10$dummy.hash.for.migrated.user', // Dummy hash
            club.owner?.name || 'Мігрований власник',
            JSON.stringify(['club_owner']),
            'active'
          ]);
        }

        // Створюємо клуб в MySQL
        const clubId = club.id || `club-migrated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await executeQuery(`
          INSERT INTO clubs (
            id, name, type, address, city, region, zip_code,
            description, legal_status, website, owner_id,
            status, approved_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          clubId,
          club.name || 'Мігрований клуб',
          club.type || 'club',
          club.address || '',
          club.city || '',
          club.region || '',
          club.zipCode || '',
          club.description || '',
          club.legalStatus || '',
          club.website || null,
          ownerId,
          'active',
          club.approvedAt || new Date().toISOString()
        ]);

        console.log(`✅ Клуб "${club.name}" успішно мігровано з ID: ${clubId}`);
        migratedCount++;

      } catch (clubError) {
        console.error(`❌ Помилка міграції клубу "${club.name}":`, clubError);
        errorCount++;
      }
    }

    // Отримуємо загальну кількість клубів після міграції
    const countResult = await executeQuery(`
      SELECT COUNT(*) as total FROM clubs WHERE status = 'active'
    `);
    const totalClubs = countResult[0]?.total || 0;

    console.log(`🎉 Міграція завершена:`);
    console.log(`✅ Мігровано: ${migratedCount} клубів`);
    console.log(`⏭️ Пропущено: ${skippedCount} клубів`);
    console.log(`❌ Помилок: ${errorCount} клубів`);
    console.log(`📊 Загалом клубів в MySQL: ${totalClubs}`);

    return NextResponse.json({
      success: true,
      message: 'Міграція клубів завершена',
      results: {
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount,
        totalClubsInDatabase: totalClubs
      }
    });

  } catch (error) {
    console.error('❌ Критична помилка міграції:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка міграції клубів',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// GET для отримання інструкцій з міграції
export async function GET() {
  return NextResponse.json({
    description: 'API для міграції клубів з localStorage в MySQL',
    usage: 'POST з масивом клубів у форматі { clubs: [...] }',
    example: {
      method: 'POST',
      body: {
        clubs: [
          {
            id: 'club-123',
            name: 'Назва клубу',
            type: 'club',
            address: 'Адреса',
            city: 'Місто',
            region: 'Область',
            zipCode: '12345',
            description: 'Опис',
            legalStatus: 'ТОВ',
            website: 'https://site.com',
            owner: {
              name: 'Ім\'я власника',
              email: 'email@example.com',
              phone: '+380501234567'
            },
            approvedAt: '2025-01-24T...',
            status: 'active'
          }
        ]
      }
    }
  });
}
