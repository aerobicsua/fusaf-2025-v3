"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import Link from "next/link";
import {
  Trophy,
  User,
  Calendar,
  Award,
  CheckCircle,
  LogIn,
  Star,
  Medal,
  Target,
  Users,
  UserCircle
} from "lucide-react";

export default function SimpleAthletePanelPage() {
  const { user, loading } = useSimpleAuth();

  console.log('🏆 SimpleAthletePanelPage рендер:', { user, loading });

  // Перенаправляємо на нову сторінку профілю
  React.useEffect(() => {
    if (user && typeof window !== 'undefined') {
      window.location.href = '/profile';
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Завантаження панелі...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏆 Профіль Спортсмена
            </h1>
            <p className="text-gray-600">
              Привіт, {user?.name || "Гість"}! Ласкаво просимо до ФУСАФ
            </p>
          </div>

          {/* Швидка статистика */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">📊 Швидка статистика:</h3>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Статус:</strong> {user ? 'Активний член ФУСАФ ✅' : 'Не авторизований ❌'}</p>
              <p><strong>Користувач:</strong> {user?.name || "Не авторизований"}</p>
              <p><strong>Email:</strong> {user?.email || "Немає"}</p>
              <p><strong>Роль:</strong> {user?.roles?.join(", ") || "Немає ролей"}</p>
              <p><strong>Дата реєстрації:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('uk-UA') : "Невідомо"}</p>
            </div>
          </div>

          {!user ? (
            /* Неавторизований користувач */
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Ви не авторизовані</h3>
              <p className="text-yellow-800 mb-4">
                Для доступу до панелі спортсмена увійдіть в систему
              </p>
              <div className="space-x-4">
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Увійти в систему
                </Button>
                <Button
                  onClick={() => window.location.href = '/membership'}
                  variant="outline"
                  className="border-pink-600 text-pink-600"
                >
                  Стати членом ФУСАФ
                </Button>
              </div>
            </div>
          ) : (
            /* Авторизований користувач */
            <div className="space-y-8">
              {/* Успішна авторизація */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Успішно авторизовані!</strong> Ласкаво просимо до системи ФУСАФ.
                </AlertDescription>
              </Alert>

              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Trophy className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Змагання</p>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Medal className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Медалі</p>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Target className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Бали</p>
                        <p className="text-2xl font-bold text-gray-900">1250</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Star className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Рейтинг</p>
                        <p className="text-2xl font-bold text-gray-900">#15</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Інформація про користувача */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Особиста інформація</CardTitle>
                      <CardDescription>
                        Дані користувача в системі ФУСАФ
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => window.location.href = '/profile'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      Редагувати профіль
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Ім'я</label>
                        <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">ID</label>
                        <p className="mt-1 text-sm text-gray-900">{user.id}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Ролі</label>
                        <div className="mt-1 space-x-1">
                          {user.roles?.map((role, index) => (
                            <Badge key={index} variant="secondary">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Статус</label>
                        <p className="mt-1">
                          <Badge className="bg-green-500">Активний</Badge>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
