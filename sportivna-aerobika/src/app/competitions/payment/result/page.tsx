"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface PaymentResultData {
  status: 'success' | 'failed' | 'pending';
  orderId: string;
  amount?: number;
  competitionId?: string;
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = useState<PaymentResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const status = searchParams.get('status') || 'pending';

    if (orderId) {
      // Витягуємо дані з order_id
      const orderParts = orderId.split('_');
      const competitionId = orderParts.length >= 4 ? orderParts[1] : undefined;

      setResultData({
        status: status as 'success' | 'failed' | 'pending',
        orderId,
        competitionId
      });
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!resultData) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <XCircle className="h-6 w-6 mr-2" />
            Помилка
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Не вдалося отримати інформацію про платіж. Спробуйте пізніше або зверніться до підтримки.
          </p>
          <div className="mt-4">
            <Link href="/competitions">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Повернутися до змагань
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (resultData.status) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return <AlertCircle className="h-12 w-12 text-yellow-600" />;
    }
  };

  const getStatusTitle = () => {
    switch (resultData.status) {
      case 'success':
        return 'Платіж успішний!';
      case 'failed':
        return 'Платіж не пройшов';
      default:
        return 'Платіж обробляється';
    }
  };

  const getStatusMessage = () => {
    switch (resultData.status) {
      case 'success':
        return 'Ваша реєстрація на змагання підтверджена. Деталі будуть надіслані на вашу електронну пошту.';
      case 'failed':
        return 'Платіж не був оброблений. Ви можете спробувати ще раз або зверніться до підтримки.';
      default:
        return 'Ваш платіж обробляється. Це може зайняти кілька хвилин. Ви отримаете підтвердження електронною поштою.';
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <CardTitle className={`text-xl ${
          resultData.status === 'success' ? 'text-green-600' :
          resultData.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {getStatusTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          {getStatusMessage()}
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Номер замовлення:</p>
          <p className="font-mono text-sm break-all">{resultData.orderId}</p>
        </div>

        <div className="space-y-2">
          {resultData.status === 'success' && (
            <Link href="/dashboard">
              <Button className="btn-aerobics-primary w-full">
                Перейти до особистого кабінету
              </Button>
            </Link>
          )}

          {resultData.status === 'failed' && resultData.competitionId && (
            <Link href={`/competitions/${resultData.competitionId}`}>
              <Button className="btn-aerobics-primary w-full">
                Спробувати ще раз
              </Button>
            </Link>
          )}

          <Link href="/competitions">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Повернутися до змагань
            </Button>
          </Link>
        </div>

        <div className="text-xs text-gray-500 pt-4">
          Якщо у вас виникли питання, зверніться до нас:
          <br />
          <a href="mailto:info@fusaf.org.ua" className="text-pink-600 hover:underline">
            info@fusaf.org.ua
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Результат платежу
            </h1>
            <p className="text-gray-600">
              Інформація про стан вашого платежу за участь у змаганні
            </p>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
            </div>
          }>
            <PaymentResultContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
