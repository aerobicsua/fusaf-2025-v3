import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, clubsData, applicationsData } = await request.json();

    console.log(`🔔 Перевірка нових заявок для користувача: ${userEmail}`);

    // Отримуємо дані з запиту (передані з клієнта)
    const approvedClubs = clubsData || [];
    const userClubs = approvedClubs.filter((club: any) =>
      club.owner?.email === userEmail
    );

    if (userClubs.length === 0) {
      return NextResponse.json({
        success: true,
        newApplications: 0,
        notifications: []
      });
    }

    // Отримуємо заявки з запиту
    const allApplications = applicationsData || [];

    // Фільтруємо заявки для клубів користувача
    const userClubApplications = allApplications.filter((app: any) =>
      userClubs.some((club: any) => club.id === app.preferredClub.id)
    );

    // Знаходимо нові заявки (за останні 24 години)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const newApplications = userClubApplications.filter((app: any) => {
      const submittedDate = new Date(app.submittedAt);
      return submittedDate >= oneDayAgo && app.status === 'pending';
    });

    // Знаходимо заявки на розгляді
    const pendingApplications = userClubApplications.filter((app: any) =>
      app.status === 'pending'
    );

    // Підготовка сповіщень
    const notifications = newApplications.map((app: any) => {
      const club = userClubs.find((club: any) => club.id === app.preferredClub.id);
      return {
        id: app.id,
        applicantName: app.name,
        clubName: club?.name,
        submittedAt: app.submittedAt,
        roles: app.roles,
        message: app.applicationMessage
      };
    });

    // Якщо є нові заявки і користувач налаштував email сповіщення
    if (newApplications.length > 0) {
      try {
        await sendNotificationEmail(userEmail, newApplications, userClubs);
        console.log('✅ Email сповіщення про нові заявки надіслано');
      } catch (emailError) {
        console.error('❌ Помилка надсилання email сповіщення:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      newApplications: newApplications.length,
      pendingApplications: pendingApplications.length,
      totalApplications: userClubApplications.length,
      notifications,
      summary: {
        totalClubs: userClubs.length,
        clubNames: userClubs.map((club: any) => club.name)
      }
    });

  } catch (error) {
    console.error('❌ Помилка перевірки нових заявок:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка перевірки заявок'
    }, { status: 500 });
  }
}

async function sendNotificationEmail(userEmail: string, newApplications: any[], userClubs: any[]) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'aerobicsua@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'demo_password'
    }
  });

  const clubsWithApps = newApplications.reduce((acc: any, app: any) => {
    const clubName = app.preferredClub.name;
    if (!acc[clubName]) {
      acc[clubName] = [];
    }
    acc[clubName].push(app);
    return acc;
  }, {});

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Нові заявки тренерів - ФУСАФ</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #007bff;">🔔 Нові заявки тренерів!</h1>
      </div>

      <div style="background: #e7f3ff; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #0056b3; margin-top: 0;">Шановний керівник клубу!</h2>

        <p>У вас є <strong>${newApplications.length}</strong> ${newApplications.length === 1 ? 'нова заявка' : 'нових заявок'} від тренерів/суддів, які потребують вашого розгляду.</p>

        ${Object.entries(clubsWithApps).map(([clubName, apps]: [string, any]) => `
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0; color: #007bff;">🏢 ${clubName}</h3>
            ${(apps as any[]).map(app => `
              <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                <p style="margin: 0;"><strong>👤 ${app.name}</strong></p>
                <p style="margin: 5px 0; color: #666; font-size: 14px;">
                  Ролі: ${app.roles.map((role: string) => role === 'coach' ? 'Тренер' : 'Суддя').join(', ')}
                </p>
                <p style="margin: 5px 0; color: #666; font-size: 14px;">
                  Подано: ${new Date(app.submittedAt).toLocaleDateString('uk-UA')} ${new Date(app.submittedAt).toLocaleTimeString('uk-UA')}
                </p>
                ${app.applicationMessage ? `
                  <p style="margin: 5px 0; font-style: italic; color: #666; font-size: 14px;">
                    "${app.applicationMessage}"
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>

      <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #155724; margin-top: 0;">🎯 Що робити далі:</h3>
        <ul style="color: #155724;">
          <li>Перейдіть до дашборду керівника клубу</li>
          <li>Переглянуте детальну інформацію про кожного заявника</li>
          <li>Прийміть рішення про схвалення або відхилення</li>
          <li>Додайте коментар для тренера</li>
        </ul>

        <div style="text-align: center; margin-top: 20px;">
          <a href="https://fusaf.org.ua/club-manager/trainer-applications"
             style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            📋 Переглянути заявки
          </a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; background: #1f2937; color: white; border-radius: 8px;">
        <h3 style="margin-top: 0;">Федерація України зі Спортивної Аеробіки і Фітнесу</h3>
        <p>📧 Email: info@fusaf.org.ua</p>
        <p>🌐 Сайт: <a href="https://fusaf.org.ua" style="color: #60a5fa;">fusaf.org.ua</a></p>
      </div>

      <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">
        © 2024 ФУСАФ. Автоматичне сповіщення.
      </p>
    </div>
  </body>
  </html>`;

  const textContent = `
🔔 Нові заявки тренерів!

Шановний керівник клубу!

У вас є ${newApplications.length} ${newApplications.length === 1 ? 'нова заявка' : 'нових заявок'} від тренерів/суддів.

${Object.entries(clubsWithApps).map(([clubName, apps]: [string, any]) => `
🏢 ${clubName}:
${(apps as any[]).map(app => `
  • ${app.name} (${app.roles.map((role: string) => role === 'coach' ? 'Тренер' : 'Суддя').join(', ')})
    Подано: ${new Date(app.submittedAt).toLocaleDateString('uk-UA')}
    ${app.applicationMessage ? `Повідомлення: "${app.applicationMessage}"` : ''}
`).join('')}
`).join('')}

Перейдіть до дашборду для розгляду заявок: https://fusaf.org.ua/club-manager/trainer-applications

ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу
`;

  const mailOptions = {
    from: `"ФУСАФ" <${process.env.EMAIL_USER || 'aerobicsua@gmail.com'}>`,
    to: userEmail,
    subject: `🔔 Нові заявки тренерів (${newApplications.length}) - ФУСАФ`,
    text: textContent,
    html: htmlContent
  };

  // Перевіряємо чи налаштовані реальні email credentials
  const hasRealCredentials = process.env.EMAIL_PASSWORD &&
                            process.env.EMAIL_PASSWORD !== 'demo_password' &&
                            process.env.EMAIL_USER &&
                            process.env.EMAIL_USER !== 'aerobicsua@gmail.com';

  if (hasRealCredentials) {
    await transporter.sendMail(mailOptions);
  } else {
    console.log('📧 ДЕМО режим - сповіщення про нові заявки (було б надіслано на):', userEmail);
    console.log('📧 Кількість нових заявок:', newApplications.length);
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API для перевірки нових заявок тренерів. Використовуйте POST запит з userEmail.'
  });
}
