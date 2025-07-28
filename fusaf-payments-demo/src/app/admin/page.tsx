"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  Calendar,
  Mail,
  Phone,
  Building,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

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
  competitionTitle?: string;
  liqpayPaymentId?: string;
  senderCardMask?: string;
  senderCardBank?: string;
  errorDescription?: string;
  createdAt: string;
  paidAt?: string;
}

interface PaymentStats {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  totalAmount: number;
  successfulAmount: number;
  averageAmount: number;
  todayPayments: number;
  yesterdayPayments: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadPayments();
  }, [statusFilter, searchQuery, dateFrom, dateTo]);

  const loadPayments = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/payments?${params}`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.data.payments);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPayment = async (paymentId: string) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/payments/${paymentId}?refresh=true`);
      const data = await response.json();

      if (data.success) {
        setPayments(prev => prev.map(p =>
          p.id === paymentId ? data.data : p
        ));

        if (selectedPayment?.id === paymentId) {
          setSelectedPayment(data.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing payment:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatAmount = (amount: number, currency: string = 'UAH') => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-500 text-white',
      pending: 'bg-yellow-500 text-white',
      processing: 'bg-blue-500 text-white',
      failed: 'bg-red-500 text-white',
      cancelled: 'bg-gray-500 text-white'
    };

    const icons = {
      success: CheckCircle,
      pending: Clock,
      processing: RefreshCw,
      failed: XCircle,
      cancelled: XCircle
    };

    const labels = {
      success: 'Успішно',
      pending: 'Очікування',
      processing: 'Обробка',
      failed: 'Помилка',
      cancelled: 'Скасовано'
    };

    const Icon = icons[status as keyof typeof icons] || Clock;
    const className = variants[status as keyof typeof variants] || 'bg-gray-500 text-white';
    const label = labels[status as keyof typeof labels] || status;

    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mr-3" />
            <span className="text-lg">Завантаження платежів...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Адмін панель платежів</h1>
            <p className="text-gray-600 mt-1">
              Управління платежами LiqPay та аналітика системи ФУСАФ
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={loadPayments} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Оновити
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Новий платіж
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всього платежів</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 flex items-center">
                  {stats.todayPayments > stats.yesterdayPayments ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className="text-sm text-gray-600">
                    Сьогодні: {stats.todayPayments}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Успішні платежі</p>
                    <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    {((stats.successful / stats.total) * 100).toFixed(1)}% успішність
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Загальна сума</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatAmount(stats.totalAmount)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    Успішно: {formatAmount(stats.successfulAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">В обробці</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    Помилки: {stats.failed}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Статус
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всі статуси</SelectItem>
                    <SelectItem value="success">Успішні</SelectItem>
                    <SelectItem value="pending">Очікування</SelectItem>
                    <SelectItem value="processing">Обробка</SelectItem>
                    <SelectItem value="failed">Помилки</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Пошук
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Order ID, email, опис..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Від дати
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  До дати
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Список платежів</CardTitle>
            <CardDescription>
              Знайдено {payments.length} платежів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Клієнт</TableHead>
                    <TableHead>Сума</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Змагання</TableHead>
                    <TableHead>Дата створення</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.orderId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.customerEmail}</div>
                          {payment.customerPhone && (
                            <div className="text-sm text-gray-500">{payment.customerPhone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatAmount(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {payment.competitionTitle || payment.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => refreshPayment(payment.id)}
                            disabled={refreshing}
                          >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {payments.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Платежі не знайдено</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Деталі платежу</DialogTitle>
              <DialogDescription>
                Повна інформація про платіж {selectedPayment?.orderId}
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-6">
                {/* Status and Amount */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Статус платежу</h4>
                    <div className="space-y-2">
                      {getStatusBadge(selectedPayment.status)}
                      {selectedPayment.liqpayStatus && (
                        <div className="text-sm text-gray-600">
                          LiqPay: {selectedPayment.liqpayStatus}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Сума</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Інформація про клієнта</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPayment.customerEmail}</span>
                    </div>
                    {selectedPayment.customerPhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{selectedPayment.customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Competition */}
                {selectedPayment.competitionTitle && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Змагання</h4>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPayment.competitionTitle}</span>
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                {selectedPayment.status === 'success' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Деталі оплати</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {selectedPayment.liqpayPaymentId && (
                        <div>
                          <span className="text-gray-600">LiqPay Payment ID:</span>
                          <div className="font-mono">{selectedPayment.liqpayPaymentId}</div>
                        </div>
                      )}
                      {selectedPayment.senderCardMask && (
                        <div>
                          <span className="text-gray-600">Картка:</span>
                          <div>{selectedPayment.senderCardMask}</div>
                        </div>
                      )}
                      {selectedPayment.senderCardBank && (
                        <div>
                          <span className="text-gray-600">Банк:</span>
                          <div>{selectedPayment.senderCardBank}</div>
                        </div>
                      )}
                      {selectedPayment.paidAt && (
                        <div>
                          <span className="text-gray-600">Оплачено:</span>
                          <div>{formatDate(selectedPayment.paidAt)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {selectedPayment.status === 'failed' && selectedPayment.errorDescription && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Помилка</h4>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                        <div className="text-sm text-red-700">
                          {selectedPayment.errorDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Часові мітки</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Створено:</span>
                      <div>{formatDate(selectedPayment.createdAt)}</div>
                    </div>
                    {selectedPayment.paidAt && (
                      <div>
                        <span className="text-gray-600">Оплачено:</span>
                        <div className="text-green-600 font-medium">
                          {formatDate(selectedPayment.paidAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => refreshPayment(selectedPayment.id)}
                    disabled={refreshing}
                    size="sm"
                  >
                    {refreshing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Оновити статус
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Експорт
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
