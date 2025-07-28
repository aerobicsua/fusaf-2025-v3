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
const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
import { Legend } from 'recharts';
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => ({ default: mod.Area })), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart })), { ssr: false });
const ComposedChart = dynamic(() => import('recharts').then(mod => ({ default: mod.ComposedChart })), { ssr: false });
import {
  Trophy,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Building,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface Competition {
  id: string;
  title: string;
  date: string;
  location: string;
  city: string;
  organizer: string;
  status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
  categories: string[];
  registrations: {
    total: number;
    byProgram: {
      IW: number;
      IM: number;
      MP: number;
      TR: number;
      GR: number;
      AD: number;
      AS: number;
    };
    byCategory: {
      [key: string]: number;
    };
  };
  financial: {
    totalRevenue: number;
    expectedRevenue: number;
    fees: {
      registration: number;
      entry: number;
    };
  };
  createdDate: string;
  registrationDeadline: string;
}

// Демо-дані змагань
const demoCompetitions: Competition[] = [
  {
    id: '1',
    title: 'Чемпіонат України з спортивної аеробіки 2025',
    date: '2025-03-15',
    location: 'Палац спорту "Україна"',
    city: 'Київ',
    organizer: 'ФУСАФ',
    status: 'registration_open',
    categories: ['Індивідуальні жінки', 'Індивідуальні чоловіки', 'Змішані пари'],
    registrations: {
      total: 145,
      byProgram: { IW: 45, IM: 35, MP: 25, TR: 15, GR: 12, AD: 8, AS: 5 },
      byCategory: { 'senior': 85, 'junior': 35, 'kids': 25 }
    },
    financial: {
      totalRevenue: 43500,
      expectedRevenue: 58000,
      fees: { registration: 200, entry: 100 }
    },
    createdDate: '2024-12-01',
    registrationDeadline: '2025-03-01'
  },
  {
    id: '2',
    title: 'Кубок Львова з фітнес-аеробіки',
    date: '2025-02-20',
    location: 'СК "Львів"',
    city: 'Львів',
    organizer: 'Обласна федерація',
    status: 'completed',
    categories: ['Індивідуальні жінки', 'Тріо'],
    registrations: {
      total: 78,
      byProgram: { IW: 35, IM: 15, MP: 8, TR: 12, GR: 5, AD: 3, AS: 0 },
      byCategory: { 'senior': 45, 'junior': 20, 'kids': 13 }
    },
    financial: {
      totalRevenue: 15600,
      expectedRevenue: 15600,
      fees: { registration: 150, entry: 50 }
    },
    createdDate: '2024-11-15',
    registrationDeadline: '2025-02-10'
  },
  {
    id: '3',
    title: 'Відкритий турнір "Енергія Харкова"',
    date: '2025-04-12',
    location: 'Спорткомплекс "Метеор"',
    city: 'Харків',
    organizer: 'Енергія Харків',
    status: 'published',
    categories: ['Індивідуальні жінки', 'Індивідуальні чоловіки', 'Змішані пари', 'Групи'],
    registrations: {
      total: 0,
      byProgram: { IW: 0, IM: 0, MP: 0, TR: 0, GR: 0, AD: 0, AS: 0 },
      byCategory: {}
    },
    financial: {
      totalRevenue: 0,
      expectedRevenue: 25000,
      fees: { registration: 180, entry: 80 }
    },
    createdDate: '2024-12-20',
    registrationDeadline: '2025-04-01'
  },
  {
    id: '4',
    title: 'Міжнародний турнір "Dnipro Cup"',
    date: '2025-05-18',
    location: 'Палац спорту "Метеор"',
    city: 'Дніпро',
    organizer: 'Олімп Дніпро',
    status: 'draft',
    categories: ['Індивідуальні жінки', 'Індивідуальні чоловіки', 'Змішані пари', 'Тріо', 'Групи'],
    registrations: {
      total: 0,
      byProgram: { IW: 0, IM: 0, MP: 0, TR: 0, GR: 0, AD: 0, AS: 0 },
      byCategory: {}
    },
    financial: {
      totalRevenue: 0,
      expectedRevenue: 45000,
      fees: { registration: 250, entry: 120 }
    },
    createdDate: '2025-01-05',
    registrationDeadline: '2025-05-05'
  },
  {
    id: '5',
    title: 'Чемпіонат Одеської області',
    date: '2025-01-25',
    location: 'СК "Спарта"',
    city: 'Одеса',
    organizer: 'Спорт-Арена',
    status: 'in_progress',
    categories: ['Індивідуальні жінки', 'Індивідуальні чоловіки'],
    registrations: {
      total: 56,
      byProgram: { IW: 28, IM: 18, MP: 5, TR: 3, GR: 2, AD: 0, AS: 0 },
      byCategory: { 'senior': 35, 'junior': 15, 'kids': 6 }
    },
    financial: {
      totalRevenue: 8400,
      expectedRevenue: 8400,
      fees: { registration: 120, entry: 30 }
    },
    createdDate: '2024-10-30',
    registrationDeadline: '2025-01-15'
  }
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Чернетка', color: 'bg-gray-500' },
  { value: 'published', label: 'Опубліковано', color: 'bg-blue-500' },
  { value: 'registration_open', label: 'Реєстрація відкрита', color: 'bg-green-500' },
  { value: 'registration_closed', label: 'Реєстрація закрита', color: 'bg-yellow-500' },
  { value: 'in_progress', label: 'Проводиться', color: 'bg-purple-500' },
  { value: 'completed', label: 'Завершено', color: 'bg-indigo-500' },
  { value: 'cancelled', label: 'Скасовано', color: 'bg-red-500' }
];

const CITIES = [
  'Київ',
  'Львів',
  'Харків',
  'Дніпро',
  'Одеса',
  'Запоріжжя',
  'Полтава',
  'Черкаси',
  'Суми',
  'Вінниця'
];


const CHART_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function AdminCompetitionsTab() {
  const [competitions, setCompetitions] = useState<Competition[]>(demoCompetitions);
  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>(demoCompetitions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    organizer: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    let filtered = [...competitions];

    if (searchTerm) {
      filtered = filtered.filter(comp =>
        comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(comp => comp.status === filters.status);
    }
    if (filters.city) {
      filtered = filtered.filter(comp => comp.city === filters.city);
    }
    if (filters.organizer) {
      filtered = filtered.filter(comp => comp.organizer.toLowerCase().includes(filters.organizer.toLowerCase()));
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(comp => comp.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(comp => comp.date <= filters.dateTo);
    }

    setFilteredCompetitions(filtered);
  }, [competitions, searchTerm, filters]);

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return (
      <Badge className={`${statusOption?.color} text-white`}>
        {statusOption?.label}
      </Badge>
    );
  };

  const getTotalStats = () => {
    return {
      totalCompetitions: competitions.length,
      activeCompetitions: competitions.filter(c => c.status === 'registration_open').length,
      completedCompetitions: competitions.filter(c => c.status === 'completed').length,
      totalRegistrations: competitions.reduce((sum, c) => sum + c.registrations.total, 0),
      totalRevenue: competitions.reduce((sum, c) => sum + c.financial.totalRevenue, 0)
    };
  };

  const getCompetitionsByMonth = () => {
    const monthlyData = competitions.reduce((acc, comp) => {
      const month = new Date(comp.date).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'short'
      });

      if (!acc[month]) {
        acc[month] = {
          month,
          competitions: 0,
          participants: 0,
          revenue: 0
        };
      }

      acc[month].competitions += 1;
      acc[month].participants += comp.registrations.total;
      acc[month].revenue += comp.financial.totalRevenue;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData).sort((a: any, b: any) =>
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  };

  const getProgramDistribution = () => {
    const distribution = competitions.reduce((acc, comp) => {
      Object.entries(comp.registrations.byProgram).forEach(([program, count]) => {
        acc[program] = (acc[program] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number));
  };

  const getStatusDistribution = () => {
    const distribution = competitions.reduce((acc, comp) => {
      const statusLabel = STATUS_OPTIONS.find(s => s.value === comp.status)?.label || comp.status;
      acc[statusLabel] = (acc[statusLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getCityDistribution = () => {
    const distribution = competitions.reduce((acc, comp) => {
      acc[comp.city] = (acc[comp.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number));
  };

  const getFinancialAnalytics = () => {
    return competitions.map(comp => ({
      name: comp.title.substring(0, 20) + '...',
      participants: comp.registrations.total,
      revenue: comp.financial.totalRevenue,
      expected: comp.financial.expectedRevenue,
      avgPerParticipant: comp.registrations.total > 0
        ? comp.financial.totalRevenue / comp.registrations.total
        : 0
    }));
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Назва,Дата,Місто,Організатор,Статус,Учасників,Дохід\n" +
      filteredCompetitions.map(comp =>
        `"${comp.title}","${comp.date}","${comp.city}","${comp.organizer}","${STATUS_OPTIONS.find(s => s.value === comp.status)?.label}","${comp.registrations.total}","${comp.financial.totalRevenue}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "competitions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      city: '',
      organizer: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всього змагань</p>
                <p className="text-2xl font-bold">{stats.totalCompetitions}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активних</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCompetitions}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Завершених</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completedCompetitions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Учасників</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRegistrations}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Дохід</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalRevenue.toLocaleString()} грн</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графічна аналітика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Тренд змагань по місяцях */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Тренд змагань по місяцях
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={getCompetitionsByMonth()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="competitions" fill="#3B82F6" name="Змагання" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="participants"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Учасники"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Розподіл учасників по програмах */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Розподіл по програмах
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getProgramDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Статуси змагань */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Статуси змагань
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
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Розподіл по містах */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Розподіл по містах
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getCityDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Фінансова аналітика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Фінансова аналітика змагань
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={getFinancialAnalytics()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="participants" fill="#3B82F6" name="Учасники" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#EF4444"
                strokeWidth={2}
                name="Дохід (грн)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="expected"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Очікуваний дохід (грн)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue per month trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Тренд доходів по місяцях
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getCompetitionsByMonth()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                name="Дохід (грн)"
              />
            </AreaChart>
          </ResponsiveContainer>
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
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Пошук за назвою, організатором або місцем..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <Label>Місто</Label>
                <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({...prev, city: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі міста" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі міста</SelectItem>
                    {CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Організатор</Label>
                <Input
                  placeholder="Пошук організатора"
                  value={filters.organizer}
                  onChange={(e) => setFilters(prev => ({...prev, organizer: e.target.value}))}
                />
              </div>

              <div>
                <Label>Дата від</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({...prev, dateFrom: e.target.value}))}
                />
              </div>

              <div>
                <Label>Дата до</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({...prev, dateTo: e.target.value}))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця змагань */}
      <Card>
        <CardHeader>
          <CardTitle>
            Змагання ({filteredCompetitions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Назва</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Місце</TableHead>
                  <TableHead>Організатор</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Учасники</TableHead>
                  <TableHead>Дохід</TableHead>
                  <TableHead>Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitions.map((competition) => (
                  <TableRow key={competition.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{competition.title}</p>
                        <p className="text-sm text-gray-500">
                          Категорії: {competition.categories.length}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(competition.date).toLocaleDateString('uk-UA')}</p>
                        <p className="text-sm text-gray-500">
                          Дедлайн: {new Date(competition.registrationDeadline).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{competition.city}</p>
                        <p className="text-sm text-gray-500">{competition.location}</p>
                      </div>
                    </TableCell>
                    <TableCell>{competition.organizer}</TableCell>
                    <TableCell>{getStatusBadge(competition.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-blue-600">{competition.registrations.total}</p>
                        <p className="text-sm text-gray-500">
                          Програм: {Object.values(competition.registrations.byProgram).filter((v: number) => v > 0).length}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-green-600">
                          {competition.financial.totalRevenue.toLocaleString()} грн
                        </p>
                        {competition.status === 'registration_open' && (
                          <p className="text-sm text-gray-500">
                            Очік: {competition.financial.expectedRevenue.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
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
