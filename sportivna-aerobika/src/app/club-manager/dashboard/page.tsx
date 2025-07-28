"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  GraduationCap,
  Trophy,
  Clock,
  MapPin,
  Mail,
  Phone,
  Building,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  Star,
  Award,
  Download,
  FileSpreadsheet,
  FileText,
  Bell
} from 'lucide-react';
import Link from 'next/link';

interface ClubData {
  id: string;
  name: string;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  approvedAt: string;
}

interface TrainerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  clubId: string;
  clubName: string;
  roles: string[];
  specialization: string;
  approvedAt: string;
  status: string;
}

interface AthleteData {
  id: string;
  name: string;
  email: string;
  phone: string;
  club: string;
  registeredAt: string;
  status: string;
}

interface ApplicationData {
  id: string;
  name: string;
  preferredClub: {
    id: string;
    name: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export default function ClubManagerDashboard() {
  const { user } = useSimpleAuth();
  const [myClubs, setMyClubs] = useState<ClubData[]>([]);
  const [clubTrainers, setClubTrainers] = useState<TrainerData[]>([]);
  const [clubAthletes, setClubAthletes] = useState<AthleteData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      checkNewApplications(); // Перевіряємо нові заявки при завантаженні

      // Перевіряємо нові заявки кожні 5 хвилин
      const interval = setInterval(checkNewApplications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Функція перевірки нових заявок
  const checkNewApplications = async () => {
    try {
      // Завантажуємо актуальні дані для передачі в API
      const approvedClubs = JSON.parse(localStorage.getItem('approvedClubs') || '[]');
      const allApplications = JSON.parse(localStorage.getItem('coachJudgeApplications') || '[]');

      const response = await fetch('/api/check-new-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email,
          clubsData: approvedClubs,
          applicationsData: allApplications
        })
      });

      const result = await response.json();

      if (result.success && result.notifications.length > 0) {
        setNotifications(result.notifications);
        setShowNotifications(true);

        // Автоматично ховаємо сповіщення через 10 секунд
        setTimeout(() => setShowNotifications(false), 10000);
      }
    } catch (error) {
      console.error('Помилка перевірки нових заявок:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Завантажуємо клуби користувача
      const approvedClubs = JSON.parse(localStorage.getItem('approvedClubs') || '[]');
      const userClubs = approvedClubs.filter((club: ClubData) =>
        club.owner.email === user?.email
      );
      setMyClubs(userClubs);

      // Завантажуємо тренерів клубів користувача
      const allTrainers = JSON.parse(localStorage.getItem('clubTrainers') || '[]');
      const myClubTrainers = allTrainers.filter((trainer: TrainerData) =>
        userClubs.some(club => club.id === trainer.clubId)
      );
      setClubTrainers(myClubTrainers);

      // Завантажуємо спортсменів клубів користувача
      const allAthletes = JSON.parse(localStorage.getItem('approvedAthletes') || '[]');
      const myClubAthletes = allAthletes.filter((athlete: AthleteData) =>
        userClubs.some(club => club.id === athlete.club)
      );
      setClubAthletes(myClubAthletes);

      // Завантажуємо заявки тренерів
      const allApplications = JSON.parse(localStorage.getItem('coachJudgeApplications') || '[]');
      const myClubApplications = allApplications.filter((app: ApplicationData) =>
        userClubs.some(club => club.id === app.preferredClub.id)
      );
      setApplications(myClubApplications);

    } catch (error) {
      console.error('Помилка завантаження даних дашборду:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функція експорту статистики
  const handleExport = async (format: 'excel' | 'pdf', clubId: string) => {
    setExportLoading(format + clubId);
    try {
      // Знаходимо дані клубу
      const club = myClubs.find(c => c.id === clubId);
      const trainersData = clubTrainers.filter(t => t.clubId === clubId);
      const athletesData = clubAthletes.filter(a => a.club === clubId);
      const applicationsData = applications.filter(app => app.preferredClub.id === clubId);

      const response = await fetch('/api/export-club-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          format,
          userEmail: user?.email,
          clubData: club,
          trainersData,
          athletesData,
          applicationsData
        })
      });

      const result = await response.json();

      if (result.success) {
        // Створюємо і завантажуємо файл
        const blob = new Blob([result.data], { type: result.mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert(`${format === 'excel' ? 'Excel' : 'PDF'} файл успішно завантажено!`);
      } else {
        alert('Помилка експорту: ' + result.error);
      }
    } catch (error) {
      alert('Помилка експорту статистики');
    } finally {
      setExportLoading(null);
    }
  };

  // Статистика для графіків
  const trainersBySpecialization = clubTrainers.reduce((acc, trainer) => {
    const spec = trainer.specialization || 'Не вказано';
    acc[spec] = (acc[spec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(trainersBySpecialization).map(([name, value]) => ({
    name,
    value
  }));

  const roleDistribution = clubTrainers.reduce((acc, trainer) => {
    trainer.roles.forEach(role => {
      const roleName = role === 'coach' ? 'Тренер' : 'Суддя';
      acc[roleName] = (acc[roleName] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const roleChartData = Object.entries(roleDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const recentApplications = applications.filter(app => {
    const submittedDate = new Date(app.submittedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return submittedDate >= weekAgo;
  }).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ заборонено</h1>
          <p className="text-gray-600">Увійдіть в систему як керівник клубу</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження дашборду...</p>
        </div>
      </div>
    );
  }

  if (myClubs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ви не є керівником жодного клубу</h1>
          <p className="text-gray-600 mb-6">Щоб отримати доступ до дашборду, вам потрібно зареєструвати клуб</p>
          <Link href="/membership/club-owner/registration">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Зареєструвати клуб
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Notifications */}
      {showNotifications && notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white border border-blue-200 shadow-lg rounded-lg p-4 min-w-[300px]">
            <div className="flex items-center mb-2">
              <Bell className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-semibold text-blue-700">Нові заявки тренерів</span>
            </div>
            <ul className="space-y-1">
              {notifications.map((notif, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  {notif.message}
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowNotifications(false)}
            >
              Закрити
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Дашборд керівника клубу</h1>
              <p className="text-gray-600 text-sm">
                {myClubs.length === 1
                  ? `Управління клубом "${myClubs[0].name}"`
                  : `Управління ${myClubs.length} клубами`
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/club-manager/trainer-applications">
                <Button variant="outline" className="relative">
                  👨‍🏫 Заявки тренерів
                  {pendingApplications > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                      {pendingApplications}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Мої клуби</p>
                  <p className="text-2xl font-semibold text-gray-900">{myClubs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Тренери</p>
                  <p className="text-2xl font-semibold text-gray-900">{clubTrainers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Спортсмени</p>
                  <p className="text-2xl font-semibold text-gray-900">{clubAthletes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Заявки на розгляді</p>
                  <p className="text-2xl font-semibold text-gray-900">{pendingApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Розподіл тренерів за спеціалізацією */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Тренери за спеціалізацією
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Немає даних для відображення
                </div>
              )}
            </CardContent>
          </Card>

          {/* Розподіл ролей */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Розподіл ролей
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roleChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roleChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Немає даних для відображення
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Останні події */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Останні тренери */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Останні схвалені тренери
                </span>
                <Badge variant="outline">{clubTrainers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clubTrainers.length > 0 ? (
                <div className="space-y-4">
                  {clubTrainers.slice(-5).reverse().map((trainer) => (
                    <div key={trainer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{trainer.name}</p>
                        <p className="text-sm text-gray-600">{trainer.specialization}</p>
                        <div className="flex space-x-2 mt-1">
                          {trainer.roles.map(role => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role === 'coach' ? 'Тренер' : 'Суддя'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(trainer.approvedAt).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Поки немає схвалених тренерів</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Останні заявки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Останні заявки тренерів
                </span>
                <Badge variant="outline">{applications.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(-5).reverse().map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{application.name}</p>
                        <p className="text-sm text-gray-600">{application.preferredClub.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {application.status === 'pending' ? 'На розгляді' :
                           application.status === 'approved' ? 'Схвалено' : 'Відхилено'}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(application.submittedAt).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Поки немає заявок тренерів</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Мої клуби */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Мої клуби
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map((club) => (
                <div key={club.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{club.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <span>{clubTrainers.filter(t => t.clubId === club.id).length} тренерів</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{clubAthletes.filter(a => a.club === club.id).length} спортсменів</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Створено: {new Date(club.approvedAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exportLoading === 'excel' + club.id}
                      onClick={() => handleExport('excel', club.id)}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      {exportLoading === 'excel' + club.id ? 'Експортуємо...' : 'Excel'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exportLoading === 'pdf' + club.id}
                      onClick={() => handleExport('pdf', club.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {exportLoading === 'pdf' + club.id ? 'Експортуємо...' : 'PDF'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
