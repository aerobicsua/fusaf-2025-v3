import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try to find by ID first, then by order ID
    let payment = await database.getPaymentById(id);

    if (!payment) {
      payment = await database.getPaymentByOrderId(id);
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Платіж не знайдено' },
        { status: 404 }
      );
    }

    // Simulate LiqPay status check for demo
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    if (refresh && payment.status === 'pending') {
      // Simulate random status updates for demo
      const randomOutcomes = ['success', 'pending', 'failed'];
      const weights = [0.7, 0.2, 0.1]; // 70% success, 20% still pending, 10% failed

      const random = Math.random();
      let newStatus: 'pending' | 'success' | 'failed' | 'processing' | 'cancelled' = payment.status;

      if (random < weights[0]) {
        newStatus = 'success';
      } else if (random < weights[0] + weights[1]) {
        newStatus = 'pending';
      } else {
        newStatus = 'failed';
      }

      if (newStatus !== payment.status) {
        const updateData: any = {
          status: newStatus,
          liqpayStatus: newStatus === 'success' ? 'success' : newStatus === 'failed' ? 'failure' : 'processing',
        };

        if (newStatus === 'success') {
          updateData.paidAt = new Date();
          updateData.liqpayPaymentId = `demo_${Date.now()}`;
          updateData.liqpayTransactionId = `tx_${Math.random().toString(36).substr(2, 9)}`;
          updateData.senderCardMask = '4149****' + Math.floor(Math.random() * 9999).toString().padStart(4, '0');
          updateData.senderCardBank = ['ПриватБанк', 'ОщадБанк', 'Монобанк', 'Райффайзен'][Math.floor(Math.random() * 4)];
        } else if (newStatus === 'failed') {
          updateData.errorCode = 'card_declined';
          updateData.errorDescription = 'Картка відхилена банком';
        }

        payment = await database.updatePayment(payment.id, updateData);
      }
    }

    return NextResponse.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { success: false, error: 'Помилка завантаження платежу' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const payment = await database.getPaymentById(id);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Платіж не знайдено' },
        { status: 404 }
      );
    }

    const { status, liqpayStatus, liqpayPaymentId, errorDescription } = body;

    const updateData: any = {};

    if (status) updateData.status = status;
    if (liqpayStatus) updateData.liqpayStatus = liqpayStatus;
    if (liqpayPaymentId) updateData.liqpayPaymentId = liqpayPaymentId;
    if (errorDescription) updateData.errorDescription = errorDescription;

    // Set paidAt if status becomes success
    if (status === 'success' && payment.status !== 'success') {
      updateData.paidAt = new Date();
    }

    const updatedPayment = await database.updatePayment(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: 'Платіж оновлено успішно'
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Помилка оновлення платежу' },
      { status: 500 }
    );
  }
}
