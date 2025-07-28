import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Users,
  Building,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  BarChart3,
  Mail,
  UserPlus,
  Home,
  Shield
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
                <p className="text-sm text-gray-600">Федерація України зі Спортивної Аеробіки і Фітнесу</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/athlete-registration">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Реєстрація на змагання
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Адмін панель
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Система управління спортивною федерацією
          </h2>
          <p className="text-xl mb-8">
            Повний функціонал для управління спортсменами, тренерами, змаганнями та онлайн платежами
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/athlete-registration">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <UserPlus className="h-5 w-5 mr-2" />
                Зареєструватися на змагання
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <FileText className="h-5 w-5 mr-2" />
                API Документація
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Основні можливості</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Професійна система з повним функціоналом для управління всіма аспектами спортивної федерації
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Online Payments */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-6 w-6 text-green-600 mr-2" />
                  Онлайн платежі
                  <Badge className="ml-2 bg-green-500">NEW!</Badge>
                </CardTitle>
                <CardDescription>
                  Безпечні платежі через LiqPay з автоматичним підтвердженням реєстрації
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Оплата реєстрації на змагання</li>
                  <li>• Real-time статус платежів</li>
                  <li>• Автоматичні email чеки</li>
                  <li>• PCI DSS безпека</li>
                </ul>
              </CardContent>
            </Card>

            {/* Competition Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-6 w-6 text-orange-600 mr-2" />
                  Управління змаганнями
                </CardTitle>
                <CardDescription>
                  Повний цикл організації змагань від створення до результатів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Створення та редагування змагань</li>
                  <li>• Онлайн реєстрація учасників</li>
                  <li>• Управління категоріями</li>
                  <li>• Автоматичні сповіщення</li>
                </ul>
              </CardContent>
            </Card>

            {/* Athletes & Coaches */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  Спортсмени та тренери
                </CardTitle>
                <CardDescription>
                  Кваліфікаційний реєстр тренерів та база спортсменів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Реєстр тренерів/суддів</li>
                  <li>• Сертифікати та ліцензії</li>
                  <li>• Профілі спортсменів</li>
                  <li>• Контроль термінів дії</li>
                </ul>
              </CardContent>
            </Card>

            {/* Clubs Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-6 w-6 text-purple-600 mr-2" />
                  Управління клубами
                </CardTitle>
                <CardDescription>
                  Централізований облік спортивних клубів та організацій
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Реєстрація клубів</li>
                  <li>• Статистика членства</li>
                  <li>• Контактна інформація</li>
                  <li>• Досягнення клубів</li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 text-indigo-600 mr-2" />
                  Аналітика та звіти
                </CardTitle>
                <CardDescription>
                  Детальна статистика та експорт даних для звітності
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Графіки та діаграми</li>
                  <li>• Фінансова аналітика</li>
                  <li>• Експорт в Excel</li>
                  <li>• Регіональна статистика</li>
                </ul>
              </CardContent>
            </Card>

            {/* Admin Panel */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-6 w-6 text-gray-600 mr-2" />
                  Адміністрування
                </CardTitle>
                <CardDescription>
                  Повна адмін панель з контролем доступу та аудитом
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Управління користувачами</li>
                  <li>• Система ролей</li>
                  <li>• Логи дій</li>
                  <li>• Email сповіщення</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Система в цифрах</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">45+</div>
              <div className="text-gray-600">API Endpoints</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">16</div>
              <div className="text-gray-600">Таблиць БД</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">55+</div>
              <div className="text-gray-600">React компонентів</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">Безпека платежів</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Готові почати?</h3>
          <p className="text-xl mb-8 text-gray-300">
            Зареєструйтеся на змагання прямо зараз з онлайн оплатою
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/athlete-registration">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-5 w-5 mr-2" />
                Реєстрація спортсмена
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <CreditCard className="h-5 w-5 mr-2" />
                Платежі (Адмін)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-gray-900 font-medium">ФУСАФ</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                API Docs
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Адмін
              </Link>
              <Link href="/payments/result" className="text-gray-600 hover:text-gray-900">
                Результат платежу
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center text-gray-500 text-sm">
            © 2024 Федерація України зі Спортивної Аеробіки і Фітнесу. Система з онлайн платежами LiqPay.
          </div>
        </div>
      </footer>
    </div>
  );
}
