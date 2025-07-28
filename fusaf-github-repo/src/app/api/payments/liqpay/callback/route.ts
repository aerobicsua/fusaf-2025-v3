import { type NextRequest, NextResponse } from 'next/server';
import { liqPayService, LiqPayStatus } from '@/lib/liqpay';
import { updateRegistration } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const signature = formData.get('signature') as string;

    if (!data || !signature) {
      return NextResponse.json(
        { error: 'Missing data or signature' },
        { status: 400 }
      );
    }

    // Перевіряємо підпис
    if (!liqPayService.validateCallback(data, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Декодуємо дані платежу
    const paymentData = liqPayService.decodeData(data);
    if (!paymentData) {
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      );
    }

    const { status, order_id } = paymentData as {
      status: string;
      order_id: string;
    };

    // Витягуємо registrationId з order_id
    // Формат: fusaf_{competitionId}_{registrationId}_{timestamp}
    const orderParts = order_id.split('_');
    if (orderParts.length < 4 || orderParts[0] !== 'fusaf') {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    const registrationId = orderParts[2];

    // Визначаємо новий статус платежу
    let newPaymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    let newRegistrationStatus: 'pending' | 'confirmed' | 'cancelled' | 'waitlist' | undefined;

    switch (status) {
      case LiqPayStatus.SUCCESS:
        newPaymentStatus = 'paid';
        newRegistrationStatus = 'confirmed';
        break;
      case LiqPayStatus.FAILURE:
      case LiqPayStatus.ERROR:
        newPaymentStatus = 'failed';
        break;
      case LiqPayStatus.REVERSED:
        newPaymentStatus = 'refunded';
        newRegistrationStatus = 'cancelled';
        break;
      default:
        newPaymentStatus = 'pending';
        break;
    }

    // Оновлюємо реєстрацію в базі даних
    const updateData: {
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
      status?: 'pending' | 'confirmed' | 'cancelled' | 'waitlist';
    } = {
      payment_status: newPaymentStatus
    };

    if (newRegistrationStatus) {
      updateData.status = newRegistrationStatus;
    }

    const updatedRegistration = await updateRegistration(registrationId, updateData);

    if (updatedRegistration && newPaymentStatus === 'paid') {
      // Можемо додати логіку для відправки email підтвердження
      console.log(`Payment successful for registration ${registrationId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
