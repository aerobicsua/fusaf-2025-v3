import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { createLiqPayService } from '@/lib/liqpay';

/**
 * @swagger
 * /api/payments/status:
 *   get:
 *     summary: Перевірити статус платежу
 *     description: Отримати поточний статус платежу за order_id або payment_id
 *     tags: [Payments]
 *     parameters:
 *       - name: orderId
 *         in: query
 *         description: ID замовлення
 *         schema:
 *           type: string
 *       - name: paymentId
 *         in: query
 *         description: ID платежу
 *         schema:
 *           type: string
 *       - name: refresh
 *         in: query
 *         description: Оновити статус з LiqPay
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Статус платежу
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
 *                     status:
 *                       type: string
 *                       enum: [pending, processing, success, failed, expired, cancelled]
 *                     liqpayStatus:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     description:
 *                       type: string
 *                     competitionId:
 *                       type: string
 *                     competitionTitle:
 *                       type: string
 *                     customerEmail:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     isExpired:
 *                       type: boolean
 *                     canRetry:
 *                       type: boolean
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         description: Платіж не знайдено
 *       500:
 *         $ref: '#/components/responses/500'
 */

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    const paymentId = url.searchParams.get('paymentId');
    const refresh = url.searchParams.get('refresh') === 'true';

    console.log('🔍 GET /api/payments/status:', { orderId, paymentId, refresh });

    // Валідація параметрів
    if (!orderId && !paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Потрібен orderId або paymentId'
      }, { status: 400 });
    }

    // Шукаємо платіж в базі даних
    let query = `
      SELECT
        p.id, p.order_id, p.competition_id, p.amount, p.currency, p.description,
        p.status, p.liqpay_status, p.liqpay_payment_id, p.customer_email,
        p.created_at, p.paid_at, p.expires_at, p.liqpay_err_code, p.liqpay_err_description,
        c.title as competition_title
      FROM payments p
      LEFT JOIN competitions c ON p.competition_id = c.id
      WHERE
    `;

    const params: any[] = [];

    if (orderId) {
      query += 'p.order_id = ?';
      params.push(orderId);
    } else {
      query += 'p.id = ?';
      params.push(paymentId);
    }

    const payments = await executeQuery<any>(query, params);

    if (payments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Платіж не знайдено'
      }, { status: 404 });
    }

    const payment = payments[0];

    // Якщо потрібно оновити статус з LiqPay
    if (refresh && payment.order_id && payment.status !== 'success') {
      try {
        console.log('🔄 Оновлення статусу з LiqPay для:', payment.order_id);

        const liqPayService = createLiqPayService();
        const liqpayStatus = await liqPayService.checkPaymentStatus(payment.order_id);

        if (liqpayStatus) {
          const newStatus = getPaymentStatus(liqpayStatus.status, liqPayService);

          // Оновлюємо статус в базі
          await executeQuery(`
            UPDATE payments SET
              status = ?,
              liqpay_status = ?,
              liqpay_payment_id = ?,
              liqpay_err_code = ?,
              liqpay_err_description = ?,
              paid_at = ?,
              updated_at = NOW()
            WHERE id = ?
          `, [
            newStatus,
            liqpayStatus.status,
            liqpayStatus.payment_id || null,
            liqpayStatus.err_code || null,
            liqpayStatus.err_description || null,
            liqPayService.isPaymentSuccessful(liqpayStatus.status) ? new Date() : payment.paid_at,
            payment.id
          ]);

          // Оновлюємо локальні дані
          payment.status = newStatus;
          payment.liqpay_status = liqpayStatus.status;
          payment.liqpay_payment_id = liqpayStatus.payment_id;
          payment.liqpay_err_code = liqpayStatus.err_code;
          payment.liqpay_err_description = liqpayStatus.err_description;

          if (liqPayService.isPaymentSuccessful(liqpayStatus.status) && !payment.paid_at) {
            payment.paid_at = new Date();
          }

          console.log('✅ Статус оновлено:', payment.order_id, '→', newStatus);
        }
      } catch (error) {
        console.error('❌ Помилка оновлення статусу з LiqPay:', error);
      }
    }

    // Перевіряємо чи платіж прострочений
    const isExpired = payment.expires_at && new Date(payment.expires_at) < new Date();
    const canRetry = ['failed', 'expired', 'cancelled'].includes(payment.status);

    // Форматуємо відповідь
    const responseData = {
      paymentId: payment.id,
      orderId: payment.order_id,
      status: payment.status,
      liqpayStatus: payment.liqpay_status,
      liqpayPaymentId: payment.liqpay_payment_id,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      description: payment.description,
      competitionId: payment.competition_id,
      competitionTitle: payment.competition_title,
      customerEmail: payment.customer_email,
      createdAt: payment.created_at,
      paidAt: payment.paid_at,
      expiresAt: payment.expires_at,
      isExpired: isExpired,
      canRetry: canRetry,
      statusDescription: getStatusDescription(payment.status),
      errorCode: payment.liqpay_err_code,
      errorDescription: payment.liqpay_err_description
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Статус платежу отримано'
    });

  } catch (error) {
    console.error('❌ Помилка отримання статусу платежу:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка отримання статусу платежу',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
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
 * Отримати опис статусу українською
 */
function getStatusDescription(status: string): string {
  const descriptions: { [key: string]: string } = {
    'pending': 'Очікує оплати',
    'processing': 'Обробляється',
    'success': 'Успішно оплачено',
    'failed': 'Помилка оплати',
    'expired': 'Термін сплинув',
    'cancelled': 'Скасовано'
  };

  return descriptions[status] || `Невідомий статус: ${status}`;
}
