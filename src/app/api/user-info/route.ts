import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email параметр обов\'язковий'
      }, { status: 400 });
    }

    console.log(`👤 Завантаження повного профілю користувача: ${email}`);

    // Отримуємо користувача з MySQL з усіма полями профілю
    const users = await executeQuery(`
      SELECT
        id, email, name, first_name, last_name, middle_name,
        date_of_birth, gender, roles, phone, country, region, city, address, zip_code,
        club, coach, sport_category, experience, specialization,
        bio, website, social_media, achievements,
        is_public_profile, show_email, show_phone, email_notifications,
        avatar, documents, status, created_at, updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `, [email]);

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Користувач не знайдений'
      }, { status: 404 });
    }

    const user = users[0];

    console.log(`✅ Повний профіль користувача завантажено:`, {
      name: user.name,
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      date_of_birth: user.date_of_birth,
      club: user.club,
      coach: user.coach,
      social_media: user.social_media,
      achievements: user.achievements ? user.achievements.substring(0, 50) + '...' : null
    });

    // Парсимо JSON поля
    let socialMedia = {};
    if (user.social_media) {
      try {
        socialMedia = typeof user.social_media === 'string'
          ? JSON.parse(user.social_media)
          : user.social_media;
      } catch (e) {
        console.warn('⚠️ Помилка парсингу social_media:', e);
        socialMedia = {};
      }
    }

    let documents = [];
    let competitions = [];
    if (user.documents) {
      try {
        const parsedDocs = typeof user.documents === 'string'
          ? JSON.parse(user.documents)
          : user.documents;

        // Підтримуємо як старий формат (масив), так і новий (об'єкт з competitions)
        if (Array.isArray(parsedDocs)) {
          documents = parsedDocs;
          competitions = [];
        } else if (parsedDocs && typeof parsedDocs === 'object') {
          documents = parsedDocs.files || [];
          competitions = parsedDocs.competitions || [];
        }
      } catch (e) {
        console.warn('⚠️ Помилка парсингу documents:', e);
        documents = [];
        competitions = [];
      }
    }

    let roles = [];
    if (user.roles) {
      try {
        roles = typeof user.roles === 'string'
          ? user.roles.startsWith('[')
            ? JSON.parse(user.roles)
            : [user.roles.replace(/"/g, '')]
          : Array.isArray(user.roles)
            ? user.roles
            : [user.roles];
      } catch (e) {
        console.warn('⚠️ Помилка парсингу roles:', e);
        roles = [];
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,

        // Основні дані
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        roles: roles,
        phone: user.phone,

        // Адреса
        country: user.country || 'Україна',
        region: user.region,
        city: user.city,
        address: user.address,
        zip_code: user.zip_code,

        // Спортивна інформація
        club: user.club,
        coach: user.coach,
        sport_category: user.sport_category,
        experience: user.experience,
        specialization: user.specialization,

        // Особиста інформація
        bio: user.bio,
        website: user.website,
        social_media: socialMedia,
        achievements: user.achievements,

        // Налаштування приватності
        is_public_profile: Boolean(user.is_public_profile),
        show_email: Boolean(user.show_email),
        show_phone: Boolean(user.show_phone),
        email_notifications: Boolean(user.email_notifications),

        // Файли
        avatar: user.avatar,
        documents: documents,
        competitions: competitions,

        // Системні поля
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Помилка отримання повного профілю користувача:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження користувача',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
