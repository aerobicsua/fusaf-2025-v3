import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail, generateWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword, name, role = 'athlete' } = await request.json();

    // Валідація вхідних даних
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email, пароль та ім\'я обов\'язкові'
      }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Паролі не співпадають'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Пароль повинен містити мінімум 6 символів'
      }, { status: 400 });
    }

    // Валідація email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Некоректний email адрес'
      }, { status: 400 });
    }

    console.log('📝 Спроба реєстрації для:', email);

    // Перевіряємо чи користувач вже існує
    const existingUsers = await executeQuery<any>(`
      SELECT id FROM users WHERE email = ?
    `, [email.toLowerCase()]);

    if (existingUsers.length > 0) {
      console.log('❌ Користувач вже існує:', email);
      return NextResponse.json({
        success: false,
        error: 'Користувач з таким email вже існує'
      }, { status: 409 });
    }

    // Хешуємо пароль
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Пароль захешований для:', email);

    // Генеруємо унікальний ID
    const userId = uuidv4();

    // Розбиваємо ім'я на частини
    const nameParts = name.trim().split(' ').filter((part: string) => part.trim());
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

    // Створюємо користувача в БД
    await executeQuery(`
      INSERT INTO users (
        id, email, password_hash, name, roles,
        first_name, last_name, middle_name,
        country, status, email_verified, membership_paid,
        created_at, last_login
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      userId,
      email.toLowerCase(),
      passwordHash,
      name.trim(),
      `["${role}", "user"]`,
      firstName,
      lastName,
      middleName,
      'Україна',
      'active', // одразу активуємо
      false, // email не підтверджено
      false // членство не оплачено
    ]);

    console.log('✅ Користувач створений в БД:', email);

    // Отримуємо створеного користувача
    const newUsers = await executeQuery<any>(`
      SELECT
        id, email, name, roles,
        first_name, last_name, middle_name,
        country, status, email_verified, membership_paid,
        created_at, last_login
      FROM users
      WHERE id = ?
    `, [userId]);

    if (newUsers.length === 0) {
      throw new Error('Не вдалося створити користувача');
    }

    const newUser = newUsers[0];

    // Парсимо ролі
    let roles = [];
    try {
      roles = JSON.parse(newUser.roles || '[]');
    } catch (e) {
      roles = [role, 'user'];
    }

    // Формуємо відповідь
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      roles: roles,
      createdAt: newUser.created_at,
      lastLogin: newUser.last_login,
      emailVerified: newUser.email_verified,

      // Базовий профіль
      profile: {
        firstName: newUser.first_name || '',
        lastName: newUser.last_name || '',
        middleName: newUser.middle_name || '',
        dateOfBirth: '',
        gender: '',
        phone: '',

        // Адреса
        country: newUser.country || 'Україна',
        region: '',
        city: '',
        address: '',
        zipCode: '',

        // Спортивна інформація
        club: '',
        coach: '',
        sportCategory: '',
        experience: '',
        specialization: '',

        // Особиста інформація
        bio: '',
        website: '',
        socialMedia: {
          instagram: '',
          facebook: '',
          telegram: ''
        },

        // Досягнення
        achievements: '',
        competitions: [],

        // Налаштування
        isPublicProfile: true,
        showEmail: false,
        showPhone: false,
        emailNotifications: true,

        // Файли
        avatar: '',
        documents: []
      }
    };

    console.log('🎉 Успішна реєстрація для:', email);

    // Надсилаємо вітальний email
    try {
      const roleLabels: Record<string, string> = {
        'athlete': 'Спортсмен',
        'coach_judge': 'Тренер/Суддя',
        'club_owner': 'Власник клубу',
        'admin': 'Адміністратор'
      };

      const welcomeEmailHtml = generateWelcomeEmail({
        name: name.trim(),
        email: email.toLowerCase(),
        role: role,
        registrationDate: new Date().toISOString()
      });

      const emailResult = await sendEmail({
        from: 'aerobicsua@gmail.com',
        to: email.toLowerCase(),
        subject: `🎉 Ласкаво просимо до ФУСАФ, ${firstName}!`,
        html: welcomeEmailHtml
      });

      if (emailResult.success) {
        console.log('✅ Вітальний email надіслано успішно для:', email);
      } else {
        console.log('⚠️ Не вдалося надіслати вітальний email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Помилка надсилання вітального email:', emailError);
      // Не зупиняємо процес реєстрації через помилку email
    }

    return NextResponse.json({
      success: true,
      message: 'Реєстрація успішна! Ласкаво просимо до ФУСАФ! Перевірте email для додаткової інформації.',
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Помилка реєстрації:', error);

    return NextResponse.json({
      success: false,
      error: 'Внутрішня помилка сервера',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
