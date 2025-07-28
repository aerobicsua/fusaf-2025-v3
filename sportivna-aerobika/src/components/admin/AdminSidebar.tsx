"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Building,
  Newspaper,
  FileText,
  Settings,
  Shield,
  Download,
  BarChart3,
  UserCheck,
  Calendar,
  Activity,
  Mail,
  Database,
  Lock,
  CreditCard
} from 'lucide-react';

const navigation = [
  {
    name: 'Головна панель',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Огляд системи та статистика'
  },
  {
    name: 'Користувачі',
    icon: Users,
    description: 'Управління користувачами',
    submenu: [
      {
        name: 'Усі користувачі',
        href: '/admin/users',
        icon: Users,
        description: 'Загальний список користувачів'
      },
      {
        name: 'Спортсмени',
        href: '/admin/athletes',
        icon: UserCheck,
        description: 'Управління спортсменами'
      },
      {
        name: 'Тренери/Судді',
        href: '/admin/coaches',
        icon: Shield,
        description: 'Управління тренерами та суддями'
      }
    ]
  },
  {
    name: 'Контент',
    icon: FileText,
    description: 'Управління контентом',
    submenu: [
      {
        name: 'Клуби',
        href: '/admin/clubs',
        icon: Building,
        description: 'Управління клубами та підрозділами'
      },
      {
        name: 'Змагання',
        href: '/admin/competitions',
        icon: Trophy,
        description: 'Управління змаганнями'
      },
      {
        name: 'Новини',
        href: '/admin/news',
        icon: Newspaper,
        description: 'Управління новинами'
      },
      {
        name: 'Реєстрації',
        href: '/admin/registrations',
        icon: Calendar,
        description: 'Перегляд та управління реєстраціями'
      },
      {
        name: 'Платежі',
        href: '/admin/payments',
        icon: CreditCard,
        description: 'Управління платежами LiqPay'
      }
    ]
  },
  {
    name: 'Аналітика та звіти',
    icon: BarChart3,
    description: 'Статистика та звіти',
    submenu: [
      {
        name: 'Аналітика',
        href: '/admin/analytics',
        icon: BarChart3,
        description: 'Детальна статистика та графіки'
      },
      {
        name: 'Експорт даних',
        href: '/admin/export',
        icon: Download,
        description: 'Експорт даних у Excel та JSON'
      }
    ]
  },
  {
    name: 'Комунікації',
    icon: Mail,
    description: 'Сповіщення та повідомлення',
    submenu: [
      {
        name: 'Email сповіщення',
        href: '/admin/notifications',
        icon: Mail,
        description: 'Відправка email повідомлень'
      }
    ]
  },
  {
    name: 'Система та безпека',
    icon: Lock,
    description: 'Системні функції',
    submenu: [
      {
        name: 'Логи дій',
        href: '/admin/logs',
        icon: Activity,
        description: 'Аудит дій адміністраторів'
      },
      {
        name: 'Налаштування',
        href: '/admin/settings',
        icon: Settings,
        description: 'Конфігурація системи'
      }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 pt-16">
      <div className="flex flex-col h-full">
        {/* Заголовок адмінки */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Адмінпанель</h2>
              <p className="text-sm text-gray-500">Суперадміністратор</p>
            </div>
          </div>
        </div>

        {/* Навігація */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                // Розділ з підменю
                <div>
                  <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                    <item.icon className="h-5 w-5 mr-3 text-gray-400" />
                    {item.name}
                  </div>
                  <div className="ml-6 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                          pathname === subItem.href
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <subItem.icon className="h-4 w-4 mr-3" />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                // Звичайний пункт меню
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Нижня інформація */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">ФУСАФ Адмін</p>
                <p className="text-xs text-blue-600">Система управління</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
