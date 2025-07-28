"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Download,
  Mail,
  Calendar,
  CreditCard,
  Trophy,
  Copy
} from 'lucide-react';

interface PaymentStatusProps {
  orderId?: string;
  paymentId?: string;
  autoRefresh?: boolean;
  showDetails?: boolean;
  onRetry?: () => void;
}

interface PaymentData {
  paymentId: string;
  orderId: string;
  status: string;
  statusDescription: string;
  liqpayStatus: string;
  liqpayPaymentId: string;
  amount: number;
  currency: string;
  description: string;
  competitionId: string;
  competitionTitle: string;
  customerEmail: string;
  createdAt: string;
  paidAt: string;
  expiresAt: string;
  isExpired: boolean;
  canRetry: boolean;
  errorCode: string;
  errorDescription: string;
}

const statusColors = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  success: 'bg-green-500',
  failed: 'bg-red-500',
  expired: 'bg-gray-500',
  cancelled: 'bg-gray-400'
};

const statusIcons = {
  pending: Clock,
  processing: RefreshCw,
  success: CheckCircle,
  failed: XCircle,
  expired: AlertTriangle,
  cancelled: XCircle
};

export default function PaymentStatus({
  orderId,
  paymentId,
  autoRefresh = true,
  showDetails = true,
  onRetry
}: PaymentStatusProps) {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId || paymentId) {
      loadPaymentStatus();

      // Автоматичне оновлення для pending статусів
      if (autoRefresh) {
        const interval = setInterval(() => {
          if (payment?.status === 'pending' || payment?.status === 'processing') {
            loadPaymentStatus(true);
          }
        }, 5000);

        return () => clearInterval(interval);
      }
    }
  }, [orderId, paymentId, autoRefresh, payment?.status]);

  const loadPaymentStatus = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (orderId) queryParams.append('orderId', orderId);
      if (paymentId) queryParams.append('paymentId', paymentId);
      queryParams.append('refresh', 'true');

      const response = await fetch(`/api/payments/status?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setPayment(data.data);
      } else {
        setError(data.error || 'Помилка завантаження статусу платежу');
      }
    } catch (err) {
      console.error('Помилка завантаження статусу:', err);
      setError('Помилка мережі');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleString('uk-UA');
  };

  const formatAmount = (amount: number, currency: string = 'UAH') => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const copyOrderId = () => {
    if (payment?.orderId) {
      navigator.clipboard.writeText(payment.orderId);
    }
  };

  const getStatusBadge = () => {
    if (!payment) return null;

    const IconComponent = statusIcons[payment.status as keyof typeof statusIcons] || Clock;
    const colorClass = statusColors[payment.status as keyof typeof statusColors] || 'bg-gray-500';

    return (
      <Badge className={`${colorClass} text-white`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {payment.statusDescription}
      </Badge>
    );
  };

  const getMainIcon = () => {
    if (!payment) return <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />;

    const IconComponent = statusIcons[payment.status as keyof typeof statusIcons] || Clock;
    const colorClass = payment.status === 'success' ? 'text-green-500' :
                      payment.status === 'failed' ? 'text-red-500' :
                      payment.status === 'processing' ? 'text-blue-500' :
                      'text-yellow-500';

    return (
      <IconComponent
        className={`h-8 w-8 ${colorClass} ${payment.status === 'processing' ? 'animate-spin' : ''}`}
      />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
          <span>Завантаження статусу платежу...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center">
            <XCircle className="h-6 w-6 text-red-500 mr-2" />
            <div>
              <p className="font-medium text-red-800">Помилка завантаження</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => loadPaymentStatus()}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Спробувати знову
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32 text-gray-500">
          Платіж не знайдено
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Основний статус */}
      <Card className={`${
        payment.status === 'success' ? 'border-green-200 bg-green-50' :
        payment.status === 'failed' ? 'border-red-200 bg-red-50' :
        payment.status === 'processing' ? 'border-blue-200 bg-blue-50' :
        'border-yellow-200 bg-yellow-50'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {getMainIcon()}
              <span className="ml-3">Статус платежу</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {refreshing && <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />}
            </div>
          </CardTitle>
          <CardDescription>
            {payment.status === 'success' && 'Платіж успішно завершено'}
            {payment.status === 'failed' && 'Платіж не вдався'}
            {payment.status === 'pending' && 'Очікування оплати'}
            {payment.status === 'processing' && 'Платіж обробляється'}
            {payment.status === 'expired' && 'Термін платежу минув'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Сума платежу</div>
              <div className="text-2xl font-bold">
                {formatAmount(payment.amount, payment.currency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Order ID</div>
              <div className="flex items-center">
                <span className="font-mono text-sm">{payment.orderId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyOrderId}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Помилки */}
          {payment.errorDescription && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <div>
                  <div className="font-medium text-red-800">Помилка платежу</div>
                  <div className="text-sm text-red-700">{payment.errorDescription}</div>
                  {payment.errorCode && (
                    <div className="text-xs text-red-600 mt-1">Код: {payment.errorCode}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Змагання */}
          {payment.competitionTitle && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-orange-500 mr-2" />
                <div>
                  <div className="font-medium">{payment.competitionTitle}</div>
                  <div className="text-sm text-gray-600">{payment.description}</div>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки дій */}
          <div className="mt-4 flex space-x-3">
            <Button
              onClick={() => loadPaymentStatus()}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Оновити
            </Button>

            {payment.canRetry && onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Спробувати знову
              </Button>
            )}

            {payment.status === 'success' && payment.liqpayPaymentId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4 mr-2" />
                Чек
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Детальна інформація */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Деталі платежу</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    {payment.customerEmail}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Створено</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {formatDate(payment.createdAt)}
                  </div>
                </div>
                {payment.paidAt && (
                  <div>
                    <div className="text-sm text-gray-600">Оплачено</div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {formatDate(payment.paidAt)}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {payment.liqpayPaymentId && (
                  <div>
                    <div className="text-sm text-gray-600">LiqPay Payment ID</div>
                    <div className="font-mono text-sm">{payment.liqpayPaymentId}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-600">LiqPay Status</div>
                  <div>{payment.liqpayStatus || 'Не вказано'}</div>
                </div>
                {payment.expiresAt && (
                  <div>
                    <div className="text-sm text-gray-600">Діє до</div>
                    <div className={payment.isExpired ? 'text-red-600' : 'text-gray-700'}>
                      {formatDate(payment.expiresAt)}
                      {payment.isExpired && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Прострочено
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
