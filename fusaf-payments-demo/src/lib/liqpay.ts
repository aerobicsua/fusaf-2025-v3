import crypto from 'crypto';

/**
 * LiqPay Integration Library for FUSAF
 * Handles payment processing for competition registrations
 */

export interface LiqPayConfig {
  publicKey: string;
  privateKey: string;
  apiUrl: string;
  sandboxMode: boolean;
}

export interface LiqPayPaymentData {
  version: number;
  public_key: string;
  action: string;
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  result_url?: string;
  server_url?: string;
  language?: string;
  customer?: string;
  customer_user_id?: string;
  phone?: string;
  email?: string;
  expired_date?: string;
  product_category?: string;
  product_description?: string;
  product_name?: string;
  product_url?: string;
}

export interface LiqPayResponse {
  payment_id: string;
  status: string;
  amount: number;
  currency: string;
  order_id: string;
  description: string;
  transaction_id?: string;
  sender_phone?: string;
  sender_card_mask2?: string;
  sender_card_bank?: string;
  create_date?: string;
  end_date?: string;
  err_code?: string;
  err_description?: string;
}

export class LiqPayService {
  private config: LiqPayConfig;

  constructor(config: LiqPayConfig) {
    this.config = config;
  }

  /**
   * Generate signature for LiqPay request
   */
  private generateSignature(data: string): string {
    const signString = this.config.privateKey + data + this.config.privateKey;
    return crypto.createHash('sha1').update(signString).digest('base64');
  }

  /**
   * Encode data to base64
   */
  private encodeData(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Decode data from base64
   */
  private decodeData(data: string): any {
    return JSON.parse(Buffer.from(data, 'base64').toString());
  }

  /**
   * Create payment request
   */
  createPayment(paymentData: Partial<LiqPayPaymentData>): {
    data: string;
    signature: string;
    form_url: string;
  } {
    const data: LiqPayPaymentData = {
      version: 3,
      public_key: this.config.publicKey,
      action: 'pay',
      currency: 'UAH',
      language: 'uk',
      ...paymentData
    } as LiqPayPaymentData;

    const encodedData = this.encodeData(data);
    const signature = this.generateSignature(encodedData);

    return {
      data: encodedData,
      signature: signature,
      form_url: this.config.sandboxMode
        ? 'https://www.liqpay.ua/api/3/checkout'
        : 'https://www.liqpay.ua/api/3/checkout'
    };
  }

  /**
   * Verify callback from LiqPay
   */
  verifyCallback(data: string, signature: string): {
    isValid: boolean;
    paymentData?: LiqPayResponse;
  } {
    const expectedSignature = this.generateSignature(data);

    if (signature !== expectedSignature) {
      return { isValid: false };
    }

    try {
      const paymentData = this.decodeData(data) as LiqPayResponse;
      return { isValid: true, paymentData };
    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderId: string): Promise<LiqPayResponse | null> {
    try {
      const data = {
        version: 3,
        public_key: this.config.publicKey,
        action: 'status',
        order_id: orderId
      };

      const encodedData = this.encodeData(data);
      const signature = this.generateSignature(encodedData);

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          data: encodedData,
          signature: signature
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result as LiqPayResponse;

    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  }

  /**
   * Get payment status description in Ukrainian
   */
  getPaymentStatusDescription(status: string): string {
    const statuses: { [key: string]: string } = {
      'error': 'Помилка платежу',
      'failure': 'Неуспішний платіж',
      'processing': 'Платіж обробляється',
      'success': 'Успішний платіж',
      'wait_secure': 'Очікування підтвердження',
      'wait_accept': 'Очікування акцепту',
      'wait_lc': 'Очікування LC',
      'hold_wait': 'Утримання коштів',
      'cash_wait': 'Очікування готівки',
      'invoice_wait': 'Очікування рахунку',
      'prepared': 'Підготовлено',
      'wait_compensation': 'Очікування компенсації',
      'sandbox': 'Тестовий платіж'
    };

    return statuses[status] || `Невідомий статус: ${status}`;
  }

  /**
   * Check if payment is successful
   */
  isPaymentSuccessful(status: string): boolean {
    return ['success', 'sandbox'].includes(status);
  }

  /**
   * Check if payment is failed
   */
  isPaymentFailed(status: string): boolean {
    return ['error', 'failure'].includes(status);
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(status: string): boolean {
    return [
      'processing',
      'wait_secure',
      'wait_accept',
      'wait_lc',
      'hold_wait',
      'cash_wait',
      'invoice_wait',
      'prepared',
      'wait_compensation'
    ].includes(status);
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'UAH'): string {
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
}

// Factory function to create LiqPay service instance
export function createLiqPayService(): LiqPayService {
  const config: LiqPayConfig = {
    publicKey: process.env.LIQPAY_PUBLIC_KEY || 'sandbox_i12345678901',
    privateKey: process.env.LIQPAY_PRIVATE_KEY || 'sandbox_demoPrivateKey',
    apiUrl: 'https://www.liqpay.ua/api/request',
    sandboxMode: process.env.NODE_ENV !== 'production'
  };

  return new LiqPayService(config);
}

export default LiqPayService;
