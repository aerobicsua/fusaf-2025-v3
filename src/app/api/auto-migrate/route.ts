import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    console.log('🚀 АВТОМАТИЧНА МІГРАЦІЯ: Початок перенесення даних в MySQL...');

    // Симулюємо дані з localStorage на основі того що бачимо в консолі
    const clubsFromLocalStorage = [
      {
        id: 'club-1753343509330',
        name: 'Фітнес-клуб "ТехноФіт"',
        type: 'club',
        address: 'Симоненка 3в',
        city: 'Вишгород',
        region: 'Київська область',
        zipCode: '07301',
        description: '',
        legalStatus: 'ПП',
        website: 'https://technofit.com.ua',
        owner: {
          name: 'Федосенко Андрій Вікторович',
          email: 'andfedos@gmail.com',
          phone: '+380504109083'
        },
        approvedAt: '2025-07-24T07:51:49.330Z',
        status: 'active'
      }
    ];

    console.log(`📊 Мігруємо ${clubsFromLocalStorage.length} клубів...`);

    let migratedCount = 0;

    for (const club of clubsFromLocalStorage) {
      try {
        console.log(`🏢 Обробка клубу: ${club.name}`);

        // Перевіряємо чи клуб вже існує
        const existingClubs = await executeQuery(`
          SELECT id FROM clubs WHERE name = ? LIMIT 1
        `, [club.name]);

        if (existingClubs.length > 0) {
          console.log(`⏭️ Клуб "${club.name}" вже існує, оновлюємо...`);

          // Оновлюємо існуючий клуб
          await executeQuery(`
            UPDATE clubs SET
              full_name = ?, address = ?, city = ?, region = ?,
              description = ?, legal_status = ?, website = ?,
              email = ?, phone = ?, status = ?, updated_at = NOW()
            WHERE name = ?
          `, [
            club.name,
            club.address,
            club.city,
            club.region,
            club.description,
            club.legalStatus,
            club.website,
            club.owner.email,
            club.owner.phone,
            'active',
            club.name
          ]);

          migratedCount++;
          continue;
        }

        // Шукаємо власника за email
        let ownerId = null;
        if (club.owner?.email) {
          const ownerUsers = await executeQuery(`
            SELECT id FROM users WHERE email = ? LIMIT 1
          `, [club.owner.email]);

          if (ownerUsers.length > 0) {
            ownerId = ownerUsers[0].id;
            console.log(`👤 Знайдено власника в БД: ${club.owner.email}`);
          }
        }

        // Якщо власника немає, створюємо
        if (!ownerId) {
          console.log(`👤 Створюємо власника: ${club.owner.name}`);
          ownerId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          await executeQuery(`
            INSERT INTO users (
              id, email, password_hash, name, first_name, last_name,
              roles, phone, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            ownerId,
            club.owner.email,
            '$2b$10$8O8KvK8GvK8GvK8GvK8GvOt6wX8wX8wX8wX8wX8wX8wX8wX8wX8w.',
            club.owner.name,
            'Андрій', // З даних форми
            'Федосенко', // З даних форми
            JSON.stringify(['club_owner']),
            club.owner.phone,
            'active'
          ]);

          console.log(`✅ Власник створений: ${ownerId}`);
        }

        // Створюємо клуб відповідно до реальної схеми БД
        await executeQuery(`
          INSERT INTO clubs (
            id, name, full_name, address, city, region,
            description, legal_status, website, email, phone,
            owner_id, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          club.id,
          club.name,
          club.name, // full_name = name
          club.address,
          club.city,
          club.region,
          club.description,
          club.legalStatus,
          club.website,
          club.owner.email, // email клубу
          club.owner.phone, // phone клубу
          ownerId,
          'active'
        ]);

        console.log(`✅ Клуб створений: ${club.name} (ID: ${club.id})`);
        migratedCount++;

      } catch (clubError) {
        console.error(`❌ Помилка міграції клубу "${club.name}":`, clubError);
      }
    }

    // Перевіряємо результат
    const totalClubs = await executeQuery(`
      SELECT COUNT(*) as total FROM clubs WHERE status = 'active'
    `);

    const totalUsers = await executeQuery(`
      SELECT COUNT(*) as total FROM users WHERE JSON_CONTAINS(roles, '"club_owner"')
    `);

    const clubCount = totalClubs[0]?.total || 0;
    const userCount = totalUsers[0]?.total || 0;

    console.log(`🎉 МІГРАЦІЯ ЗАВЕРШЕНА:`);
    console.log(`✅ Мігровано клубів: ${migratedCount}`);
    console.log(`📊 Всього клубів в MySQL: ${clubCount}`);
    console.log(`👥 Власників клубів в MySQL: ${userCount}`);

    return NextResponse.json({
      success: true,
      message: 'Автоматична міграція завершена успішно',
      results: {
        migratedClubs: migratedCount,
        totalClubsInDatabase: clubCount,
        totalClubOwnersInDatabase: userCount
      }
    });

  } catch (error) {
    console.error('❌ КРИТИЧНА ПОМИЛКА МІГРАЦІЇ:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка автоматичної міграції',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
