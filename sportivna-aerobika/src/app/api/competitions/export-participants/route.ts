import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed

// Симуляція даних учасників
const mockParticipants = [
  {
    id: 'p1',
    name: 'Іваненко Марія',
    lastName: 'Іваненко',
    firstName: 'Марія',
    middleName: 'Петрівна',
    birthDate: '2008-05-15',
    gender: 'female',
    email: 'maria.ivanenko@email.com',
    phone: '+380 67 123 45 67',
    club: 'СК "Грація"',
    city: 'Київ',
    coach: 'Петренко Ольга Василівна',
    program: 'iw',
    category: 'youth',
    registrationType: 'individual',
    registrationDate: '2025-01-15',
    paymentStatus: 'paid',
    medicalCertificate: true,
    insurance: true
  },
  {
    id: 'p2',
    name: 'Коваленко Андрій',
    lastName: 'Коваленко',
    firstName: 'Андрій',
    middleName: 'Васильович',
    birthDate: '2006-08-22',
    gender: 'male',
    email: 'andriy.kovalenko@email.com',
    phone: '+380 93 987 65 43',
    club: 'Аеробіка Львів',
    city: 'Львів',
    coach: 'Сидоренко Ігор Петрович',
    program: 'im',
    category: 'juniors',
    registrationType: 'individual',
    registrationDate: '2025-01-18',
    paymentStatus: 'pending',
    medicalCertificate: true,
    insurance: true
  },
  {
    id: 'p3',
    name: 'Степаненко Анна & Мельник Олег',
    lastName: 'Степаненко/Мельник',
    firstName: 'Анна/Олег',
    middleName: '',
    birthDate: '2004-03-10 / 2003-11-05',
    gender: 'mixed',
    email: 'pair.stepanenko.melnyk@email.com',
    phone: '+380 50 111 22 33',
    club: 'Фітнес-Динаміка',
    city: 'Дніпро',
    coach: 'Тимошенко Марина Олександрівна',
    program: 'mp',
    category: 'seniors',
    registrationType: 'preliminary',
    registrationDate: '2025-01-20',
    paymentStatus: 'paid',
    medicalCertificate: true,
    insurance: true
  },
  {
    id: 'p4',
    name: 'Команда "Зірочки"',
    lastName: 'Команда',
    firstName: 'Зірочки',
    middleName: '',
    birthDate: '2009-07-01 (середній вік)',
    gender: 'female',
    email: 'team.zirochky@email.com',
    phone: '+380 44 555 66 77',
    club: 'СК "Грація"',
    city: 'Київ',
    coach: 'Шевченко Тетяна Миколаївна',
    program: 'gr',
    category: 'youth',
    registrationType: 'preliminary',
    registrationDate: '2025-01-12',
    paymentStatus: 'paid',
    medicalCertificate: true,
    insurance: true
  }
];

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    // Перевіряємо права - тільки організатори можуть експортувати дані
    const canExport = (session.user as any)?.roles?.some((role: string) =>
      ['admin', 'club_owner', 'coach_judge'].includes(role)
    );

    if (!canExport) {
      return NextResponse.json({
        success: false,
        error: 'Недостатньо прав для експорту даних'
      }, { status: 403 });
    }

    const { competitionId, settings } = await request.json();

    if (!competitionId || !settings) {
      return NextResponse.json({
        success: false,
        error: 'Не вказано ID змагання або налаштування експорту'
      }, { status: 400 });
    }

    // Фільтруємо учасників згідно налаштувань
    let filteredParticipants = [...mockParticipants];

    if (settings.filterBy.program !== 'all') {
      filteredParticipants = filteredParticipants.filter(p => p.program === settings.filterBy.program);
    }

    if (settings.filterBy.category !== 'all') {
      filteredParticipants = filteredParticipants.filter(p => p.category === settings.filterBy.category);
    }

    if (settings.filterBy.registrationType !== 'all') {
      filteredParticipants = filteredParticipants.filter(p => p.registrationType === settings.filterBy.registrationType);
    }

    console.log(`📊 Експорт учасників змагання ${competitionId}:`, {
      format: settings.format,
      totalParticipants: filteredParticipants.length,
      filters: settings.filterBy,
      fields: settings.includeFields,
      user: session.user.email
    });

    // Генеруємо файл згідно обраного формату
    if (settings.format === 'excel') {
      return generateExcelFile(filteredParticipants, settings);
    } else if (settings.format === 'pdf') {
      return generatePDFFile(filteredParticipants, settings);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Невідомий формат експорту'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Помилка експорту учасників:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}

function generateExcelFile(participants: any[], settings: any) {
  // Симуляція генерації Excel файлу
  const csvContent = generateCSVContent(participants, settings);

  // Конвертуємо CSV в blob для завантаження
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="participants.xlsx"'
    }
  });
}

function generatePDFFile(participants: any[], settings: any) {
  // Симуляція генерації PDF файлу
  const htmlContent = generateHTMLContent(participants, settings);

  // В реальній системі тут би була конвертація HTML в PDF
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="participants.pdf"'
    }
  });
}

function generateCSVContent(participants: any[], settings: any): string {
  const headers = [];

  if (settings.includeFields.personalInfo) {
    headers.push('Прізвище', 'Ім\'я', 'По батькові', 'Дата народження', 'Стать');
  }

  if (settings.includeFields.contactInfo) {
    headers.push('Email', 'Телефон');
  }

  if (settings.includeFields.clubInfo) {
    headers.push('Клуб', 'Місто', 'Тренер');
  }

  if (settings.includeFields.programInfo) {
    headers.push('Програма', 'Категорія');
  }

  if (settings.includeFields.paymentInfo) {
    headers.push('Статус оплати', 'Дата реєстрації');
  }

  if (settings.includeFields.medicalInfo) {
    headers.push('Медична довідка', 'Страхування');
  }

  let csvContent = headers.join(',') + '\n';

  participants.forEach(participant => {
    const row = [];

    if (settings.includeFields.personalInfo) {
      row.push(
        participant.lastName,
        participant.firstName,
        participant.middleName,
        participant.birthDate,
        participant.gender === 'male' ? 'Чоловіча' : participant.gender === 'female' ? 'Жіноча' : 'Змішана'
      );
    }

    if (settings.includeFields.contactInfo) {
      row.push(participant.email, participant.phone);
    }

    if (settings.includeFields.clubInfo) {
      row.push(participant.club, participant.city, participant.coach);
    }

    if (settings.includeFields.programInfo) {
      const programNames = {
        'iw': 'Individual Women',
        'im': 'Individual Men',
        'mp': 'Mixed Pairs',
        'tr': 'Trio',
        'gr': 'Group',
        'ad': 'Aerobic Dance',
        'as': 'Aerobic Step'
      };

      const categoryNames = {
        'youth': 'YOUTH / 12-14 YEARS',
        'juniors': 'JUNIORS / 15-17 YEARS',
        'seniors': 'SENIORS 18+ YEARS',
        'nd': 'ND',
        'ndmini': 'NDmini'
      };

      row.push(
        programNames[participant.program as keyof typeof programNames] || participant.program,
        categoryNames[participant.category as keyof typeof categoryNames] || participant.category
      );
    }

    if (settings.includeFields.paymentInfo) {
      row.push(
        participant.paymentStatus === 'paid' ? 'Сплачено' : 'Очікує оплати',
        participant.registrationDate
      );
    }

    if (settings.includeFields.medicalInfo) {
      row.push(
        participant.medicalCertificate ? 'Є' : 'Немає',
        participant.insurance ? 'Є' : 'Немає'
      );
    }

    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });

  return csvContent;
}

function generateHTMLContent(participants: any[], settings: any): string {
  const headers = [];

  if (settings.includeFields.personalInfo) {
    headers.push('Прізвище', 'Ім\'я', 'Дата народження');
  }

  if (settings.includeFields.clubInfo) {
    headers.push('Клуб', 'Місто');
  }

  if (settings.includeFields.programInfo) {
    headers.push('Програма', 'Категорія');
  }

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Список учасників</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #2563eb; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Список учасників змагання</h1>
      <p>Дата експорту: ${new Date().toLocaleDateString('uk-UA')}</p>
      <p>Кількість учасників: ${participants.length}</p>

      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  participants.forEach(participant => {
    htmlContent += '<tr>';

    if (settings.includeFields.personalInfo) {
      htmlContent += `<td>${participant.lastName}</td>`;
      htmlContent += `<td>${participant.firstName}</td>`;
      htmlContent += `<td>${participant.birthDate}</td>`;
    }

    if (settings.includeFields.clubInfo) {
      htmlContent += `<td>${participant.club}</td>`;
      htmlContent += `<td>${participant.city}</td>`;
    }

    if (settings.includeFields.programInfo) {
      const programNames = {
        'iw': 'Individual Women',
        'im': 'Individual Men',
        'mp': 'Mixed Pairs',
        'tr': 'Trio',
        'gr': 'Group',
        'ad': 'Aerobic Dance',
        'as': 'Aerobic Step'
      };

      htmlContent += `<td>${programNames[participant.program as keyof typeof programNames] || participant.program}</td>`;
      htmlContent += `<td>${participant.category}</td>`;
    }

    htmlContent += '</tr>';
  });

  htmlContent += `
        </tbody>
      </table>

      <div class="footer">
        <p>Згенеровано системою ФУСАФ • Федерація України зі спортивної аеробіки і фітнесу</p>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}
