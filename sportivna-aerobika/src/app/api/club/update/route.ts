import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const { clubId, updatedBy, clubData } = await request.json();

    if (!clubId || !updatedBy || !clubData) {
      return NextResponse.json({
        success: false,
        error: 'Дані клубу, ID клубу та email користувача обов\'язкові'
      }, { status: 400 });
    }

    console.log(`🏢 Оновлення клубу: ${clubData.name} користувачем: ${updatedBy}`);

    // Перевіряємо чи користувач є власником клубу
    const verification = await executeQuery(`
      SELECT id, name, email, club, roles
      FROM users
      WHERE email = ? AND club = ? AND roles LIKE '%club_owner%'
      LIMIT 1
    `, [updatedBy, clubData.name]);

    if (verification.length === 0) {
      console.warn(`⚠️ Користувач ${updatedBy} не є власником клубу ${clubData.name}`);
      return NextResponse.json({
        success: false,
        error: 'У вас немає прав для редагування цього клубу'
      }, { status: 403 });
    }

    console.log(`✅ Користувач ${updatedBy} підтверджений як власник клубу`);

    // Спробуємо оновити в таблиці clubs (якщо вона існує)
    try {
      const updateResult = await executeQuery(`
        UPDATE clubs
        SET
          name = ?,
          description = ?,
          address = ?,
          phone = ?,
          email = ?,
          website = ?,
          achievements = ?,
          founded = ?,
          avatar = ?,
          updated_at = NOW()
        WHERE id = ? AND owner_id = ?
      `, [
        clubData.name,
        clubData.description || '',
        clubData.address || '',
        clubData.phone || '',
        clubData.email || '',
        clubData.website || '',
        clubData.achievements || clubData.experience || '', // Підтримуємо обидва поля
        clubData.founded || null,
        clubData.avatar || '',
        clubId,
        updatedBy
      ]);

      if (Array.isArray(updateResult) && updateResult.length > 0) {
        console.log(`✅ Клуб оновлено в таблиці clubs`);
        return NextResponse.json({
          success: true,
          message: 'Інформацію про клуб успішно оновлено'
        });
      }
    } catch (clubTableError) {
      console.warn('⚠️ Таблиця clubs не існує або помилка оновлення, створюємо запис');
    }

    // Якщо таблиці clubs немає, створимо її та запис
    try {
      // Спочатку видаляємо стару таблицю з неповною схемою
      try {
        await executeQuery(`DROP TABLE IF EXISTS clubs`);
        console.log('🗑️ Стара таблиця clubs видалена');
      } catch (dropError) {
        console.warn('⚠️ Помилка видалення таблиці:', dropError);
      }

      // Створюємо таблицю clubs з повною схемою включаючи медіа-файли
      await executeQuery(`
        CREATE TABLE clubs (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          address VARCHAR(500),
          phone VARCHAR(20),
          email VARCHAR(255),
          website VARCHAR(255),
          founded DATE,
          avatar LONGTEXT,
          owner_id VARCHAR(255) NOT NULL,
          owner_name VARCHAR(255),
          members_count INT DEFAULT 0,
          achievements TEXT,
          media_files LONGTEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Додаємо поле media_files до існуючої таблиці (якщо потрібно)
      try {
        await executeQuery(`ALTER TABLE clubs ADD COLUMN media_files LONGTEXT`);
        console.log('✅ Поле media_files додано до таблиці clubs');
      } catch (alterError) {
        console.log('ℹ️ Поле media_files вже існує або помилка:', alterError);
      }

      console.log('✅ Таблиця clubs створена або вже існує');

      // Вставляємо або оновлюємо запис клубу
      await executeQuery(`
        INSERT INTO clubs (
          id, name, description, address, phone, email, website,
          owner_id, owner_name, achievements, founded, avatar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          address = VALUES(address),
          phone = VALUES(phone),
          email = VALUES(email),
          website = VALUES(website),
          achievements = VALUES(achievements),
          founded = VALUES(founded),
          avatar = VALUES(avatar),
          updated_at = NOW()
      `, [
        clubId,
        clubData.name,
        clubData.description || '',
        clubData.address || '',
        clubData.phone || '',
        clubData.email || '',
        clubData.website || '',
        updatedBy,
        verification[0].name,
        clubData.achievements || clubData.experience || '', // Підтримуємо обидва поля
        clubData.founded || null,
        clubData.avatar || ''
      ]);

      // Оновлюємо кількість членів
      const memberCount = await executeQuery(`
        SELECT COUNT(*) as count
        FROM users
        WHERE club = ?
      `, [clubData.name]);

      await executeQuery(`
        UPDATE clubs
        SET members_count = ?
        WHERE id = ?
      `, [memberCount[0]?.count || 0, clubId]);

      console.log(`✅ Клуб збережено в таблиці clubs`);

      return NextResponse.json({
        success: true,
        message: 'Інформацію про клуб успішно оновлено'
      });

    } catch (createError) {
      console.error('❌ Помилка створення таблиці clubs:', createError);
      return NextResponse.json({
        success: false,
        error: 'Помилка збереження інформації про клуб'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Помилка оновлення клубу:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка сервера при оновленні клубу',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
