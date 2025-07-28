import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubName = searchParams.get('name');

    if (!clubName) {
      return NextResponse.json({
        success: false,
        error: 'Назва клубу обов\'язкова'
      }, { status: 400 });
    }

    console.log(`🏢 Пошук інформації про клуб: ${clubName}`);

    // Спочатку спробуємо знайти клуб в таблиці clubs (якщо вона існує)
    try {
      const clubs = await executeQuery(`
        SELECT
          id, name, description, address, phone, email, website,
          founded, avatar, owner_id, owner_name, members_count, achievements,
          is_active, created_at, updated_at
        FROM clubs
        WHERE name = ?
        LIMIT 1
      `, [clubName]);

      if (clubs.length > 0) {
        const club = clubs[0];
        console.log('✅ Клуб знайдено в таблиці clubs:', club.name);

        return NextResponse.json({
          success: true,
          club: {
            id: club.id,
            name: club.name,
            description: club.description || '',
            address: club.address || '',
            phone: club.phone || '',
            email: club.email || '',
            website: club.website || '',
            founded: club.founded || new Date().toISOString(),
            avatar: club.avatar || '',
            ownerId: club.owner_id,
            ownerName: club.owner_name || 'Невідомо',
            membersCount: club.members_count || 0,
            achievements: club.achievements || '',
            isActive: Boolean(club.is_active),
            created_at: club.created_at,
            updated_at: club.updated_at
          }
        });
      }
    } catch (clubTableError) {
      console.warn('⚠️ Таблиця clubs не існує або помилка доступу, шукаємо в users');
    }

    // Якщо таблиці clubs немає, шукаємо в таблиці users
    const users = await executeQuery(`
      SELECT
        id, name, email, club, created_at, updated_at
      FROM users
      WHERE club = ? AND roles LIKE '%club_owner%'
      LIMIT 1
    `, [clubName]);

    if (users.length > 0) {
      const owner = users[0];
      console.log('✅ Власник клубу знайдений в таблиці users:', owner.name);

      // Рахуємо кількість членів клубу
      const memberCountResult = await executeQuery(`
        SELECT COUNT(*) as count
        FROM users
        WHERE club = ?
      `, [clubName]);

      const membersCount = memberCountResult[0]?.count || 0;

      return NextResponse.json({
        success: true,
        club: {
          id: `club_${clubName.replace(/\s+/g, '_')}`,
          name: clubName,
          description: `Спортивний клуб "${clubName}" - частина Федерації України зі Спортивної Аеробіки і Фітнесу`,
          address: '',
          phone: '',
          email: owner.email,
          website: '',
          founded: owner.created_at,
          ownerId: owner.email,
          ownerName: owner.name,
          membersCount: membersCount,
          achievements: '', // Мапимо experience -> achievements для відображення
          isActive: true,
          created_at: owner.created_at,
          updated_at: owner.updated_at
        }
      });
    }

    // Клуб не знайдено
    console.warn(`⚠️ Клуб "${clubName}" не знайдено`);
    return NextResponse.json({
      success: false,
      error: 'Клуб не знайдено'
    }, { status: 404 });

  } catch (error) {
    console.error('❌ Помилка отримання інформації про клуб:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка сервера при отриманні інформації про клуб',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
