"use client";

import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClubManagement } from "@/components/ClubManagement";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft
} from "lucide-react";

export default function ClubManagementPage() {
  const { user, loading } = useSimpleAuth();
  const router = useRouter();

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
              Увійдіть в систему для управління клубом
            </p>
            <Button onClick={() => router.push('/auth/signin')}>
              Увійти в систему
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isClubOwner = session?.user?.roles?.includes('club_owner');
  const isAdmin = session?.user?.roles?.includes('admin');

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

  const managementSections = [
    {
      icon: Users,
      title: "Управління учасниками",
      description: "Заявки на вступ та поточні учасники клубу",
      badge: "Активно"
    },
    {
      icon: Trophy,
      title: "Змагання клубу",
      description: "Організовані змагання та участь учасників",
      badge: "Скоро"
    },
    {
      icon: BarChart3,
      title: "Статистика та звіти",
      description: "Аналітика діяльності клубу",
      badge: "Скоро"
    },
    {
      icon: CreditCard,
      title: "Фінанси",
      description: "Оплати, внески та фінансові звіти",
      badge: "Скоро"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <Building className="h-8 w-8 mr-3 text-blue-600" />
                  Управління клубом
                </h1>
                <p className="text-gray-600">
                  Панель управління для власників спортивних клубів
                </p>
              </div>
              <Badge className="bg-green-500 text-white">
                {isAdmin ? 'Адміністратор' : 'Власник клубу'}
              </Badge>
            </div>
          </div>

          {/* Швидкі дії */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {managementSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="h-8 w-8 text-blue-600" />
                      <Badge variant={section.badge === 'Активно' ? 'default' : 'secondary'}>
                        {section.badge}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Основний контент - Управління учасниками */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ClubManagement />
            </div>

            {/* Бічна панель */}
            <div className="space-y-6">
              {/* Інформація про клуб */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Building className="h-5 w-5 mr-2" />
                    Ваш клуб
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Назва:</span>
                      <br />
                      СК "Грація"
                    </div>
                    <div>
                      <span className="font-medium">Місто:</span>
                      <br />
                      Київ
                    </div>
                    <div>
                      <span className="font-medium">Заснований:</span>
                      <br />
                      2015 рік
                    </div>
                    <div>
                      <span className="font-medium">Статус:</span>
                      <br />
                      <Badge className="bg-green-500 text-white">Активний</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Швидка статистика */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Статистика
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Учасників:</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Заявок:</span>
                      <span className="font-semibold">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Змагань:</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Медалей:</span>
                      <span className="font-semibold">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Швидкі дії */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Settings className="h-5 w-5 mr-2" />
                    Швидкі дії
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Trophy className="h-4 w-4 mr-2" />
                    Створити змагання
                    <Badge variant="secondary" className="ml-auto">Скоро</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Звіти
                    <Badge variant="secondary" className="ml-auto">Скоро</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Calendar className="h-4 w-4 mr-2" />
                    Календар
                    <Badge variant="secondary" className="ml-auto">Скоро</Badge>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
