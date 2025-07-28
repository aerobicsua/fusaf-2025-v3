"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Trophy,
  User,
  Mail,
  Phone,
  Calculator,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function DemoPaymentPage() {
  const [formData, setFormData] = useState({
    amount: '250',
    description: 'Реєстрація на Чемпіонат України зі Спортивної Аеробіки 2024',
    customerEmail: 'test@example.com',
    customerPhone: '+380671234567',
    competitionId: 'comp-001',
    competitionTitle: 'Чемпіонат України зі Спортивної Аеробіки 2024'
  });

  const [paymentState, setPaymentState] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    paymentData: any;
  }>({
    loading: false,
    success: false,
    error: null,
    paymentData: null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createTestPayment = async () => {
    setPaymentState({ loading: true, success: false, error: null, paymentData: null });

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          description: formData.description,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          competitionId: formData.competitionId,
          competitionTitle: formData.competitionTitle
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentState({
          loading: false,
          success: true,
          error: null,
          paymentData: data.data
        });

        // Simulate payment window opening
        setTimeout(() => {
          alert('🚀 Демо: Платіжне вікно LiqPay відкрито!\n\nВ реальній системі тут буде перенаправлення на LiqPay.\nДля демо ми просто симулюємо успішний платіж.');

          // Simulate successful payment after 2 seconds
          setTimeout(() => {
            simulatePaymentSuccess(data.data.payment.id);
          }, 2000);
        }, 1000);
      } else {
        setPaymentState({
          loading: false,
          success: false,
          error: data.error,
          paymentData: null
        });
      }
    } catch (error) {
      setPaymentState({
        loading: false,
        success: false,
        error: 'Помилка мережі',
        paymentData: null
      });
    }
  };

  const simulatePaymentSuccess = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'success',
          liqpayStatus: 'success',
          liqpayPaymentId: `demo_${Date.now()}`
        })
      });

      const data = await response.json();
      if (data.success) {
        setPaymentState(prev => ({
          ...prev,
          paymentData: { ...prev.paymentData, payment: data.data }
        }));

        alert('✅ Демо платіж успішно завершено!\n\nПерейдіть в адмін панель, щоб побачити оновлений статус.');
      }
    } catch (error) {
      console.error('Error simulating payment success:', error);
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '0 ₴' : `${num.toFixed(2)} ₴`;
  };

  const resetForm = () => {
    setPaymentState({
      loading: false,
      success: false,
      error: null,
      paymentData: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Демо платіжної системи LiqPay</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Протестуйте створення платежу та перегляньте результат в адмін панелі.
            Це повністю функціональна демонстрація інтеграції з LiqPay для ФУСАФ.
          </p>
          <Badge className="mt-3 bg-green-500 text-white">
            <Zap className="h-3 w-3 mr-1" />
            LIVE DEMO
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                Форма платежу
              </CardTitle>
              <CardDescription>
                Заповніть дані для створення тестового платежу
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Competition */}
              <div>
                <Label htmlFor="competition">Змагання</Label>
                <Select
                  value={formData.competitionId}
                  onValueChange={(value) => {
                    handleInputChange('competitionId', value);
                    const competitions = {
                      'comp-001': {
                        title: 'Чемпіонат України зі Спортивної Аеробіки 2024',
                        amount: '250'
                      },
                      'comp-002': {
                        title: 'Кубок Київської області 2024',
                        amount: '150'
                      },
                      'comp-003': {
                        title: 'Міжнародний турнір з фітнес-аеробіки',
                        amount: '300'
                      }
                    };
                    const comp = competitions[value as keyof typeof competitions];
                    if (comp) {
                      handleInputChange('competitionTitle', comp.title);
                      handleInputChange('amount', comp.amount);
                      handleInputChange('description', `Реєстрація на ${comp.title}`);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comp-001">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-orange-500" />
                        Чемпіонат України 2024 - 250 ₴
                      </div>
                    </SelectItem>
                    <SelectItem value="comp-002">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-blue-500" />
                        Кубок Київської області - 150 ₴
                      </div>
                    </SelectItem>
                    <SelectItem value="comp-003">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-purple-500" />
                        Міжнародний турнір - 300 ₴
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Сума платежу</Label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="pl-10"
                    step="0.01"
                    min="0"
                  />
                  <div className="absolute right-3 top-2.5 text-sm text-gray-500">₴</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Сума: <strong>{formatAmount(formData.amount)}</strong>
                </div>
              </div>

              {/* Customer Email */}
              <div>
                <Label htmlFor="email">Email клієнта</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="pl-10"
                    placeholder="test@example.com"
                  />
                </div>
              </div>

              {/* Customer Phone */}
              <div>
                <Label htmlFor="phone">Телефон клієнта</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="pl-10"
                    placeholder="+380..."
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Опис платежу</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Опис платежу"
                />
              </div>

              {/* Create Payment Button */}
              <div className="pt-4">
                {!paymentState.success ? (
                  <Button
                    onClick={createTestPayment}
                    disabled={paymentState.loading || !formData.amount || !formData.customerEmail}
                    className="w-full"
                    size="lg"
                  >
                    {paymentState.loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Створення платежу...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Створити демо платіж {formatAmount(formData.amount)}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={resetForm} variant="outline" className="w-full" size="lg">
                    Створити новий платіж
                  </Button>
                )}
              </div>

              {/* Error */}
              {paymentState.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">{paymentState.error}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Результат платежу
              </CardTitle>
              <CardDescription>
                Інформація про створений платіж
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!paymentState.paymentData ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Створіть платіж для перегляду результату</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-800">
                        Платіж успішно створено!
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Order ID:</span>
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {paymentState.paymentData.payment.orderId}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Сума:</span>
                      <div className="text-lg font-bold text-green-600">
                        {formatAmount(paymentState.paymentData.payment.amount.toString())}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Статус:</span>
                      <div>
                        <Badge className={
                          paymentState.paymentData.payment.status === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }>
                          {paymentState.paymentData.payment.status === 'success' ? 'Оплачено' : 'Очікування'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Email клієнта:</span>
                      <div>{paymentState.paymentData.payment.customerEmail}</div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Опис:</span>
                      <div className="text-sm">{paymentState.paymentData.payment.description}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button asChild className="w-full">
                      <a href="/admin" target="_blank" rel="noopener noreferrer">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Переглянути в адмін панелі
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Demo Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Як працює демо
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Створення платежу</h4>
                  <p className="text-blue-700 mt-1">
                    Заповніть форму та натисніть кнопку створення платежу.
                    Система створить запис у базі даних.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Симуляція LiqPay</h4>
                  <p className="text-blue-700 mt-1">
                    Для демо ми симулюємо роботу LiqPay. В реальності
                    користувач буде перенаправлений на платіжну форму.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Адмін панель</h4>
                  <p className="text-blue-700 mt-1">
                    Перейдіть в адмін панель, щоб побачити всі платежі,
                    статистику та можливості управління.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-100 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Особливості демо:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Всі платежі зберігаються тільки в пам'яті (in-memory)</li>
                <li>• При оновленні сторінки дані скидаються до початкових</li>
                <li>• Симуляція різних статусів платежів</li>
                <li>• Повна демонстрація адмін панелі</li>
                <li>• Real-time оновлення статусів</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
