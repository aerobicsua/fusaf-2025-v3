import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    // Перевіряємо права - тільки власники клубів та адміни можуть створювати змагання
    const canCreate = session.user?.roles?.some((role: string) =>
      ['admin', 'club_owner'].includes(role)
    );

    if (!canCreate) {
      return NextResponse.json({
        success: false,
        error: 'Недостатньо прав для створення змагань'
      }, { status: 403 });
    }

    // Перевіряємо тип контенту - FormData для файлів або JSON для звичайних даних
    const contentType = request.headers.get('content-type');
    let competitionData: any;
    const uploadedFiles: { [key: string]: File | File[] } = {};

    if (contentType?.includes('multipart/form-data')) {
      // Обробка файлів через FormData
      const formData = await request.formData();

      // Отримуємо JSON дані змагання
      const jsonData = formData.get('competitionData') as string;
      competitionData = JSON.parse(jsonData);

      // Обробляємо завантажені файли
      const regulationFile = formData.get('regulation') as File | null;
      const invitationFile = formData.get('invitation') as File | null;
      const additionalFiles = formData.getAll('additional_docs') as File[];

      // Валідація файлів
      const validateFile = (file: File | null, name: string) => {
        if (!file) return null;

        // Перевіряємо тип файлу
        if (file.type !== 'application/pdf') {
          throw new Error(`${name} повинен бути PDF файлом`);
        }

        // Перевіряємо розмір (максимум 10 МБ)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`${name} занадто великий. Максимальний розмір: 10 МБ`);
        }

        return file;
      };

      // Валідуємо кожен файл
      if (regulationFile) {
        const validatedFile = validateFile(regulationFile, 'Регламент');
        if (validatedFile) uploadedFiles.regulation = validatedFile;
      }
      if (invitationFile) {
        const validatedFile = validateFile(invitationFile, 'Запрошення');
        if (validatedFile) uploadedFiles.invitation = validatedFile;
      }
      if (additionalFiles.length > 0) {
        uploadedFiles.additional_docs = additionalFiles.map((file, index) =>
          validateFile(file, `Додатковий документ ${index + 1}`)
        ).filter(Boolean) as File[];
      }
    } else {
      // Звичайний JSON запит без файлів
      competitionData = await request.json();
    }

    // Валідація обов'язкових полів
    if (!competitionData.title?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Назва змагання є обов\'язковою'
      }, { status: 400 });
    }

    if (!competitionData.date) {
      return NextResponse.json({
        success: false,
        error: 'Дата змагання є обов\'язковою'
      }, { status: 400 });
    }

    if (!competitionData.location?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Місце проведення є обов\'язковим'
      }, { status: 400 });
    }

    if (!competitionData.contact_person?.name?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Контактна особа є обов\'язковою'
      }, { status: 400 });
    }

    if (!competitionData.categories || competitionData.categories.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Оберіть хоча б одну категорію'
      }, { status: 400 });
    }

    // Генеруємо ID змагання (в реальній системі це буде зроблено БД)
    const competitionId = `comp-${Date.now()}`;

    // Функція для симуляції збереження файлу (в реальній системі це буде завантаження на сервер/хмару)
    const saveFile = async (file: File, type: string): Promise<string> => {
      // В реальній системі тут би було:
      // 1. Збереження файлу на сервер/S3/CloudFlare
      // 2. Генерація унікального URL
      // 3. Збереження метаданих в БД

      // Для демо створюємо посилання на файл
      const timestamp = Date.now();
      const fileName = `${type}_${competitionId}_${timestamp}_${file.name}`;
      const fileUrl = `/api/competitions/${competitionId}/documents/${fileName}`;

      console.log(`📁 Збережено файл: ${file.name} (${file.size} bytes) як ${fileName}`);

      return fileUrl;
    };

    // Обробляємо завантажені документи
    const documents: {
      regulation?: { name: string; url: string; size: number };
      invitation?: { name: string; url: string; size: number };
      additional_docs?: Array<{ name: string; url: string; size: number }>;
    } = {};

    if (uploadedFiles.regulation) {
      const file = uploadedFiles.regulation as File;
      documents.regulation = {
        name: file.name,
        url: await saveFile(file, 'regulation'),
        size: file.size
      };
    }

    if (uploadedFiles.invitation) {
      const file = uploadedFiles.invitation as File;
      documents.invitation = {
        name: file.name,
        url: await saveFile(file, 'invitation'),
        size: file.size
      };
    }

    if (uploadedFiles.additional_docs && Array.isArray(uploadedFiles.additional_docs)) {
      documents.additional_docs = await Promise.all(
        uploadedFiles.additional_docs.map(async (file, index) => ({
          name: file.name,
          url: await saveFile(file, `additional_${index}`),
          size: file.size
        }))
      );
    }

    // Створюємо змагання (демонстраційна логіка)
    const newCompetition = {
      id: competitionId,
      title: competitionData.title,
      description: competitionData.description || '',
      date: competitionData.date,
      time: competitionData.time || '10:00',
      location: competitionData.location,
      address: competitionData.address || '',
      city: competitionData.city || '',
      // Нові поля для фінансів по програмах
      program_fees: {
        iw_im: competitionData.program_fees?.iw_im || 0,
        mp: competitionData.program_fees?.mp || 0,
        tr: competitionData.program_fees?.tr || 0,
        gr: competitionData.program_fees?.gr || 0,
        ad: competitionData.program_fees?.ad || 0,
        as: competitionData.program_fees?.as || 0
      },
      // Зворотна сумісність (розраховуємо середню вартість)
      registration_fee: Math.round((Object.values(competitionData.program_fees || {}).reduce((sum: number, fee: unknown) => {
        const numericFee = typeof fee === 'number' ? fee : (typeof fee === 'string' ? parseFloat(fee as string) : 0);
        return sum + (isNaN(numericFee) ? 0 : numericFee);
      }, 0 as number) as number) / 6) || 0,
      entry_fee: 0,
      // Нові поля для максимальної кількості учасників по програмах
      max_participants_by_program: {
        iw: competitionData.max_participants_by_program?.iw || 0,
        im: competitionData.max_participants_by_program?.im || 0,
        mp: competitionData.max_participants_by_program?.mp || 0,
        tr: competitionData.max_participants_by_program?.tr || 0,
        gr: competitionData.max_participants_by_program?.gr || 0,
        ad: competitionData.max_participants_by_program?.ad || 0,
        as: competitionData.max_participants_by_program?.as || 0
      },
      // Зворотна сумісність (сума всіх учасників)
      max_participants: Object.values(competitionData.max_participants_by_program || {}).reduce((sum: number, count: unknown) => sum + Number(count), 0) || 100,
      registration_deadline: competitionData.registration_deadline || competitionData.date,
      status: 'draft', // Нові змагання створюються як чернетка
      organizing_club: competitionData.organizing_club || '',
      contact_person: {
        name: competitionData.contact_person.name,
        position: competitionData.contact_person.position || '',
        phone: competitionData.contact_person.phone,
        email: competitionData.contact_person.email
      },
      payment_details: {
        bank_name: competitionData.payment_details?.bank_name || '',
        account_number: competitionData.payment_details?.account_number || '',
        account_holder: competitionData.payment_details?.account_holder || '',
        swift_code: competitionData.payment_details?.swift_code || ''
      },
      categories: competitionData.categories,
      rules: competitionData.rules || '',
      equipment_requirements: competitionData.equipment_requirements || '',
      accommodation: {
        available: competitionData.accommodation?.available || false,
        details: competitionData.accommodation?.details || '',
        cost_per_night: competitionData.accommodation?.cost_per_night || null
      },
      meals: {
        available: competitionData.meals?.available || false,
        details: competitionData.meals?.details || '',
        cost_per_meal: competitionData.meals?.cost_per_meal || null
      },
      transportation: {
        available: competitionData.transportation?.available || false,
        details: competitionData.transportation?.details || ''
      },
      medical_requirements: competitionData.medical_requirements || '',
      insurance_required: competitionData.insurance_required !== false,
      notes: competitionData.notes || '',
      website: competitionData.website || '',
      // Додаємо завантажені документи
      documents,
      created_by: session.user.email,
      created_at: new Date().toISOString(),
      preliminary_registrations: [],
      individual_registrations: []
    };

    // В реальній системі тут би було збереження в БД
    console.log('🏆 Створення нового змагання:', {
      id: competitionId,
      title: newCompetition.title,
      date: newCompetition.date,
      organizer: session.user.email,
      categories: newCompetition.categories,
      documentsCount: {
        regulation: !!documents.regulation,
        invitation: !!documents.invitation,
        additional: documents.additional_docs?.length || 0
      }
    });

    // Підготуємо повідомлення про завантажені документи
    const documentsInfo = [];
    if (documents.regulation) documentsInfo.push('📄 Регламент');
    if (documents.invitation) documentsInfo.push('📋 Запрошення');
    if (documents.additional_docs?.length) {
      documentsInfo.push(`📁 Додаткових документів: ${documents.additional_docs.length}`);
    }

    const documentsMessage = documentsInfo.length > 0
      ? `\n\nЗавантажені документи:\n${documentsInfo.join('\n')}`
      : '';

    // Відправляємо сповіщення про нове змагання (асинхронно)
    if (newCompetition.status === 'published' || newCompetition.status === 'registration_open') {
      try {
        // Викликаємо API сповіщень асинхронно
        fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send-competition-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '', // Передаємо сесію
          },
          body: JSON.stringify({
            competition: newCompetition
          })
        }).then(response => {
          if (response.ok) {
            console.log('✅ Сповіщення про нове змагання відправлено');
          } else {
            console.error('❌ Помилка відправки сповіщень');
          }
        }).catch(error => {
          console.error('❌ Помилка при відправці сповіщень:', error);
        });
      } catch (error) {
        console.error('❌ Помилка при ініціації відправки сповіщень:', error);
      }
    }

    // Симулюємо успішне створення
    return NextResponse.json({
      success: true,
      competition: newCompetition,
      message: `Змагання успішно створено! Воно збережено як чернетка.${documentsMessage}`,
      documents: documents,
      notifications: newCompetition.status === 'published' || newCompetition.status === 'registration_open'
        ? 'Сповіщення надіслано підписникам'
        : 'Сповіщення будуть надіслані після публікації'
    });

  } catch (error) {
    console.error('Помилка створення змагання:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}
