import { NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { z } from 'zod';

// Zod схеми для валідації профілю тренера/судді
const coachJudgeProfileSchema = z.object({
  firstName: z.string().min(1, "Ім'я обов'язкове").max(50, "Ім'я занадто довге"),
  lastName: z.string().min(1, "Прізвище обов'язкове").max(50, "Прізвище занадто довге"),
  middleName: z.string().max(50, "По батькові занадто довге").optional(),
  email: z.string().email("Невірний формат email"),
  phone: z.string().min(1, "Телефон обов'язковий").regex(/^\+380\d{9}$/, "Телефон має бути в форматі +380XXXXXXXXX"),
  region: z.string().min(1, "Область обов'язкова"),
  city: z.string().min(1, "Місто обов'язкове").max(100, "Назва міста занадто довга"),
  address: z.string().min(1, "Адреса обов'язкова").max(200, "Адреса занадто довга"),

  // Професійна інформація
  specialization: z.string().min(1, "Спеціалізація обов'язкова").max(100, "Спеціалізація занадто довга"),
  education: z.string().min(1, "Освіта обов'язкова").max(1000, "Опис освіти занадто довгий"),
  experience: z.string().max(2000, "Опис досвіду занадто довгий").optional(),
  workExperience: z.number().min(0, "Досвід не може бути від'ємним").max(50, "Досвід занадто великий").optional(),
  isCoach: z.boolean().optional(),
  isJudge: z.boolean().optional(),

  // Кваліфікація
  coachCategory: z.string().max(50, "Категорія тренера занадто довга").optional(),
  judgeCategory: z.string().max(50, "Категорія судді занадто довга").optional(),
  qualificationLevel: z.string().max(200, "Рівень кваліфікації занадто довгий").optional(),
  currentEmployment: z.string().max(200, "Місце роботи занадто довге").optional(),

  // Атестація
  lastAttestation: z.string().optional(),
  nextAttestation: z.string().optional(),

  // Діяльність
  athletesCount: z.number().min(0, "Кількість спортсменів не може бути від'ємною").optional(),
  competitionsJudged: z.number().min(0, "Кількість змагань не може бути від'ємною").optional(),
  achievements: z.string().max(2000, "Опис досягнень занадто довгий").optional(),

  // Автоматично обчислювані поля
  fullName: z.string().optional()
});

const updateCoachJudgeProfileSchema = z.object({
  coachJudgeId: z.string().min(1, "ID тренера/судді обов'язковий"),
  updates: coachJudgeProfileSchema.partial()
});

// Покращена система email повідомлень для тренера/судді
async function sendCoachJudgeProfileUpdateNotification(profile: any, updatedFields: string[]) {
  const roles = [];
  if (profile.isCoach) roles.push("тренера");
  if (profile.isJudge) roles.push("судді");
  const roleText = roles.join(" та ");

  const emailData = {
    to: profile.email,
    subject: `Профіль ${roleText} ФУСАФ оновлено`,
    html: `
      <h2>Вітаємо, ${profile.fullName}!</h2>

      <p>Ваш профіль ${roleText} в ФУСАФ було успішно оновлено.</p>

      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>📝 Оновлені поля:</h3>
        <ul>
          ${updatedFields.map(field => `<li><strong>${field}</strong></li>`).join('')}
        </ul>
        <p><strong>Дата оновлення:</strong> ${new Date().toLocaleString('uk-UA')}</p>
      </div>

      <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>🎓 Кваліфікація:</h3>
        <ul>
          <li><strong>Спеціалізація:</strong> ${profile.specialization}</li>
          ${profile.isCoach && profile.coachCategory ? `<li><strong>Категорія тренера:</strong> ${profile.coachCategory}</li>` : ''}
          ${profile.isJudge && profile.judgeCategory ? `<li><strong>Категорія судді:</strong> ${profile.judgeCategory}</li>` : ''}
          <li><strong>Досвід:</strong> ${profile.workExperience} років</li>
          ${profile.currentEmployment ? `<li><strong>Місце роботи:</strong> ${profile.currentEmployment}</li>` : ''}
        </ul>
      </div>

      ${profile.nextAttestation ? `
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>📅 Атестація:</h3>
        <p><strong>Наступна атестація:</strong> ${new Date(profile.nextAttestation).toLocaleDateString('uk-UA')}</p>
        <p style="font-size: 12px; color: #856404;">Не забудьте підготуватися до атестації заздалегідь!</p>
      </div>
      ` : ''}

      <p>🔒 <strong>Безпека:</strong> Якщо ці зміни зробили не ви, негайно зверніться до служби підтримки.</p>

      <p>Ви можете переглянути свій оновлений профіль в панелі управління.</p>

      <p>З повагою,<br>Команда ФУСАФ</p>

      <hr>
      <p style="color: #666; font-size: 12px;">
        Федерація України зі Спортивної Аеробіки і Фітнесу<br>
        Email: info@fusaf.org.ua | Телефон: +38 (050) 123-45-67
      </p>
    `
  };

  // В реальному проекті тут буде Resend або SendGrid
  console.log(`📧 EMAIL ПОВІДОМЛЕННЯ ПРО ОНОВЛЕННЯ ПРОФІЛЮ ТРЕНЕРА/СУДДІ:`);
  console.log(`─────────────────────────────────────────────────`);
  console.log(`До: ${emailData.to}`);
  console.log(`Тема: ${emailData.subject}`);
  console.log(`Спеціалізація: ${profile.specialization}`);
  console.log(`Ролі: тренер - ${profile.isCoach}, суддя - ${profile.isJudge}`);
  console.log(`Оновлені поля: ${updatedFields.join(', ')}`);
  console.log(`Час відправки: ${new Date().toISOString()}`);
  console.log(`─────────────────────────────────────────────────`);

  // TODO: Підключити реальний email сервіс
  // await emailService.send(emailData);
}

// Тимчасове сховище профілів тренерів/суддів (в реальному проекті - база даних)
const coachJudgeProfiles = new Map<string, any>();

// Ініціалізація тестових даних
if (coachJudgeProfiles.size === 0) {
  coachJudgeProfiles.set('coach-judge-1705234567890', {
    id: "coach-judge-1705234567890",
    userId: "1",
    firstName: "Марина",
    lastName: "Коваленко",
    middleName: "Сергіївна",
    fullName: "Коваленко Марина Сергіївна",
    email: "marina.kovalenko@example.com",
    phone: "+380671234567",
    region: "Львівська область",
    city: "Львів",
    address: "вул. Спортивна, 25, кв. 12",

    specialization: "Спортивна аеробіка",
    education: "ЛДУФК ім. І. Боберського, тренер з спортивної аеробіки, 2015",
    experience: "8 років досвіду в підготовці спортсменів",
    workExperience: 8,
    isCoach: true,
    isJudge: true,

    coachCategory: "B",
    judgeCategory: "2",
    qualificationLevel: "Тренер-інструктор, суддя 2 категорії",
    currentEmployment: "СК Львів Фітнес",

    certificates: [
      "Сертифікат тренера ФУСАФ 2023",
      "Сертифікат судді 2 категорії 2022",
      "Курс підвищення кваліфікації 2024"
    ],
    licenses: [
      "Ліцензія тренера №12345",
      "Ліцензія судді №67890"
    ],
    courses: [
      "Основи спортивної аеробіки",
      "Суддівство змагань",
      "Психологія спорту"
    ],
    lastAttestation: "2023-06-15",
    nextAttestation: "2026-06-15",

    athletesCount: 25,
    competitionsJudged: 18,
    achievements: "Підготувала 3 чемпіонів України, 8 призерів регіональних змагань",
    awards: [
      "Кращий тренер року 2023",
      "Подяка від ФУСАФ 2022"
    ],

    photoUrl: null,
    documents: {
      diploma: null,
      certificates: null,
      licenses: null
    },

    membershipPaid: true,
    membershipExpiryDate: "2025-12-31",
    status: "active",
    registrationDate: "2024-01-15T10:30:00Z",
    lastUpdated: new Date().toISOString()
  });

  // Додаємо для користувача з роллю coach_judge
  coachJudgeProfiles.set('coach-judge-2', {
    id: "coach-judge-2",
    userId: "4",
    firstName: "Тестовий",
    lastName: "Тренер",
    middleName: "",
    fullName: "Тренер Тестовий",
    email: "coach-judge@fusaf.org.ua",
    phone: "+380501234567",
    region: "м. Київ",
    city: "Київ",
    address: "вул. Тестова, 15, кв. 8",

    specialization: "Фітнес аеробіка",
    education: "НУ фізичного виховання і спорту України, 2018",
    experience: "5 років роботи тренером",
    workExperience: 5,
    isCoach: true,
    isJudge: false,

    coachCategory: "C",
    judgeCategory: "",
    qualificationLevel: "Тренер-інструктор категорії C",
    currentEmployment: "СК Тестовий Клуб",

    certificates: [
      "Базовий курс тренера ФУСАФ 2019",
      "Курс підвищення кваліфікації 2022"
    ],
    licenses: [
      "Ліцензія тренера №54321"
    ],
    courses: [
      "Основи тренерської діяльності",
      "Методика викладання"
    ],
    lastAttestation: "2022-09-10",
    nextAttestation: "2025-09-10",

    athletesCount: 12,
    competitionsJudged: 0,
    achievements: "Підготував 2 призерів міських змагань",
    awards: [
      "Подяка від клубу 2023"
    ],

    photoUrl: null,
    documents: {
      diploma: null,
      certificates: null,
      licenses: null
    },

    membershipPaid: true,
    membershipExpiryDate: "2025-12-31",
    status: "active",
    registrationDate: "2024-02-01T12:00:00Z",
    lastUpdated: new Date().toISOString()
  });
}

// GET - отримання профілю тренера/судді
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const coachJudgeId = url.searchParams.get('coachJudgeId');

    let profile = null;

    if (coachJudgeId) {
      // Шукаємо по конкретному ID
      profile = coachJudgeProfiles.get(coachJudgeId);
    } else {
      // Шукаємо профіль по userId поточного користувача
      for (const [id, p] of coachJudgeProfiles.entries()) {
        if (p.userId === session.user.id) {
          profile = p;
          break;
        }
      }
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Профіль тренера/судді не знайдено' },
        { status: 404 }
      );
    }

    // Перевіряємо права доступу (тренер/суддя може редагувати тільки свій профіль)
    const isOwner = profile.userId === session.user.id;
    const isAdmin = session.user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Недостатньо прав для перегляду цього профілю' },
        { status: 403 }
      );
    }

    const roles = [];
    if (profile.isCoach) roles.push("тренер");
    if (profile.isJudge) roles.push("суддя");

    console.log('✅ Профіль тренера/судді отримано:', profile.fullName, `(${roles.join(', ')})`);

    return NextResponse.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('❌ Помилка отримання профілю тренера/судді:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// PUT - оновлення профілю тренера/судді з покращеною валідацією
export async function PUT(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('🔄 Оновлення профілю тренера/судді:', data);

    // Валідація вхідних даних через Zod
    const validationResult = updateCoachJudgeProfileSchema.safeParse(data);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');

      return NextResponse.json(
        { error: `Помилки валідації: ${errors}` },
        { status: 400 }
      );
    }

    const { coachJudgeId, updates } = validationResult.data;

    const existingProfile = coachJudgeProfiles.get(coachJudgeId);

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Профіль тренера/судді не знайдено' },
        { status: 404 }
      );
    }

    // Перевіряємо права доступу
    const isOwner = existingProfile.userId === session.user.id;
    const isAdmin = session.user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Недостатньо прав для редагування цього профілю' },
        { status: 403 }
      );
    }

    // Формування повного імені
    const firstName = updates.firstName || existingProfile.firstName;
    const lastName = updates.lastName || existingProfile.lastName;
    const middleName = updates.middleName || existingProfile.middleName;

    if (updates.firstName || updates.lastName || updates.middleName !== undefined) {
      updates.fullName = `${lastName} ${firstName}` + (middleName ? ` ${middleName}` : '');
    }

    // Формування рівня кваліфікації
    if (updates.isCoach !== undefined || updates.isJudge !== undefined ||
        updates.coachCategory || updates.judgeCategory) {

      const isCoach = updates.isCoach !== undefined ? updates.isCoach : existingProfile.isCoach;
      const isJudge = updates.isJudge !== undefined ? updates.isJudge : existingProfile.isJudge;
      const coachCat = updates.coachCategory || existingProfile.coachCategory;
      const judgeCat = updates.judgeCategory || existingProfile.judgeCategory;

      const qualifications = [];
      if (isCoach && coachCat) qualifications.push(`Тренер категорії ${coachCat}`);
      if (isJudge && judgeCat) qualifications.push(`Суддя ${judgeCat} категорії`);

      if (qualifications.length > 0) {
        updates.qualificationLevel = qualifications.join(', ');
      }
    }

    // Оновлюємо профіль
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    coachJudgeProfiles.set(coachJudgeId, updatedProfile);

    const updatedFields = Object.keys(updates).filter(key =>
      key !== 'fullName' && key !== 'qualificationLevel'
    );

    const roles = [];
    if (updatedProfile.isCoach) roles.push("тренер");
    if (updatedProfile.isJudge) roles.push("суддя");

    console.log('✅ Профіль тренера/судді оновлено:', updatedProfile.fullName, `(${roles.join(', ')})`);
    console.log('📝 Оновлені поля:', updatedFields);

    // Відправляємо email повідомлення
    await sendCoachJudgeProfileUpdateNotification(updatedProfile, updatedFields);

    return NextResponse.json({
      success: true,
      message: 'Профіль тренера/судді успішно оновлено',
      profile: updatedProfile,
      updatedFields: updatedFields
    });

  } catch (error) {
    console.error('❌ Помилка оновлення профілю тренера/судді:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - видалення профілю (тільки для адміністраторів)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    // Тільки адміністратори можуть видаляти профілі
    if (!session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Недостатньо прав для видалення профілю' },
        { status: 403 }
      );
    }

    const { coachJudgeId } = await request.json();

    if (!coachJudgeId) {
      return NextResponse.json(
        { error: 'Не вказано ID тренера/судді' },
        { status: 400 }
      );
    }

    const profile = coachJudgeProfiles.get(coachJudgeId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Профіль тренера/судді не знайдено' },
        { status: 404 }
      );
    }

    coachJudgeProfiles.delete(coachJudgeId);

    const roles = [];
    if (profile.isCoach) roles.push("тренер");
    if (profile.isJudge) roles.push("суддя");

    console.log('🗑️ Профіль тренера/судді видалено:', profile.fullName, `(${roles.join(', ')})`);

    return NextResponse.json({
      success: true,
      message: 'Профіль тренера/судді успішно видалено'
    });

  } catch (error) {
    console.error('❌ Помилка видалення профілю тренера/судді:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
