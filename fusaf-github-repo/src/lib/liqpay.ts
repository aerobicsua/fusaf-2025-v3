import crypto from 'crypto';

// LiqPay статуси платежів
export enum LiqPayStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  ERROR = 'error',
  REVERSED = 'reversed',
  SUBSCRIBED = 'subscribed',
  UNSUBSCRIBED = 'unsubscribed',
  PROCESSING = 'processing',
  WAIT_SECURE = 'wait_secure',
  WAIT_ACCEPT = 'wait_accept',
  WAIT_LIQPAY = 'wait_liqpay',
  HOLD_WAIT = 'hold_wait',
  INVOICE_WAIT = 'invoice_wait'
}

// Інтерфейс для даних платежу
export interface LiqPayPaymentData {
  public_key: string;
  version: number;
  action: string;
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  result_url: string;
  server_url: string;
  language: string;
  pay_way?: string;
}

// Інтерфейс для callback даних
export interface LiqPayCallbackData {
  public_key: string;
  version: number;
  action: string;
  payment_id: number;
  status: string;
  amount: number;
  currency: string;
  order_id: string;
  description: string;
  sender_phone?: string;
  sender_card_mask2?: string;
  sender_card_type?: string;
  transaction_id: number;
  create_date: number;
  end_date: number;
  completion_date?: number;
}

class LiqPayService {
  private publicKey: string;
  private privateKey: string;
  private sandbox: boolean;

  constructor() {
    this.publicKey = process.env.LIQPAY_PUBLIC_KEY || '';
    this.privateKey = process.env.LIQPAY_PRIVATE_KEY || '';
    this.sandbox = process.env.LIQPAY_SANDBOX === 'true';
  }

  // Створення підпису для LiqPay
  private createSignature(data: string): string {
    const sign = crypto
      .createHash('sha1')
      .update(this.privateKey + data + this.privateKey)
      .digest('base64');
    return sign;
  }

  // Кодування даних в base64
  private encodeData(data: object): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  // Декодування даних з base64
  decodeData(data: string): LiqPayCallbackData | null {
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding LiqPay data:', error);
      return null;
    }
  }

  // Перевірка підпису callback
  validateCallback(data: string, signature: string): boolean {
    const expectedSignature = this.createSignature(data);
    return expectedSignature === signature;
  }

  // Створення параметрів для форми платежу
  createPaymentForm(paymentData: LiqPayPaymentData): {
    data: string;
    signature: string;
    action_url: string;
  } {
    const data = this.encodeData(paymentData);
    const signature = this.createSignature(data);

    return {
      data,
      signature,
      action_url: this.sandbox
        ? 'https://www.liqpay.ua/api/3/checkout'
        : 'https://www.liqpay.ua/api/3/checkout'
    };
  }

  // Створення URL для оплати змагання
  createCompetitionPaymentData(
    competitionId: string,
    registrationId: string,
    amount: number,
    description: string,
    userEmail?: string
  ): LiqPayPaymentData {
    const orderId = `fusaf_${competitionId}_${registrationId}_${Date.now()}`;

    return {
      public_key: this.publicKey,
      version: 3,
      action: 'pay',
      amount,
      currency: 'UAH',
      description,
      order_id: orderId,
      result_url: `${process.env.APP_URL}/competitions/payment/result?order_id=${orderId}`,
      server_url: `${process.env.APP_URL}/api/payments/liqpay/callback`,
      language: 'uk',
    };
  }

  // Перевірка статусу платежу
  getPaymentStatus(
    orderId: string
  ): Promise<{ status: string; amount: number } | null> {
    // Тут можна додати логіку для перевірки статусу платежу через LiqPay API
    // Поки що повертаємо заглушку
    return Promise.resolve(null);
  }
}

// Експортуємо singleton інстанс
export const liqPayService = new LiqPayService();
