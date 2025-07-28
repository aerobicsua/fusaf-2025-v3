import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { clubId, format, userEmail, clubData, trainersData, athletesData, applicationsData } = await request.json();

    console.log(`📊 Експорт статистики клубу ${clubId} у форматі ${format} для користувача ${userEmail}`);

    // Отримуємо дані з запиту (передані з клієнта)
    const club = clubData;
    const clubTrainers = trainersData || [];
    const clubAthletes = athletesData || [];
    const applications = applicationsData || [];

    if (!club) {
      return NextResponse.json({
        success: false,
        error: 'Дані клубу не надано'
      }, { status: 404 });
    }

    // Підготовка даних для експорту
    const exportData = {
      club: {
        name: club.name,
        address: club.address,
        city: club.city,
        region: club.region,
        owner: club.owner,
        approvedAt: club.approvedAt
      },
      statistics: {
        totalTrainers: clubTrainers.length,
        totalAthletes: clubAthletes.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((app: any) => app.status === 'pending').length,
        approvedApplications: applications.filter((app: any) => app.status === 'approved').length,
        rejectedApplications: applications.filter((app: any) => app.status === 'rejected').length
      },
      trainers: clubTrainers.map((trainer: any) => ({
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        specialization: trainer.specialization,
        roles: trainer.roles.join(', '),
        approvedAt: new Date(trainer.approvedAt).toLocaleDateString('uk-UA'),
        judgeInfo: trainer.judgeInfo ? `${trainer.judgeInfo.category} (${trainer.judgeInfo.license})` : 'Н/Д'
      })),
      athletes: clubAthletes.map((athlete: any) => ({
        name: athlete.name,
        email: athlete.email,
        phone: athlete.phone,
        dateOfBirth: athlete.dateOfBirth || 'Н/Д',
        city: athlete.city,
        registeredAt: new Date(athlete.registeredAt).toLocaleDateString('uk-UA')
      })),
      applications: applications.map((app: any) => ({
        name: app.name,
        email: app.email,
        status: app.status === 'pending' ? 'На розгляді' :
                app.status === 'approved' ? 'Схвалено' : 'Відхилено',
        submittedAt: new Date(app.submittedAt).toLocaleDateString('uk-UA'),
        reviewedAt: app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString('uk-UA') : 'Н/Д'
      }))
    };

    if (format === 'excel') {
      // Генерація Excel файлу (CSV формат для простоти)
      const csvData = generateCSV(exportData);

      return NextResponse.json({
        success: true,
        message: 'Excel файл готовий до завантаження',
        data: csvData,
        filename: `club_${club.name}_stats_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv'
      });
    } else if (format === 'pdf') {
      // Генерація PDF (HTML для простоти - можна конвертувати в PDF)
      const htmlData = generateHTML(exportData);

      return NextResponse.json({
        success: true,
        message: 'PDF файл готовий до завантаження',
        data: htmlData,
        filename: `club_${club.name}_stats_${new Date().toISOString().split('T')[0]}.html`,
        mimeType: 'text/html'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Невідомий формат експорту'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Помилка експорту статистики:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка створення експорту'
    }, { status: 500 });
  }
}

function generateCSV(data: any): string {
  const { club, statistics, trainers, athletes, applications } = data;

  let csv = '';

  // Інформація про клуб
  csv += 'ІНФОРМАЦІЯ ПРО КЛУБ\n';
  csv += `Назва,${club.name}\n`;
  csv += `Адреса,"${club.address}, ${club.city}, ${club.region}"\n`;
  csv += `Керівник,${club.owner.name}\n`;
  csv += `Email керівника,${club.owner.email}\n`;
  csv += `Дата реєстрації,${new Date(club.approvedAt).toLocaleDateString('uk-UA')}\n\n`;

  // Статистика
  csv += 'СТАТИСТИКА\n';
  csv += `Тренерів,${statistics.totalTrainers}\n`;
  csv += `Спортсменів,${statistics.totalAthletes}\n`;
  csv += `Заявок загалом,${statistics.totalApplications}\n`;
  csv += `На розгляді,${statistics.pendingApplications}\n`;
  csv += `Схвалено,${statistics.approvedApplications}\n`;
  csv += `Відхилено,${statistics.rejectedApplications}\n\n`;

  // Тренери
  if (trainers.length > 0) {
    csv += 'ТРЕНЕРИ\n';
    csv += 'Ім\'я,Email,Телефон,Спеціалізація,Ролі,Дата схвалення,Суддівська інформація\n';
    trainers.forEach((trainer: any) => {
      csv += `"${trainer.name}",${trainer.email},${trainer.phone},"${trainer.specialization}","${trainer.roles}",${trainer.approvedAt},"${trainer.judgeInfo}"\n`;
    });
    csv += '\n';
  }

  // Спортсмени
  if (athletes.length > 0) {
    csv += 'СПОРТСМЕНИ\n';
    csv += 'Ім\'я,Email,Телефон,Дата народження,Місто,Дата реєстрації\n';
    athletes.forEach((athlete: any) => {
      csv += `"${athlete.name}",${athlete.email},${athlete.phone},${athlete.dateOfBirth},"${athlete.city}",${athlete.registeredAt}\n`;
    });
    csv += '\n';
  }

  // Заявки
  if (applications.length > 0) {
    csv += 'ЗАЯВКИ ТРЕНЕРІВ\n';
    csv += 'Ім\'я,Email,Статус,Дата подачі,Дата розгляду\n';
    applications.forEach((app: any) => {
      csv += `"${app.name}",${app.email},"${app.status}",${app.submittedAt},${app.reviewedAt}\n`;
    });
  }

  return csv;
}

function generateHTML(data: any): string {
  const { club, statistics, trainers, athletes, applications } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Статистика клубу ${club.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #007bff; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f8f9fa; font-weight: bold; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
    .club-info { background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Статистика клубу "${club.name}"</h1>
    <p>Згенеровано: ${new Date().toLocaleDateString('uk-UA')} ${new Date().toLocaleTimeString('uk-UA')}</p>
  </div>

  <div class="section">
    <h2>🏢 Інформація про клуб</h2>
    <div class="club-info">
      <p><strong>Назва:</strong> ${club.name}</p>
      <p><strong>Адреса:</strong> ${club.address}, ${club.city}, ${club.region}</p>
      <p><strong>Керівник:</strong> ${club.owner.name}</p>
      <p><strong>Email керівника:</strong> ${club.owner.email}</p>
      <p><strong>Дата реєстрації:</strong> ${new Date(club.approvedAt).toLocaleDateString('uk-UA')}</p>
    </div>
  </div>

  <div class="section">
    <h2>📈 Загальна статистика</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${statistics.totalTrainers}</div>
        <div>Тренерів</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${statistics.totalAthletes}</div>
        <div>Спортсменів</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${statistics.totalApplications}</div>
        <div>Заявок</div>
      </div>
    </div>
  </div>

  ${trainers.length > 0 ? `
  <div class="section">
    <h2>👨‍🏫 Тренери (${trainers.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Ім'я</th>
          <th>Email</th>
          <th>Спеціалізація</th>
          <th>Ролі</th>
          <th>Дата схвалення</th>
        </tr>
      </thead>
      <tbody>
        ${trainers.map((trainer: any) => `
          <tr>
            <td>${trainer.name}</td>
            <td>${trainer.email}</td>
            <td>${trainer.specialization}</td>
            <td>${trainer.roles}</td>
            <td>${trainer.approvedAt}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${athletes.length > 0 ? `
  <div class="section">
    <h2>🏃‍♂️ Спортсмени (${athletes.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Ім'я</th>
          <th>Email</th>
          <th>Місто</th>
          <th>Дата реєстрації</th>
        </tr>
      </thead>
      <tbody>
        ${athletes.map((athlete: any) => `
          <tr>
            <td>${athlete.name}</td>
            <td>${athlete.email}</td>
            <td>${athlete.city}</td>
            <td>${athlete.registeredAt}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${applications.length > 0 ? `
  <div class="section">
    <h2>📋 Заявки тренерів (${applications.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Ім'я</th>
          <th>Email</th>
          <th>Статус</th>
          <th>Дата подачі</th>
          <th>Дата розгляду</th>
        </tr>
      </thead>
      <tbody>
        ${applications.map((app: any) => `
          <tr>
            <td>${app.name}</td>
            <td>${app.email}</td>
            <td>${app.status}</td>
            <td>${app.submittedAt}</td>
            <td>${app.reviewedAt}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div style="margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
    <p>Згенеровано системою ФУСАФ • ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;
}

export async function GET() {
  return NextResponse.json({
    message: 'API для експорту статистики клубу. Використовуйте POST запит з clubId та format.'
  });
}
