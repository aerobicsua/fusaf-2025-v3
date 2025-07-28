import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { createLiqPayService } from '@/lib/liqpay';

/**
 * @swagger
 * /api/payments/callback:
 *   post:
 *     summary: Callback від LiqPay
 *     description: Обробка callback повідомлень від LiqPay про статус платежу
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *               - signature
 *             properties:
 *               data:
 *                 type: string
 *                 description: Base64 закодовані дані від LiqPay
 *               signature:
 *                 type: string
 *                 description: Підпис для верифікації
 *     responses:
 *       200:
 *         description: Callback оброблено успішно
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "OK"
 *       400:
 *         description: Помилка валідації callback
 *       500:
 *         description: Внутрішня помилка сервера
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/payments/callback - callback від LiqPay');

    // Отримуємо дані з form-data
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const signature = formData.get('signature') as string;

    if (!data || !signature) {
      console.log('❌ Відсутні обов\'язкові параметри callback');
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Створюємо LiqPay сервіс
    const liqPayService = createLiqPayService();

    // Верифікуємо підпис
    const verification = liqPayService.verifyCallback(data, signature);
    if (!verification.isValid || !verification.paymentData) {
      console.log('❌ Невалідний підпис callback від LiqPay');
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const paymentData = verification.paymentData;
    console.log('📨 Отримано callback від LiqPay:', {
      order_id: paymentData.order_id,
      status: paymentData.status,
      amount: paymentData.amount
    });

    // Шукаємо платіж в базі даних
    const payments = await executeQuery<any>(`
      SELECT id, order_id, competition_id, amount, status, customer_email,
             registration_data, customer_user_id
      FROM payments
      WHERE order_id = ?
    `, [paymentData.order_id]);

    if (payments.length === 0) {
      console.log('❌ Платіж не знайдено:', paymentData.order_id);
      return new NextResponse('Payment not found', { status: 404 });
    }

    const payment = payments[0];

    // Перевіряємо чи платіж вже оброблений
    if (payment.status === 'success' && liqPayService.isPaymentSuccessful(paymentData.status)) {
      console.log('ℹ️ Платіж вже оброблений:', paymentData.order_id);
      return new NextResponse('OK', { status: 200 });
    }

    // Оновлюємо платіж в базі даних
    const newStatus = getPaymentStatus(paymentData.status, liqPayService);
    await executeQuery(`
      UPDATE payments SET
        status = ?,
        liqpay_payment_id = ?,
        liqpay_transaction_id = ?,
        liqpay_status = ?,
        liqpay_err_code = ?,
        liqpay_err_description = ?,
        callback_data = ?,
        sender_card_mask = ?,
        sender_card_bank = ?,
        sender_phone = ?,
        paid_at = ?,
        updated_at = NOW()
      WHERE order_id = ?
    `, [
      newStatus,
      paymentData.payment_id || null,
      paymentData.transaction_id || null,
      paymentData.status,
      paymentData.err_code || null,
      paymentData.err_description || null,
      JSON.stringify(paymentData),
      paymentData.sender_card_mask2 || null,
      paymentData.sender_card_bank || null,
      paymentData.sender_phone || null,
      liqPayService.isPaymentSuccessful(paymentData.status) ? new Date() : null,
      paymentData.order_id
    ]);

    console.log('✅ Платіж оновлено:', paymentData.order_id, '→', newStatus);

    // Якщо платіж успішний - обробляємо реєстрацію
    if (liqPayService.isPaymentSuccessful(paymentData.status)) {
      await processSuccessfulPayment(payment, paymentData);
    }

    // Якщо платіж невдалий - логуємо помилку
    if (liqPayService.isPaymentFailed(paymentData.status)) {
      console.log('❌ Платіж невдалий:', {
        order_id: paymentData.order_id,
        status: paymentData.status,
        error_code: paymentData.err_code,
        error_description: paymentData.err_description
      });
    }

    // Логуємо callback в admin logs
    await logPaymentCallback(payment, paymentData, newStatus);

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('❌ Помилка обробки callback:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

/**
 * Конвертує статус LiqPay в статус нашої системи
 */
function getPaymentStatus(liqpayStatus: string, liqPayService: any): string {
  if (liqPayService.isPaymentSuccessful(liqpayStatus)) {
    return 'success';
  } else if (liqPayService.isPaymentFailed(liqpayStatus)) {
    return 'failed';
  } else if (liqPayService.isPaymentPending(liqpayStatus)) {
    return 'processing';
  } else {
    return 'pending';
  }
}

/**
 * Обробка успішного платежу
 */
async function processSuccessfulPayment(payment: any, paymentData: any) {
  try {
    console.log('🎉 Обробка успішного платежу:', payment.order_id);

    // Парсимо дані реєстрації
    let registrationData = {};
    try {
      registrationData = typeof payment.registration_data === 'string'
        ? JSON.parse(payment.registration_data)
        : payment.registration_data || {};
    } catch (error) {
      console.warn('⚠️ Помилка парсингу registration_data:', error);
    }

    // Створюємо реєстрацію на змагання (якщо є дані)
    if (payment.competition_id && Object.keys(registrationData).length > 0) {
      const registrationId = require('uuid').v4();

      await executeQuery(`
        INSERT INTO athlete_registrations (
          id, competition_id, athlete_email, category, notes,
          payment_id, registration_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        registrationId,
        payment.competition_id,
        payment.customer_email || registrationData.email,
        registrationData.category || 'General',
        `Платіж успішно завершено. Order ID: ${payment.order_id}`,
        payment.id,
        'registered'
      ]);

      console.log('✅ Реєстрацію створено:', registrationId);
    }

    // Відправляємо email про успішний платіж
    await sendPaymentSuccessEmail(payment, paymentData);

    // Оновлюємо статистику змагання
    if (payment.competition_id) {
      await updateCompetitionStats(payment.competition_id);
    }

  } catch (error) {
    console.error('❌ Помилка обробки успішного платежу:', error);
  }
}

/**
 * Відправка email про успішний платіж
 */
async function sendPaymentSuccessEmail(payment: any, paymentData: any) {
  try {
    if (!payment.customer_email) {
      console.log('ℹ️ Email не вказано для платежу:', payment.order_id);
      return;
    }

    // Отримуємо інформацію про змагання
    let competitionTitle = 'Змагання ФУСАФ';
    if (payment.competition_id) {
      const competitions = await executeQuery<any>(`
        SELECT title FROM competitions WHERE id = ?
      `, [payment.competition_id]);

      if (competitions.length > 0) {
        competitionTitle = competitions[0].title;
      }
    }

    // Відправляємо через API notifications
    await fetch(`${process.env.NEXTAUTH_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'payment_success',
        recipients: [{
          email: payment.customer_email,
          name: payment.customer_email
        }],
        template: 'custom',
        customSubject: 'Оплата успішно завершена - ФУСАФ',
        customMessage: `
Вітаємо! Ваш платіж успішно завершено.

Деталі платежу:
• Номер замовлення: ${payment.order_id}
• Сума: ${paymentData.amount} ${paymentData.currency}
• Змагання: ${competitionTitle}
• Дата: ${new Date().toLocaleDateString('uk-UA')}

Дякуємо за участь у змаганнях ФУСАФ!

З найкращими побажаннями,
Команда ФУСАФ
        `,
        variables: {
          orderid: payment.order_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          competitionTitle: competitionTitle
        }
      })
    });

    console.log('📧 Email про успішний платіж відправлено:', payment.customer_email);

  } catch (error) {
    console.error('❌ Помилка відправки email про платіж:', error);
  }
}

/**
 * Оновлення статистики змагання
 */
async function updateCompetitionStats(competitionId: string) {
  try {
    // Підраховуємо кількість оплачених реєстрацій
    const result = await executeQuery<any>(`
      SELECT COUNT(*) as paid_count
      FROM payments p
      WHERE p.competition_id = ? AND p.status = 'success'
    `);

    const paidCount = result[0]?.paid_count || 0;

    // Оновлюємо поле current_participants
    await executeQuery(`
      UPDATE competitions
      SET current_participants = ?, updated_at = NOW()
      WHERE id = ?
    `, [paidCount, competitionId]);

    console.log('📊 Статистику змагання оновлено:', competitionId, '→', paidCount, 'учасників');

  } catch (error) {
    console.error('❌ Помилка оновлення статистики змагання:', error);
  }
}

/**
 * Логування callback в admin logs
 */
async function logPaymentCallback(payment: any, paymentData: any, newStatus: string) {
  try {
    await executeQuery(`
      INSERT INTO admin_logs (
        id, admin_id, admin_email, action, target_type, target_id,
        details, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      require('uuid').v4(),
      'system',
      'system@fusaf.org.ua',
      'PAYMENT_CALLBACK',
      'payment',
      payment.id,
      JSON.stringify({
        order_id: payment.order_id,
        old_status: payment.status,
        new_status: newStatus,
        liqpay_status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        liqpay_payment_id: paymentData.payment_id
      }),
      'liqpay-server',
      'LiqPay-Callback/1.0'
    ]);

  } catch (error) {
    console.error('❌ Помилка логування callback:', error);
  }
}
