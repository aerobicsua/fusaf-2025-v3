"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Mail,
  Phone,
  Building,
  Trophy,
  ExternalLink
} from 'lucide-react';

interface Payment {
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
  customerPhone: string;
  createdAt: string;
  paidAt: string;
  expiresAt: string;
  isExpired: boolean;
  canRetry: boolean;
  errorCode: string;
  errorDescription: string;
  formattedAmount: string;
}

interface PaymentStats {
  total: number;
  totalAmount: number;
  successfulPayments: number;
  successfulAmount: number;
  averageAmount: number;
  successRate: string;
  byStatus: { [key: string]: { count: number; amount: number } };
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

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    email: '',
    competitionId: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 50
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPayments();
  }, [filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/payments/history?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.data.payments);
        setStats(data.data.statistics);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error('Помилка завантаження платежів:', data.error);
      }
    } catch (error) {
      console.error('Помилка завантаження платежів:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : prev.page
    }));
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const handleRefreshPayment = async (payment: Payment) => {
    try {
      const response = await fetch(`/api/payments/status?orderId=${payment.orderId}&refresh=true`);
      const data = await response.json();

      if (data.success) {
        loadPayments(); // Перезавантажуємо список
        alert('Статус платежу оновлено');
      } else {
        alert('Помилка оновлення статусу: ' + data.error);
      }
    } catch (error) {
      console.error('Помилка оновлення статусу:', error);
      alert('Помилка оновлення статусу');
    }
  };

  const handleExport = () => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'page' && key !== 'limit') {
        queryParams.append(key, value.toString());
      }
    });

    window.open(`/api/admin/export?type=payments&format=csv&${queryParams}`, '_blank');
  };

  const getStatusBadge = (payment: Payment) => {
    const IconComponent = statusIcons[payment.status as keyof typeof statusIcons] || Clock;
    const colorClass = statusColors[payment.status as keyof typeof statusColors] || 'bg-gray-500';

    return (
      <Badge className={colorClass}>
        <IconComponent className="h-3 w-3 mr-1" />
        {payment.statusDescription}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleString('uk-UA');
  };

  const formatAmount = (amount: number, currency: string = 'UAH') => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління платежами</h1>
          <p className="text-gray-600 mt-1">
            Система онлайн-платежів через LiqPay для реєстрації на змагання
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
          <Button onClick={loadPayments} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Оновити
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500">Всього платежів</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.successfulPayments}</div>
              <p className="text-xs text-gray-500">Успішних</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">
                {formatAmount(stats.successfulAmount)}
              </div>
              <p className="text-xs text-gray-500">Отримано коштів</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {formatAmount(stats.averageAmount)}
              </div>
              <p className="text-xs text-gray-500">Середній платіж</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.successRate}%</div>
              <p className="text-xs text-gray-500">Успішність</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">
                {formatAmount(stats.totalAmount)}
              </div>
              <p className="text-xs text-gray-500">Загальна сума</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Статистика по статусах */}
      {stats && Object.keys(stats.byStatus).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Статистика по статусах</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.byStatus).map(([status, data]) => {
                const IconComponent = statusIcons[status as keyof typeof statusIcons] || Clock;
                const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-500';

                return (
                  <div key={status} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                      <span className="text-sm font-medium capitalize">{status}</span>
                    </div>
                    <div className="text-lg font-bold">{data.count}</div>
                    <div className="text-sm text-gray-600">{formatAmount(data.amount)}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Фільтри */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Фільтри та пошук
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label>Email клієнта</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Email..."
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Статус</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі статуси" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі статуси</SelectItem>
                  <SelectItem value="pending">Очікує оплати</SelectItem>
                  <SelectItem value="processing">Обробляється</SelectItem>
                  <SelectItem value="success">Успішно</SelectItem>
                  <SelectItem value="failed">Помилка</SelectItem>
                  <SelectItem value="expired">Прострочено</SelectItem>
                  <SelectItem value="cancelled">Скасовано</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>ID змагання</Label>
              <Input
                placeholder="Competition ID..."
                value={filters.competitionId}
                onChange={(e) => handleFilterChange('competitionId', e.target.value)}
              />
            </div>

            <div>
              <Label>Дата від</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <Label>Дата до</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  email: '',
                  competitionId: '',
                  status: '',
                  dateFrom: '',
                  dateTo: '',
                  page: 1,
                  limit: 50
                })}
                className="w-full"
              >
                Очистити
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця платежів */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Платежі ({payments.length})
            </div>
            <div className="text-sm text-gray-500">
              Сторінка {filters.page} з {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата/ID</TableHead>
                    <TableHead>Клієнт</TableHead>
                    <TableHead>Змагання</TableHead>
                    <TableHead>Сума</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>LiqPay</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.paymentId}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(payment.createdAt).split(',')[0]}
                          </div>
                          <div className="text-gray-500 font-mono text-xs">
                            {payment.orderId}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {formatDate(payment.createdAt).split(',')[1]}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {payment.customerEmail}
                          </div>
                          {payment.customerPhone && (
                            <div className="flex items-center text-gray-500 mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {payment.customerPhone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Trophy className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="font-medium truncate max-w-xs">
                              {payment.competitionTitle || 'Не вказано'}
                            </span>
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {payment.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-bold text-lg">
                            {payment.formattedAmount}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {payment.currency}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(payment)}
                          {payment.paidAt && (
                            <div className="text-xs text-green-600">
                              Оплачено: {formatDate(payment.paidAt).split(',')[0]}
                            </div>
                          )}
                          {payment.isExpired && (
                            <div className="text-xs text-red-600">
                              Прострочено
                            </div>
                          )}
                          {payment.errorDescription && (
                            <div className="text-xs text-red-600 truncate max-w-xs">
                              {payment.errorDescription}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {payment.liqpayPaymentId && (
                            <div className="font-mono text-xs">
                              {payment.liqpayPaymentId}
                            </div>
                          )}
                          <div className="text-gray-500 text-xs">
                            {payment.liqpayStatus}
                          </div>
                          {payment.errorCode && (
                            <div className="text-red-500 text-xs">
                              Error: {payment.errorCode}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefreshPayment(payment)}
                            disabled={payment.status === 'success'}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Пагінація */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Показано {payments.length} з {stats?.total || 0} платежів
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => handleFilterChange('page', (filters.page - 1).toString())}
                >
                  Попередня
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= totalPages}
                  onClick={() => handleFilterChange('page', (filters.page + 1).toString())}
                >
                  Наступна
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Діалог деталей платежу */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Деталі платежу</DialogTitle>
            <DialogDescription>
              Повна інформація про платіж {selectedPayment?.orderId}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Основна інформація */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Інформація про платіж</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Order ID</Label>
                      <div className="font-mono">{selectedPayment.orderId}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Payment ID</Label>
                      <div className="font-mono text-sm">{selectedPayment.paymentId}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Сума</Label>
                      <div className="text-2xl font-bold">{selectedPayment.formattedAmount}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Опис</Label>
                      <div>{selectedPayment.description}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Статус</Label>
                      <div>{getStatusBadge(selectedPayment)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Клієнт</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedPayment.customerEmail}
                      </div>
                    </div>
                    {selectedPayment.customerPhone && (
                      <div>
                        <Label className="text-xs text-gray-500">Телефон</Label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedPayment.customerPhone}
                        </div>
                      </div>
                    )}
                    {selectedPayment.competitionTitle && (
                      <div>
                        <Label className="text-xs text-gray-500">Змагання</Label>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedPayment.competitionTitle}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* LiqPay деталі */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">LiqPay деталі</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">LiqPay Payment ID</Label>
                      <div className="font-mono">{selectedPayment.liqpayPaymentId || 'Не вказано'}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">LiqPay Status</Label>
                      <div>{selectedPayment.liqpayStatus || 'Не вказано'}</div>
                    </div>
                  </div>
                  {selectedPayment.errorCode && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <Label className="text-xs text-red-600">Помилка</Label>
                      <div className="text-red-700">
                        <strong>Код:</strong> {selectedPayment.errorCode}
                      </div>
                      {selectedPayment.errorDescription && (
                        <div className="text-red-700">
                          <strong>Опис:</strong> {selectedPayment.errorDescription}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Дати */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Часові мітки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Створено</Label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(selectedPayment.createdAt)}
                      </div>
                    </div>
                    {selectedPayment.paidAt && (
                      <div>
                        <Label className="text-xs text-gray-500">Оплачено</Label>
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {formatDate(selectedPayment.paidAt)}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedPayment.expiresAt && (
                    <div>
                      <Label className="text-xs text-gray-500">Діє до</Label>
                      <div className={`flex items-center ${selectedPayment.isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDate(selectedPayment.expiresAt)}
                        {selectedPayment.isExpired && (
                          <Badge variant="destructive" className="ml-2">Прострочено</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Закрити
            </Button>
            {selectedPayment && (
              <Button onClick={() => handleRefreshPayment(selectedPayment)}>
                Оновити статус
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
