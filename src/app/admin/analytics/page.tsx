"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  Building,
  MapPin,
  Calendar,
  Award,
  Target,
  Download,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalAthletes: number;
    totalClubs: number;
    totalCompetitions: number;
    totalRegistrations: number;
    activeUsers: number;
    growthRate: number;
  };
  usersByRegion: { [key: string]: number };
  usersByMonth: { month: string; users: number; athletes: number }[];
  competitionsByStatus: { [key: string]: number };
  registrationsByMonth: { month: string; count: number }[];
  topClubs: { name: string; members: number; region: string }[];
  recentActivity: { date: string; activity: string; count: number }[];
  performanceMetrics: {
    avgRegistrationTime: number;
    popularCategories: { [key: string]: number };
    peakActivityHours: { hour: number; activity: number }[];
  };
}

// Простий компонент графіка (в production використовувати Chart.js, Recharts тощо)
function SimpleBarChart({
  data,
  title,
  valueKey,
  labelKey,
  color = '#3B82F6'
}: {
  data: any[];
  title: string;
  valueKey: string;
  labelKey: string;
  color?: string;
}) {
  const maxValue = Math.max(...data.map(item => item[valueKey]));

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm text-gray-700">{title}</h3>
      <div className="space-y-2">
        {data.slice(0, 10).map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-xs text-gray-600 truncate">
              {item[labelKey]}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(item[valueKey] / maxValue) * 100}%`,
                  backgroundColor: color
                }}
              />
            </div>
            <div className="w-12 text-xs text-right font-medium">
              {item[valueKey]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleLineChart({
  data,
  title,
  valueKey,
  labelKey,
  color = '#10B981'
}: {
  data: any[];
  title: string;
  valueKey: string;
  labelKey: string;
  color?: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm text-gray-700">{title}</h3>
      <div className="h-48 flex items-end space-x-1">
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d[valueKey]));
          const height = (item[valueKey] / maxValue) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${height}%`,
                  backgroundColor: color,
                  minHeight: '2px'
                }}
              />
              <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                {item[labelKey]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('last_30_days');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Завантажуємо дані з різних API
      const [usersRes, clubsRes, competitionsRes, registrationsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/clubs'),
        fetch('/api/admin/competitions'),
        fetch('/api/athlete-registration')
      ]);

      const usersData = await usersRes.json();
      const clubsData = await clubsRes.json();
      const competitionsData = await competitionsRes.json();
      const registrationsData = await registrationsRes.json();

      // Симулюємо аналітичні дані (в production отримувати з спеціального API)
      const analyticsData: AnalyticsData = {
        overview: {
          totalUsers: usersData.statistics?.total || 0,
          totalAthletes: usersData.statistics?.athletes || 0,
          totalClubs: clubsData.statistics?.total || 0,
          totalCompetitions: competitionsData.statistics?.total || 0,
          totalRegistrations: registrationsData.statistics?.total || 0,
          activeUsers: usersData.statistics?.active || 0,
          growthRate: 15.3 // Симуляція росту
        },
        usersByRegion: usersData.statistics?.byRegion || {},
        usersByMonth: generateMonthlyData(),
        competitionsByStatus: competitionsData.statistics || {},
        registrationsByMonth: generateRegistrationData(),
        topClubs: generateTopClubsData(clubsData.statistics?.byRegion || {}),
        recentActivity: generateRecentActivity(),
        performanceMetrics: {
          avgRegistrationTime: 2.5, // хвилин
          popularCategories: {
            'SENIORS 18+ YEARS': 45,
            'JUNIORS / 15-17 YEARS': 32,
            'YOUTH / 12-14 YEARS': 28
          },
          peakActivityHours: generatePeakHours()
        }
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Помилка завантаження аналітики:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const generateMonthlyData = () => {
    const months = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'];
    return months.map(month => ({
      month,
      users: Math.floor(Math.random() * 50) + 10,
      athletes: Math.floor(Math.random() * 30) + 5
    }));
  };

  const generateRegistrationData = () => {
    const months = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'];
    return months.map(month => ({
      month,
      count: Math.floor(Math.random() * 20) + 5
    }));
  };

  const generateTopClubsData = (regionData: any) => {
    return Object.keys(regionData).slice(0, 5).map(region => ({
      name: `СК ${region}`,
      members: Math.floor(Math.random() * 100) + 20,
      region
    }));
  };

  const generateRecentActivity = () => {
    const activities = [
      'Нові реєстрації', 'Створені змагання', 'Оновлені профілі',
      'Підтвердження учасників', 'Публікації новин'
    ];

    return activities.map(activity => ({
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('uk-UA'),
      activity,
      count: Math.floor(Math.random() * 50) + 1
    }));
  };

  const generatePeakHours = () => {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity: Math.floor(Math.random() * 100) + (hour >= 9 && hour <= 18 ? 50 : 10)
    }));
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const csvData = [
      ['Метрика', 'Значення'],
      ['Всього користувачів', analytics.overview.totalUsers],
      ['Спортсменів', analytics.overview.totalAthletes],
      ['Клубів', analytics.overview.totalClubs],
      ['Змагань', analytics.overview.totalCompetitions],
      ['Реєстрацій', analytics.overview.totalRegistrations],
      ['Ріст (%)', analytics.overview.growthRate]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FUSAF_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Не вдалося завантажити дані аналітики</p>
        <Button onClick={loadAnalytics} className="mt-4">
          Спробувати знову
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Аналітика та звіти</h1>
          <p className="text-gray-600 mt-1">
            Детальна статистика системи ФУСАФ з графіками та трендами
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Останні 7 днів</SelectItem>
              <SelectItem value="last_30_days">Останні 30 днів</SelectItem>
              <SelectItem value="last_3_months">Останні 3 місяці</SelectItem>
              <SelectItem value="last_year">Останній рік</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Оновити
          </Button>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
        </div>
      </div>

      {/* Основна статистика */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalUsers}</div>
                <p className="text-xs text-gray-500">Користувачів</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{analytics.overview.totalAthletes}</div>
                <p className="text-xs text-gray-500">Спортсменів</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{analytics.overview.totalClubs}</div>
                <p className="text-xs text-gray-500">Клубів</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{analytics.overview.totalCompetitions}</div>
                <p className="text-xs text-gray-500">Змагань</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{analytics.overview.totalRegistrations}</div>
                <p className="text-xs text-gray-500">Реєстрацій</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold text-emerald-600">+{analytics.overview.growthRate}%</div>
                <p className="text-xs text-gray-500">Ріст</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графіки та діаграми */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Користувачі по місяцях */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Динаміка користувачів
            </CardTitle>
            <CardDescription>
              Кількість нових користувачів та спортсменів по місяцях
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={analytics.usersByMonth}
              title="Нові користувачі"
              valueKey="users"
              labelKey="month"
              color="#3B82F6"
            />
          </CardContent>
        </Card>

        {/* Користувачі по регіонах */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Розподіл по регіонах
            </CardTitle>
            <CardDescription>
              Кількість користувачів по регіонах України
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={Object.entries(analytics.usersByRegion).map(([region, count]) => ({
                region,
                count
              }))}
              title="Користувачі по регіонах"
              valueKey="count"
              labelKey="region"
              color="#10B981"
            />
          </CardContent>
        </Card>

        {/* Реєстрації по місяцях */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Реєстрації на змагання
            </CardTitle>
            <CardDescription>
              Динаміка реєстрацій на змагання
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={analytics.registrationsByMonth}
              title="Реєстрації по місяцях"
              valueKey="count"
              labelKey="month"
              color="#F59E0B"
            />
          </CardContent>
        </Card>

        {/* Статус змагань */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Статуси змагань
            </CardTitle>
            <CardDescription>
              Розподіл змагань по статусах
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={Object.entries(analytics.competitionsByStatus).map(([status, count]) => ({
                status,
                count
              }))}
              title="Змагання по статусах"
              valueKey="count"
              labelKey="status"
              color="#8B5CF6"
            />
          </CardContent>
        </Card>
      </div>

      {/* Таблиці та додаткова аналітика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ клуби */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Топ клуби за кількістю членів
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клуб</TableHead>
                  <TableHead>Регіон</TableHead>
                  <TableHead>Членів</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topClubs.map((club, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{club.name}</TableCell>
                    <TableCell>{club.region}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{club.members}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Остання активність */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Остання активність
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Активність</TableHead>
                  <TableHead>Кількість</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentActivity.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm">{activity.date}</TableCell>
                    <TableCell>{activity.activity}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.count}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Показники продуктивності */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Середній час реєстрації</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {analytics.performanceMetrics.avgRegistrationTime} хв
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Час, який користувачі витрачають на реєстрацію
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Популярні категорії</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.performanceMetrics.popularCategories).map(([category, count]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="truncate">{category}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Пікова активність</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              14:00 - 16:00
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Час найвищої активності користувачів
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Пік активності: {Math.max(...analytics.performanceMetrics.peakActivityHours.map(h => h.activity))} дій/годину
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Тренди та інсайти */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Ключові інсайти та рекомендації
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h3 className="font-medium text-green-800">Позитивний тренд</h3>
              </div>
              <p className="text-sm text-green-700">
                Кількість реєстрацій зросла на {analytics.overview.growthRate}% порівняно з попереднім періодом
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-blue-800">Географічний розподіл</h3>
              </div>
              <p className="text-sm text-blue-700">
                Найбільша активність спостерігається в Київській області та західних регіонах
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">Сезонність</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Пік активності припадає на весняно-літній період (березень-червень)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
