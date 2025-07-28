import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    // TODO: В реальному додатку тут би була перевірка JWT токена
    // Поки що повертаємо помилку, оскільки профіль завантажується через логін

    return NextResponse.json({
      success: false,
      error: 'Користувач не авторизований'
    }, { status: 401 });

  } catch (error) {
    console.error('❌ Помилка отримання профілю:', error);

    return NextResponse.json({
      success: false,
      error: 'Внутрішня помилка сервера'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json();
    const { userId, profile, name } = updateData;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ID користувача обов\'язковий'
      }, { status: 400 });
    }

    console.log('📝 Оновлення профілю для користувача:', userId);

    // Перевіряємо чи користувач існує
    const users = await executeQuery<any>(`
      SELECT id, email FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Користувача не знайдено'
      }, { status: 404 });
    }

    console.log('✅ Користувач знайдений:', users[0].email);

    // Підготовка даних для оновлення
    const updateFields = [];
    const updateValues = [];

    // Основні дані
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (profile) {
      // Особисті дані
      if (profile.firstName !== undefined) {
        updateFields.push('first_name = ?');
        updateValues.push(profile.firstName);
      }
      if (profile.lastName !== undefined) {
        updateFields.push('last_name = ?');
        updateValues.push(profile.lastName);
      }
      if (profile.middleName !== undefined) {
        updateFields.push('middle_name = ?');
        updateValues.push(profile.middleName);
      }
      if (profile.dateOfBirth !== undefined) {
        updateFields.push('date_of_birth = ?');
        updateValues.push(profile.dateOfBirth || null);
      }
      if (profile.gender !== undefined) {
        updateFields.push('gender = ?');
        updateValues.push(profile.gender || null);
      }
      if (profile.phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(profile.phone);
      }

      // Адреса
      if (profile.country !== undefined) {
        updateFields.push('country = ?');
        updateValues.push(profile.country);
      }
      if (profile.region !== undefined) {
        updateFields.push('region = ?');
        updateValues.push(profile.region);
      }
      if (profile.city !== undefined) {
        updateFields.push('city = ?');
        updateValues.push(profile.city);
      }
      if (profile.address !== undefined) {
        updateFields.push('address = ?');
        updateValues.push(profile.address);
      }
      if (profile.zipCode !== undefined) {
        updateFields.push('zip_code = ?');
        updateValues.push(profile.zipCode);
      }

      // Спортивна інформація
      if (profile.club !== undefined) {
        updateFields.push('club = ?');
        updateValues.push(profile.club);
      }
      if (profile.coach !== undefined) {
        updateFields.push('coach = ?');
        updateValues.push(profile.coach);
      }
      if (profile.sportCategory !== undefined) {
        updateFields.push('sport_category = ?');
        updateValues.push(profile.sportCategory);
      }
      if (profile.experience !== undefined) {
        updateFields.push('experience = ?');
        updateValues.push(profile.experience);
      }
      if (profile.specialization !== undefined) {
        updateFields.push('specialization = ?');
        updateValues.push(profile.specialization);
      }

      // Особиста інформація
      if (profile.bio !== undefined) {
        updateFields.push('bio = ?');
        updateValues.push(profile.bio);
      }
      if (profile.website !== undefined) {
        updateFields.push('website = ?');
        updateValues.push(profile.website);
      }
      if (profile.achievements !== undefined) {
        updateFields.push('achievements = ?');
        updateValues.push(profile.achievements);
      }

      // JSON поля
      if (profile.socialMedia !== undefined) {
        updateFields.push('social_media = ?');
        updateValues.push(JSON.stringify(profile.socialMedia));
      }
      if (profile.documents !== undefined) {
        updateFields.push('documents = ?');
        updateValues.push(JSON.stringify(profile.documents));
      }

      // Налаштування
      if (profile.isPublicProfile !== undefined) {
        updateFields.push('is_public_profile = ?');
        updateValues.push(profile.isPublicProfile);
      }
      if (profile.showEmail !== undefined) {
        updateFields.push('show_email = ?');
        updateValues.push(profile.showEmail);
      }
      if (profile.showPhone !== undefined) {
        updateFields.push('show_phone = ?');
        updateValues.push(profile.showPhone);
      }
      if (profile.emailNotifications !== undefined) {
        updateFields.push('email_notifications = ?');
        updateValues.push(profile.emailNotifications);
      }

      // Файли
      if (profile.avatar !== undefined) {
        updateFields.push('avatar = ?');
        updateValues.push(profile.avatar);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Немає даних для оновлення'
      }, { status: 400 });
    }

    // Додаємо updated_at
    updateFields.push('updated_at = NOW()');

    // Виконуємо оновлення
    updateValues.push(userId); // для WHERE clause

    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateValues);

    console.log('✅ Профіль оновлено для:', users[0].email);

    // Отримуємо оновлені дані
    const updatedUsers = await executeQuery<any>(`
      SELECT
        id, email, name, roles,
        first_name, last_name, middle_name,
        date_of_birth, gender, phone,
        country, region, city, address, zip_code,
        club, coach, sport_category, experience, specialization,
        bio, website, social_media, achievements,
        is_public_profile, show_email, show_phone, email_notifications,
        avatar, documents,
        email_verified, membership_paid, membership_expiry_date, status,
        created_at, updated_at, last_login
      FROM users
      WHERE id = ?
    `, [userId]);

    if (updatedUsers.length === 0) {
      throw new Error('Не вдалося отримати оновлені дані');
    }

    const updatedUser = updatedUsers[0];

    // Парсимо JSON поля
    let roles = [];
    let socialMedia = { instagram: '', facebook: '', telegram: '' };
    let documents = [];

    try {
      // Обробляємо різні формати ролей
      if (typeof updatedUser.roles === 'string') {
        roles = JSON.parse(updatedUser.roles);
      } else if (Array.isArray(updatedUser.roles)) {
        roles = updatedUser.roles;
      } else {
        roles = ['user'];
      }
    } catch (e) {
      console.warn('⚠️ Помилка парсингу ролей, використовуємо default:', e);
      roles = ['user'];
    }

    try {
      socialMedia = JSON.parse(updatedUser.social_media || '{"instagram":"","facebook":"","telegram":""}');
    } catch (e) {
      console.warn('⚠️ Помилка парсингу соціальних мереж:', e);
    }

    try {
      documents = JSON.parse(updatedUser.documents || '[]');
    } catch (e) {
      console.warn('⚠️ Помилка парсингу документів:', e);
    }

    // Формуємо відповідь
    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      roles: roles,
      createdAt: updatedUser.created_at,
      lastLogin: updatedUser.last_login,
      emailVerified: updatedUser.email_verified,

      profile: {
        firstName: updatedUser.first_name || '',
        lastName: updatedUser.last_name || '',
        middleName: updatedUser.middle_name || '',
        dateOfBirth: updatedUser.date_of_birth || '',
        gender: updatedUser.gender || '',
        phone: updatedUser.phone || '',

        country: updatedUser.country || '',
        region: updatedUser.region || '',
        city: updatedUser.city || '',
        address: updatedUser.address || '',
        zipCode: updatedUser.zip_code || '',

        club: updatedUser.club || '',
        coach: updatedUser.coach || '',
        sportCategory: updatedUser.sport_category || '',
        experience: updatedUser.experience || '',
        specialization: updatedUser.specialization || '',

        bio: updatedUser.bio || '',
        website: updatedUser.website || '',
        socialMedia: socialMedia,
        achievements: updatedUser.achievements || '',
        competitions: [],

        isPublicProfile: updatedUser.is_public_profile || false,
        showEmail: updatedUser.show_email || false,
        showPhone: updatedUser.show_phone || false,
        emailNotifications: updatedUser.email_notifications !== false,

        avatar: updatedUser.avatar || '',
        documents: documents
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Профіль успішно оновлено',
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Помилка оновлення профілю:', error);

    return NextResponse.json({
      success: false,
      error: 'Внутрішня помилка сервера',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
