import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  CreditCard,
  Settings,
  BarChart3,
  ShieldCheck,
  Users,
  Calendar,
  FileText,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ФУСАФ</h1>
                <p className="text-sm text-gray-600">Платіжна система з LiqPay</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/admin">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Адмін панель
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Демо платіж
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-green-500 text-white">
            <Zap className="h-3 w-3 mr-1" />
            LIVE DEMO
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Система онлайн платежів LiqPay
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Повний функціонал адмін панелі для управління платежами, аналітики та моніторингу
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/admin">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Settings className="h-5 w-5 mr-2" />
                Відкрити адмін панель
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Функції платіжної системи</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Демонстрація повного функціоналу адмін панелі платежів з LiqPay інтеграцією
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Admin Panel */}
            <Card className="hover:shadow-lg transition-shadow border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-6 w-6 text-blue-600 mr-2" />
                  Адмін панель платежів
                  <Badge className="ml-2 bg-blue-500">READY</Badge>
                </CardTitle>
                <CardDescription>
                  Повне управління всіма платежами системи
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Список всіх платежів з фільтрацією</li>
                  <li>• Real-time статус з LiqPay</li>
                  <li>• Детальна інформація по кожному платежу</li>
                  <li>• Оновлення статусу вручну</li>
                </ul>
                <Link href="/admin">
                  <Button className="w-full mt-4">
                    Відкрити панель
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="hover:shadow-lg transition-shadow border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 text-green-600 mr-2" />
                  Аналітика платежів
                  <Badge className="ml-2 bg-green-500">LIVE</Badge>
                </CardTitle>
                <CardDescription>
                  Детальна статистика та фінансові звіти
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Загальна статистика платежів</li>
                  <li>• Розподіл по статусах</li>
                  <li>• Фінансові показники</li>
                  <li>• Конверсія та успішність</li>
                </ul>
                <Link href="/admin">
                  <Button variant="outline" className="w-full mt-4">
                    Переглянути аналітику
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="hover:shadow-lg transition-shadow border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldCheck className="h-6 w-6 text-purple-600 mr-2" />
                  Безпека платежів
                  <Badge className="ml-2 bg-purple-500">PCI DSS</Badge>
                </CardTitle>
                <CardDescription>
                  Enterprise-рівень безпеки через LiqPay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Signature verification callback</li>
                  <li>• SSL encryption всіх даних</li>
                  <li>• Audit log всіх операцій</li>
                  <li>• Rate limiting та захист</li>
                </ul>
                <Link href="/admin">
                  <Button variant="outline" className="w-full mt-4">
                    Переглянути логи
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Real-time */}
            <Card className="hover:shadow-lg transition-shadow border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-6 w-6 text-orange-600 mr-2" />
                  Real-time оновлення
                  <Badge className="ml-2 bg-orange-500">LIVE</Badge>
                </CardTitle>
                <CardDescription>
                  Миттєве отримання статусів платежів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Автоматичні callback від LiqPay</li>
                  <li>• Оновлення статусу в реальному часі</li>
                  <li>• Email сповіщення клієнтам</li>
                  <li>• Push оновлення в адмінці</li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  Демо callback
                </Button>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="hover:shadow-lg transition-shadow border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 text-indigo-600 mr-2" />
                  Управління клієнтами
                  <Badge className="ml-2 bg-indigo-500">CRM</Badge>
                </CardTitle>
                <CardDescription>
                  Облік клієнтів та їх платежів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• История платежів клієнта</li>
                  <li>• Контактна інформація</li>
                  <li>• Статистика по клієнтам</li>
                  <li>• Email комунікація</li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  База клієнтів
                </Button>
              </CardContent>
            </Card>

            {/* Reporting */}
            <Card className="hover:shadow-lg transition-shadow border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-6 w-6 text-red-600 mr-2" />
                  Звіти та експорт
                  <Badge className="ml-2 bg-red-500">CSV/XLS</Badge>
                </CardTitle>
                <CardDescription>
                  Фінансові звіти та експорт даних
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Експорт платежів в Excel</li>
                  <li>• Фінансові звіти по періодах</li>
                  <li>• Звіти по статусам</li>
                  <li>• Автоматичні email звіти</li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  Створити звіт
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Швидкі дії</h3>
            <p className="text-gray-600">Протестуйте основні функції системи</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link href="/admin">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium mb-2">Адмін панель</h4>
                  <p className="text-sm text-gray-600">Управління платежами</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Тест платіж</h4>
                <p className="text-sm text-gray-600">Демо LiqPay форма</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Аналітика</h4>
                <p className="text-sm text-gray-600">Статистика та звіти</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">API Docs</h4>
                <p className="text-sm text-gray-600">Документація API</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-blue-400 mr-2" />
              <span className="font-medium">ФУСАФ LiqPay Demo</span>
            </div>
            <div className="text-sm text-gray-400">
              Демонстрація платіжної системи з повним функціоналом
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
