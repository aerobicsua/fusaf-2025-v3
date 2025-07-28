"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
// Динамічний імпорт Recharts компонентів для SSR
const PieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
import { Legend } from 'recharts';
const BarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })), { ssr: false });
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Building,
  MapPin,
  Calendar,
  Eye,
  UserX,
  UserCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  gender?: 'male' | 'female';
  club?: string;
  region?: string;
  registrationDate: string;
  lastLogin?: string;
  status: 'active' | 'suspended' | 'pending';
  membershipFee: {
    paid: boolean;
    amount: number;
    paidDate?: string;
  };
}

// Демо-дані користувачів
const demoUsers: User[] = [
  {
    id: '1',
    name: 'Петренко Анна Іванівна',
    email: 'anna.petrenko@email.com',
    roles: ['athlete'],
    gender: 'female',
    club: 'СК "Грація"',
    region: 'Київська область',
    registrationDate: '2024-09-15',
    lastLogin: '2025-01-07',
    status: 'active',
    membershipFee: { paid: true, amount: 300, paidDate: '2024-09-15' }
  },
  {
    id: '2',
    name: 'Іваненко Марія Петрівна',
    email: 'maria.ivanenko@email.com',
    roles: ['club_owner', 'coach_judge'],
    gender: 'female',
    club: 'СК "Грація"',
    region: 'Київська область',
    registrationDate: '2024-08-10',
    lastLogin: '2025-01-07',
    status: 'active',
    membershipFee: { paid: true, amount: 500, paidDate: '2024-08-10' }
  },
  {
    id: '3',
    name: 'Коваленко Дмитро Олексійович',
    email: 'dmytro.kovalenko@email.com',
    roles: ['athlete'],
    gender: 'male',
    club: 'Аеробіка Львів',
    region: 'Львівська область',
    registrationDate: '2024-10-20',
    lastLogin: '2025-01-06',
    status: 'active',
    membershipFee: { paid: true, amount: 300, paidDate: '2024-10-20' }
  },
  {
    id: '4',
    name: 'Сидоренко Олексій Миколайович',
    email: 'oleksiy.sydorenko@email.com',
    roles: ['coach_judge'],
    gender: 'male',
    club: 'Фітнес-Динаміка',
    region: 'Дніпропетровська область',
    registrationDate: '2024-07-05',
    status: 'pending',
    membershipFee: { paid: false, amount: 400 }
  },
  {
    id: '5',
    name: 'Мельник Софія Андріївна',
    email: 'sofia.melnyk@email.com',
    roles: ['athlete'],
    gender: 'female',
    club: 'Спорт-Арена',
    region: 'Одеська область',
    registrationDate: '2024-11-15',
    lastLogin: '2025-01-05',
    status: 'active',
    membershipFee: { paid: true, amount: 300, paidDate: '2024-11-15' }
  },
  {
    id: '6',
    name: 'Семенов Ігор Васильович',
    email: 'igor.semenov@email.com',
    roles: ['athlete'],
    gender: 'male',
    club: 'СК "Грація"',
    region: 'Київська область',
    registrationDate: '2024-06-12',
    lastLogin: '2025-01-04',
    status: 'active',
    membershipFee: { paid: true, amount: 300, paidDate: '2024-06-12' }
  },
  {
    id: '7',
    name: 'Гриценко Олена Петрівна',
    email: 'olena.hrytsenko@email.com',
    roles: ['coach_judge'],
    gender: 'female',
    club: 'Енергія Харків',
    region: 'Харківська область',
    registrationDate: '2024-05-20',
    lastLogin: '2025-01-03',
    status: 'active',
    membershipFee: { paid: true, amount: 400, paidDate: '2024-05-20' }
  },
  {
    id: '8',
    name: 'Бондаренко Катерина Олександрівна',
    email: 'kate.bondarenko@email.com',
    roles: ['athlete'],
    gender: 'female',
    club: 'Олімп Дніпро',
    region: 'Дніпропетровська область',
    registrationDate: '2024-12-01',
    status: 'suspended',
    membershipFee: { paid: false, amount: 300 }
  }
];

// Кольори для графіків
const CHART_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const REGIONS = [
  'Київська область',
  'Львівська область',
  'Дніпропетровська область',
  'Харківська область',
  'Одеська область',
  'Запорізька область',
  'Донецька область',
  'Полтавська область',
  'Черкаська область',
  'Сумська область'
];

const CLUBS = [
  'СК "Грація"',
  'Аеробіка Львів',
  'Фітнес-Динаміка',
  'Спорт-Арена',
  'Енергія Харків',
  'Олімп Дніпро'
];

const ROLES = [
  { value: 'athlete', label: 'Спортсмен' },
  { value: 'club_owner', label: 'Власник клубу' },
  { value: 'coach_judge', label: 'Тренер/Суддя' },
  { value: 'admin', label: 'Адміністратор' }
];

export function AdminUsersTab() {
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(demoUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    gender: '',
    club: '',
    region: '',
    status: '',
    membershipPaid: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Застосування фільтрів та пошуку
  useEffect(() => {
    let filtered = [...users];

    // Пошук
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фільтри
    if (filters.role) {
      filtered = filtered.filter(user => user.roles.includes(filters.role));
    }
    if (filters.gender) {
      filtered = filtered.filter(user => user.gender === filters.gender);
    }
    if (filters.club) {
      filtered = filtered.filter(user => user.club === filters.club);
    }
    if (filters.region) {
      filtered = filtered.filter(user => user.region === filters.region);
    }
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }
    if (filters.membershipPaid) {
      const isPaid = filters.membershipPaid === 'paid';
      filtered = filtered.filter(user => user.membershipFee.paid === isPaid);
    }

    // Сортування
    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'club':
          aValue = a.club || '';
          bValue = b.club || '';
          break;
        case 'region':
          aValue = a.region || '';
          bValue = b.region || '';
          break;
        case 'registrationDate':
          aValue = a.registrationDate;
          bValue = b.registrationDate;
          break;
        case 'lastLogin':
          aValue = a.lastLogin || '';
          bValue = b.lastLogin || '';
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, filters, sortBy, sortOrder]);

  const getRoleBadge = (roles: string[]) => {
    const roleLabels = {
      athlete: 'Спортсмен',
      club_owner: 'Власник клубу',
      coach_judge: 'Тренер/Суддя',
      admin: 'Адміністратор'
    };

    return roles.map(role => (
      <Badge key={role} variant="outline" className="mr-1 mb-1">
        {roleLabels[role as keyof typeof roleLabels] || role}
      </Badge>
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активний', color: 'bg-green-500' },
      suspended: { label: 'Заблокований', color: 'bg-red-500' },
      pending: { label: 'Очікує', color: 'bg-yellow-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getMembershipBadge = (membershipFee: User['membershipFee']) => {
    if (membershipFee.paid) {
      return (
        <Badge className="bg-green-500 text-white">
          Сплачено {membershipFee.amount} грн
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500 text-white">
          Не сплачено {membershipFee.amount} грн
        </Badge>
      );
    }
  };

  const handleExport = () => {
    // Експорт даних користувачів у CSV
    const csvContent = "data:text/csv;charset=utf-8," +
      "Ім'я,Email,Ролі,Стать,Клуб/Підрозділ,Область,Дата реєстрації,Статус,Членський внесок\n" +
      filteredUsers.map(user =>
        `"${user.name}","${user.email}","${user.roles.join(', ')}","${user.gender || ''}","${user.club || ''}","${user.region || ''}","${user.registrationDate}","${user.status}","${user.membershipFee.paid ? 'Сплачено' : 'Не сплачено'}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      gender: '',
      club: '',
      region: '',
      status: '',
      membershipPaid: ''
    });
    setSearchTerm('');
  };

  // Функції для підготовки даних для графіків
  const getRoleDistribution = () => {
    const distribution = users.reduce((acc, user) => {
      user.roles.forEach(role => {
        const roleLabel = ROLES.find(r => r.value === role)?.label || role;
        acc[roleLabel] = (acc[roleLabel] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getRegionDistribution = () => {
    const distribution = REGIONS.reduce((acc, region) => {
      const count = users.filter(u => u.region === region).length;
      if (count > 0) {
        acc.push({ name: region.replace(' область', ''), value: count });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>);

    return distribution;
  };

  const getStatusDistribution = () => {
    const distribution = users.reduce((acc, user) => {
      const statusLabel = user.status === 'active' ? 'Активні' :
                         user.status === 'pending' ? 'Очікують' : 'Заблоковані';
      acc[statusLabel] = (acc[statusLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getRegistrationTrend = () => {
    const trend = users.reduce((acc, user) => {
      const date = user.registrationDate;
      const month = new Date(date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(trend)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, count]) => ({ month, count }));
  };

  const getGenderDistribution = () => {
    const distribution = users.reduce((acc, user) => {
      if (user.gender) {
        const genderLabel = user.gender === 'male' ? 'Чоловіки' : 'Жінки';
        acc[genderLabel] = (acc[genderLabel] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всього користувачів</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активних</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Сплатили внесок</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.membershipFee.paid).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Очікують</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графічна аналітика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Розподіл по ролях */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Розподіл по ролях
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isClient ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getRoleDistribution()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {getRoleDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center bg-gray-100 rounded">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Завантаження графіка...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Розподіл по регіонах */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Розподіл по регіонах
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getRegionDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Статуси користувачів */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Статуси користувачів
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getStatusDistribution()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {getStatusDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.name === 'Активні' ? '#10B981' :
                      entry.name === 'Очікують' ? '#F59E0B' : '#EF4444'
                    } />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Тренд реєстрацій */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Тренд реєстрацій
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getRegistrationTrend()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Нові реєстрації"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Розподіл по статі */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Розподіл по статі та аналітика членства
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Розподіл по статі</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={getGenderDistribution()}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {getGenderDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'Чоловіки' ? '#3B82F6' : '#EC4899'
                      } />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="font-medium mb-3">Статистика членства</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span>Сплатили внесок:</span>
                  <span className="font-bold text-green-600">
                    {users.filter(u => u.membershipFee.paid).length} з {users.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span>Борг по внесках:</span>
                  <span className="font-bold text-red-600">
                    {users.filter(u => !u.membershipFee.paid).reduce((sum, u) => sum + u.membershipFee.amount, 0).toLocaleString()} грн
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span>Зібрано коштів:</span>
                  <span className="font-bold text-blue-600">
                    {users.filter(u => u.membershipFee.paid).reduce((sum, u) => sum + u.membershipFee.amount, 0).toLocaleString()} грн
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                placeholder="Пошук за іменем або email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Фільтри */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <Label>Роль</Label>
                <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({...prev, role: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі ролі" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі ролі</SelectItem>
                    <SelectItem value="athlete">Спортсмен</SelectItem>
                    <SelectItem value="club_owner">Власник клубу</SelectItem>
                    <SelectItem value="coach_judge">Тренер/Суддя</SelectItem>
                    <SelectItem value="admin">Адміністратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Стать</Label>
                <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({...prev, gender: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі</SelectItem>
                    <SelectItem value="male">Чоловіча</SelectItem>
                    <SelectItem value="female">Жіноча</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Клуб/Підрозділ</Label>
                <Select value={filters.club} onValueChange={(value) => setFilters(prev => ({...prev, club: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі клуби" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі клуби</SelectItem>
                    {CLUBS.map(club => (
                      <SelectItem key={club} value={club}>{club}</SelectItem>
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
                <Label>Статус</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі статуси" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі статуси</SelectItem>
                    <SelectItem value="active">Активний</SelectItem>
                    <SelectItem value="pending">Очікує</SelectItem>
                    <SelectItem value="suspended">Заблокований</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Членський внесок</Label>
                <Select value={filters.membershipPaid} onValueChange={(value) => setFilters(prev => ({...prev, membershipPaid: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі</SelectItem>
                    <SelectItem value="paid">Сплачено</SelectItem>
                    <SelectItem value="unpaid">Не сплачено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Сортування */}
            <div className="flex items-center space-x-4">
              <Label>Сортувати за:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Ім'ям</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="club">Клубом</SelectItem>
                  <SelectItem value="region">Областю</SelectItem>
                  <SelectItem value="registrationDate">Датою реєстрації</SelectItem>
                  <SelectItem value="lastLogin">Останнім входом</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">За зростанням</SelectItem>
                  <SelectItem value="desc">За спаданням</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця користувачів */}
      <Card>
        <CardHeader>
          <CardTitle>
            Користувачі ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ім'я</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ролі</TableHead>
                  <TableHead>Клуб/Підрозділ</TableHead>
                  <TableHead>Область</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Членський внесок</TableHead>
                  <TableHead>Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          {user.gender === 'male' ? '♂️' : user.gender === 'female' ? '♀️' : ''}
                          Реєстрація: {new Date(user.registrationDate).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap">
                        {getRoleBadge(user.roles)}
                      </div>
                    </TableCell>
                    <TableCell>{user.club || '-'}</TableCell>
                    <TableCell>{user.region || '-'}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getMembershipBadge(user.membershipFee)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
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
