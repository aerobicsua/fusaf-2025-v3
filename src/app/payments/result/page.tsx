"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaymentStatus from '@/components/payments/PaymentStatus';
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Home,
  Trophy,
  FileText,
  AlertTriangle
} from 'lucide-react';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadPaymentResult();
    } else {
      setError('Не вказано ID платежу');
      setLoading(false);
    }
  }, [orderId]);

  const loadPaymentResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/status?orderId=${orderId}&refresh=true`);
      const data = await response.json();

      if (data.success) {
        setPayment(data.data);
      } else {
        setError(data.error || 'Помилка завантаження інформації про платіж');
      }
    } catch (error) {
      console.error('Помилка завантаження результату платежу:', error);
      setError('Помилка мережі');
    } finally {
      setLoading(false);
    }
  };

  const getResultMessage = () => {
    if (!payment) return null;

    switch (payment.status) {
      case 'success':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: 'Платіж успішно завершено!',
          description: 'Ваша реєстрація на змагання підтверджена',
          color: 'green'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          title: 'Платіж не вдався',
          description: 'Спробуйте ще раз або зверніться до служби підтримки',
          color: 'red'
        };
      case 'processing':
      case 'pending':
        return {
          icon: <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />,
          title: 'Платіж обробляється',
          description: 'Зачекайте, ваш платіж обробляється',
          color: 'blue'
        };
      case 'expired':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-orange-500" />,
          title: 'Термін платежу минув',
          description: 'Спробуйте створити новий платіж',
          color: 'orange'
        };
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-gray-500" />,
          title: 'Невідомий статус',
          description: 'Зверніться до служби підтримки',
          color: 'gray'
        };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
              <span>Завантаження результату платежу...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <XCircle className="h-6 w-6 mr-2" />
                Помилка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex space-x-3">
                <Button onClick={loadPaymentResult} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Спробувати знову
                </Button>
                <Button onClick={() => window.location.href = '/'}>
                  <Home className="h-4 w-4 mr-2" />
                  На головну
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const result = getResultMessage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Результат платежу */}
        {result && (
          <Card className={`${
            result.color === 'green' ? 'border-green-200 bg-green-50' :
            result.color === 'red' ? 'border-red-200 bg-red-50' :
            result.color === 'blue' ? 'border-blue-200 bg-blue-50' :
            result.color === 'orange' ? 'border-orange-200 bg-orange-50' :
            'border-gray-200 bg-gray-50'
          }`}>
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                {result.icon}
                <CardTitle className={`mt-4 ${
                  result.color === 'green' ? 'text-green-800' :
                  result.color === 'red' ? 'text-red-800' :
                  result.color === 'blue' ? 'text-blue-800' :
                  result.color === 'orange' ? 'text-orange-800' :
                  'text-gray-800'
                }`}>
                  {result.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {result.description}
                </CardDescription>
              </div>
            </CardHeader>
            {payment && payment.status === 'success' && (
              <CardContent>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Підтвердження відправлено на email: <strong>{payment.customerEmail}</strong>
                  </p>
                  {payment.competitionTitle && (
                    <p className="text-sm text-gray-600">
                      Змагання: <strong>{payment.competitionTitle}</strong>
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Детальна інформація про платіж */}
        {payment && (
          <PaymentStatus
            orderId={payment.orderId}
            autoRefresh={payment.status === 'pending' || payment.status === 'processing'}
            showDetails={true}
            onRetry={() => {
              // Перенаправляємо на сторінку реєстрації для повторної спроби
              window.location.href = '/athlete-registration';
            }}
          />
        )}

        {/* Навігаційні кнопки */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.href = '/athlete-registration'}
                variant="outline"
                className="flex-1"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Зареєструватися на інше змагання
              </Button>

              <Button
                onClick={() => window.location.href = '/competitions'}
                variant="outline"
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Переглянути змагання
              </Button>

              <Button
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                На головну
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Інформація про підтримку */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Потрібна допомога?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Якщо у вас виникли проблеми з платежем або реєстрацією:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Надішліть email на <strong>support@fusaf.org.ua</strong></li>
                <li>Вкажіть Order ID: <code className="bg-gray-100 px-1 rounded">{payment?.orderId}</code></li>
                <li>Опишіть проблему детально</li>
              </ul>
              <p className="mt-3">
                Ми відповімо протягом 24 годин в робочі дні.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
              <span>Завантаження...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
