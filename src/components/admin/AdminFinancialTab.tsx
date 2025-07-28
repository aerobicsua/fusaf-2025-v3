"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DollarSign,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface MembershipPayment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'athlete' | 'club_owner' | 'coach_judge';
  amount: number;
  paymentDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'cash';
  region: string;
  club?: string;
  transactionId?: string;
  dueDate: string;
  year: number;
}

// Розцінки членських внесків
const MEMBERSHIP_FEES = {
  athlete: 300,
  club_owner: 500,
  coach_judge: 400
};

// Демо-дані платежів
const demoPayments: MembershipPayment[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'Петренко Анна Іванівна',
    userEmail: 'anna.petrenko@email.com',
    userRole: 'athlete',
    amount: 300,
    paymentDate: '2024-09-15',
    status: 'paid',
    paymentMethod: 'card',
    region: 'Київська область',
    club: 'СК "Грація"',
    transactionId: 'TXN001',
    dueDate: '2024-12-31',
    year: 2024
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Іваненко Марія Петрівна',
    userEmail: 'maria.ivanenko@email.com',
    userRole: 'club_owner',
    amount: 500,
    paymentDate: '2024-08-10',
    status: 'paid',
    paymentMethod: 'bank_transfer',
    region: 'Київська область',
    club: 'СК "Грація"',
    transactionId: 'TXN002',
    dueDate: '2024-12-31',
    year: 2024
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Коваленко Дмитро Олексійович',
    userEmail: 'dmytro.kovalenko@email.com',
    userRole: 'athlete',
    amount: 300,
    paymentDate: '2024-10-20',
    status: 'paid',
    paymentMethod: 'card',
    region: 'Львівська область',
    club: 'Аеробіка Львів',
    transactionId: 'TXN003',
    dueDate: '2024-12-31',
    year: 2024
  },
  {
    id: '4',
    userId: 'user-4',
    userName: 'Сидоренко Олексій Миколайович',
    userEmail: 'oleksiy.sydorenko@email.com',
    userRole: 'coach_judge',
    amount: 400,
    paymentDate: '',
    status: 'overdue',
    paymentMethod: 'card',
    region: 'Дніпропетровська область',
    club: 'Фітнес-Динаміка',
    dueDate: '2024-12-31',
    year: 2024
  },
  {
    id: '5',
    userId: 'user-5',
    userName: 'Мельник Софія Андріївна',
    userEmail: 'sofia.melnyk@email.com',
    userRole: 'athlete',
    amount: 300,
    paymentDate: '2024-11-15',
    status: 'paid',
    paymentMethod: 'bank_transfer',
    region: 'Одеська область',
    club: 'Спорт-Арена',
    transactionId: 'TXN005',
    dueDate: '2024-12-31',
    year: 2024
  },
  // 2025 рік
  {
    id: '6',
    userId: 'user-1',
    userName: 'Петренко Анна Іванівна',
    userEmail: 'anna.petrenko@email.com',
    userRole: 'athlete',
    amount: 300,
    paymentDate: '',
    status: 'pending',
    paymentMethod: 'card',
    region: 'Київська область',
    club: 'СК "Грація"',
    dueDate: '2025-12-31',
    year: 2025
  }
];

const REGIONS = [
  'Київська область',
  'Львівська область',
  'Дніпропетровська область',
  'Харківська область',
  'Одеська область',
  'Запорізька область'
];

const ROLES = [
  { value: 'athlete', label: 'Спортсмен' },
  { value: 'club_owner', label: 'Власник клубу' },
  { value: 'coach_judge', label: 'Тренер/Суддя' }
];

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Сплачено', color: 'bg-green-500' },
  { value: 'pending', label: 'Очікує сплати', color: 'bg-yellow-500' },
  { value: 'overdue', label: 'Прострочено', color: 'bg-red-500' },
  { value: 'refunded', label: 'Повернуто', color: 'bg-gray-500' }
];

export function AdminFinancialTab() {
  const [payments, setPayments] = useState<MembershipPayment[]>(demoPayments);
  const [filteredPayments, setFilteredPayments] = useState<MembershipPayment[]>(demoPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    region: '',
    paymentMethod: '',
    year: '2024',
    month: ''
  });

  // Застосування фільтрів та пошуку
  useEffect(() => {
    let filtered = [...payments];

    // Пошук
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фільтри
    if (filters.status) {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }
    if (filters.role) {
      filtered = filtered.filter(payment => payment.userRole === filters.role);
    }
    if (filters.region) {
      filtered = filtered.filter(payment => payment.region === filters.region);
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter(payment => payment.paymentMethod === filters.paymentMethod);
    }
    if (filters.year) {
      filtered = filtered.filter(payment => payment.year === Number.parseInt(filters.year));
    }
    if (filters.month) {
      filtered = filtered.filter(payment => {
        if (!payment.paymentDate) return false;
        const paymentMonth = new Date(payment.paymentDate).getMonth() + 1;
        return paymentMonth === Number.parseInt(filters.month);
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, filters]);

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return (
      <Badge className={`${statusOption?.color} text-white`}>
        {statusOption?.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleLabel = ROLES.find(r => r.value === role)?.label || role;
    return (
      <Badge variant="outline">
        {roleLabel}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodLabels = {
      card: 'Картка',
      bank_transfer: 'Банк. переказ',
      cash: 'Готівка'
    };
    return (
      <Badge variant="secondary">
        {methodLabels[method as keyof typeof methodLabels] || method}
      </Badge>
    );
  };

  const getFinancialStats = () => {
    const currentYear = Number.parseInt(filters.year) || new Date().getFullYear();
    const yearPayments = payments.filter(p => p.year === currentYear);

    const totalPaid = yearPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = yearPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = yearPayments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

    const byRole = ROLES.reduce((acc, role) => {
      const rolePayments = yearPayments.filter(p => p.userRole === role.value && p.status === 'paid');
      acc[role.value] = {
        count: rolePayments.length,
        amount: rolePayments.reduce((sum, p) => sum + p.amount, 0)
      };
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const byRegion = REGIONS.reduce((acc, region) => {
      const regionPayments = yearPayments.filter(p => p.region === region && p.status === 'paid');
      acc[region] = {
        count: regionPayments.length,
        amount: regionPayments.reduce((sum, p) => sum + p.amount, 0)
      };
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return {
      totalPaid,
      totalPending,
      totalOverdue,
      totalExpected: totalPaid + totalPending + totalOverdue,
      collectionRate: ((totalPaid / (totalPaid + totalPending + totalOverdue)) * 100) || 0,
      byRole,
      byRegion
    };
  };

  const stats = getFinancialStats();

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Ім'я,Email,Роль,Сума,Дата платежу,Статус,Спосіб оплати,Область,Клуб/Підрозділ\n" +
      filteredPayments.map(payment =>
        `"${payment.userName}","${payment.userEmail}","${ROLES.find(r => r.value === payment.userRole)?.label}","${payment.amount}","${payment.paymentDate || 'Не сплачено'}","${STATUS_OPTIONS.find(s => s.value === payment.status)?.label}","${payment.paymentMethod}","${payment.region}","${payment.club || ''}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `membership_fees_${filters.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      role: '',
      region: '',
      paymentMethod: '',
      year: '2024',
      month: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Фінансова статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Зібрано ({filters.year})</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPaid.toLocaleString()} грн</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Очікується</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalPending.toLocaleString()} грн</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Прострочено</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalOverdue.toLocaleString()} грн</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">% збору</p>
                <p className="text-2xl font-bold text-blue-600">{stats.collectionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Аналітика по ролях та регіонах */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Збори по ролях ({filters.year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ROLES.map(role => {
                const roleStats = stats.byRole[role.value] || { count: 0, amount: 0 };
                const expectedAmount = roleStats.count * MEMBERSHIP_FEES[role.value as keyof typeof MEMBERSHIP_FEES];
                return (
                  <div key={role.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{role.label}</p>
                      <p className="text-sm text-gray-600">
                        {roleStats.count} осіб • {MEMBERSHIP_FEES[role.value as keyof typeof MEMBERSHIP_FEES]} грн за особу
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{roleStats.amount.toLocaleString()} грн</p>
                      {expectedAmount > 0 && (
                        <p className="text-sm text-gray-500">
                          з {expectedAmount.toLocaleString()} грн
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Збори по регіонах ({filters.year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byRegion)
                .sort(([,a], [,b]) => b.amount - a.amount)
                .slice(0, 6)
                .map(([region, regionStats]) => (
                  <div key={region} className="flex items-center justify-between">
                    <span className="font-medium text-sm">{region}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(regionStats.amount / stats.totalPaid) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-16 text-right">
                        {regionStats.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Пошук та фільтри */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Пошук та фільтри
            </span>
            <div className="flex space-x-2">
              <Button onClick={clearFilters} variant="outline" size="sm">
                Очистити фільтри
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Експорт CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Пошук */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Пошук за іменем, email або ID транзакції..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Фільтри */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <Label>Рік</Label>
                <Select value={filters.year} onValueChange={(value) => setFilters(prev => ({...prev, year: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Статус</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі статуси" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі статуси</SelectItem>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Роль</Label>
                <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({...prev, role: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі ролі" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі ролі</SelectItem>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Область</Label>
                <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({...prev, region: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі області" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі області</SelectItem>
                    {REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Спосіб оплати</Label>
                <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(prev => ({...prev, paymentMethod: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі способи" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі способи</SelectItem>
                    <SelectItem value="card">Картка</SelectItem>
                    <SelectItem value="bank_transfer">Банк. переказ</SelectItem>
                    <SelectItem value="cash">Готівка</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Місяць</Label>
                <Select value={filters.month} onValueChange={(value) => setFilters(prev => ({...prev, month: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі місяці" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі місяці</SelectItem>
                    <SelectItem value="1">Січень</SelectItem>
                    <SelectItem value="2">Лютий</SelectItem>
                    <SelectItem value="3">Березень</SelectItem>
                    <SelectItem value="4">Квітень</SelectItem>
                    <SelectItem value="5">Травень</SelectItem>
                    <SelectItem value="6">Червень</SelectItem>
                    <SelectItem value="7">Липень</SelectItem>
                    <SelectItem value="8">Серпень</SelectItem>
                    <SelectItem value="9">Вересень</SelectItem>
                    <SelectItem value="10">Жовтень</SelectItem>
                    <SelectItem value="11">Листопад</SelectItem>
                    <SelectItem value="12">Грудень</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця платежів */}
      <Card>
        <CardHeader>
          <CardTitle>
            Членські внески ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Користувач</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Сума</TableHead>
                  <TableHead>Дата платежу</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Спосіб оплати</TableHead>
                  <TableHead>Область</TableHead>
                  <TableHead>ID транзакції</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.userName}</p>
                        <p className="text-sm text-gray-500">{payment.userEmail}</p>
                        {payment.club && (
                          <p className="text-sm text-blue-600">{payment.club}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(payment.userRole)}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{payment.amount} грн</span>
                    </TableCell>
                    <TableCell>
                      {payment.paymentDate ? (
                        <div>
                          <p>{new Date(payment.paymentDate).toLocaleDateString('uk-UA')}</p>
                          <p className="text-sm text-gray-500">
                            Термін: {new Date(payment.dueDate).toLocaleDateString('uk-UA')}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500">Не сплачено</p>
                          <p className="text-sm text-red-500">
                            Термін: {new Date(payment.dueDate).toLocaleDateString('uk-UA')}
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{getPaymentMethodBadge(payment.paymentMethod)}</TableCell>
                    <TableCell>{payment.region}</TableCell>
                    <TableCell>
                      {payment.transactionId ? (
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {payment.transactionId}
                        </code>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
