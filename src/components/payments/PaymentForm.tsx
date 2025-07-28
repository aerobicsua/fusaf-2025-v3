"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  RefreshCw,
  Mail,
  Phone,
  Trophy,
  Calculator
} from 'lucide-react';

interface PaymentFormProps {
  competitionId: string;
  competitionTitle: string;
  registrationFee: number;
  registrationData: any;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
  userEmail?: string;
  userPhone?: string;
}

interface PaymentState {
  loading: boolean;
  paymentUrl: string | null;
  orderId: string | null;
  status: 'idle' | 'creating' | 'pending' | 'success' | 'failed';
  error: string | null;
}

export default function PaymentForm({
  competitionId,
  competitionTitle,
  registrationFee,
  registrationData,
  onSuccess,
  onCancel,
  userEmail = '',
  userPhone = ''
}: PaymentFormProps) {
  const [customerEmail, setCustomerEmail] = useState(userEmail);
  const [customerPhone, setCustomerPhone] = useState(userPhone);
  const [paymentAmount, setPaymentAmount] = useState(registrationFee);
  const [payment, setPayment] = useState<PaymentState>({
    loading: false,
    paymentUrl: null,
    orderId: null,
    status: 'idle',
    error: null
  });
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Очищаємо інтервал при размонтированні компонента
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const validateForm = () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      setPayment(prev => ({ ...prev, error: 'Введіть коректний email' }));
      return false;
    }

    if (paymentAmount < registrationFee) {
      setPayment(prev => ({
        ...prev,
        error: `Мінімальна сума платежу: ${registrationFee} ₴`
      }));
      return false;
    }

    return true;
  };

  const createPayment = async () => {
    if (!validateForm()) return;

    setPayment(prev => ({ ...prev, loading: true, status: 'creating', error: null }));

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId,
          amount: paymentAmount,
          currency: 'UAH',
          description: `Реєстрація на змагання: ${competitionTitle}`,
          customerEmail,
          customerPhone,
          registrationData
        })
      });

      const data = await response.json();

      if (data.success) {
        setPayment(prev => ({
          ...prev,
          paymentUrl: data.data.paymentUrl,
          orderId: data.data.orderId,
          status: 'pending',
          loading: false
        }));

        // Відкриваємо платіжну форму LiqPay
        window.open(data.data.paymentUrl, '_blank', 'width=800,height=600');

        // Починаємо перевіряти статус платежу
        startStatusCheck(data.data.orderId);
      } else {
        setPayment(prev => ({
          ...prev,
          error: data.error || 'Помилка створення платежу',
          loading: false,
          status: 'failed'
        }));
      }
    } catch (error) {
      console.error('Помилка створення платежу:', error);
      setPayment(prev => ({
        ...prev,
        error: 'Помилка мережі. Спробуйте пізніше.',
        loading: false,
        status: 'failed'
      }));
    }
  };

  const startStatusCheck = (orderId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/status?orderId=${orderId}&refresh=true`);
        const data = await response.json();

        if (data.success) {
          const { status } = data.data;

          if (status === 'success') {
            setPayment(prev => ({ ...prev, status: 'success' }));
            clearInterval(interval);
            onSuccess?.(data.data.paymentId);
          } else if (['failed', 'expired', 'cancelled'].includes(status)) {
            setPayment(prev => ({
              ...prev,
              status: 'failed',
              error: data.data.errorDescription || 'Платіж не вдався'
            }));
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Помилка перевірки статусу:', error);
      }
    }, 3000); // Перевіряємо кожні 3 секунди

    setStatusCheckInterval(interval);

    // Зупиняємо перевірку через 10 хвилин
    setTimeout(() => {
      clearInterval(interval);
      if (payment.status === 'pending') {
        setPayment(prev => ({
          ...prev,
          status: 'failed',
          error: 'Час очікування платежу минув'
        }));
      }
    }, 10 * 60 * 1000);
  };

  const manualStatusCheck = async () => {
    if (!payment.orderId) return;

    setPayment(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`/api/payments/status?orderId=${payment.orderId}&refresh=true`);
      const data = await response.json();

      if (data.success) {
        const { status } = data.data;

        if (status === 'success') {
          setPayment(prev => ({ ...prev, status: 'success', loading: false }));
          onSuccess?.(data.data.paymentId);
        } else if (['failed', 'expired', 'cancelled'].includes(status)) {
          setPayment(prev => ({
            ...prev,
            status: 'failed',
            error: data.data.errorDescription || 'Платіж не вдався',
            loading: false
          }));
        } else {
          setPayment(prev => ({ ...prev, loading: false }));
        }
      }
    } catch (error) {
      console.error('Помилка перевірки статусу:', error);
      setPayment(prev => ({ ...prev, loading: false }));
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = () => {
    switch (payment.status) {
      case 'creating':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (payment.status) {
      case 'creating':
        return 'Створення платежу...';
      case 'pending':
        return 'Очікування оплати. Перейдіть в вікно LiqPay для завершення платежу.';
      case 'success':
        return 'Платіж успішно завершено! Ваша реєстрація підтверджена.';
      case 'failed':
        return payment.error || 'Платіж не вдався. Спробуйте ще раз.';
      default:
        return 'Введіть дані для оплати реєстрації';
    }
  };

  if (payment.status === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <CheckCircle className="h-6 w-6 mr-2" />
            Платіж успішно завершено!
          </CardTitle>
          <CardDescription>
            Ваша реєстрація на змагання підтверджена
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Order ID:</span>
              <span className="font-mono text-sm">{payment.orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Сума:</span>
              <span className="font-bold text-green-600">{formatAmount(paymentAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Змагання:</span>
              <span className="text-sm">{competitionTitle}</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
              <div className="text-sm text-green-800">
                <p>Підтвердження платежу відправлено на {customerEmail}</p>
                <p className="mt-1">Деталі реєстрації та інструкції будуть відправлені окремо</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Інформація про змагання */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-orange-500" />
            Реєстрація на змагання
          </CardTitle>
          <CardDescription>{competitionTitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Реєстраційний збір:</span>
              <span className="font-bold text-lg">{formatAmount(registrationFee)}</span>
            </div>
            {registrationData?.category && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Категорія:</span>
                <span>{registrationData.category}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Форма платежу */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
            Оплата через LiqPay
          </CardTitle>
          <CardDescription>
            Безпечна оплата банківською картою або через мобільний банкінг
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Контактні дані */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email для підтвердження *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Телефон (опціонально)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+380..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Сума платежу */}
          <div>
            <Label htmlFor="amount">Сума платежу (₴)</Label>
            <div className="relative">
              <Calculator className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                min={registrationFee}
                step="0.01"
                className="pl-10"
              />
            </div>
            {paymentAmount > registrationFee && (
              <p className="text-sm text-blue-600 mt-1">
                Додаткова сума: {formatAmount(paymentAmount - registrationFee)} (добровільний внесок)
              </p>
            )}
          </div>

          {/* Статус та помилки */}
          {payment.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{payment.error}</span>
              </div>
            </div>
          )}

          {payment.status !== 'idle' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                {getStatusIcon()}
                <span className="text-sm text-blue-700 ml-2">{getStatusMessage()}</span>
              </div>
              {payment.orderId && (
                <div className="mt-2 text-xs text-blue-600 font-mono">
                  Order ID: {payment.orderId}
                </div>
              )}
            </div>
          )}

          {/* Безпека */}
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-start">
              <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Безпечні платежі через LiqPay</p>
                <p className="mt-1">
                  Ваші платіжні дані захищені за стандартами PCI DSS.
                  Картковi дані не зберігаються на наших серверах.
                </p>
              </div>
            </div>
          </div>

          {/* Кнопки дій */}
          <div className="flex space-x-3">
            {payment.status === 'idle' || payment.status === 'failed' ? (
              <Button
                onClick={createPayment}
                disabled={payment.loading || !customerEmail}
                className="flex-1"
              >
                {payment.loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Створення платежу...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Оплатити {formatAmount(paymentAmount)}
                  </>
                )}
              </Button>
            ) : payment.status === 'pending' ? (
              <Button
                onClick={manualStatusCheck}
                disabled={payment.loading}
                variant="outline"
                className="flex-1"
              >
                {payment.loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Перевірка...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Перевірити статус
                  </>
                )}
              </Button>
            ) : null}

            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Скасувати
              </Button>
            )}
          </div>

          {/* Додаткова інформація */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center">
              <Info className="h-3 w-3 mr-1" />
              <span>Підтримуються всі банківські картки України</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Платіж діє протягом 30 хвилин</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              <span>Чек буде відправлено на вказаний email</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
