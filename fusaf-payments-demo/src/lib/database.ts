// Simple in-memory storage for demo purposes
interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'success' | 'failed' | 'processing' | 'cancelled';
  liqpayStatus?: string;
  customerEmail: string;
  customerPhone?: string;
  competitionId?: string;
  competitionTitle?: string;
  liqpayPaymentId?: string;
  liqpayTransactionId?: string;
  senderCardMask?: string;
  senderCardBank?: string;
  errorCode?: string;
  errorDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  expiresAt?: Date;
}

class MemoryDatabase {
  private payments: Map<string, Payment> = new Map();
  private nextId = 1;

  constructor() {
    // Insert demo data
    this.seedDemoData();
  }

  private seedDemoData() {
    const demoPayments: Omit<Payment, 'id'>[] = [
      {
        orderId: 'FUSAF-001-' + Date.now(),
        amount: 250.00,
        currency: 'UAH',
        description: 'Реєстрація на Чемпіонат України зі Спортивної Аеробіки 2024',
        status: 'success',
        liqpayStatus: 'success',
        customerEmail: 'ivan.petrov@example.com',
        customerPhone: '+380671234567',
        competitionId: 'comp-001',
        competitionTitle: 'Чемпіонат України зі Спортивної Аеробіки 2024',
        liqpayPaymentId: '1234567890',
        liqpayTransactionId: 'tx_123456',
        senderCardMask: '4149****1234',
        senderCardBank: 'ПриватБанк',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        updatedAt: new Date(Date.now() - 3600000),
        paidAt: new Date(Date.now() - 3500000),
        expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
      },
      {
        orderId: 'FUSAF-002-' + (Date.now() + 1),
        amount: 150.00,
        currency: 'UAH',
        description: 'Реєстрація на Кубок Київської області 2024',
        status: 'pending',
        liqpayStatus: 'wait_secure',
        customerEmail: 'maria.kovalenko@example.com',
        customerPhone: '+380501234567',
        competitionId: 'comp-002',
        competitionTitle: 'Кубок Київської області 2024',
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        updatedAt: new Date(Date.now() - 1800000),
        expiresAt: new Date(Date.now() + 86400000),
      },
      {
        orderId: 'FUSAF-003-' + (Date.now() + 2),
        amount: 300.00,
        currency: 'UAH',
        description: 'Реєстрація на Міжнародний турнір з фітнес-аеробіки',
        status: 'failed',
        liqpayStatus: 'failure',
        customerEmail: 'oleksandr.sydorenko@example.com',
        competitionId: 'comp-003',
        competitionTitle: 'Міжнародний турнір з фітнес-аеробіки',
        errorCode: 'card_declined',
        errorDescription: 'Картка відхилена банком',
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        updatedAt: new Date(Date.now() - 7200000),
        expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
      },
      {
        orderId: 'FUSAF-004-' + (Date.now() + 3),
        amount: 200.00,
        currency: 'UAH',
        description: 'Реєстрація на Всеукраїнський чемпіонат серед юніорів',
        status: 'processing',
        liqpayStatus: 'processing',
        customerEmail: 'anna.bondarenko@example.com',
        customerPhone: '+380631234567',
        competitionId: 'comp-004',
        competitionTitle: 'Всеукраїнський чемпіонат серед юніорів',
        createdAt: new Date(Date.now() - 600000), // 10 minutes ago
        updatedAt: new Date(Date.now() - 300000), // Updated 5 minutes ago
        expiresAt: new Date(Date.now() + 86400000),
      },
      {
        orderId: 'FUSAF-005-' + (Date.now() + 4),
        amount: 175.00,
        currency: 'UAH',
        description: 'Реєстрація на Чемпіонат Львівської області',
        status: 'success',
        liqpayStatus: 'success',
        customerEmail: 'viktor.melnyk@example.com',
        customerPhone: '+380441234567',
        competitionId: 'comp-005',
        competitionTitle: 'Чемпіонат Львівської області',
        liqpayPaymentId: '1234567891',
        liqpayTransactionId: 'tx_123457',
        senderCardMask: '5168****5678',
        senderCardBank: 'ОщадБанк',
        createdAt: new Date(Date.now() - 10800000), // 3 hours ago
        updatedAt: new Date(Date.now() - 10800000),
        paidAt: new Date(Date.now() - 10500000),
        expiresAt: new Date(Date.now() + 86400000),
      }
    ];

    demoPayments.forEach(payment => {
      const id = this.generateId();
      this.payments.set(id, { ...payment, id });
    });
  }

  private generateId(): string {
    return `pay_${String(this.nextId++).padStart(6, '0')}`;
  }

  async getAllPayments(filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Payment[]> {
    let payments = Array.from(this.payments.values());

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      payments = payments.filter(p => p.status === filters.status);
    }

    if (filters?.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      payments = payments.filter(p => p.createdAt >= dateFrom);
    }

    if (filters?.dateTo) {
      const dateTo = new Date(filters.dateTo);
      payments = payments.filter(p => p.createdAt <= dateTo);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      payments = payments.filter(p =>
        p.orderId.toLowerCase().includes(search) ||
        p.customerEmail.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.competitionTitle?.toLowerCase().includes(search)
      );
    }

    // Sort by creation date (newest first)
    payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    return payments.slice(offset, offset + limit);
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.payments.get(id) || null;
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    for (const payment of this.payments.values()) {
      if (payment.orderId === orderId) {
        return payment;
      }
    }
    return null;
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const id = this.generateId();
    const payment: Payment = {
      ...paymentData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updateData: Partial<Payment>): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;

    const updatedPayment = {
      ...payment,
      ...updateData,
      updatedAt: new Date()
    };

    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async updatePaymentByOrderId(orderId: string, updateData: Partial<Payment>): Promise<Payment | null> {
    const payment = await this.getPaymentByOrderId(orderId);
    if (!payment) return null;

    return this.updatePayment(payment.id, updateData);
  }

  async getPaymentStats(): Promise<{
    total: number;
    successful: number;
    pending: number;
    failed: number;
    totalAmount: number;
    successfulAmount: number;
    averageAmount: number;
    todayPayments: number;
    yesterdayPayments: number;
  }> {
    const payments = Array.from(this.payments.values());
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    const stats = {
      total: payments.length,
      successful: payments.filter(p => p.status === 'success').length,
      pending: payments.filter(p => p.status === 'pending' || p.status === 'processing').length,
      failed: payments.filter(p => p.status === 'failed').length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      successfulAmount: payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0),
      averageAmount: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
      todayPayments: payments.filter(p => p.createdAt >= startOfToday).length,
      yesterdayPayments: payments.filter(p => p.createdAt >= startOfYesterday && p.createdAt < startOfToday).length,
    };

    return stats;
  }
}

// Singleton instance
const database = new MemoryDatabase();

export { database, type Payment };
export default database;
