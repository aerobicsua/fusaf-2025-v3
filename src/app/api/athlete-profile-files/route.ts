import { NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed

// Покращене файлове сховище з персистентністю
// В реальному проекті це буде Supabase Storage або AWS S3
class FileStorage {
  private files = new Map<string, { name: string, size: number, type: string, data: string, uploadDate: string }>();

  constructor() {
    // Симуляція завантаження існуючих файлів з "БД"
    this.loadExistingFiles();
  }

  private loadExistingFiles() {
    // Симуляція тестових файлів
    this.files.set('photo-1705234567890', {
      name: 'athlete_photo.jpg',
      size: 1024000,
      type: 'image/jpeg',
      data: this.generateSampleImageData(),
      uploadDate: '2024-01-15T10:30:00Z'
    });

    this.files.set('medical-1705234567890', {
      name: 'medical_certificate.pdf',
      size: 2048000,
      type: 'application/pdf',
      data: this.generateSamplePdfData(),
      uploadDate: '2024-01-15T10:30:00Z'
    });
  }

  private generateSampleImageData(): string {
    // Мінімальний валідний JPEG файл у base64 для демонстрації
    return '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  }

  private generateSamplePdfData(): string {
    // Мінімальний валідний PDF файл у base64
    return 'JVBERi0xLjQKJcOkw7zDtsO4DQoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagoKMiAwIG9iago8PAovVHlwZSAvT3V0bGluZXMKL0NvdW50IDAKPj4KZW5kb2JqCgozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbNCAwIFJdCj4+CmVuZG9iagoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDkgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjUgMCBvYmoKPDwKL0xlbmd0aCA0NQo+PgpzdHJlYW0KQBQKCAB0MQovRjEgMTIgVGYKMTAwIDcwMCBUZAooTWVkaWNhbCBDZXJ0aWZpY2F0ZSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDEyMCAwMDAwMCBuIAowMDAwMDAwMTc3IDAwMDAwIG4gCjAwMDAwMDAzNjQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0NTkKJSVFT0Y=';
  }

  save(fileId: string, file: { name: string, size: number, type: string, data: string }): void {
    this.files.set(fileId, {
      ...file,
      uploadDate: new Date().toISOString()
    });
    console.log(`💾 Файл збережено в FileStorage: ${fileId} -> ${file.name}`);
  }

  get(fileId: string): { name: string, size: number, type: string, data: string, uploadDate: string } | undefined {
    return this.files.get(fileId);
  }

  delete(fileId: string): boolean {
    const deleted = this.files.delete(fileId);
    if (deleted) {
      console.log(`🗑️ Файл видалено з FileStorage: ${fileId}`);
    }
    return deleted;
  }

  getFileUrl(fileId: string): string {
    return `/api/files/${fileId}`;
  }
}

const fileStorage = new FileStorage();

// Покращена система email повідомлень
async function sendFileUpdateNotification(profile: any, fileType: string, fileName: string) {
  const fileTypeNames = {
    photo: 'фотографію профілю',
    medicalCertificate: 'медичну довідку',
    parentalConsent: 'дозвіл батьків'
  };

  const emailData = {
    to: profile.email,
    subject: `Оновлено ${fileTypeNames[fileType as keyof typeof fileTypeNames]} в профілі ФУСАФ`,
    html: `
      <h2>Вітаємо, ${profile.fullName}!</h2>

      <p>Ваш документ успішно оновлено в профілі спортсмена ФУСАФ.</p>

      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>📄 Деталі оновлення:</h3>
        <ul>
          <li><strong>Тип документу:</strong> ${fileTypeNames[fileType as keyof typeof fileTypeNames]}</li>
          <li><strong>Назва файлу:</strong> ${fileName}</li>
          <li><strong>Дата оновлення:</strong> ${new Date().toLocaleString('uk-UA')}</li>
          <li><strong>Статус:</strong> ✅ Успішно завантажено</li>
        </ul>
      </div>

      <p>🔒 <strong>Безпека:</strong> Якщо це оновлення зробили не ви, негайно зверніться до служби підтримки.</p>

      <p>З повагою,<br>Команда ФУСАФ</p>

      <hr>
      <p style="color: #666; font-size: 12px;">
        Федерація України зі Спортивної Аеробіки і Фітнесу<br>
        Email: info@fusaf.org.ua | Телефон: +38 (050) 123-45-67
      </p>
    `
  };

  // В реальному проекті тут буде Resend або SendGrid
  console.log(`📧 EMAIL ПОВІДОМЛЕННЯ:`);
  console.log(`─────────────────────────────────────────────────`);
  console.log(`До: ${emailData.to}`);
  console.log(`Тема: ${emailData.subject}`);
  console.log(`HTML: ${emailData.html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
  console.log(`Час відправки: ${new Date().toISOString()}`);
  console.log(`─────────────────────────────────────────────────`);

  // TODO: Підключити реальний email сервіс
  // await emailService.send(emailData);
}

// Симуляція бази профілів спортсменів (в реальному проекті - база даних)
const athleteProfiles = new Map<string, any>();

// Синхронізація з основним API профілю
// В реальному проекті це буде єдина база даних

// Ініціалізація тестових файлів через FileStorage клас
// (файли завантажуються автоматично в конструкторі FileStorage)

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

// POST - завантаження нових файлів
export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    // Перевіряємо що користувач є спортсменом
    if (!session.user.roles?.includes('athlete')) {
      return NextResponse.json(
        { error: 'Доступ тільки для спортсменів' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const athleteId = formData.get('athleteId') as string;
    const fileType = formData.get('fileType') as string; // 'photo', 'medicalCertificate', 'parentalConsent'
    const file = formData.get('file') as File;

    if (!athleteId || !fileType || !file) {
      return NextResponse.json(
        { error: 'Не вистачає обов\'язкових параметрів' },
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

    // Перевіряємо права доступу
    const isOwner = profile.userId === session.user.id;
    const isAdmin = session.user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Недостатньо прав для оновлення файлів' },
        { status: 403 }
      );
    }

    // Валідація типу файлу
    const allowedTypes = ['photo', 'medicalCertificate', 'parentalConsent'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Невідомий тип файлу' },
        { status: 400 }
      );
    }

    // Валідація розміру файлу
    const maxSizes = {
      photo: 5 * 1024 * 1024, // 5MB
      medicalCertificate: 10 * 1024 * 1024, // 10MB
      parentalConsent: 10 * 1024 * 1024 // 10MB
    };

    if (file.size > maxSizes[fileType as keyof typeof maxSizes]) {
      return NextResponse.json(
        { error: `Розмір файлу перевищує допустимий ліміт (${maxSizes[fileType as keyof typeof maxSizes] / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    // Валідація типу MIME
    const allowedMimeTypes = {
      photo: ['image/jpeg', 'image/jpg', 'image/png'],
      medicalCertificate: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
      parentalConsent: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    };

    if (!allowedMimeTypes[fileType as keyof typeof allowedMimeTypes].includes(file.type)) {
      return NextResponse.json(
        { error: 'Непідтримуваний тип файлу' },
        { status: 400 }
      );
    }

    // Збереження файлу
    const fileId = `${fileType}-${athleteId}-${Date.now()}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');

    fileStorage.save(fileId, {
      name: file.name,
      size: file.size,
      type: file.type,
      data: base64Data
    });

    // Видаляємо старий файл якщо він існує
    const oldFileId = profile.files?.[fileType];
    if (oldFileId) {
      fileStorage.delete(oldFileId);
    }

    // Оновлюємо профіль
    const updatedProfile = {
      ...profile,
      files: {
        ...profile.files,
        [fileType]: fileId
      },
      lastUpdated: new Date().toISOString()
    };

    // Оновлюємо photoUrl для фотографії
    if (fileType === 'photo') {
      updatedProfile.photoUrl = `/api/files/${fileId}`;
    }

    athleteProfiles.set(athleteId, updatedProfile);

    console.log(`✅ Файл оновлено: ${fileType} -> ${file.name} для ${profile.fullName}`);

    // Покращена система email повідомлень
    await sendFileUpdateNotification(profile, fileType, file.name);

    return NextResponse.json({
      success: true,
      message: 'Файл успішно оновлено',
      fileId: fileId,
      fileType: fileType,
      fileName: file.name,
      fileUrl: fileType === 'photo' ? `/api/files/${fileId}` : null,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('❌ Помилка завантаження файлу:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - видалення файлу
export async function DELETE(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    const { athleteId, fileType } = await request.json();

    if (!athleteId || !fileType) {
      return NextResponse.json(
        { error: 'Не вистачає обов\'язкових параметрів' },
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

    // Перевіряємо права доступу
    const isOwner = profile.userId === session.user.id;
    const isAdmin = session.user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Недостатньо прав для видалення файлів' },
        { status: 403 }
      );
    }

    const fileId = profile.files?.[fileType];
    if (!fileId) {
      return NextResponse.json(
        { error: 'Файл не знайдено' },
        { status: 404 }
      );
    }

    // Видаляємо файл
    fileStorage.delete(fileId);

    // Оновлюємо профіль
    const updatedFiles = { ...profile.files };
    delete updatedFiles[fileType];

    const updatedProfile = {
      ...profile,
      files: updatedFiles,
      photoUrl: fileType === 'photo' ? null : profile.photoUrl,
      lastUpdated: new Date().toISOString()
    };

    athleteProfiles.set(athleteId, updatedProfile);

    console.log(`🗑️ Файл видалено: ${fileType} для ${profile.fullName}`);

    return NextResponse.json({
      success: true,
      message: 'Файл успішно видалено',
      fileType: fileType,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('❌ Помилка видалення файлу:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
