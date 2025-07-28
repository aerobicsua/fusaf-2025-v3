import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const payments = await database.getAllPayments(filters);
    const stats = await database.getPaymentStats();

    return NextResponse.json({
      success: true,
      data: {
        payments,
        stats,
        filters
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Помилка завантаження платежів' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      amount,
      currency = 'UAH',
      description,
      customerEmail,
      customerPhone,
      competitionId,
      competitionTitle
    } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Некоректна сума платежу' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Опис платежу обов\'язковий' },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Email клієнта обов\'язковий' },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `FUSAF-${String(Date.now()).slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create payment
    const payment = await database.createPayment({
      orderId,
      amount,
      currency,
      description,
      status: 'pending',
      customerEmail,
      customerPhone,
      competitionId,
      competitionTitle,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    return NextResponse.json({
      success: true,
      data: {
        payment,
        paymentUrl: `https://www.liqpay.ua/api/3/checkout?data=demo&signature=demo&order_id=${orderId}`,
        message: 'Платіж створено успішно'
      }
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Помилка створення платежу' },
      { status: 500 }
    );
  }
}
