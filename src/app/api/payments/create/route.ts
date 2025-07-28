import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { createLiqPayService } from '@/lib/liqpay';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Створити платіж через LiqPay
 *     description: Створює новий платіж для реєстрації на змагання через LiqPay
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - competitionId
 *               - amount
 *               - description
 *             properties:
 *               competitionId:
 *                 type: string
 *                 format: uuid
 *                 description: ID змагання
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 description: Сума платежу в гривнях
 *               description:
 *                 type: string
 *                 description: Опис платежу
 *               currency:
 *                 type: string
 *                 enum: [UAH, USD, EUR]
 *                 default: UAH
 *               customerEmail:
 *                 type: string
 *                 format: email
 *                 description: Email платника
 *               customerPhone:
 *                 type: string
 *                 description: Телефон платника
 *               registrationData:
 *                 type: object
 *                 description: Дані для реєстрації на змагання
 *     responses:
 *       200:
 *         description: Платіж створено успішно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     liqpayData:
 *                       type: string
 *                     liqpaySignature:
 *                       type: string
 *                     paymentUrl:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       500:
 *         $ref: '#/components/responses/500'
 */

export async function POST(request: NextRequest) {
  try {
    console.log('💳 POST /api/payments/create - створення платежу');

    // Отримуємо дані з запиту
    const {
      competitionId,
      amount,
      description,
      currency = 'UAH',
      customerEmail,
      customerPhone,
      registrationData
    } = await request.json();

    // Валідація обов'язкових полів
    if (!competitionId || !amount || !description) {
      return NextResponse.json({
        success: false,
        error: 'Обов\'язкові поля: competitionId, amount, description'
      }, { status: 400 });
    }

    // Валідація суми
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Сума платежу має бути числом більше 0'
      }, { status: 400 });
    }

    // Перевіряємо чи існує змагання
    const competitions = await executeQuery<any>(`
      SELECT id, title, registration_fee, status, registration_deadline
      FROM competitions
      WHERE id = ?
    `, [competitionId]);

    if (competitions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Змагання не знайдено'
      }, { status: 404 });
    }

    const competition = competitions[0];

    // Перевіряємо статус змагання
    if (competition.status !== 'registration_open') {
      return NextResponse.json({
        success: false,
        error: 'Реєстрація на це змагання закрита'
      }, { status: 400 });
    }

    // Перевіряємо дедлайн реєстрації
    if (competition.registration_deadline && new Date(competition.registration_deadline) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Термін реєстрації на змагання минув'
      }, { status: 400 });
    }

    // Перевіряємо суму відносно реєстраційного збору
    if (competition.registration_fee && amount < competition.registration_fee) {
      return NextResponse.json({
        success: false,
        error: `Мінімальна сума платежу: ${competition.registration_fee} ₴`
      }, { status: 400 });
    }

    // Створюємо LiqPay сервіс
    const liqPayService = createLiqPayService();

    // Генеруємо унікальні ID
    const paymentId = uuidv4();
    const orderId = `FUSAF_${Date.now()}_${paymentId.substring(0, 8)}`;

    // Підготовка даних для LiqPay
    const paymentData = {
      amount: amount,
      currency: currency,
      description: description,
      order_id: orderId,
      result_url: `${process.env.NEXTAUTH_URL}/payments/result?orderId=${orderId}`,
      server_url: `${process.env.NEXTAUTH_URL}/api/payments/callback`,
      language: 'uk',
      customer: customerEmail || '',
      email: customerEmail || '',
      phone: customerPhone || '',
      expired_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 хвилин
      product_category: 'sport',
      product_description: `Реєстрація на змагання: ${competition.title}`,
      product_name: competition.title,
      product_url: `${process.env.NEXTAUTH_URL}/competitions/${competitionId}`
    };

    // Валідація даних платежу
    const validation = liqPayService.validatePaymentData(paymentData);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Помилка валідації даних платежу',
        details: validation.errors
      }, { status: 400 });
    }

    // Створюємо платіж в LiqPay
    const liqPayPayment = liqPayService.createPayment(paymentData);

    // Зберігаємо платіж в базі даних
    await executeQuery(`
      INSERT INTO payments (
        id, order_id, competition_id, amount, currency, description,
        status, payment_method, customer_email, customer_phone,
        registration_data, liqpay_data, liqpay_signature,
        expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      paymentId,
      orderId,
      competitionId,
      amount,
      currency,
      description,
      'pending',
      'liqpay',
      customerEmail || null,
      customerPhone || null,
      JSON.stringify(registrationData || {}),
      liqPayPayment.data,
      liqPayPayment.signature,
      new Date(Date.now() + 30 * 60 * 1000) // 30 хвилин
    ]);

    console.log('✅ Платіж створено:', orderId, 'на суму:', amount, currency);

    return NextResponse.json({
      success: true,
      data: {
        paymentId: paymentId,
        orderId: orderId,
        liqpayData: liqPayPayment.data,
        liqpaySignature: liqPayPayment.signature,
        paymentUrl: liqPayPayment.form_url,
        amount: amount,
        currency: currency,
        description: description,
        competitionTitle: competition.title,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      },
      message: 'Платіж створено успішно'
    });

  } catch (error) {
    console.error('❌ Помилка створення платежу:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка створення платежу',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// Створимо таблицю для платежів, якщо її немає
async function ensurePaymentsTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(100) UNIQUE NOT NULL,
        competition_id VARCHAR(36),

        # Основна інформація про платіж
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'UAH',
        description TEXT NOT NULL,
        status ENUM('pending', 'processing', 'success', 'failed', 'expired', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'liqpay',

        # Інформація про клієнта
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_user_id VARCHAR(36),

        # LiqPay специфічні дані
        liqpay_payment_id VARCHAR(100),
        liqpay_transaction_id VARCHAR(100),
        liqpay_data TEXT,
        liqpay_signature VARCHAR(255),
        liqpay_status VARCHAR(50),
        liqpay_err_code VARCHAR(10),
        liqpay_err_description TEXT,

        # Додаткові дані
        registration_data JSON,
        callback_data JSON,

        # Банківські дані (якщо доступні)
        sender_card_mask VARCHAR(20),
        sender_card_bank VARCHAR(100),
        sender_phone VARCHAR(50),

        # Терміни
        expires_at TIMESTAMP,
        paid_at TIMESTAMP NULL,

        # Системні поля
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        # Індекси
        INDEX idx_order_id (order_id),
        INDEX idx_competition_id (competition_id),
        INDEX idx_status (status),
        INDEX idx_customer_email (customer_email),
        INDEX idx_created_at (created_at),
        INDEX idx_liqpay_payment_id (liqpay_payment_id),

        # Зв'язки
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE SET NULL,
        FOREIGN KEY (customer_user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Таблиця payments готова');
  } catch (error) {
    console.error('❌ Помилка створення таблиці payments:', error);
  }
}

// Ініціалізуємо таблицю при завантаженні модуля
ensurePaymentsTable();
