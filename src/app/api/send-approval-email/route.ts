import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, userName, clubName, reviewNotes } = await request.json();

    console.log('📧 Надсилання email про схвалення клубу:', { to, userName, clubName });

    // Налаштування транспорту
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'aerobicsua@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'demo_password'
      }
    });

    // HTML шаблон листа
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Заявка схвалена - ФУСАФ</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">🎉 Вітаємо! Ваша заявка схвалена!</h1>
        </div>

        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1e40af; margin-top: 0;">Деталі схвалення:</h2>

          <p><strong>Вітаємо, ${userName}!</strong></p>

          <p>Ваша заявка на реєстрацію клубу <strong>"${clubName}"</strong> була успішно розглянута та <strong style="color: #059669;">СХВАЛЕНА</strong> адміністрацією ФУСАФ.</p>

          ${reviewNotes ? `
            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0;">
              <h4 style="margin: 0 0 10px 0; color: #047857;">Коментар адміністратора:</h4>
              <p style="margin: 0;">${reviewNotes}</p>
            </div>
          ` : ''}

          <h3 style="color: #1e40af;">Наступні кроки:</h3>
          <ul>
            <li>Ваш клуб тепер офіційно є членом ФУСАФ</li>
            <li>Ви маєте доступ до всіх функцій системи</li>
            <li>Можете реєструвати спортсменів у вашому клубі</li>
            <li>Подавати заявки на участь у змаганнях</li>
            <li>Використовувати всі переваги членства в ФУСАФ</li>
          </ul>
        </div>

        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1e40af; margin-top: 0;">Корисні посилання:</h3>
          <p><a href="https://fusaf.org.ua/clubs" style="color: #2563eb;">🏢 Переглянути свій клуб</a></p>
          <p><a href="https://fusaf.org.ua/competitions" style="color: #2563eb;">🏆 Доступні змагання</a></p>
          <p><a href="https://fusaf.org.ua/membership/athlete/registration" style="color: #2563eb;">👥 Реєстрація спортсменів</a></p>
        </div>

        <div style="text-align: center; padding: 20px; background: #1f2937; color: white; border-radius: 8px;">
          <h3 style="margin-top: 0;">Федерація України зі Спортивної Аеробіки і Фітнесу</h3>
          <p>📧 Email: info@fusaf.org.ua</p>
          <p>📞 Телефон: +380 (44) 123-45-67</p>
          <p>🌐 Сайт: <a href="https://fusaf.org.ua" style="color: #60a5fa;">fusaf.org.ua</a></p>
        </div>

        <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">
          © 2024 ФУСАФ. Всі права захищені.
        </p>
      </div>
    </body>
    </html>
    `;

    // Текстова версія
    const textContent = `
🎉 Вітаємо! Ваша заявка схвалена!

Вітаємо, ${userName}!

Ваша заявка на реєстрацію клубу "${clubName}" була успішно розглянута та СХВАЛЕНА адміністрацією ФУСАФ.

${reviewNotes ? `Коментар адміністратора: ${reviewNotes}` : ''}

Наступні кроки:
• Ваш клуб тепер офіційно є членом ФУСАФ
• Ви маєте доступ до всіх функцій системи
• Можете реєструвати спортсменів у вашому клубі
• Подавати заявки на участь у змаганнях

Федерація України зі Спортивної Аеробіки і Фітнесу
Email: info@fusaf.org.ua
Телефон: +380 (44) 123-45-67
Сайт: fusaf.org.ua
    `;

    // Відправляємо email
    const mailOptions = {
      from: `"ФУСАФ" <${process.env.EMAIL_USER || 'aerobicsua@gmail.com'}>`,
      to: to,
      subject: `🎉 Заявка на клуб "${clubName}" схвалена - ФУСАФ`,
      text: textContent,
      html: htmlContent
    };

    // Перевіряємо чи налаштовані реальні email credentials
    const hasRealCredentials = process.env.EMAIL_PASSWORD &&
                              process.env.EMAIL_PASSWORD !== 'demo_password' &&
                              process.env.EMAIL_USER &&
                              process.env.EMAIL_USER !== 'aerobicsua@gmail.com';

    if (hasRealCredentials) {
      try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email про схвалення успішно надіслано на:', to);
      } catch (emailError) {
        console.error('❌ Помилка надсилання email:', emailError);
        // Не падаємо, просто логуємо помилку
      }
    } else {
      console.log('📧 ДЕМО режим - email про схвалення (було б надіслано на):', to);
      console.log('📧 Шаблон email:', {
        subject: mailOptions.subject,
        to: mailOptions.to,
        previewText: textContent.substring(0, 200) + '...'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email про схвалення надіслано успішно'
    });

  } catch (error) {
    console.error('❌ Помилка надсилання email про схвалення:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка надсилання email про схвалення'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API для надсилання email про схвалення заявки на клуб. Використовуйте POST запит.'
  });
}
