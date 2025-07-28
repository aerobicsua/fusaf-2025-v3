import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Налаштування SMTP транспорту
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'noreply.fusaf@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові поля: to, subject, html' },
        { status: 400 }
      );
    }

    const transporter = createTransporter();

    // Налаштування email
    const mailOptions = {
      from: {
        name: 'Федерація України зі Спортивної Аеробіки і Фітнесу',
        address: process.env.EMAIL_USER || 'noreply.fusaf@gmail.com'
      },
      to: to,
      subject: subject,
      html: html,
      text: text || 'Це повідомлення від ФУСАФ',
      // Додаткові опції
      replyTo: 'info@fusaf.org.ua',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('📧 Спроба відправки email до:', to);

    // Відправка email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email відправлено успішно:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email відправлено успішно',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Помилка відправки email:', error);

    // Детальне логування помилки
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Помилка відправки email',
        details: error instanceof Error ? error.message : 'Невідома помилка'
      },
      { status: 500 }
    );
  }
}

// Тестовий endpoint
export async function GET(request: NextRequest) {
  try {
    const transporter = createTransporter();

    // Перевірка з'єднання
    await transporter.verify();

    return NextResponse.json({
      status: 'OK',
      message: 'Email сервіс працює',
      config: {
        service: 'Gmail SMTP',
        from: process.env.EMAIL_USER || 'noreply.fusaf@gmail.com'
      }
    });
  } catch (error) {
    console.error('❌ Помилка перевірки email сервісу:', error);

    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Email сервіс недоступний',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      },
      { status: 500 }
    );
  }
}
