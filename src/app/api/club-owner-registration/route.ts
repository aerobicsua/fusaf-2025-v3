import { NextRequest, NextResponse } from 'next/server';
import { ClubRequestsStorage } from '@/lib/club-requests-storage';
import { executeQuery } from '@/lib/mysql';
import { EmailService } from '@/lib/email';
import bcrypt from 'bcryptjs';

// Тимчасове сховище для файлів (в реальному проекті використовуйте cloud storage)
const uploadedFiles = new Map<string, { name: string, size: number, type: string, data: string }>();

export async function POST(request: NextRequest) {
  try {
    console.log('🏢 Реєстрація керівника клубу/підрозділу розпочата');

    // Безпечне отримання FormData
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('❌ Помилка парсингу FormData:', error);
      return NextResponse.json(
        { success: false, error: 'Помилка обробки форми' },
        { status: 400 }
      );
    }

    // Отримуємо всі поля з форми
    const rawPassword = formData.get('password');
    console.log('🔑 Пароль з FormData:', rawPassword ? `✓ отримано (довжина: ${rawPassword.toString().length})` : '✗ не отримано');

    const clubOwnerData = {
      // Особисті дані
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      middleName: formData.get('middleName') as string || '',
      position: formData.get('position') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: rawPassword as string,
      region: formData.get('region') as string,
      city: formData.get('city') as string,

      // Інформація про клуб/підрозділ
      clubName: formData.get('clubName') as string,
      clubType: formData.get('clubType') as string,
      zipCode: formData.get('zipCode') as string,
      clubRegion: formData.get('clubRegion') as string,
      clubCity: formData.get('clubCity') as string,
      clubAddress: formData.get('clubAddress') as string,
      clubDescription: formData.get('clubDescription') as string || '',
      experience: formData.get('experience') as string || '',
      achievements: formData.get('achievements') as string || '', // Нове поле для досягнень
      legalStatus: formData.get('legalStatus') as string,
      website: formData.get('website') as string || '',
    };

    console.log('📋 Отримані дані з форми:', JSON.stringify(clubOwnerData, null, 2));

    // Валідація обов'язкових полів
    const requiredFields = [
      'firstName', 'lastName', 'middleName', 'position', 'email', 'phone', 'password', 'region', 'city',
      'clubName', 'clubType', 'zipCode', 'clubRegion', 'clubCity', 'clubAddress', 'legalStatus'
    ];

    console.log('🔍 Перевірка обов\'язкових полів...');
    const missingFields = requiredFields.filter(field => {
      const value = clubOwnerData[field as keyof typeof clubOwnerData];
      const isMissing = !value || value.toString().trim() === '';
      if (isMissing) {
        console.log(`❌ Відсутнє поле: ${field} = "${value}"`);
      }
      return isMissing;
    });

    if (missingFields.length > 0) {
      console.log('❌ Валідація не пройшла. Відсутні поля:', missingFields);
      return NextResponse.json(
        { success: false, error: `Обов'язкові поля не заповнені: ${missingFields.join(', ')}` },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Валідація пройшла успішно');

    // Перевірка формату email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clubOwnerData.email)) {
      return NextResponse.json(
        { success: false, error: 'Невірний формат email адреси' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Перевірка формату телефону
    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(clubOwnerData.phone)) {
      return NextResponse.json(
        { success: false, error: 'Телефон має бути в форматі +380XXXXXXXXX' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Обробка документів про реєстрацію
    const registrationDocuments = formData.get('registrationDocuments') as File;
    let documentsFileId = null;

    if (!registrationDocuments) {
      return NextResponse.json(
        { success: false, error: 'Документи про реєстрацію юрособи/ФОП є обов\'язковими' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Перевірка типу та розміру файлу
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(registrationDocuments.type)) {
      return NextResponse.json(
        { success: false, error: 'Документи можуть бути тільки у форматі PDF, JPG або PNG' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (registrationDocuments.size > 2 * 1024 * 1024) { // 2MB
      return NextResponse.json(
        { success: false, error: 'Розмір файлу не може перевищувати 2MB' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Збереження файлу (симуляція)
    documentsFileId = `docs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const buffer = Buffer.from(await registrationDocuments.arrayBuffer());
    const base64Data = buffer.toString('base64');

    uploadedFiles.set(documentsFileId, {
      name: registrationDocuments.name,
      size: registrationDocuments.size,
      type: registrationDocuments.type,
      data: base64Data
    });

    console.log(`📁 Документи збережено: ${registrationDocuments.name}`);

    // Перевірка довжини пароля
    if (clubOwnerData.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Пароль повинен містити мінімум 6 символів' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fullName = `${clubOwnerData.lastName} ${clubOwnerData.firstName}` +
                    (clubOwnerData.middleName ? ` ${clubOwnerData.middleName}` : '');

    try {
      // Створюємо реального користувача в MySQL з паролем від користувача
      const hashedPassword = await bcrypt.hash(clubOwnerData.password, 10);
      console.log('🔑 Використовуємо пароль від користувача (довжина:', clubOwnerData.password.length, ')');
      console.log('🔒 Хеш пароля для БД створено');
      const userId = `user-${Date.now()}`;

      await executeQuery(`
        INSERT INTO users (
          id, email, password_hash, name, first_name, last_name, middle_name,
          roles, phone, region, city, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        userId,
        clubOwnerData.email.toLowerCase(),
        hashedPassword,
        fullName,
        clubOwnerData.firstName,
        clubOwnerData.lastName,
        clubOwnerData.middleName,
        JSON.stringify(['club_owner']),
        clubOwnerData.phone,
        clubOwnerData.region,
        clubOwnerData.city,
        'pending'
      ]);

      const newUser = {
        success: true,
        user: {
          id: userId,
          email: clubOwnerData.email,
          name: fullName
        }
      };
      console.log('✅ Користувач створений в MySQL:', newUser.user.email);

      // Створюємо запис керівника клубу/підрозділу
      const clubOwnerRecord = {
        id: `club-owner-${Date.now()}`,
        userId: newUser.success ? newUser.user?.id || "temp-id" : "error",

        // Особисті дані
        firstName: clubOwnerData.firstName,
        lastName: clubOwnerData.lastName,
        middleName: clubOwnerData.middleName,
        fullName: fullName,
        position: clubOwnerData.position,
        email: clubOwnerData.email,
        phone: clubOwnerData.phone,
        region: clubOwnerData.region,
        city: clubOwnerData.city,

        // Інформація про клуб/підрозділ
        clubName: clubOwnerData.clubName,
        clubType: clubOwnerData.clubType,
        clubTypeText: clubOwnerData.clubType === 'club' ? 'Клуб' : 'Підрозділ',

        // Повна адреса клубу/підрозділу
        zipCode: clubOwnerData.zipCode,
        clubRegion: clubOwnerData.clubRegion,
        clubCity: clubOwnerData.clubCity,
        clubAddress: clubOwnerData.clubAddress,
        fullClubAddress: `${clubOwnerData.zipCode}, ${clubOwnerData.clubRegion}, ${clubOwnerData.clubCity}, ${clubOwnerData.clubAddress}`,

        clubDescription: clubOwnerData.clubDescription,
        experience: clubOwnerData.experience,
        achievements: clubOwnerData.achievements, // Досягнення клубу
        legalStatus: clubOwnerData.legalStatus,
        website: clubOwnerData.website,

        // Документи
        registrationDocumentsFileId: documentsFileId,
        registrationDocumentsUrl: `/api/files/${documentsFileId}`,

        // Метадані
        role: 'club_owner',
        registrationDate: new Date().toISOString(),
        status: 'pending_approval',
        password: clubOwnerData.password,
        isApproved: false,
        approvalDate: null,
        rejectionReason: null,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Створюємо заявку для адміністратора у форматі, який очікує адмін-панель
      const clubRequest = {
        id: `request-${Date.now()}`,
        user: {
          id: newUser.success ? newUser.user?.id || "temp-id" : "error",
          name: fullName,
          email: clubOwnerData.email,
          phone: clubOwnerData.phone,
          registeredAt: new Date().toISOString()
        },
        club: {
          name: clubOwnerData.clubName,
          type: clubOwnerData.clubType as 'club' | 'subdivision',
          address: clubOwnerData.clubAddress,
          city: clubOwnerData.clubCity,
          region: clubOwnerData.clubRegion,
          zipCode: clubOwnerData.zipCode,
          description: clubOwnerData.clubDescription,
          experience: clubOwnerData.experience,
          legalStatus: clubOwnerData.legalStatus,
          website: clubOwnerData.website
        },
        status: 'pending' as const,
        submittedAt: new Date().toISOString(),
        documents: [
          {
            name: registrationDocuments.name,
            url: `/api/files/${documentsFileId}`
          }
        ]
      };

      // РЕАЛЬНО зберігаємо заявку в системі
      console.log('💾 Зберігаємо заявку в системі заявок...');

      // Додаємо заявку до MySQL
      await ClubRequestsStorage.add(clubRequest);

      // ДОДАТКОВО: Зберігаємо заявку для demo-демонстрації
      // (Симулюємо збереження в localStorage з серверної сторони)
      console.log('💾 Додатково зберігаємо заявку для демо...');

      try {
        // Надсилаємо заявку до API clubs/requests для синхронізації
        const saveResponse = await fetch(new URL('/api/clubs/requests', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clubRequest)
        });

        if (saveResponse.ok) {
          console.log('✅ Заявка збережена в API clubs/requests');
        } else {
          console.log('⚠️ Помилка збереження в API, але заявка в локальному сховищі');
        }
      } catch (apiError) {
        console.log('⚠️ API недоступний, але заявка збережена локально:', apiError);
      }

      console.log('✅ Заявка створена та збережена, ID:', clubRequest.id);

      console.log('✅ Керівник клубу/підрозділу зареєстрований:', fullName);
      console.log('✅ Заявка додана в адмін-панель для розгляду');

      // РЕАЛЬНЕ НАДСИЛАННЯ EMAIL користувачу
      console.log('📧 Надсилаємо email підтвердження користувачу...');
      try {
        const userEmailResult = await EmailService.sendEmail({
          to: clubOwnerData.email,
          type: 'club_registration',
          data: {
            name: fullName,
            email: clubOwnerData.email,
            clubName: clubOwnerData.clubName,
            clubType: clubOwnerData.clubType,
            registrationDate: new Date().toISOString()
          }
        });

        if (userEmailResult.success) {
          console.log('✅ Email користувачу надіслано успішно');
        } else {
          console.log('⚠️ Помилка надсилання email користувачу:', userEmailResult.error);
        }
      } catch (emailError) {
        console.log('⚠️ Критична помилка надсилання email користувачу:', emailError);
      }

      // РЕАЛЬНЕ НАДСИЛАННЯ EMAIL адміністратору
      console.log('📧 Надсилаємо сповіщення адміністратору...');
      try {
        const adminEmailResult = await EmailService.sendEmail({
          to: 'aerobicsua@gmail.com', // основний email адміністратора
          type: 'admin_notification',
          data: {
            clubOwnerName: fullName,
            clubName: clubOwnerData.clubName,
            clubType: clubOwnerData.clubType,
            email: clubOwnerData.email,
            phone: clubOwnerData.phone,
            registrationDate: new Date().toISOString()
          }
        });

        if (adminEmailResult.success) {
          console.log('✅ Email адміністратору надіслано успішно');
        } else {
          console.log('⚠️ Помилка надсилання email адміністратору:', adminEmailResult.error);
        }
      } catch (emailError) {
        console.log('⚠️ Критична помилка надсилання email адміністратору:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: `Заявка на реєстрацію керівника ${clubOwnerRecord.clubTypeText === 'Клуб' ? 'клубу' : 'підрозділу'} успішно подана!`,
        data: {
          clubOwnerId: clubOwnerRecord.id,
          fullName: fullName,
          email: clubOwnerData.email,
          clubName: clubOwnerData.clubName,
          clubType: clubOwnerRecord.clubTypeText,
          status: 'pending_approval',
          password: clubOwnerData.password,
          message: 'Перевірте email для отримання деталей та очікуйте на схвалення адміністратора.'
        }
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (authError: any) {
      // Видаляємо завантажений файл при помилці
      if (documentsFileId) {
        uploadedFiles.delete(documentsFileId);
      }

      console.error('❌ Помилка створення користувача:', authError);

      if (authError.message && authError.message.includes('вже існує')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Користувач з такою email адресою вже зареєстрований'
          },
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Помилка створення користувача: ' + (authError.message || 'Невідома помилка')
        },
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('❌ Помилка реєстрації керівника клубу/підрозділу:', error);

    // Завжди повертаємо JSON відповідь
    return NextResponse.json(
      {
        success: false,
        error: 'Внутрішня помилка сервера',
        details: error instanceof Error ? error.message : 'Невідома помилка'
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// API для отримання файлів документів
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const fileId = url.searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'File ID required' }, { status: 400 });
  }

  const file = uploadedFiles.get(fileId);
  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const buffer = Buffer.from(file.data, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.type,
      'Content-Length': file.size.toString(),
      'Content-Disposition': `inline; filename="${file.name}"`
    }
  });
}
