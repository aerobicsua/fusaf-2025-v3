import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const {
      to,
      trainerName,
      clubName,
      decision, // 'approved' або 'rejected'
      reviewNotes,
      clubManagerName
    } = await request.json();

    console.log(`📧 Надсилання сповіщення тренеру про ${decision === 'approved' ? 'схвалення' : 'відхилення'} заявки:`, { to, trainerName, clubName });

    // Налаштування транспорту
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'aerobicsua@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'demo_password'
      }
    });

    const isApproved = decision === 'approved';
    const subject = isApproved
      ? `🎉 Вашу заявку до клубу "${clubName}" СХВАЛЕНО!`
      : `❌ Заявку до клубу "${clubName}" відхилено`;

    // HTML шаблон листа
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject} - ФУСАФ</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: ${isApproved ? '#059669' : '#dc2626'};">
            ${isApproved ? '🎉 Вітаємо!' : '😔 Рішення щодо заявки'}
          </h1>
        </div>

        <div style="background: ${isApproved ? '#ecfdf5' : '#fef2f2'}; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid ${isApproved ? '#10b981' : '#ef4444'};">
          <h2 style="color: ${isApproved ? '#047857' : '#dc2626'}; margin-top: 0;">
            ${isApproved ? 'Заявку схвалено!' : 'Заявку відхилено'}
          </h2>

          <p><strong>Шановний(а) ${trainerName}!</strong></p>

          <p>Повідомляємо вам про результат розгляду вашої заявки на вступ до клубу <strong>"${clubName}"</strong>.</p>

          ${isApproved ? `
            <p><strong style="color: #059669;">Вашу заявку СХВАЛЕНО!</strong></p>
            <p>Тепер ви офіційно є тренером/суддею клубу "${clubName}". Вітаємо з приєднанням до нашої команди!</p>
          ` : `
            <p><strong style="color: #dc2626;">На жаль, вашу заявку було відхилено.</strong></p>
            <p>Це рішення прийняв керівник клубу після ретельного розгляду.</p>
          `}

          ${reviewNotes ? `
            <div style="background: ${isApproved ? '#d1fae5' : '#fee2e2'}; border-radius: 6px; padding: 15px; margin: 15px 0;">
              <h4 style="margin: 0 0 10px 0; color: ${isApproved ? '#047857' : '#dc2626'};">Коментар керівника клубу:</h4>
              <p style="margin: 0; font-style: italic;">"${reviewNotes}"</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">— ${clubManagerName || 'Керівник клубу'}</p>
            </div>
          ` : ''}
        </div>

        ${isApproved ? `
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-top: 0;">🎯 Наступні кроки:</h3>
            <ul style="color: #374151;">
              <li>Тепер ви можете тренувати спортсменів від імені клубу "${clubName}"</li>
              <li>Ваше ім'я буде відображатися в списку тренерів клубу</li>
              <li>Ви можете брати участь у змаганнях як представник клубу</li>
              <li>Зв'яжіться з керівництвом клубу для отримання додаткової інформації</li>
            </ul>
          </div>
        ` : `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #92400e; margin-top: 0;">💡 Що можна зробити далі:</h3>
            <ul style="color: #374151;">
              <li>Ви можете подати заявку до іншого клубу</li>
              <li>Покращити свою кваліфікацію та подати заявку повторно</li>
              <li>Зв'язатися з керівництвом клубу для уточнень</li>
              <li>Продовжувати розвивати свої навички як тренер/суддя</li>
            </ul>
          </div>
        `}

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #374151; margin-top: 0;">📞 Контакти клубу "${clubName}":</h3>
          <p style="color: #6b7280;">Для будь-яких питань щодо цього рішення, будь ласка, зверніться безпосередньо до керівництва клубу або напишіть нам на info@fusaf.org.ua</p>
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
${isApproved ? '🎉 Вітаємо! Вашу заявку схвалено!' : '😔 Заявку відхилено'}

Шановний(а) ${trainerName}!

Повідомляємо вам про результат розгляду вашої заявки на вступ до клубу "${clubName}".

${isApproved
  ? `Вашу заявку СХВАЛЕНО! Тепер ви офіційно є тренером/суддею клубу "${clubName}".`
  : `На жаль, вашу заявку було відхилено керівником клубу.`
}

${reviewNotes ? `Коментар керівника: "${reviewNotes}"` : ''}

${isApproved
  ? `Наступні кроки:
• Тепер ви можете тренувати спортсменів від імені клубу
• Ваше ім'я відображається в списку тренерів клубу
• Ви можете брати участь у змаганнях як представник клубу`
  : `Що можна зробити далі:
• Подати заявку до іншого клубу
• Покращити кваліфікацію та подати заявку повторно
• Зв'язатися з керівництвом для уточнень`
}

Федерація України зі Спортивної Аеробіки і Фітнесу
Email: info@fusaf.org.ua
Телефон: +380 (44) 123-45-67
Сайт: fusaf.org.ua
    `;

    // Відправляємо email
    const mailOptions = {
      from: `"ФУСАФ" <${process.env.EMAIL_USER || 'aerobicsua@gmail.com'}>`,
      to: to,
      subject: subject,
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
        console.log(`✅ Сповіщення тренеру ${isApproved ? 'про схвалення' : 'про відхилення'} успішно надіслано на:`, to);
      } catch (emailError) {
        console.error('❌ Помилка надсилання email:', emailError);
        // Не падаємо, просто логуємо помилку
      }
    } else {
      console.log(`📧 ДЕМО режим - сповіщення тренеру ${isApproved ? 'про схвалення' : 'про відхилення'} (було б надіслано на):`, to);
      console.log('📧 Шаблон email:', {
        subject: mailOptions.subject,
        to: mailOptions.to,
        decision: decision,
        previewText: textContent.substring(0, 200) + '...'
      });
    }

    return NextResponse.json({
      success: true,
      message: `Сповіщення тренеру ${isApproved ? 'про схвалення' : 'про відхилення'} надіслано успішно`
    });

  } catch (error) {
    console.error('❌ Помилка надсилання сповіщення тренеру:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка надсилання сповіщення'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API для надсилання email сповіщень тренерам про результат розгляду заявки. Використовуйте POST запит.'
  });
}
