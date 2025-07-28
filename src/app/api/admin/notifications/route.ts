import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// Перевірка прав адміністратора
async function checkAdminPermissions(request: NextRequest) {
  // TODO: В реальному проекті тут була б перевірка JWT токена
  return true;
}

// Шаблони email повідомлень
const emailTemplates = {
  userStatusChange: {
    subject: 'Зміна статусу вашого акаунту в ФУСАФ',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>Федерація України зі Спортивної Аеробіки і Фітнесу</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Вітаємо, {{userName}}!</h2>
          <p>Інформуємо вас про зміну статусу вашого акаунту:</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Новий статус:</strong> {{newStatus}}<br>
            <strong>Дата зміни:</strong> {{changeDate}}
          </div>
          {{#if reason}}
          <p><strong>Причина:</strong> {{reason}}</p>
          {{/if}}
          <p>Якщо у вас є питання, зверніться до адміністрації ФУСАФ.</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; color: #666;">
          <p>© 2025 ФУСАФ. Всі права захищені.</p>
        </div>
      </div>
    `
  },

  newCompetition: {
    subject: 'Нове змагання в ФУСАФ: {{competitionTitle}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>🏆 Нове змагання ФУСАФ</h1>
        </div>
        <div style="padding: 20px;">
          <h2>{{competitionTitle}}</h2>
          <p>{{competitionDescription}}</p>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Деталі змагання:</h3>
            <p><strong>📅 Дата:</strong> {{competitionDate}}</p>
            <p><strong>📍 Місце:</strong> {{competitionLocation}}</p>
            <p><strong>⏰ Час:</strong> {{competitionTime}}</p>
            <p><strong>📋 Реєстрація до:</strong> {{registrationDeadline}}</p>
          </div>

          {{#if categories}}
          <div style="margin: 20px 0;">
            <strong>Категорії:</strong><br>
            {{#each categories}}
            <span style="background: #e3f2fd; padding: 5px 10px; border-radius: 15px; margin: 5px; display: inline-block;">{{this}}</span>
            {{/each}}
          </div>
          {{/if}}

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{registrationUrl}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Зареєструватися на змагання
            </a>
          </div>

          <p><small>Не забудьте зареєструватися до кінцевого терміну!</small></p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; color: #666;">
          <p>© 2025 ФУСАФ. Всі права захищені.</p>
        </div>
      </div>
    `
  },

  competitionStatusChange: {
    subject: 'Зміна статусу змагання: {{competitionTitle}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>Оновлення змагання ФУСАФ</h1>
        </div>
        <div style="padding: 20px;">
          <h2>{{competitionTitle}}</h2>
          <p>Інформуємо про зміни у змаганні:</p>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Новий статус:</strong> {{newStatus}}<br>
            <strong>Дата зміни:</strong> {{changeDate}}
          </div>

          {{#if statusMessage}}
          <p>{{statusMessage}}</p>
          {{/if}}

          {{#if actionRequired}}
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>⚠️ Потрібна дія:</strong> {{actionRequired}}
          </div>
          {{/if}}
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; color: #666;">
          <p>© 2025 ФУСAФ. Всі права захищені.</p>
        </div>
      </div>
    `
  },

  welcomeNewUser: {
    subject: 'Ласкаво просимо до ФУСАФ!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>🎉 Ласкаво просимо до ФУСАФ!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Вітаємо, {{userName}}!</h2>
          <p>Дякуємо за реєстрацію в Федерації України зі Спортивної Аеробіки і Фітнесу!</p>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Ваші дані для входу:</h3>
            <p><strong>Email:</strong> {{userEmail}}</p>
            <p><strong>Тимчасовий пароль:</strong> {{temporaryPassword}}</p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>⚠️ Важливо:</strong> Змініть тимчасовий пароль після першого входу в систему.
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{loginUrl}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Увійти в систему
            </a>
          </div>

          <h3>Наступні кроки:</h3>
          <ul>
            <li>Заповніть додаткову інформацію в профілі</li>
            <li>Оплатіть членський внесок</li>
            <li>Дочекайтеся активації акаунту</li>
            <li>Реєструйтеся на змагання</li>
          </ul>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; color: #666;">
          <p>© 2025 ФУСАФ. Всі права захищені.</p>
        </div>
      </div>
    `
  },

  passwordReset: {
    subject: 'Скидання пароля ФУСАФ',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>🔐 Скидання пароля</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Відновлення доступу</h2>
          <p>Ви отримали це повідомлення, оскільки був запитаний скидання пароля для вашого акаунту.</p>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Новий тимчасовий пароль:</strong> {{newPassword}}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{loginUrl}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Увійти в систему
            </a>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>⚠️ Безпека:</strong> Змініть пароль після входу в систему.
          </div>

          <p><small>Якщо ви не запитували скидання пароля, ігноруйте це повідомлення.</small></p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; color: #666;">
          <p>© 2025 ФУСАФ. Всі права захищені.</p>
        </div>
      </div>
    `
  }
};

// Функція для заміни змінних в шаблоні
function replaceTemplateVariables(template: string, variables: any): string {
  let result = template;

  // Проста заміна змінних {{variable}}
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  }

  // Обробка умовних блоків {{#if variable}}...{{/if}}
  result = result.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, varName, content) => {
    return variables[varName] ? content : '';
  });

  // Обробка циклів {{#each array}}...{{/each}}
  result = result.replace(/{{#each\s+(\w+)}}(.*?){{\/each}}/gs, (match, arrayName, content) => {
    const array = variables[arrayName];
    if (Array.isArray(array)) {
      return array.map(item => content.replace(/{{this}}/g, item)).join('');
    }
    return '';
  });

  return result;
}

// Функція для надсилання email (заглушка - в production використовувати реальний email сервіс)
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    // TODO: Інтеграція з реальним email сервісом (SendGrid, AWS SES, NodeMailer тощо)
    console.log('📧 EMAIL ВІДПРАВЛЕНО:');
    console.log(`До: ${to}`);
    console.log(`Тема: ${subject}`);
    console.log(`HTML довжина: ${html.length} символів`);

    // Симуляція відправки email (в production замінити на реальну відправку)
    await new Promise(resolve => setTimeout(resolve, 100));

    return true;
  } catch (error) {
    console.error('❌ Помилка відправки email:', error);
    return false;
  }
}

// POST - надіслати сповіщення
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const {
      type,
      recipients,
      template,
      variables,
      customSubject,
      customMessage
    } = await request.json();

    console.log('📧 Admin POST /api/admin/notifications - відправка сповіщень');

    // Валідація обов'язкових полів
    if (!type || !recipients || recipients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Тип сповіщення та отримувачі обов\'язкові'
      }, { status: 400 });
    }

    // Створимо таблицю для логування email, якщо вона не існує
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS email_notifications (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        template_used VARCHAR(100),
        variables JSON,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        sent_at TIMESTAMP NULL,
        error_message TEXT,
        admin_id VARCHAR(36),
        admin_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_type (type),
        INDEX idx_recipient (recipient_email),
        INDEX idx_status (status),
        INDEX idx_sent_at (sent_at)
      )
    `);

    let emailTemplate = null;
    let subject = customSubject || '';
    let htmlContent = customMessage || '';

    // Якщо використовується готовий шаблон
    if (template && emailTemplates[template as keyof typeof emailTemplates]) {
      emailTemplate = emailTemplates[template as keyof typeof emailTemplates];
      subject = customSubject || emailTemplate.subject;
      htmlContent = emailTemplate.html;
    }

    if (!subject || !htmlContent) {
      return NextResponse.json({
        success: false,
        error: 'Тема та контент повідомлення обов\'язкові'
      }, { status: 400 });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Надсилаємо email кожному отримувачу
    for (const recipient of recipients) {
      const notificationId = uuidv4();

      try {
        // Підготовка персоналізованого контенту
        const personalizedVariables = {
          ...variables,
          userName: recipient.name || recipient.email,
          userEmail: recipient.email,
          currentDate: new Date().toLocaleDateString('uk-UA'),
          loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login`,
          registrationUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/competitions`
        };

        const finalSubject = replaceTemplateVariables(subject, personalizedVariables);
        const finalHtml = replaceTemplateVariables(htmlContent, personalizedVariables);

        // Записуємо в базу (pending)
        await executeQuery(`
          INSERT INTO email_notifications (
            id, type, recipient_email, subject, template_used, variables,
            status, admin_id, admin_email, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW())
        `, [
          notificationId,
          type,
          recipient.email,
          finalSubject,
          template || 'custom',
          JSON.stringify(personalizedVariables),
          'current_admin_id', // TODO: отримати з контексту
          'admin@fusaf.org.ua' // TODO: отримати з контексту
        ]);

        // Надсилаємо email
        const emailSent = await sendEmail(recipient.email, finalSubject, finalHtml);

        if (emailSent) {
          // Оновлюємо статус на sent
          await executeQuery(`
            UPDATE email_notifications
            SET status = 'sent', sent_at = NOW()
            WHERE id = ?
          `, [notificationId]);

          results.push({
            email: recipient.email,
            status: 'sent',
            notificationId
          });
          successCount++;
        } else {
          throw new Error('Помилка відправки email');
        }

      } catch (error) {
        // Оновлюємо статус на failed
        await executeQuery(`
          UPDATE email_notifications
          SET status = 'failed', error_message = ?
          WHERE id = ?
        `, [error instanceof Error ? error.message : 'Невідома помилка', notificationId]);

        results.push({
          email: recipient.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Невідома помилка',
          notificationId
        });
        failureCount++;
      }
    }

    console.log(`✅ Сповіщення відправлено: ${successCount} успішно, ${failureCount} помилок`);

    return NextResponse.json({
      success: true,
      message: `Сповіщення відправлено: ${successCount} успішно, ${failureCount} помилок`,
      statistics: {
        total: recipients.length,
        sent: successCount,
        failed: failureCount
      },
      results: results
    });

  } catch (error) {
    console.error('❌ Помилка Admin POST /api/admin/notifications:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка відправки сповіщень',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// GET - отримати історію сповіщень
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const recipient = url.searchParams.get('recipient');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Створимо таблицю, якщо вона не існує
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS email_notifications (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        template_used VARCHAR(100),
        variables JSON,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        sent_at TIMESTAMP NULL,
        error_message TEXT,
        admin_id VARCHAR(36),
        admin_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_type (type),
        INDEX idx_recipient (recipient_email),
        INDEX idx_status (status),
        INDEX idx_sent_at (sent_at)
      )
    `);

    let query = `
      SELECT
        id, type, recipient_email, subject, template_used, status,
        sent_at, error_message, admin_email, created_at
      FROM email_notifications
      WHERE 1=1
    `;

    let countQuery = `SELECT COUNT(*) as total FROM email_notifications WHERE 1=1`;
    const queryParams: any[] = [];
    const countParams: any[] = [];

    // Додаємо фільтри
    if (type) {
      query += ` AND type = ?`;
      countQuery += ` AND type = ?`;
      queryParams.push(type);
      countParams.push(type);
    }

    if (status) {
      query += ` AND status = ?`;
      countQuery += ` AND status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    if (recipient) {
      query += ` AND recipient_email LIKE ?`;
      countQuery += ` AND recipient_email LIKE ?`;
      queryParams.push(`%${recipient}%`);
      countParams.push(`%${recipient}%`);
    }

    // Сортування та пагінація
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Виконуємо запити
    const [notifications, countResult] = await Promise.all([
      executeQuery<any>(query, queryParams),
      executeQuery<any>(countQuery, countParams)
    ]);

    const total = countResult[0]?.total || 0;

    // Статистика
    const stats = await executeQuery<any>(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today
      FROM email_notifications
    `);

    return NextResponse.json({
      success: true,
      notifications: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: stats[0] || {},
      templates: Object.keys(emailTemplates),
      filters: { type, status, recipient }
    });

  } catch (error) {
    console.error('❌ Помилка Admin GET /api/admin/notifications:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження сповіщень',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// Експорт шаблонів для використання в інших частинах додатку
export { emailTemplates, replaceTemplateVariables, sendEmail };
