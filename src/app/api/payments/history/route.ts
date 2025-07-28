import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Історія платежів
 *     description: Отримати історію платежів користувача або всіх платежів (для адміністраторів)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: email
 *         in: query
 *         description: Email користувача (опціонально для адміністраторів)
 *         schema:
 *           type: string
 *       - name: competitionId
 *         in: query
 *         description: Фільтр за змаганням
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Фільтр за статусом
 *         schema:
 *           type: string
 *           enum: [pending, processing, success, failed, expired, cancelled]
 *       - name: dateFrom
 *         in: query
 *         description: Дата початку періоду
 *         schema:
 *           type: string
 *           format: date
 *       - name: dateTo
 *         in: query
 *         description: Дата закінчення періоду
 *         schema:
 *           type: string
 *           format: date
 *       - name: page
 *         in: query
 *         description: Номер сторінки
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Кількість записів на сторінку
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Історія платежів
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           paymentId:
 *                             type: string
 *                           orderId:
 *                             type: string
 *                           status:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           currency:
 *                             type: string
 *                           description:
 *                             type: string
 *                           competitionTitle:
 *                             type: string
 *                           customerEmail:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                           paidAt:
 *                             type: string
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         totalAmount:
 *                           type: number
 *                         successfulPayments:
 *                           type: integer
 *                         successfulAmount:
 *                           type: number
 *                         byStatus:
 *                           type: object
 *       401:
 *         $ref: '#/components/responses/401'
 *       500:
 *         $ref: '#/components/responses/500'
 */

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    // Параметри запиту
    const email = url.searchParams.get('email');
    const competitionId = url.searchParams.get('competitionId');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    console.log('📊 GET /api/payments/history:', {
      email, competitionId, status, dateFrom, dateTo, page, limit
    });

    // TODO: Додати перевірку авторизації для захисту особистих даних
    // Поки що показуємо всі платежі, але в реальному проекті потрібна авторизація

    // Базовий запит
    let query = `
      SELECT
        p.id, p.order_id, p.amount, p.currency, p.description, p.status,
        p.liqpay_status, p.liqpay_payment_id, p.customer_email, p.customer_phone,
        p.created_at, p.paid_at, p.expires_at, p.liqpay_err_code, p.liqpay_err_description,
        c.title as competition_title, c.id as competition_id
      FROM payments p
      LEFT JOIN competitions c ON p.competition_id = c.id
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total,
             SUM(CASE WHEN p.status = 'success' THEN 1 ELSE 0 END) as successful_payments,
             SUM(CASE WHEN p.status = 'success' THEN p.amount ELSE 0 END) as successful_amount,
             SUM(p.amount) as total_amount
      FROM payments p
      LEFT JOIN competitions c ON p.competition_id = c.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];
    const countParams: any[] = [];

    // Фільтр за email
    if (email) {
      query += ` AND p.customer_email = ?`;
      countQuery += ` AND p.customer_email = ?`;
      queryParams.push(email);
      countParams.push(email);
    }

    // Фільтр за змаганням
    if (competitionId) {
      query += ` AND p.competition_id = ?`;
      countQuery += ` AND p.competition_id = ?`;
      queryParams.push(competitionId);
      countParams.push(competitionId);
    }

    // Фільтр за статусом
    if (status) {
      query += ` AND p.status = ?`;
      countQuery += ` AND p.status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    // Фільтр за датами
    if (dateFrom) {
      query += ` AND DATE(p.created_at) >= ?`;
      countQuery += ` AND DATE(p.created_at) >= ?`;
      queryParams.push(dateFrom);
      countParams.push(dateFrom);
    }

    if (dateTo) {
      query += ` AND DATE(p.created_at) <= ?`;
      countQuery += ` AND DATE(p.created_at) <= ?`;
      queryParams.push(dateTo);
      countParams.push(dateTo);
    }

    // Сортування та пагінація
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log('🔍 Виконання запитів до payments...');

    // Виконуємо запити
    const [payments, countResult] = await Promise.all([
      executeQuery<any>(query, queryParams),
      executeQuery<any>(countQuery, countParams)
    ]);

    const stats = countResult[0] || {
      total: 0,
      successful_payments: 0,
      successful_amount: 0,
      total_amount: 0
    };

    // Статистика по статусах
    const statusStats = await executeQuery<any>(`
      SELECT status, COUNT(*) as count, SUM(amount) as amount
      FROM payments p
      WHERE 1=1
      ${email ? 'AND p.customer_email = ?' : ''}
      ${competitionId ? 'AND p.competition_id = ?' : ''}
      ${dateFrom ? 'AND DATE(p.created_at) >= ?' : ''}
      ${dateTo ? 'AND DATE(p.created_at) <= ?' : ''}
      GROUP BY status
    `, countParams.slice(0, -1)); // Забираємо останні параметри пагінації

    // Обробляємо платежі
    const processedPayments = payments.map((payment: any) => {
      const isExpired = payment.expires_at && new Date(payment.expires_at) < new Date();

      return {
        paymentId: payment.id,
        orderId: payment.order_id,
        status: payment.status,
        statusDescription: getStatusDescription(payment.status),
        liqpayStatus: payment.liqpay_status,
        liqpayPaymentId: payment.liqpay_payment_id,
        amount: parseFloat(payment.amount),
        currency: payment.currency,
        description: payment.description,
        competitionId: payment.competition_id,
        competitionTitle: payment.competition_title,
        customerEmail: payment.customer_email,
        customerPhone: payment.customer_phone,
        createdAt: payment.created_at,
        paidAt: payment.paid_at,
        expiresAt: payment.expires_at,
        isExpired: isExpired,
        canRetry: ['failed', 'expired', 'cancelled'].includes(payment.status),
        errorCode: payment.liqpay_err_code,
        errorDescription: payment.liqpay_err_description,
        formattedAmount: formatAmount(parseFloat(payment.amount), payment.currency)
      };
    });

    // Статистика по статусах у зручному форматі
    const byStatus = statusStats.reduce((acc: any, item: any) => {
      acc[item.status] = {
        count: item.count,
        amount: parseFloat(item.amount || 0)
      };
      return acc;
    }, {});

    const totalPages = Math.ceil(stats.total / limit);

    console.log(`✅ Знайдено ${payments.length} платежів з ${stats.total} загалом`);

    return NextResponse.json({
      success: true,
      data: {
        payments: processedPayments,
        pagination: {
          page,
          limit,
          total: stats.total,
          totalPages
        },
        statistics: {
          total: stats.total,
          totalAmount: parseFloat(stats.total_amount || 0),
          successfulPayments: stats.successful_payments,
          successfulAmount: parseFloat(stats.successful_amount || 0),
          averageAmount: stats.total > 0
            ? parseFloat(stats.total_amount || 0) / stats.total
            : 0,
          successRate: stats.total > 0
            ? (stats.successful_payments / stats.total * 100).toFixed(1)
            : 0,
          byStatus
        }
      },
      message: 'Історія платежів отримана'
    });

  } catch (error) {
    console.error('❌ Помилка отримання історії платежів:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка отримання історії платежів',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
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

/**
 * Форматувати суму для відображення
 */
function formatAmount(amount: number, currency: string = 'UAH'): string {
  const formatted = amount.toFixed(2);

  switch (currency) {
    case 'UAH':
      return `${formatted} ₴`;
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    default:
      return `${formatted} ${currency}`;
  }
}
