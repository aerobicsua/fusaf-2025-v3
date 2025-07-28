import { NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { z } from 'zod';

// Zod схеми для валідації
const athleteProfileSchema = z.object({
  firstName: z.string().min(1, "Ім'я обов'язкове").max(50, "Ім'я занадто довге"),
  lastName: z.string().min(1, "Прізвище обов'язкове").max(50, "Прізвище занадто довге"),
  middleName: z.string().max(50, "По батькові занадто довге").optional(),
  dateOfBirth: z.string().min(1, "Дата народження обов'язкова"),
  age: z.number().optional(),
  gender: z.enum(['male', 'female'], { message: "Оберіть стать" }),
  firstNameEn: z.string().max(50, "Англійське ім'я занадто довге").optional(),
  lastNameEn: z.string().max(50, "Англійське прізвище занадто довге").optional(),
  passport: z.string().max(20, "Номер паспорта занадто довгий").optional(),
  email: z.string().email("Невірний формат email"),
  phone: z.string().min(1, "Телефон обов'язковий").regex(/^\+380\d{9}$/, "Телефон має бути в форматі +380XXXXXXXXX"),
  region: z.string().min(1, "Область обов'язкова"),
  city: z.string().min(1, "Місто обов'язкове").max(100, "Назва міста занадто довга"),
  address: z.string().min(1, "Адреса обов'язкова").max(200, "Адреса занадто довга"),
  club: z.string().min(1, "Клуб обов'язковий"),
  coach: z.string().max(100, "Ім'я тренера занадто довге").optional(),
  sportCategory: z.string().min(1, "Спортивна категорія обов'язкова"),
  experience: z.string().min(1, "Стаж обов'язковий").max(100, "Опис стажу занадто довгий"),
  achievements: z.string().max(1000, "Опис досягнень занадто довгий").optional(),
  fullName: z.string().optional()
});

const updateProfileSchema = z.object({
  athleteId: z.string().min(1, "ID спортсмена обов'язковий"),
  updates: athleteProfileSchema.partial()
});

// Покращена система email повідомлень
async function sendProfileUpdateNotification(profile: any, updatedFields: string[]) {
  const emailData = {
    to: profile.email,
    subject: 'Профіль спортсмена ФУСАФ оновлено',
    html: `
      <h2>Вітаємо, ${profile.fullName}!</h2>

      <p>Ваш профіль спортсмена в ФУСАФ було успішно оновлено.</p>

      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>📝 Оновлені поля:</h3>
        <ul>
          ${updatedFields.map(field => `<li><strong>${field}</strong></li>`).join('')}
        </ul>
        <p><strong>Дата оновлення:</strong> ${new Date().toLocaleString('uk-UA')}</p>
      </div>

      <p>🔒 <strong>Безпека:</strong> Якщо ці зміни зробили не ви, негайно зверніться до служби підтримки.</p>

      <p>Ви можете переглянути свій оновлений профіль в особистому кабінеті.</p>

      <p>З повагою,<br>Команда ФУСАФ</p>

      <hr>
      <p style="color: #666; font-size: 12px;">
        Федерація України зі Спортивної Аеробіки і Фітнесу<br>
        Email: info@fusaf.org.ua | Телефон: +38 (050) 123-45-67
      </p>
    `
  };

  // В реальному проекті тут буде Resend або SendGrid
  console.log(`📧 EMAIL ПОВІДОМЛЕННЯ ПРО ОНОВЛЕННЯ ПРОФІЛЮ:`);
  console.log(`─────────────────────────────────────────────────`);
  console.log(`До: ${emailData.to}`);
  console.log(`Тема: ${emailData.subject}`);
  console.log(`Оновлені поля: ${updatedFields.join(', ')}`);
  console.log(`Час відправки: ${new Date().toISOString()}`);
  console.log(`─────────────────────────────────────────────────`);

  // TODO: Підключити реальний email сервіс
  // await emailService.send(emailData);
}

// Тимчасове сховище профілів спортсменів (в реальному проекті - база даних)
const athleteProfiles = new Map<string, any>();

// Ініціалізація тестових даних
if (athleteProfiles.size === 0) {
  athleteProfiles.set('athlete-1705234567890', {
    id: "athlete-1705234567890",
    userId: "1",
    firstName: "Іван",
    lastName: "Іванов",
    middleName: "Іванович",
    fullName: "Іванов Іван Іванович",
    dateOfBirth: "2000-03-15",
    age: 24,
    gender: "male",
    firstNameEn: "Ivan",
    lastNameEn: "Ivanov",
    passport: "AA123456",
    email: "ivan.ivanov@example.com",
    phone: "+380671234567",
    region: "Київська область",
    city: "Київ",
    address: "вул. Хрещатик, 1, кв. 1",
    club: "СК Київ Аеробік",
    coach: "Іванова Олена Петрівна",
    sportCategory: "1 спортивний розряд",
    experience: "5 років",
    achievements: "Переможець чемпіонату міста Київ 2023, учасник чемпіонату України 2024",
    files: {
      photo: "photo-1705234567890",
      medicalCertificate: "medical-1705234567890",
      parentalConsent: null
    },
    photoUrl: "/api/files/photo-1705234567890",
    membershipPaid: true,
    membershipExpiryDate: "2025-12-31",
    status: "active",
    registrationDate: "2024-01-15T10:30:00Z",
    lastUpdated: new Date().toISOString()
  });

  // Додаємо для користувача з ролью athlete
  athleteProfiles.set('athlete-2', {
    id: "athlete-2",
    userId: "2",
    firstName: "Тестовий",
    lastName: "Спортсмен",
    middleName: "",
    fullName: "Спортсмен Тестовий",
    dateOfBirth: "1995-05-20",
    age: 29,
    gender: "male",
    firstNameEn: "Test",
    lastNameEn: "Athlete",
    passport: "",
    email: "athlete@fusaf.org.ua",
    phone: "+380501234567",
    region: "м. Київ",
    city: "Київ",
    address: "вул. Тестова, 5, кв. 10",
    club: "СК Львів Фітнес",
    coach: "Коваленко Марина Сергіївна",
    sportCategory: "Кандидат у майстри спорту",
    experience: "8 років",
    achievements: "Учасник чемпіонату України, призер регіональних змагань",
    files: {},
    photoUrl: null,
    membershipPaid: true,
    membershipExpiryDate: "2025-12-31",
    status: "active",
    registrationDate: "2024-02-01T12:00:00Z",
    lastUpdated: new Date().toISOString()
  });
}

// GET - отримання профілю
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
    const athleteId = url.searchParams.get('athleteId');

    let profile = null;

    if (athleteId) {
      // Шукаємо по конкретному ID
      profile = athleteProfiles.get(athleteId);
    } else {
      // Шукаємо профіль по userId поточного користувача
      for (const [id, p] of athleteProfiles.entries()) {
        if (p.userId === session.user.id) {
          profile = p;
          break;
        }
      }
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Профіль спортсмена не знайдено' },
        { status: 404 }
      );
    }

    // Перевіряємо права доступу (спортсмен може редагувати тільки свій профіль)
    const isOwner = profile.userId === session.user.id;
    const isAdmin = session.user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Недостатньо прав для перегляду цього профілю' },
        { status: 403 }
      );
    }

    console.log('✅ Профіль отримано:', profile.fullName);

    return NextResponse.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('❌ Помилка отримання профілю:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// PUT - оновлення профілю з покращеною валідацією
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
    console.log('🔄 Оновлення профілю спортсмена:', data);

    // Валідація вхідних даних через Zod
    const validationResult = updateProfileSchema.safeParse(data);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');

      return NextResponse.json(
        { error: `Помилки валідації: ${errors}` },
        { status: 400 }
      );
    }

    const { athleteId, updates } = validationResult.data;

    const existingProfile = athleteProfiles.get(athleteId);

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Профіль спортсмена не знайдено' },
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

    // Перерахунок віку при зміні дати народження
    if (updates.dateOfBirth) {
      const birthDate = new Date(updates.dateOfBirth);
      const today = new Date();
      updates.age = today.getFullYear() - birthDate.getFullYear();
    }

    // Формування повного імені
    const firstName = updates.firstName || existingProfile.firstName;
    const lastName = updates.lastName || existingProfile.lastName;
    const middleName = updates.middleName || existingProfile.middleName;

    if (updates.firstName || updates.lastName || updates.middleName !== undefined) {
      updates.fullName = `${lastName} ${firstName}` + (middleName ? ` ${middleName}` : '');
    }

    // Оновлюємо профіль
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    athleteProfiles.set(athleteId, updatedProfile);

    const updatedFields = Object.keys(updates).filter(key => key !== 'fullName' && key !== 'age');

    console.log('✅ Профіль оновлено:', updatedProfile.fullName);
    console.log('📝 Оновлені поля:', updatedFields);

    // Відправляємо email повідомлення
    await sendProfileUpdateNotification(updatedProfile, updatedFields);

    return NextResponse.json({
      success: true,
      message: 'Профіль успішно оновлено',
      profile: updatedProfile,
      updatedFields: updatedFields
    });

  } catch (error) {
    console.error('❌ Помилка оновлення профілю:', error);
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

    const { athleteId } = await request.json();

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Не вказано ID спортсмена' },
        { status: 400 }
      );
    }

    const profile = athleteProfiles.get(athleteId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Профіль спортсмена не знайдено' },
        { status: 404 }
      );
    }

    athleteProfiles.delete(athleteId);

    console.log('🗑️ Профіль видалено:', profile.fullName);

    return NextResponse.json({
      success: true,
      message: 'Профіль успішно видалено'
    });

  } catch (error) {
    console.error('❌ Помилка видалення профілю:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
