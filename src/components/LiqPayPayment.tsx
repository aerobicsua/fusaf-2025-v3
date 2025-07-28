"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Lock, Shield, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LiqPayPaymentProps {
  registrationId: string;
  competitionId: string;
  amount: number;
  description: string;
  competitionTitle: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export function LiqPayPayment({
  registrationId,
  competitionId,
  amount,
  description,
  competitionTitle,
  onPaymentSuccess,
  onPaymentError
}: LiqPayPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{ data: string; signature: string } | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Створюємо платіж через API
      const response = await fetch('/api/payments/liqpay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId,
          competitionId,
          amount,
          description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const result = await response.json();

      if (result.success) {
        setPaymentData(result.paymentData);
        setShowPaymentModal(true);

        // Автоматично відправляємо форму до LiqPay
        setTimeout(() => {
          const form = document.getElementById('liqpay-form') as HTMLFormElement;
          if (form) {
            form.submit();
          }
        }, 1000);
      } else {
        throw new Error(result.error || 'Payment creation failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError?.(error instanceof Error ? error.message : 'Помилка при створенні платежу');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Оплата участі</span>
          </CardTitle>
          <CardDescription>
            Безпечна оплата через LiqPay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Змагання:</span>
              <span className="text-sm font-medium">{competitionTitle}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Сума до сплати:</span>
              <span className="text-lg font-bold text-blue-600">{amount} грн</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Захищений платіж через LiqPay</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                💳 Картки Visa/MasterCard
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                📱 Apple Pay / Google Pay
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                💰 Приват24 / Monobank
              </Badge>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full btn-aerobics-primary"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Створення платежу...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Сплатити {amount} грн
              </>
            )}
          </Button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-yellow-700">
                  Після оплати ваша участь у змаганні буде автоматично підтверджена.
                  На вашу електронну пошту надійде чек та підтвердження.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Модальне вікно з платіжною формою */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Перенаправлення на LiqPay</DialogTitle>
            <DialogDescription>
              Зараз ви будете перенаправлені на безпечну сторінку оплати LiqPay.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>

            <p className="text-center text-sm text-gray-600">
              Підготовка до оплати... Не закривайте це вікно.
            </p>

            {paymentData && (
              <form
                id="liqpay-form"
                method="POST"
                action="https://www.liqpay.ua/api/3/checkout"
                target="_blank"
                className="hidden"
              >
                <input type="hidden" name="data" value={paymentData.data} />
                <input type="hidden" name="signature" value={paymentData.signature} />
              </form>
            )}

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Захищено SSL сертифікатом</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
