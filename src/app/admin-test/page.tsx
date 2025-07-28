"use client";

import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Settings,
  Mail,
  Database,
  Users,
  Trophy,
  FileText
} from 'lucide-react';

export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔧 Тестова Адмін Панель ФУСАФ
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Спрощений доступ до адміністративних функцій для діагностики проблем
            </p>
          </div>

          {/* Статус системи */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Стан системи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-xl inline-block mb-2">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium">База даних</div>
                  <div className="text-xs text-green-600">Підключено</div>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-xl inline-block mb-2">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium">Email система</div>
                  <div className="text-xs text-blue-600">Готова</div>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 p-3 rounded-xl inline-block mb-2">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium">Користувачі</div>
                  <div className="text-xs text-purple-600">1 адмін</div>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 p-3 rounded-xl inline-block mb-2">
                    <Trophy className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium">Змагання</div>
                  <div className="text-xs text-orange-600">0 активних</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Швидкі дії */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-purple-600" />
                  Тестування Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Перевірка налаштувань та тестування надсилання листів
                </p>
                <Link href="/admin/test-email">
                  <Button className="w-full">
                    Тестувати Email
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Користувачі
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Управління користувачами та їх правами
                </p>
                <Button className="w-full" disabled>
                  В розробці
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Змагання
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Створення та управління змаганнями
                </p>
                <Button className="w-full" disabled>
                  В розробці
                </Button>
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
                <p className="text-gray-600 mb-4">
                  Очистка демо даних та управління БД
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    fetch('/api/clear-demo-data', { method: 'POST' })
                      .then(res => res.json())
                      .then(data => alert(data.message || 'Виконано'))
                      .catch(err => alert('Помилка: ' + err.message));
                  }}
                >
                  Очистити демо дані
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Логи та діагностика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Перегляд логів та діагностика проблем
                </p>
                <Button className="w-full" disabled>
                  В розробці
                </Button>
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
                <p className="text-gray-600 mb-4">
                  Спроба доступу до повної адмін панелі
                </p>
                <Link href="/admin">
                  <Button className="w-full" variant="outline">
                    Перейти до /admin
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>

          {/* Інструкції */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>📋 Інструкції з усунення проблем</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <strong>Якщо адмін панель не відкривається:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
                    <li>Перевірте, що ви увійшли як andfedos@gmail.com</li>
                    <li>Спробуйте оновити сторінку (F5)</li>
                    <li>Очистіть кеш браузера</li>
                    <li>Перевірте консоль браузера на помилки (F12)</li>
                    <li>Використайте цю тестову панель для основних функцій</li>
                  </ol>
                </div>
                <div>
                  <strong>Доступні маршрути:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                    <li>/admin-test - ця сторінка</li>
                    <li>/admin/test-email - тестування email</li>
                    <li>/admin - повна адмін панель</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
