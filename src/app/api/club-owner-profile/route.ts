import { NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { z } from 'zod';

// Zod схеми для валідації профілю власника клубу
const clubOwnerProfileSchema = z.object({
  firstName: z.string().min(1, "Ім'я обов'язкове").max(50, "Ім'я занадто довге"),
  lastName: z.string().min(1, "Прізвище обов'язкове").max(50, "Прізвище занадто довге"),
  middleName: z.string().max(50, "По батькові занадто довге").optional(),
  position: z.string().min(1, "Посада обов'язкова").max(100, "Назва посади занадто довга"),
  email: z.string().email("Невірний формат email"),
  phone: z.string().min(1, "Телефон обов'язковий").regex(/^\+380\d{9}$/, "Телефон має бути в форматі +380XXXXXXXXX"),
  region: z.string().min(1, "Область обов'язкова"),
  city: z.string().min(1, "Місто обов'язкове").max(100, "Назва міста занадто довга"),
  address: z.string().min(1, "Адреса обов'язкова").max(200, "Адреса занадто довга"),

  // Інформація про клуб
  clubName: z.string().min(1, "Назва клубу обов'язкова").max(200, "Назва клубу занадто довга"),
  clubAddress: z.string().min(1, "Адреса клубу обов'язкова").max(300, "Адреса клубу занадто довга"),
  clubDescription: z.string().max(1000, "Опис клубу занадто довгий").optional(),
  clubHistory: z.string().max(2000, "Історія клубу занадто довга").optional(),
  legalStatus: z.string().min(1, "Правовий статус обов'язковий"),
  registrationNumber: z.string().max(50, "Номер реєстрації занадто довгий").optional(),
  foundingDate: z.string().optional(),
  website: z.string().url("Невірний формат веб-сайту").optional().or(z.literal("")),

  // Автоматично обчислювані поля
  fullName: z.string().optional(),
  yearsActive: z.number().optional()
});

const updateClubOwnerProfileSchema = z.object({
  clubOwnerId: z.string().min(1, "ID власника клубу обов'язковий"),
  updates: clubOwnerProfileSchema.partial()
});

// Покращена система email повідомлень для власника клубу
async function sendClubOwnerProfileUpdateNotification(profile: any, updatedFields: string[]) {
  const emailData = {
    to: profile.email,
    subject: 'Профіль власника клубу ФУСАФ оновлено',
    html: `
      <h2>Вітаємо, ${profile.fullName}!</h2>

      <p>Ваш профіль власника клубу "${profile.clubName}" в ФУСАФ було успішно оновлено.</p>

      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>📝 Оновлені поля:</h3>
        <ul>
          ${updatedFields.map(field => `<li><strong>${field}</strong></li>`).join('')}
        </ul>
        <p><strong>Дата оновлення:</strong> ${new Date().toLocaleString('uk-UA')}</p>
      </div>

      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>🏢 Інформація про клуб:</h3>
        <ul>
          <li><strong>Назва:</strong> ${profile.clubName}</li>
          <li><strong>Адреса:</strong> ${profile.clubAddress}</li>
          <li><strong>Статус:</strong> ${profile.legalStatus}</li>
          ${profile.website ? `<li><strong>Веб-сайт:</strong> <a href="${profile.website}">${profile.website}</a></li>` : ''}
        </ul>
      </div>

      <p>🔒 <strong>Безпека:</strong> Якщо ці зміни зробили не ви, негайно зверніться до служби підтримки.</p>

      <p>Ви можете переглянути свій оновлений профіль клубу в панелі управління.</p>

      <p>З повагою,<br>Команда ФУСАФ</p>

      <hr>
      <p style="color: #666; font-size: 12px;">
        Федерація України зі Спортивної Аеробіки і Фітнесу<br>
        Email: info@fusaf.org.ua | Телефон: +38 (050) 123-45-67
      </p>
    `
  };

  // В реальному проекті тут буде Resend або SendGrid
  console.log(`📧 EMAIL ПОВІДОМЛЕННЯ ПРО ОНОВЛЕННЯ ПРОФІЛЮ КЛУБУ:`);
  console.log(`─────────────────────────────────────────────────`);
  console.log(`До: ${emailData.to}`);
  console.log(`Тема: ${emailData.subject}`);
  console.log(`Клуб: ${profile.clubName}`);
  console.log(`Оновлені поля: ${updatedFields.join(', ')}`);
  console.log(`Час відправки: ${new Date().toISOString()}`);
  console.log(`─────────────────────────────────────────────────`);

  // TODO: Підключити реальний email сервіс
  // await emailService.send(emailData);
}

// Тимчасове сховище профілів власників клубів (в реальному проекті - база даних)
const clubOwnerProfiles = new Map<string, any>();

// Ініціалізація тестових даних
if (clubOwnerProfiles.size === 0) {
  clubOwnerProfiles.set('club-owner-1705234567890', {
    id: "club-owner-1705234567890",
    userId: "1",
    firstName: "Олена",
    lastName: "Петренко",
    middleName: "Іванівна",
    fullName: "Петренко Олена Іванівна",
    position: "Директор клубу",
    email: "elena.petrenko@example.com",
    phone: "+380671234567",
    region: "Київська область",
    city: "Київ",
    address: "вул. Спортивна, 15, оф. 201",

    clubName: "СК Київ Аеробік",
    clubAddress: "вул. Спортивна, 15, Київ",
    clubDescription: "Професійний клуб спортивної аеробіки з 15-річною історією",
    clubHistory: "Заснований у 2009 році, клуб підготував понад 200 спортсменів",
    legalStatus: "ТОВ",
    registrationNumber: "12345678",
    foundingDate: "2009-03-15",
    website: "https://kyiv-aerobic.com.ua",

    membersCount: 45,
    coachesCount: 8,
    achievementsCount: 23,
    yearsActive: 15,

    photoUrl: null,
    documents: {
      registration: null,
      license: null,
      insurance: null
    },

    membershipPaid: true,
    membershipExpiryDate: "2025-12-31",
    status: "active",
    registrationDate: "2024-01-15T10:30:00Z",
    lastUpdated: new Date().toISOString()
  });

  // Додаємо для користувача з роллю club_owner
  clubOwnerProfiles.set('club-owner-2', {
    id: "club-owner-2",
    userId: "3",
    firstName: "Тестовий",
    lastName: "Власник",
    middleName: "",
    fullName: "Власник Тестовий",
    position: "Засновник",
    email: "club-owner@fusaf.org.ua",
    phone: "+380501234567",
    region: "м. Київ",
    city: "Київ",
    address: "вул. Тестова, 10, оф. 5",

    clubName: "СК Тестовий Клуб",
    clubAddress: "вул. Тестова, 10, Київ",
    clubDescription: "Тестовий клуб для демонстрації функціоналу",
    clubHistory: "Створений для тестування системи ФУСАФ",
    legalStatus: "ФОП",
    registrationNumber: "87654321",
    foundingDate: "2020-01-01",
    website: "",

    membersCount: 12,
    coachesCount: 3,
    achievementsCount: 5,
    yearsActive: 4,

    photoUrl: null,
    documents: {
      registration: null,
      license: null,
      insurance: null
    },

    membershipPaid: true,
    membershipExpiryDate: "2025-12-31",
    status: "active",
    registrationDate: "2024-02-01T12:00:00Z",
    lastUpdated: new Date().toISOString()
  });
}

// GET - отримання профілю власника клубу
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
    const clubOwnerId = url.searchParams.get('clubOwnerId');

    let profile = null;

    if (clubOwnerId) {
      // Шукаємо по конкретному ID
      profile = clubOwnerProfiles.get(clubOwnerId);
    } else {
      // Шукаємо профіль по userId поточного користувача
      for (const [id, p] of clubOwnerProfiles.entries()) {
        if (p.userId === session.user.id) {
          profile = p;
          break;
        }
      }
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Профіль власника клубу не знайдено' },
        { status: 404 }
      );
    }

    // Перевіряємо права доступу (власник може редагувати тільки свій профіль)
    const isOwner = profile.userId === session.user.id;
    const isAdmin = session.user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Недостатньо прав для перегляду цього профілю' },
        { status: 403 }
      );
    }

    console.log('✅ Профіль власника клубу отримано:', profile.fullName, '-', profile.clubName);

    return NextResponse.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('❌ Помилка отримання профілю власника клубу:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// PUT - оновлення профілю власника клубу з покращеною валідацією
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
    console.log('🔄 Оновлення профілю власника клубу:', data);

    // Валідація вхідних даних через Zod
    const validationResult = updateClubOwnerProfileSchema.safeParse(data);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');

      return NextResponse.json(
        { error: `Помилки валідації: ${errors}` },
        { status: 400 }
      );
    }

    const { clubOwnerId, updates } = validationResult.data;

    const existingProfile = clubOwnerProfiles.get(clubOwnerId);

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Профіль власника клубу не знайдено' },
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

    // Розрахунок років діяльності клубу
    if (updates.foundingDate) {
      const foundingYear = new Date(updates.foundingDate).getFullYear();
      const currentYear = new Date().getFullYear();
      updates.yearsActive = Math.max(0, currentYear - foundingYear);
    }

    // Оновлюємо профіль
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    clubOwnerProfiles.set(clubOwnerId, updatedProfile);

    const updatedFields = Object.keys(updates).filter(key =>
      key !== 'fullName' && key !== 'yearsActive'
    );

    console.log('✅ Профіль власника клубу оновлено:', updatedProfile.fullName, '-', updatedProfile.clubName);
    console.log('📝 Оновлені поля:', updatedFields);

    // Відправляємо email повідомлення
    await sendClubOwnerProfileUpdateNotification(updatedProfile, updatedFields);

    return NextResponse.json({
      success: true,
      message: 'Профіль власника клубу успішно оновлено',
      profile: updatedProfile,
      updatedFields: updatedFields
    });

  } catch (error) {
    console.error('❌ Помилка оновлення профілю власника клубу:', error);
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

    const { clubOwnerId } = await request.json();

    if (!clubOwnerId) {
      return NextResponse.json(
        { error: 'Не вказано ID власника клубу' },
        { status: 400 }
      );
    }

    const profile = clubOwnerProfiles.get(clubOwnerId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Профіль власника клубу не знайдено' },
        { status: 404 }
      );
    }

    clubOwnerProfiles.delete(clubOwnerId);

    console.log('🗑️ Профіль власника клубу видалено:', profile.fullName, '-', profile.clubName);

    return NextResponse.json({
      success: true,
      message: 'Профіль власника клубу успішно видалено'
    });

  } catch (error) {
    console.error('❌ Помилка видалення профілю власника клубу:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
