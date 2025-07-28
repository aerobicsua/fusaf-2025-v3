"use client";

import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Settings,
  Mail,
  Database,
  Users,
  Trophy,
  FileText,
  Shield,
  BarChart3
} from 'lucide-react';

export default function AdminSimplePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔧 Адмін Панель ФУСАФ
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Управління системою Федерації України зі Спортивної Аеробіки і Фітнесу
            </p>
          </div>

          {/* Статус системи */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Статус системи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-xl inline-block mb-2">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium">База даних</div>
                  <div className="text-xs text-green-600">Активна</div>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-xl inline-block mb-2">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium">Email система</div>
                  <div className="text-xs text-green-600">Працює</div>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-xl inline-block mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium">Користувачі</div>
                  <div className="text-xs text-blue-600">1 адмін</div>
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
                  Email система
                </CardTitle>
                <CardDescription>
                  Тестування та управління email розсилками
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin-test">
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
                <CardDescription>
                  Управління користувачами та їх правами
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                <CardDescription>
                  Створення та управління змаганнями
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                <CardDescription>
                  Очистка демо даних та управління БД
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                  Очистити демо дані
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Документація
                </CardTitle>
                <CardDescription>
                  Інструкції та довідкова інформація
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  В розробці
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  Налаштування
                </CardTitle>
                <CardDescription>
                  Конфігурація системи та параметри
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  В розробці
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* Інформація */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                Інформація про систему
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Поточна версія:</h4>
                  <p className="text-gray-600">ФУСАФ v1.0 - Email система активна</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Останнє оновлення:</h4>
                  <p className="text-gray-600">19 липня 2025 - Gmail інтеграція</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Адміністратор:</h4>
                  <p className="text-gray-600">andfedos@gmail.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Email відправник:</h4>
                  <p className="text-gray-600">aerobicsua@gmail.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
