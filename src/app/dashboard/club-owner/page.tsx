"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClubManagement } from "@/components/ClubManagement";
import {
  Building,
  Users,
  Trophy,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  CreditCard,
  Shield,
  Plus,
  TrendingUp
} from "lucide-react";

export default function ClubOwnerDashboard() {
  const { user, loading } = useSimpleAuth();
  const router = useRouter();
  const [userClub, setUserClub] = useState<any>(null);
  const [clubLoading, setClubLoading] = useState(true);

  useEffect(() => {
    if (user && (user.roles?.includes('club_owner') || user.roles?.includes('admin'))) {
      loadUserClub();
    }
  }, [user]);

  const loadUserClub = async () => {
    try {
      const response = await fetch('/api/clubs/my-club');
      if (response.ok) {
        const data = await response.json();
        setUserClub(data.club);
      }
    } catch (error) {
      console.error('Помилка завантаження інформації про клуб:', error);
    } finally {
      setClubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
            <p className="text-gray-600 mb-6">
              Увійдіть в систему для доступу до панелі управління клубом
            </p>
            <Button onClick={() => router.push('/auth/signin')}>
              Увійти в систему
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isClubOwner = user?.roles?.includes('club_owner');
  const isAdmin = user?.roles?.includes('admin');

  if (!isClubOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-orange-400 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Недостатньо прав</h1>
            <p className="text-gray-600 mb-6">
              Тільки власники клубів та адміністратори можуть управляти клубами
            </p>
            <div className="space-x-4">
              <Button onClick={() => router.push('/competitions')} variant="outline">
                Переглянути змагання
              </Button>
              <Button onClick={() => router.push('/membership/club-owner')}>
                Стати власником клубу
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Users,
      title: "Управління учасниками",
      description: "Заявки на вступ та поточні учасники",
      count: "5 учасників",
      action: () => {}, // Already on this page
      active: true
    },
    {
      icon: Trophy,
      title: "Змагання клубу",
      description: "Організовані змагання",
      count: "3 змагання",
      action: () => router.push('/competitions'),
      active: false
    },
    {
      icon: Calendar,
      title: "Календар подій",
      description: "Розклад тренувань",
      count: "12 подій",
      action: () => {},
      active: false
    },
    {
      icon: BarChart3,
      title: "Статистика",
      description: "Аналітика клубу",
      count: "Звіти",
      action: () => {},
      active: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <Building className="h-8 w-8 mr-3 text-blue-600" />
                  Панель управління клубом
                </h1>
                <p className="text-gray-600">
                  Ласкаво просимо, {user?.name || user?.email}!
                </p>
              </div>
              <Badge className="bg-blue-500 text-white">
                {isAdmin ? 'Адміністратор' : 'Власник клубу'}
              </Badge>
            </div>
          </div>

          {/* Швидкі дії */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.title}
                  className={`hover:shadow-md transition-all cursor-pointer ${
                    action.active ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={action.action}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`h-8 w-8 ${action.active ? 'text-blue-600' : 'text-gray-600'}`} />
                      <Badge variant={action.active ? 'default' : 'secondary'}>
                        {action.count}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Основний контент */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ClubManagement />
            </div>

            {/* Бічна панель */}
            <div className="space-y-6">
              {/* Інформація про клуб */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    {userClub ? userClub.name : 'Завантаження...'}
                  </CardTitle>
                  <CardDescription>
                    {userClub ? 'Ваш спортивний клуб' : 'Інформація про клуб'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {clubLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : userClub ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Місто:</span>
                        <span className="font-medium">{userClub.city}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Регіон:</span>
                        <span className="font-medium">{userClub.region}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Тип:</span>
                        <span className="font-medium">
                          {userClub.type === 'club' ? 'Спортивний клуб' : 'Підрозділ'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Статус:</span>
                        <Badge className="bg-green-500 text-white">Активний</Badge>
                      </div>
                      {userClub.website && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Сайт:</span>
                          <a href={userClub.website} target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 hover:underline text-sm">
                            Відвідати
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">Клуб не знайдено або ще не схвалений</p>
                      <Button size="sm" onClick={() => router.push('/membership/club-owner/registration')}>
                        Зареєструвати клуб
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Швидка статистика */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Статистика місяця
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Нові учасники:</span>
                      <span className="font-semibold text-green-600">+2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Змагання:</span>
                      <span className="font-semibold">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Медалі:</span>
                      <span className="font-semibold text-yellow-600">4</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Рейтинг:</span>
                      <span className="font-semibold text-blue-600">↗ 12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Швидкі посилання */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Швидкі дії
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/competitions/create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Створити змагання
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/competitions')}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Переглянути змагання
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Звіти
                    <Badge variant="secondary" className="ml-auto">Скоро</Badge>
                  </Button>
                </CardContent>
              </Card>

              {/* Останні новини клубу */}
              <Card>
                <CardHeader>
                  <CardTitle>Останні події</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="pb-3 border-b">
                      <p className="font-medium">Нова заявка на вступ</p>
                      <p className="text-gray-600">Новий Спортсмен Один</p>
                      <p className="text-xs text-gray-500">Сьогодні</p>
                    </div>
                    <div className="pb-3 border-b">
                      <p className="font-medium">Успішна реєстрація</p>
                      <p className="text-gray-600">Кубок України 2025</p>
                      <p className="text-xs text-gray-500">Вчора</p>
                    </div>
                    <div>
                      <p className="font-medium">Нагорода</p>
                      <p className="text-gray-600">2 місце в категорії IW</p>
                      <p className="text-xs text-gray-500">3 дні тому</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
