import { NextRequest, NextResponse } from 'next/server';
import { getApiSession, registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('🎓 Реєстрація тренера/судді:', data);

    // Валідація обов'язкових полів
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'region', 'city', 'education', 'specialization', 'experience'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Обов'язкові поля не заповнені: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Перевірка, що обрано хоча б одну роль
    if (!data.isCoach && !data.isJudge) {
      return NextResponse.json(
        { error: 'Оберіть хоча б одну роль: тренер або суддя' },
        { status: 400 }
      );
    }

    // Перевірка формату email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Невірний формат email адреси' },
        { status: 400 }
      );
    }

    // Генерація тимчасового паролю
    const tempPassword = Math.random().toString(36).slice(-8);
    const fullName = `${data.lastName} ${data.firstName}${data.middleName ? ` ${data.middleName}` : ''}`;

    // Визначаємо ролі
    const roles = [];
    if (data.isCoach) roles.push('тренер');
    if (data.isJudge) roles.push('суддя');
    const roleString = roles.join(' + ');

    try {
      // Спробуємо створити користувача
      const newUser = await registerUser(data.email, tempPassword, fullName);
      console.log('✅ Користувач створений:', newUser.success ? newUser.user?.email || "unknown" : "error");

      // Створюємо запис тренера/судді
      const coachJudgeData = {
        id: `coach-judge-${Date.now()}`,
        userId: newUser.success ? newUser.user?.id || "temp-id" : "error",
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || '',
        fullName: fullName,
        email: data.email,
        phone: data.phone,
        region: data.region,
        city: data.city,

        // Дані англійською мовою для міжнародних змагань
        firstNameEn: data.firstNameEn || '',
        lastNameEn: data.lastNameEn || '',
        passport: data.passport || '',

        education: data.education,
        specialization: data.specialization,
        experience: data.experience,
        achievements: data.achievements || null,
        certificates: data.certificates || null,
        isCoach: data.isCoach,
        isJudge: data.isJudge,
        roles: roleString,
        role: 'coach_judge',
        registrationDate: new Date().toISOString(),
        status: 'pending_review', // Потребує розгляду кваліфікаційної комісії
        tempPassword: tempPassword
      };

      console.log('✅ Тренер/суддя зареєстрований:', coachJudgeData.fullName, '-', roleString);

      // Симуляція відправки email з паролем
      console.log(`📧 Email симуляція для ${data.email}:`);
      console.log(`Тема: Заявка на реєстрацію тренера/судді в ФУСАФ отримана`);
      console.log(`Ваш тимчасовий пароль: ${tempPassword}`);
      console.log(`Ваша заявка на роль "${roleString}" отримана і буде розглянута кваліфікаційною комісією.`);
      console.log(`Очікуваний термін розгляду: 7-14 робочих днів.`);

      // Симуляція повідомлення кваліфікаційній комісії
      console.log(`📧 Повідомлення кваліфікаційній комісії:`);
      console.log(`Нова заявка на реєстрацію: ${roleString}`);
      console.log(`Кандидат: ${fullName}`);
      console.log(`Email: ${data.email}`);
      console.log(`Спеціалізація: ${data.specialization}`);
      console.log(`Досвід: ${data.experience.substring(0, 100)}...`);

      return NextResponse.json({
        success: true,
        message: 'Заявка подана успішно! Перевірте email для отримання паролю.',
        coachJudgeId: coachJudgeData.id,
        tempPassword: tempPassword, // Тільки для демо
        roles: roleString,
        status: 'pending_review',
        expectedReviewTime: '7-14 робочих днів',
        redirectTo: '/dashboard/coach-judge'
      });

    } catch (authError: any) {
      if (authError.message.includes('вже існує')) {
        return NextResponse.json(
          { error: 'Користувач з такою email адресою вже зареєстрований' },
          { status: 409 }
        );
      }
      throw authError;
    }

  } catch (error) {
    console.error('❌ Помилка реєстрації тренера/судді:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
