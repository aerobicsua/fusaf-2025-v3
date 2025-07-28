import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Валідація вхідних даних
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email та пароль обов\'язкові'
      }, { status: 400 });
    }

    console.log('🔐 Спроба логіну для:', email);

    // Знаходимо користувача в БД
    const users = await executeQuery<any>(`
      SELECT
        id, email, password_hash, name, roles,
        first_name, last_name, middle_name,
        date_of_birth, gender, phone,
        country, region, city, address, zip_code,
        club, coach, sport_category, experience, specialization,
        bio, website, social_media, achievements,
        is_public_profile, show_email, show_phone, email_notifications,
        avatar, documents,
        email_verified, membership_paid, membership_expiry_date, status,
        created_at, last_login
      FROM users
      WHERE email = ? AND status IN ('active', 'pending')
    `, [email.toLowerCase()]);

    if (users.length === 0) {
      console.log('❌ Користувача не знайдено:', email);
      return NextResponse.json({
        success: false,
        error: 'Невірний email або пароль'
      }, { status: 401 });
    }

    const user = users[0];
    console.log('✅ Користувач знайдений:', user.email);

    // Перевіряємо пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.log('❌ Невірний пароль для:', email);
      return NextResponse.json({
        success: false,
        error: 'Невірний email або пароль'
      }, { status: 401 });
    }

    console.log('✅ Пароль правильний для:', email);
    console.log('🎉 Успішний логін для:', email);

    // Оновлюємо час останнього входу
    await executeQuery(`
      UPDATE users
      SET last_login = NOW()
      WHERE id = ?
    `, [user.id]);

    // Парсимо JSON поля
    let roles = [];
    let socialMedia = { instagram: '', facebook: '', telegram: '' };
    let documents = [];

    try {
      // Обробляємо різні формати ролей
      if (typeof user.roles === 'string') {
        roles = JSON.parse(user.roles);
      } else if (Array.isArray(user.roles)) {
        roles = user.roles;
      } else {
        roles = ['user'];
      }
    } catch (e) {
      console.warn('⚠️ Помилка парсингу ролей, використовуємо default:', e);
      roles = ['user'];
    }

    try {
      socialMedia = JSON.parse(user.social_media || '{"instagram":"","facebook":"","telegram":""}');
    } catch (e) {
      console.warn('⚠️ Помилка парсингу соціальних мереж:', e);
    }

    try {
      documents = JSON.parse(user.documents || '[]');
    } catch (e) {
      console.warn('⚠️ Помилка парсингу документів:', e);
    }

    // Формуємо відповідь без пароля
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: roles,
      createdAt: user.created_at,
      lastLogin: new Date().toISOString(),
      emailVerified: user.email_verified,

      // Розширена інформація профілю
      profile: {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        middleName: user.middle_name || '',
        dateOfBirth: user.date_of_birth || '',
        gender: user.gender || '',
        phone: user.phone || '',

        // Адреса
        country: user.country || 'Україна',
        region: user.region || '',
        city: user.city || '',
        address: user.address || '',
        zipCode: user.zip_code || '',

        // Спортивна інформація
        club: user.club || '',
        coach: user.coach || '',
        sportCategory: user.sport_category || '',
        experience: user.experience || '',
        specialization: user.specialization || '',

        // Особиста інформація
        bio: user.bio || '',
        website: user.website || '',
        socialMedia: socialMedia,

        // Досягнення
        achievements: user.achievements || '',
        competitions: [], // TODO: завантажувати з окремої таблиці

        // Налаштування
        isPublicProfile: user.is_public_profile || false,
        showEmail: user.show_email || false,
        showPhone: user.show_phone || false,
        emailNotifications: user.email_notifications !== false,

        // Файли
        avatar: user.avatar || '',
        documents: documents
      }
    };

    console.log('🎉 Успішний логін для:', email);

    return NextResponse.json({
      success: true,
      message: 'Успішний вхід в систему',
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Помилка логіну:', error);

    return NextResponse.json({
      success: false,
      error: 'Внутрішня помилка сервера',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
