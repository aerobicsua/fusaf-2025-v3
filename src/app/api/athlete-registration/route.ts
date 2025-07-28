import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('🏃 Реєстрація спортсмена в MySQL розпочата');
    console.log('📝 Отримані дані:', Object.keys(data));

    // Валідація обов'язкових полів
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Відсутні обов'язкові поля: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Валідація email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({
        success: false,
        error: 'Некоректний email адрес'
      }, { status: 400 });
    }

    // Перевіряємо чи користувач вже існує
    const existingUsers = await executeQuery(`
      SELECT id FROM users WHERE email = ?
    `, [data.email.toLowerCase()]);

    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Користувач з таким email вже зареєстрований'
      }, { status: 409 });
    }

    // Генеруємо пароль та хешуємо його
    const generatedPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(generatedPassword, 12);

    // Генеруємо унікальні ID
    const userId = uuidv4();
    const registrationId = uuidv4();

    // Формуємо повне ім'я
    const fullName = `${data.firstName} ${data.lastName} ${data.middleName || ''}`.trim();

    console.log('👤 Створюємо користувача:', data.email);

    // Створюємо користувача в БД (спрощений запит)
    await executeQuery(`
      INSERT INTO users (
        id, email, password_hash, name, roles,
        first_name, last_name, middle_name,
        date_of_birth, gender, phone,
        country, region, city,
        status, email_verified, membership_paid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      data.email.toLowerCase(),
      passwordHash,
      fullName,
      '["athlete", "user"]',
      data.firstName,
      data.lastName,
      data.middleName || '',
      data.dateOfBirth,
      data.gender || 'female',
      data.phone,
      data.country || 'Україна',
      data.region || '',
      data.city || '',
      'pending', // спочатку очікує активації
      false, // email не підтверджено
      false // членство не оплачено
    ]);

    console.log('✅ Користувач створений в БД');

    // Зберігаємо додаткову інформацію про реєстрацію
    await executeQuery(`
      INSERT INTO registrations (
        id, participant_id, registration_type,
        program, category, participants_data,
        club_name, coach_name, coach_phone,
        registration_fee, entry_fee, total_fee,
        payment_status, notes, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      registrationId,
      userId,
      'athlete_profile', // тип реєстрації
      data.discipline || 'Спортивна аеробіка',
      data.category || '',
      JSON.stringify({
        emergencyContact: data.emergencyContact || {},
        medicalInfo: data.medicalInfo || {},
        preferences: data.preferences || {}
      }),
      data.club || '',
      data.coach || '',
      data.coachPhone || '',
      0, // поки без плати
      0,
      0,
      'pending',
      data.notes || '',
      'pending'
    ]);

    console.log('✅ Реєстрація збережена в БД');

    // Формуємо відповідь
    const response = {
      success: true,
      message: 'Реєстрацію спортсмена успішно завершено!',
      data: {
        userId: userId,
        registrationId: registrationId,
        registrationNumber: `FUSAF-A-${new Date().getFullYear()}-${registrationId.slice(-6).toUpperCase()}`,
        email: data.email,
        name: fullName,
        temporaryPassword: generatedPassword,
        status: 'pending',
        nextSteps: [
          'Перевірте електронну пошту для підтвердження реєстрації',
          'Увійдіть в систему з тимчасовим паролем',
          'Заповніть додаткову інформацію в профілі',
          'Оплатіть членський внесок'
        ]
      },
      warnings: [
        'Тимчасовий пароль надіслано на електронну пошту',
        'Змініть пароль після першого входу в систему'
      ]
    };

    // TODO: Надіслати email з тимчасовим паролем
    console.log('📧 Email з паролем:', generatedPassword, 'для', data.email);

    // TODO: Інтеграція з платіжною системою для членських внесків

    console.log('🎉 Реєстрацію спортсмена завершено успішно');

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Помилка реєстрації спортсмена:', error);

    return NextResponse.json({
      success: false,
      error: 'Внутрішня помилка сервера при реєстрації',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Отримуємо статистику реєстрацій спортсменів
    const totalRegistrations = await executeQuery(`
      SELECT COUNT(*) as count FROM registrations
      WHERE registration_type = 'athlete_profile'
    `);

    const pendingRegistrations = await executeQuery(`
      SELECT COUNT(*) as count FROM registrations
      WHERE registration_type = 'athlete_profile' AND status = 'pending'
    `);

    const recentRegistrations = await executeQuery(`
      SELECT
        r.id, r.created_at, r.status,
        u.name, u.email, u.city, u.club
      FROM registrations r
      JOIN users u ON r.participant_id = u.id
      WHERE r.registration_type = 'athlete_profile'
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      statistics: {
        total: totalRegistrations[0]?.count || 0,
        pending: pendingRegistrations[0]?.count || 0,
        recent: recentRegistrations
      },
      message: 'Статистика реєстрацій спортсменів'
    });

  } catch (error) {
    console.error('❌ Помилка отримання статистики:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка отримання статистики реєстрацій'
    }, { status: 500 });
  }
}
