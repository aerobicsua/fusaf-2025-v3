import nodemailer from 'nodemailer';

export interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export enum EmailType {
  WELCOME = 'welcome',
  CONFIRMATION = 'confirmation',
  PASSWORD_RESET = 'password_reset',
  COMPETITION_REMINDER = 'competition_reminder',
  COURSE_CONFIRMATION = 'course_confirmation',
  REGISTRATION_CONFIRMATION = 'registration_confirmation',
  CLUB_REGISTRATION = 'club_registration',
  ADMIN_NOTIFICATION = 'admin_notification',
  APPROVAL = 'approval',
  REJECTION = 'rejection'
}

export class EmailService {
  static async send(config: EmailConfig) {
    return sendEmail(config);
  }

  static generateWelcome(userInfo: any) {
    return generateWelcomeEmail(userInfo);
  }

  static generateConfirmation(userInfo: any) {
    return generateEmailConfirmationEmail(userInfo);
  }

  static async sendRegistrationConfirmation(email: string, registrationInfo: any) {
    const html = generateRegistrationConfirmationEmail(registrationInfo);
    return sendEmail({
      from: process.env.GMAIL_USER || 'aerobicsua@gmail.com',
      to: email,
      subject: `Підтвердження реєстрації на ${registrationInfo.competitionTitle}`,
      html
    });
  }

  static async sendEmail(params: { to: string; type: string; data: any }) {
    let html = '';
    let subject = '';

    switch (params.type) {
      case EmailType.WELCOME:
        html = generateWelcomeEmail(params.data);
        subject = 'Ласкаво просимо до ФУСАФ!';
        break;
      case EmailType.CONFIRMATION:
        html = generateEmailConfirmationEmail(params.data);
        subject = 'Підтвердження електронної пошти - ФУСАФ';
        break;
      case EmailType.REGISTRATION_CONFIRMATION:
        html = generateRegistrationConfirmationEmail(params.data);
        subject = `Підтвердження реєстрації на ${params.data.competitionTitle || 'змагання'}`;
        break;
      case EmailType.CLUB_REGISTRATION:
        html = generateClubRegistrationEmail(params.data);
        subject = `Заявка на реєстрацію ${params.data.clubType === 'club' ? 'клубу' : 'підрозділу'} подана - ФУСАФ`;
        break;
      case EmailType.ADMIN_NOTIFICATION:
        html = generateAdminNotificationEmail(params.data);
        subject = `Нова заявка на реєстрацію ${params.data.clubType === 'club' ? 'клубу' : 'підрозділу'} - ФУСАФ`;
        break;
      case EmailType.APPROVAL:
        html = generateApprovalEmail(params.data);
        subject = `Заявку схвалено! Ласкаво просимо до ФУСАФ`;
        break;
      case EmailType.REJECTION:
        html = generateRejectionEmail(params.data);
        subject = `Результат розгляду заявки - ФУСАФ`;
        break;
      default:
        return { success: false, error: 'Невідомий тип email' };
    }

    return sendEmail({
      from: process.env.GMAIL_USER || 'aerobicsua@gmail.com',
      to: params.to,
      subject,
      html
    });
  }
}

export function validateEmailAddress(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Конфігурація SMTP для Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true для 465, false для інших портів
    auth: {
      user: process.env.GMAIL_USER || 'aerobicsua@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD // App password для Gmail
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Надсилання email
export async function sendEmail(config: EmailConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    console.log('📧 Надсилання email:', {
      from: config.from,
      to: config.to,
      subject: config.subject
    });

    const mailOptions = {
      from: `"ФУСАФ" <${config.from}>`,
      to: config.to,
      subject: config.subject,
      html: config.html,
      // Додаткові заголовки
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email надіслано успішно:', {
      messageId: info.messageId,
      to: config.to
    });

    return { success: true };

  } catch (error) {
    console.error('❌ Помилка надсилання email:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка'
    };
  }
}

// Шаблон вітального листа для нових користувачів
export function generateWelcomeEmail(userInfo: {
  name: string;
  email: string;
  role: string;
  registrationDate: string;
}): string {
  const roleLabels: Record<string, string> = {
    'athlete': 'Спортсмен',
    'coach_judge': 'Тренер/Суддя',
    'club_owner': 'Власник клубу',
    'admin': 'Адміністратор'
  };

  const roleLabel = roleLabels[userInfo.role] || 'Користувач';

  return `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ласкаво просимо до ФУСАФ!</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .title {
          color: #1e293b;
          font-size: 28px;
          font-weight: bold;
          margin: 0;
        }
        .subtitle {
          color: #64748b;
          font-size: 16px;
          margin: 10px 0 0 0;
        }
        .content {
          margin: 30px 0;
        }
        .welcome-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
          border-left: 4px solid #3b82f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
        }
        .info-table td {
          padding: 12px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-table td:first-child {
          font-weight: 600;
          color: #475569;
          width: 40%;
        }
        .info-table td:last-child {
          color: #1e293b;
        }
        .info-table tr:last-child td {
          border-bottom: none;
        }
        .next-steps {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .next-steps h3 {
          color: #166534;
          margin: 0 0 15px 0;
          font-size: 18px;
        }
        .next-steps ul {
          margin: 0;
          padding-left: 20px;
          color: #065f46;
        }
        .next-steps li {
          margin: 8px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          color: #3b82f6;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Ф</div>
          <h1 class="title">Ласкаво просимо до ФУСАФ!</h1>
          <p class="subtitle">Федерація України зі Спортивної Аеробіки і Фітнесу</p>
        </div>

        <div class="content">
          <div class="welcome-box">
            <h2>🎉 Вітаємо з успішною реєстрацією!</h2>
            <p>Дякуємо, що приєдналися до нашої спільноти спортивної аеробіки та фітнесу в Україні.</p>
          </div>

          <h3>📋 Інформація про вашу реєстрацію:</h3>
          <table class="info-table">
            <tr>
              <td>Повне ім'я:</td>
              <td><strong>${userInfo.name}</strong></td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>${userInfo.email}</td>
            </tr>
            <tr>
              <td>Роль:</td>
              <td><strong>${roleLabel}</strong></td>
            </tr>
            <tr>
              <td>Дата реєстрації:</td>
              <td>${new Date(userInfo.registrationDate).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</td>
            </tr>
          </table>

          <div class="next-steps">
            <h3>🚀 Наступні кроки:</h3>
            <ul>
              <li><strong>Заповніть профіль</strong> - додайте фото, контактну інформацію та спортивні досягнення</li>
              <li><strong>Перегляньте змагання</strong> - дізнайтеся про найближчі турніри та події</li>
              <li><strong>Приєднайтеся до спільноти</strong> - знайдіть клуби та тренерів у вашому регіоні</li>
              <li><strong>Слідкуйте за новинами</strong> - будьте в курсі останніх подій у світі спортивної аеробіки</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="https://fusaf.org.ua/profile" class="button">
              Заповнити профіль →
            </a>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 30px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>💡 Важлива інформація:</strong> Ваш акаунт активовано, але для участі в змаганнях потрібно заповнити додаткову інформацію в профілі.
            </p>
          </div>
        </div>

        <div class="footer">
          <h4>Контактна інформація ФУСАФ:</h4>
          <p>
            📧 Email: <a href="mailto:info@fusaf.org.ua">info@fusaf.org.ua</a><br>
            🌐 Веб-сайт: <a href="https://fusaf.org.ua">fusaf.org.ua</a><br>
            📍 Адреса: Україна, м. Київ
          </p>

          <div class="social-links">
            <a href="#" target="_blank">Facebook</a> |
            <a href="#" target="_blank">Instagram</a> |
            <a href="#" target="_blank">Telegram</a>
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            © 2025 Федерація України зі Спортивної Аеробіки і Фітнесу (ФУСАФ)<br>
            Всі права захищені. Цей лист надіслано автоматично.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Шаблон листа підтвердження email
export function generateEmailConfirmationEmail(userInfo: {
  name: string;
  email: string;
  confirmationUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Підтвердження електронної пошти - ФУСАФ</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .confirm-button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 30px 0;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .confirm-button:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✉️</div>
          <h1>Підтвердження електронної пошти</h1>
          <p>ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу</p>
        </div>

        <div class="content">
          <p>Привіт, <strong>${userInfo.name}</strong>!</p>

          <p>Дякуємо за реєстрацію в системі ФУСАФ. Для завершення процесу реєстрації, будь ласка, підтвердіть вашу електронну пошту.</p>

          <div style="text-align: center;">
            <a href="${userInfo.confirmationUrl}" class="confirm-button">
              ✅ Підтвердити email
            </a>
          </div>

          <div class="warning">
            <strong>⏰ Важливо:</strong> Це посилання дійсне протягом 24 годин. Після закінчення цього терміну вам потрібно буде запросити нове підтвердження.
          </div>

          <p>Якщо кнопка не працює, скопіюйте та вставте це посилання у ваш браузер:</p>
          <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${userInfo.confirmationUrl}
          </p>

          <p>Якщо ви не реєструвалися в ФУСАФ, просто проігноруйте цей лист.</p>
        </div>

        <div class="footer">
          <p>
            З повагою,<br>
            Команда ФУСАФ
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
            © 2025 ФУСАФ. Цей лист надіслано автоматично.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Шаблон листа підтвердження реєстрації на змагання
export function generateRegistrationConfirmationEmail(registrationInfo: {
  participantName: string;
  competitionTitle: string;
  competitionDate: string;
  competitionTime?: string;
  location?: string;
  address?: string;
  category?: string;
  ageGroup?: string;
  contactPerson?: string;
  competitionUrl?: string;
  dashboardUrl?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Підтвердження реєстрації - ФУСАФ</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
        }
        .info-table td {
          padding: 12px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-table td:first-child {
          font-weight: 600;
          color: #475569;
          width: 40%;
        }
        .info-table td:last-child {
          color: #1e293b;
        }
        .info-table tr:last-child td {
          border-bottom: none;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 10px;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏆</div>
          <h1>Підтвердження реєстрації</h1>
          <p>ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу</p>
        </div>

        <div class="content">
          <p>Привіт, <strong>${registrationInfo.participantName}</strong>!</p>

          <p>Ваша реєстрація на змагання успішно прийнята!</p>

          <h3>📋 Деталі реєстрації:</h3>
          <table class="info-table">
            <tr>
              <td>Змагання:</td>
              <td><strong>${registrationInfo.competitionTitle}</strong></td>
            </tr>
            <tr>
              <td>Дата:</td>
              <td>${registrationInfo.competitionDate}</td>
            </tr>
            ${registrationInfo.competitionTime ? `
            <tr>
              <td>Час:</td>
              <td>${registrationInfo.competitionTime}</td>
            </tr>
            ` : ''}
            ${registrationInfo.location ? `
            <tr>
              <td>Місце:</td>
              <td>${registrationInfo.location}</td>
            </tr>
            ` : ''}
            ${registrationInfo.address ? `
            <tr>
              <td>Адреса:</td>
              <td>${registrationInfo.address}</td>
            </tr>
            ` : ''}
            ${registrationInfo.category ? `
            <tr>
              <td>Категорія:</td>
              <td>${registrationInfo.category}</td>
            </tr>
            ` : ''}
            ${registrationInfo.ageGroup ? `
            <tr>
              <td>Вікова група:</td>
              <td>${registrationInfo.ageGroup}</td>
            </tr>
            ` : ''}
            ${registrationInfo.contactPerson ? `
            <tr>
              <td>Контактна особа:</td>
              <td>${registrationInfo.contactPerson}</td>
            </tr>
            ` : ''}
          </table>

          <div style="text-align: center; margin: 30px 0;">
            ${registrationInfo.competitionUrl ? `
            <a href="${registrationInfo.competitionUrl}" class="button">
              Переглянути змагання
            </a>
            ` : ''}
            ${registrationInfo.dashboardUrl ? `
            <a href="${registrationInfo.dashboardUrl}" class="button">
              Мій кабінет
            </a>
            ` : ''}
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 30px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>💡 Важлива інформація:</strong> Будь ласка, збережіть цей лист як підтвердження вашої реєстрації.
            </p>
          </div>
        </div>

        <div class="footer">
          <h4>Контактна інформація ФУСАФ:</h4>
          <p>
            📧 Email: <a href="mailto:info@fusaf.org.ua">info@fusaf.org.ua</a><br>
            🌐 Веб-сайт: <a href="https://fusaf.org.ua">fusaf.org.ua</a>
          </p>

          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            © 2025 ФУСАФ. Цей лист надіслано автоматично.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Шаблон листа підтвердження реєстрації клубу
export function generateClubRegistrationEmail(data: {
  name: string;
  email: string;
  clubName: string;
  clubType: string;
  password?: string;
  registrationDate: string;
}): string {
  const clubTypeText = data.clubType === 'club' ? 'клубу' : 'підрозділу';

  return `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Заявка на реєстрацію ${clubTypeText} подана - ФУСАФ</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
        }
        .info-table td {
          padding: 12px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-table td:first-child {
          font-weight: 600;
          color: #475569;
          width: 40%;
        }
        .info-table td:last-child {
          color: #1e293b;
        }
        .info-table tr:last-child td {
          border-bottom: none;
        }
        .important-box {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📋</div>
          <h1>Заявка на реєстрацію ${clubTypeText} подана</h1>
          <p>ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу</p>
        </div>

        <div class="content">
          <p>Вітаємо, <strong>${data.name}</strong>!</p>

          <p>Ваша заявка на реєстрацію як керівник ${clubTypeText} "<strong>${data.clubName}</strong>" успішно подана та передана на розгляд адміністрації ФУСАФ.</p>

          <h3>📋 Ваші реєстраційні дані:</h3>
          <table class="info-table">
            <tr>
              <td>Повне ім'я:</td>
              <td><strong>${data.name}</strong></td>
            </tr>
            <tr>
              <td>Email (логін):</td>
              <td>${data.email}</td>
            </tr>
            <tr>
              <td>Назва ${clubTypeText}:</td>
              <td><strong>${data.clubName}</strong></td>
            </tr>
            <tr>
              <td>Дата подання:</td>
              <td>${new Date(data.registrationDate).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</td>
            </tr>
          </table>

          <div class="important-box">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">⏳ Розгляд заявки:</h3>
            <ul style="margin: 0; color: #92400e;">
              <li>Термін розгляду: <strong>3-5 робочих днів</strong></li>
              <li>Результат буде надіслано на цю email адресу</li>
              <li>Авторизація в системі буде доступна тільки після схвалення</li>
              <li>Зберігайте ваші дані для входу</li>
            </ul>
          </div>

          <h3>📞 Зв'язок з нами:</h3>
          <p>Якщо у вас є питання щодо розгляду заявки:</p>
          <ul>
            <li>📧 Email: <a href="mailto:info@fusaf.org.ua">info@fusaf.org.ua</a></li>
            <li>📱 Телефон: +38 (044) 123-45-67</li>
            <li>🌐 Веб-сайт: <a href="https://fusaf.org.ua">fusaf.org.ua</a></li>
          </ul>
        </div>

        <div class="footer">
          <p>
            З повагою,<br>
            Адміністрація ФУСАФ
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
            © 2025 ФУСАФ. Цей лист надіслано автоматично.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Шаблон листа сповіщення адміністратора
export function generateAdminNotificationEmail(data: {
  clubOwnerName: string;
  clubName: string;
  clubType: string;
  email: string;
  phone: string;
  registrationDate: string;
}): string {
  const clubTypeText = data.clubType === 'club' ? 'клубу' : 'підрозділу';

  return `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Нова заявка на реєстрацію ${clubTypeText} - ФУСАФ</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .alert-badge {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 20px;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
        }
        .info-table td {
          padding: 12px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-table td:first-child {
          font-weight: 600;
          color: #475569;
          width: 40%;
        }
        .info-table td:last-child {
          color: #1e293b;
        }
        .info-table tr:last-child td {
          border-bottom: none;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 10px;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="alert-badge">🚨 Нова заявка</div>
          <h1>Реєстрація керівника ${clubTypeText}</h1>
          <p>ФУСАФ - Адміністративне сповіщення</p>
        </div>

        <div class="content">
          <p><strong>Подано нову заявку на реєстрацію керівника ${clubTypeText}!</strong></p>

          <h3>👤 Інформація про заявника:</h3>
          <table class="info-table">
            <tr>
              <td>Повне ім'я:</td>
              <td><strong>${data.clubOwnerName}</strong></td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>${data.email}</td>
            </tr>
            <tr>
              <td>Телефон:</td>
              <td>${data.phone}</td>
            </tr>
            <tr>
              <td>Назва ${clubTypeText}:</td>
              <td><strong>${data.clubName}</strong></td>
            </tr>
            <tr>
              <td>Дата подання:</td>
              <td>${new Date(data.registrationDate).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</td>
            </tr>
          </table>

          <div style="background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">⚡ Необхідні дії:</h3>
            <ul style="margin: 0; color: #1e40af;">
              <li>Перевірити документи та інформацію в адмін-панелі</li>
              <li>Зв'язатися з заявником при необхідності</li>
              <li>Прийняти рішення про схвалення/відхилення</li>
              <li>Надіслати відповідь протягом 3-5 робочих днів</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="https://fusaf.org.ua/admin/club-requests" class="button">
              Переглянути в адмін-панелі
            </a>
          </div>
        </div>

        <div class="footer">
          <p>
            ФУСАФ - Автоматичне сповіщення<br>
            Адміністративна система
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
            © 2025 ФУСАФ. Цей лист надіслано автоматично.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Шаблон листа схвалення заявки
export function generateApprovalEmail(data: {
  name: string;
  email: string;
  clubName: string;
  loginUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Заявку схвалено! Ласкаво просимо до ФУСАФ</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .success-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 20px;
          font-size: 18px;
        }
        .login-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 30px 0;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .next-steps {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .next-steps h3 {
          color: #166534;
          margin: 0 0 15px 0;
          font-size: 18px;
        }
        .next-steps ul {
          margin: 0;
          padding-left: 20px;
          color: #065f46;
        }
        .next-steps li {
          margin: 8px 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-badge">🎉 СХВАЛЕНО!</div>
          <h1>Ласкаво просимо до ФУСАФ!</h1>
          <p>Федерація України зі Спортивної Аеробіки і Фітнесу</p>
        </div>

        <div class="content">
          <p>Вітаємо, <strong>${data.name}</strong>!</p>

          <p>Ваша заявка на реєстрацію керівника клубу "<strong>${data.clubName}</strong>" успішно схвалена адміністрацією ФУСАФ!</p>

          <p>🎊 <strong>Ви офіційно стали членом ФУСАФ!</strong></p>

          <div style="text-align: center;">
            <a href="${data.loginUrl}" class="login-button">
              🚀 Увійти в систему
            </a>
          </div>

          <div class="next-steps">
            <h3>🚀 Наступні кроки:</h3>
            <ul>
              <li><strong>Увійдіть в систему</strong> з вашими реєстраційними даними</li>
              <li><strong>Заповніть профіль клубу</strong> - додайте логотип, опис та контакти</li>
              <li><strong>Додайте тренерів</strong> - запросіть тренерський склад до системи</li>
              <li><strong>Зареєструйте спортсменів</strong> - створіть профілі для ваших атлетів</li>
              <li><strong>Створюйте змагання</strong> - організовуйте турніри та події</li>
              <li><strong>Слідкуйте за новинами</strong> - будьте в курсі подій ФУСАФ</li>
            </ul>
          </div>

          <div style="background: #e0e7ff; border: 1px solid #6366f1; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #4338ca; margin: 0 0 15px 0;">💡 Корисні посилання:</h3>
            <ul style="margin: 0; color: #4338ca;">
              <li><a href="https://fusaf.org.ua/profile" style="color: #4338ca;">Особистий кабінет</a></li>
              <li><a href="https://fusaf.org.ua/competitions" style="color: #4338ca;">Календар змагань</a></li>
              <li><a href="https://fusaf.org.ua/news" style="color: #4338ca;">Новини федерації</a></li>
              <li><a href="https://fusaf.org.ua/support" style="color: #4338ca;">Техпідтримка</a></li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <h4>Контактна інформація ФУСАФ:</h4>
          <p>
            📧 Email: <a href="mailto:info@fusaf.org.ua">info@fusaf.org.ua</a><br>
            🌐 Веб-сайт: <a href="https://fusaf.org.ua">fusaf.org.ua</a><br>
            📍 Адреса: Україна, м. Київ
          </p>

          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            © 2025 ФУСАФ. Цей лист надіслано автоматично.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Шаблон листа відхилення заявки
export function generateRejectionEmail(data: {
  name: string;
  email: string;
  clubName: string;
  reason: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Результат розгляду заявки - ФУСАФ</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .rejection-badge {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 20px;
          font-size: 16px;
        }
        .reason-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .reason-box h3 {
          color: #991b1b;
          margin: 0 0 15px 0;
          font-size: 18px;
        }
        .next-steps {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .next-steps h3 {
          color: #166534;
          margin: 0 0 15px 0;
          font-size: 18px;
        }
        .next-steps ul {
          margin: 0;
          padding-left: 20px;
          color: #065f46;
        }
        .next-steps li {
          margin: 8px 0;
        }
        .reapply-button {
          display: inline-block;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="rejection-badge">📋 Результат розгляду</div>
          <h1>Розгляд заявки завершено</h1>
          <p>ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу</p>
        </div>

        <div class="content">
          <p>Шановний <strong>${data.name}</strong>,</p>

          <p>Дякуємо за ваш інтерес до співпраці з ФУСАФ та подання заявки на реєстрацію клубу "<strong>${data.clubName}</strong>".</p>

          <p>На жаль, після ретельного розгляду вашої заявки, адміністрація ФУСАФ прийняла рішення про неможливість її схвалення на даний момент.</p>

          <div class="reason-box">
            <h3>📝 Причина відхилення:</h3>
            <p style="margin: 0; color: #7f1d1d;">${data.reason}</p>
          </div>

          <div class="next-steps">
            <h3>🔄 Можливості для повторного звернення:</h3>
            <ul>
              <li><strong>Усуньте зазначені недоліки</strong> та подайте заявку знову</li>
              <li><strong>Зверніться за консультацією</strong> до адміністрації ФУСАФ</li>
              <li><strong>Підготуйте додаткові документи</strong> якщо це необхідно</li>
              <li><strong>Повторно подайте заявку</strong> після виправлення зауважень</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="https://fusaf.org.ua/membership/club-owner/registration" class="reapply-button">
              Подати заявку повторно
            </a>
          </div>

          <div style="background: #e0e7ff; border: 1px solid #6366f1; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #4338ca; margin: 0 0 15px 0;">💬 Потрібна допомога?</h3>
            <p style="margin: 0; color: #4338ca;">
              Наші фахівці готові допомогти вам з підготовкою документів та відповісти на будь-які питання.
              Зв'яжіться з нами для отримання детальних рекомендацій.
            </p>
          </div>
        </div>

        <div class="footer">
          <h4>Контактна інформація ФУСАФ:</h4>
          <p>
            📧 Email: <a href="mailto:info@fusaf.org.ua">info@fusaf.org.ua</a><br>
            📱 Телефон: +38 (044) 123-45-67<br>
            🌐 Веб-сайт: <a href="https://fusaf.org.ua">fusaf.org.ua</a>
          </p>

          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            © 2025 ФУСАФ. Цей лист надіслано автоматично.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
