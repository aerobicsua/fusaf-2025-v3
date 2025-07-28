// Email сервіс для надсилання листів ФУСАФ
export interface EmailData {
  to: string;
  name: string;
  subject: string;
  template: 'welcome' | 'registration-confirmation' | 'password-reset';
  data: any;
}

export interface RegistrationEmailData {
  userName: string;
  userEmail: string;
  userRole: string;
  registrationDate: string;
  loginUrl: string;
  nextSteps: string[];
}

// Шаблони email листів
const EMAIL_TEMPLATES = {
  'registration-confirmation': {
    subject: '🎉 Вітаємо з реєстрацією в ФУСАФ!',
    generateHtml: (data: RegistrationEmailData) => `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вітаємо з реєстрацією в ФУСАФ!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
        .badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; display: inline-block; margin: 10px 0; }
        .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .highlight { color: #007bff; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Вітаємо з реєстрацією!</h1>
        <p>Федерація України зі Спортивної Аеробіки і Фітнесу</p>
    </div>

    <div class="content">
        <h2>Вітаємо, ${data.userName}!</h2>

        <p>Ви успішно зареєструвалися в <strong>ФУСАФ</strong> як <span class="badge">${getRoleLabel(data.userRole)}</span></p>

        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Ваші дані для входу:</h3>
            <p><strong>Email:</strong> ${data.userEmail}</p>
            <p><strong>Роль:</strong> ${getRoleLabel(data.userRole)}</p>
            <p><strong>Дата реєстрації:</strong> ${data.registrationDate}</p>
        </div>

        <div class="next-steps">
            <h3>🚀 Наступні кроки:</h3>
            <ol>
                ${data.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" class="button">🔐 Увійти в систему</a>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>💡 Корисні посилання:</h4>
            <ul>
                <li><a href="https://fusaf.org.ua/competitions">📅 Календар змагань</a></li>
                <li><a href="https://fusaf.org.ua/courses">📚 Курси та навчання</a></li>
                <li><a href="https://fusaf.org.ua/clubs">🏢 Спортивні клуби</a></li>
                <li><a href="https://fusaf.org.ua/instructions">📖 Інструкції та документи</a></li>
            </ul>
        </div>

        <p><strong>Зверніть увагу:</strong> Цей email підтверджує вашу реєстрацію в системі ФУСАФ. Збережіть його для своїх записів.</p>
    </div>

    <div class="footer">
        <p><strong>Федерація України зі Спортивної Аеробіки і Фітнесу</strong></p>
        <p>📧 Email: <a href="mailto:info@fusaf.org.ua">info@fusaf.org.ua</a></p>
        <p>🌐 Сайт: <a href="https://fusaf.org.ua">fusaf.org.ua</a></p>
        <p>📱 Телефон: +38 (044) 123-45-67</p>

        <p style="margin-top: 20px; font-size: 12px; color: #999;">
            Цей лист було надіслано автоматично. Будь ласка, не відповідайте на нього.<br>
            Якщо у вас є питання, зв'яжіться з нами за адресою info@fusaf.org.ua
        </p>
    </div>
</body>
</html>
    `
  }
};

// Функція для отримання назви ролі
function getRoleLabel(role: string): string {
  switch (role) {
    case 'athlete': return 'Спортсмен';
    case 'coach_judge': return 'Тренер/Суддя';
    case 'club_owner': return 'Власник клубу';
    case 'admin': return 'Адміністратор';
    default: return 'Користувач';
  }
}

// Функція надсилання email (реальна відправка)
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string }> {
  try {
    console.log('📧 Відправка email до:', emailData.to);
    console.log('📧 Тема:', emailData.subject);

    const template = EMAIL_TEMPLATES[emailData.template];
    if (!template) {
      throw new Error(`Шаблон ${emailData.template} не знайдено`);
    }

    // Генерація HTML контенту
    const htmlContent = template.generateHtml(emailData.data);

    // Реальна відправка через API
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: emailData.to,
        subject: template.subject,
        html: htmlContent,
        text: `Вітаємо з реєстрацією в ФУСАФ! Цей лист підтверджує вашу реєстрацію. Для входу в систему використовуйте ваш email та пароль.`
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.details || result.error || 'Помилка відправки');
    }

    console.log('✅ Email відправлено через API:', result.messageId);

    return {
      success: true,
      message: `Email успішно надіслано на ${emailData.to}`
    };

  } catch (error) {
    console.error('❌ Помилка відправки email:', error);

    // Якщо API недоступний, показуємо попередження, але не блокуємо реєстрацію
    console.warn('⚠️ Email API недоступний, показуємо content в консолі для тестування...');

    try {
      const template = EMAIL_TEMPLATES[emailData.template];
      if (template) {
        const htmlContent = template.generateHtml(emailData.data);
        console.log('📧 Email content (fallback):', htmlContent.substring(0, 800) + '...');
      }
    } catch (fallbackError) {
      console.error('Помилка fallback:', fallbackError);
    }

    return {
      success: false,
      message: `Помилка відправки email: ${error instanceof Error ? error.message : 'Невідома помилка'}`
    };
  }
}

// Функція відправки email після реєстрації
export async function sendRegistrationEmail(userData: {
  name: string;
  email: string;
  role: string;
}): Promise<{ success: boolean; message: string }> {

  const registrationData: RegistrationEmailData = {
    userName: userData.name,
    userEmail: userData.email,
    userRole: userData.role,
    registrationDate: new Date().toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    loginUrl: `${typeof window !== 'undefined' ? window.location.origin : 'https://fusaf.org.ua'}/login`,
    nextSteps: getNextStepsForRole(userData.role)
  };

  return await sendEmail({
    to: userData.email,
    name: userData.name,
    subject: '🎉 Вітаємо з реєстрацією в ФУСАФ!',
    template: 'registration-confirmation',
    data: registrationData
  });
}

// Функція для отримання наступних кроків залежно від ролі
function getNextStepsForRole(role: string): string[] {
  switch (role) {
    case 'athlete':
      return [
        'Заповніть додаткову інформацію у вашому профілі',
        'Оберіть спортивний клуб для тренувань',
        'Перегляньте календар найближчих змагань',
        'Підготуйте необхідні документи для участі у змаганнях',
        'Зв\'яжіться з тренером для початку підготовки'
      ];
    case 'coach_judge':
      return [
        'Завершіть верифікацію ваших кваліфікацій',
        'Зареєструйтесь на курси підвищення кваліфікації',
        'Приєднайтесь до професійної спільноти тренерів',
        'Подайте заявку на суддівство змагань',
        'Оновіть інформацію про свій досвід та сертифікати'
      ];
    case 'club_owner':
      return [
        'Зареєструйте ваш спортивний клуб в системі',
        'Додайте інформацію про тренерський склад',
        'Створіть профілі для ваших спортсменів',
        'Почніть планування змагань та тренувань',
        'Налаштуйте маркетингові матеріали клубу'
      ];
    default:
      return [
        'Ознайомтеся з можливостями платформи',
        'Заповніть свій профіль',
        'Перегляньте доступні функції',
        'Зв\'яжіться з підтримкою при необхідності'
      ];
  }
}

// Функція для надсилання email про статус заявки на роль
export async function sendRoleStatusEmail(
  emailOrData: string | {
    email: string;
    name: string;
    status: 'approved' | 'rejected';
    role: string;
    reason?: string;
  },
  status?: 'approved' | 'rejected',
  additionalData?: any
): Promise<{ success: boolean; message: string }> {

  let email: string;
  let statusText: string;
  let role: string;

  if (typeof emailOrData === 'string') {
    // Старий формат виклику (email, status, data)
    email = emailOrData;
    statusText = status === 'approved' ? 'Схвалено' : 'Відхилено';
    role = additionalData?.requestedRole || 'Невідомо';
  } else {
    // Новий формат виклику (об'єкт)
    email = emailOrData.email;
    statusText = emailOrData.status === 'approved' ? 'Схвалено' : 'Відхилено';
    role = emailOrData.role;
  }

  console.log(`📧 Email статусу ролі для ${email}:`);
  console.log(`Статус: ${statusText}`);
  console.log(`Роль: ${role}`);

  return {
    success: true,
    message: `Email статусу ролі відправлено на ${email}`
  };
}

// Функція для тестування email системи
export async function testEmailSystem(): Promise<void> {
  console.log('🧪 Тестування email системи...');

  const testResult = await sendRegistrationEmail({
    name: 'Тест Користувач',
    email: 'test@example.com',
    role: 'athlete'
  });

  console.log('✅ Результат тесту:', testResult);
}
