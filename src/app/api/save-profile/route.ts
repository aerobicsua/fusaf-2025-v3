import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const { email, profileData } = await request.json();

    if (!email || !profileData) {
      return NextResponse.json({
        success: false,
        error: 'Email та дані профілю обов\'язкові'
      }, { status: 400 });
    }

    console.log(`💾 Збереження профілю для: ${email}`);
    console.log(`🖼️ Аватар: ${profileData.avatar ? 'присутній (довжина: ' + profileData.avatar.length + ')' : 'відсутній'}`);

    // Валідація аватара
    if (profileData.avatar && profileData.avatar.length > 16777215) { // 16MB limit for MEDIUMTEXT
      console.warn('⚠️ Аватар занадто великий, обрізаємо...');
      profileData.avatar = profileData.avatar.substring(0, 16777215);
    }

    // Оновлюємо основні дані користувача
    const updates = {
      first_name: profileData.firstName || '',
      last_name: profileData.lastName || '',
      middle_name: profileData.middleName || '',
      date_of_birth: profileData.dateOfBirth || null,
      gender: profileData.gender || null,
      phone: profileData.phone || '',
      region: profileData.region || '',
      city: profileData.city || '',
      address: profileData.address || '',
      zip_code: profileData.zipCode || '',
      bio: profileData.bio || '',
      website: profileData.website || '',
      club: profileData.club || '',
      coach: profileData.coach || '',
      sport_category: profileData.sportCategory || '',
      experience: profileData.experience || '',
      specialization: profileData.specialization || '',
      achievements: profileData.achievements || '',
      is_public_profile: profileData.isPublicProfile || false,
      show_email: profileData.showEmail || false,
      show_phone: profileData.showPhone || false,
      email_notifications: profileData.emailNotifications !== false,
      avatar: profileData.avatar || null,
      social_media: JSON.stringify(profileData.socialMedia || {}),
      documents: JSON.stringify({
        files: profileData.documents || [],
        competitions: profileData.competitions || []
      })
    };

    console.log(`📅 Дата народження для збереження:`);
    console.log(`📅   - Отримано: "${profileData.dateOfBirth}" (тип: ${typeof profileData.dateOfBirth})`);
    console.log(`📅   - Оброблено: ${updates.date_of_birth} (тип: ${typeof updates.date_of_birth})`);
    console.log(`👨‍🏫 Тренер для збереження:`);
    console.log(`👨‍🏫   - Отримано: "${profileData.coach}" (тип: ${typeof profileData.coach})`);
    console.log(`👨‍🏫   - Оброблено: ${updates.coach} (тип: ${typeof updates.coach})`);

    // Будуємо динамічний запит для оновлення
    const updateFields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      // Завжди включаємо дату народження, навіть якщо вона null
      if (key === 'date_of_birth' || (value !== null && value !== undefined)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    // Оновлюємо повне ім'я
    const fullName = `${profileData.lastName || ''} ${profileData.firstName || ''} ${profileData.middleName || ''}`.trim();
    if (fullName) {
      updateFields.push('name = ?');
      values.push(fullName);
    }

    // Додаємо email для WHERE
    values.push(email);

    // Виконуємо оновлення
    await executeQuery(`
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE email = ?
    `, values);

    console.log(`✅ Профіль користувача ${email} оновлено успішно`);

    return NextResponse.json({
      success: true,
      message: 'Профіль оновлено успішно'
    });

  } catch (error) {
    console.error('❌ Помилка збереження профілю:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка збереження профілю',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
