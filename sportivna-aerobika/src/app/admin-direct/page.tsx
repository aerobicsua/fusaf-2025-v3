"use client";

import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Settings,
  Mail,
  Database,
  Users,
  Trophy,
  FileText,
  Home
} from 'lucide-react';

export default function AdminDirectPage() {
  const { user, loading } = useSimpleAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              🔧 Пряма Адмін Панель (без Layout)
            </h1>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                На головну
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🔍 Debug Інформація</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Завантаження:</strong> {loading ? 'ТАК' : 'НІ'}</div>
                <div><strong>Користувач:</strong> {user ? `${user.email}` : 'Не авторизований'}</div>
                <div><strong>Ім'я:</strong> {user?.name || 'Немає'}</div>
                <div><strong>Ролі:</strong> {user ? JSON.stringify(user.roles) : 'Немає'}</div>
                <div><strong>Адмін email:</strong> {user?.email === 'andfedos@gmail.com' ? 'ТАК ✅' : 'НІ ❌'}</div>
                <div><strong>Маршрут:</strong> /admin-direct</div>
                <div><strong>Час:</strong> {new Date().toLocaleString('uk-UA')}</div>
              </div>
            </CardContent>
          </Card>

          {!user ? (
            <Card>
              <CardHeader>
                <CardTitle>🔒 Потрібна авторизація</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Для доступу до адмін функцій увійдіть в систему
                </p>
                <Link href="/login">
                  <Button>Увійти</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-purple-600" />
                    Email тестування
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">
                    Перевірка email системи
                  </p>
                  <Link href="/admin/test-email">
                    <Button className="w-full">
                      Тестувати
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gray-600" />
                    Повна адмін панель
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">
                    Альтернативна адмін панель
                  </p>
                  <Link href="/admin-panel">
                    <Button className="w-full" variant="outline">
                      Перейти
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-green-600" />
                    База даних
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">
                    Очистка демо даних
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      if (confirm('Очистити всі демо дані?')) {
                        fetch('/api/clear-demo-data', { method: 'POST' })
                          .then(res => res.json())
                          .then(data => alert(data.message || 'Виконано'))
                          .catch(err => alert('Помилка: ' + err.message));
                      }
                    }}
                  >
                    Очистити
                  </Button>
                </CardContent>
              </Card>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">
                  ⭐ Альтернативна панель
                </h3>
                <p className="text-purple-600 mb-4 text-sm">
                  Адмін панель без Layout
                </p>
                <Link href="/admin-panel">
                  <Button className="w-full" variant="outline">
                    Перейти
                  </Button>
                </Link>
              </div>

            </div>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>📋 Тестування маршрутизації</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <strong>Доступні маршрути для тестування:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                    <li><code>/admin-direct</code> - ця сторінка (без Layout)</li>
                    <li><code>/admin-test</code> - тестова адмін панель</li>
                    <li><code>/admin-simple</code> - спрощена адмін панель</li>
                    <li><code>/admin</code> - повна адмін панель з Layout</li>
                    <li><code>/admin/test-email</code> - тестування email</li>
                  </ul>
                </div>
                <div>
                  <strong>Статус:</strong>
                  <span className="ml-2 text-green-600">✅ Сторінка завантажилася без помилок</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
