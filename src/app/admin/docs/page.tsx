"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Book,
  Users,
  Trophy,
  DollarSign,
  Mail,
  Database,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const sections = [
  {
    id: 'overview',
    title: 'Огляд системи',
    icon: Book,
    content: `
      <h3>Про систему ФУСАФ</h3>
      <p>Сайт ФУСАФ - це повноцінна платформа для управління Федерацією України зі Спортивної Аеробіки і Фітнесу.</p>

      <h4>Основні функції:</h4>
      <ul>
        <li>Система реєстрації користувачів (спортсмени, тренери, судді, власники клубів)</li>
        <li>Управління змаганнями та реєстраціями</li>
        <li>Платіжна система LiqPay</li>
        <li>Email розсилки та сповіщення</li>
        <li>Аналітика та звітність</li>
        <li>Резервне копіювання та безпека</li>
      </ul>

      <h4>Технічний стек:</h4>
      <ul>
        <li><strong>Frontend:</strong> Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui</li>
        <li><strong>Backend:</strong> Next.js API Routes</li>
        <li><strong>Database:</strong> Supabase (PostgreSQL)</li>
        <li><strong>Authentication:</strong> NextAuth.js + Google OAuth</li>
        <li><strong>Email:</strong> Resend API</li>
        <li><strong>Payments:</strong> LiqPay</li>
        <li><strong>Hosting:</strong> ADM.tools (Node.js)</li>
      </ul>
    `
  },
  {
    id: 'users',
    title: 'Управління користувачами',
    icon: Users,
    content: `
      <h3>Ролі користувачів</h3>
      <ul>
        <li><strong>athlete</strong> - спортсмен</li>
        <li><strong>coach</strong> - тренер</li>
        <li><strong>judge</strong> - суддя</li>
        <li><strong>club_owner</strong> - власник клубу</li>
      </ul>

      <h3>Операції з користувачами</h3>

      <h4>Перегляд користувачів</h4>
      <p>Для перегляду всіх користувачів використовуйте SQL запит:</p>
      <pre><code>SELECT * FROM users ORDER BY created_at DESC;</code></pre>

      <p>Користувачі за роллю:</p>
      <pre><code>SELECT * FROM users WHERE role = 'athlete';</code></pre>

      <h4>Видалення користувача</h4>
      <div class="warning">
        <strong>⚠️ УВАГА:</strong> Видалення користувача також видаляє всі пов'язані дані!
      </div>

      <p>Перед видаленням перевірте залежності:</p>
      <pre><code>SELECT
  (SELECT COUNT(*) FROM registrations WHERE user_id = 'USER_ID') as registrations,
  (SELECT COUNT(*) FROM clubs WHERE owner_id = 'USER_ID') as owned_clubs;</code></pre>
    `
  },
  {
    id: 'competitions',
    title: 'Управління змаганнями',
    icon: Trophy,
    content: `
      <h3>Статуси змагань</h3>
      <ul>
        <li><strong>draft</strong> - чернетка</li>
        <li><strong>published</strong> - опубліковано</li>
        <li><strong>registration_open</strong> - відкрита реєстрація</li>
        <li><strong>registration_closed</strong> - реєстрація закрита</li>
        <li><strong>in_progress</strong> - проходить</li>
        <li><strong>completed</strong> - завершено</li>
        <li><strong>cancelled</strong> - скасовано</li>
      </ul>

      <h3>Створення змагання через API</h3>
      <pre><code>POST /api/competitions
{
  "title": "Кубок України 2025",
  "description": "Національні змагання",
  "date": "2025-03-15",
  "time": "10:00",
  "location": "Палац спорту Україна",
  "registration_fee": 500,
  "max_participants": 150,
  "age_groups": ["8-10", "11-13", "14-16"],
  "categories": ["індивідуальна", "пара"],
  "status": "published"
}</code></pre>

      <h3>Статуси реєстрацій</h3>
      <ul>
        <li><strong>pending</strong> - очікує підтвердження</li>
        <li><strong>confirmed</strong> - підтверджено</li>
        <li><strong>cancelled</strong> - скасовано</li>
        <li><strong>waitlist</strong> - список очікування</li>
      </ul>
    `
  },
  {
    id: 'payments',
    title: 'Платіжна система',
    icon: DollarSign,
    content: `
      <h3>Налаштування LiqPay</h3>

      <h4>Environment Variables</h4>
      <pre><code>LIQPAY_PUBLIC_KEY=your_public_key
LIQPAY_PRIVATE_KEY=your_private_key
LIQPAY_SANDBOX=false  # true для тестування</code></pre>

      <h3>Процес платежу</h3>
      <ol>
        <li>Користувач реєструється на змагання</li>
        <li>Система генерує платіжну форму LiqPay</li>
        <li>Користувач сплачує</li>
        <li>LiqPay відправляє callback на <code>/api/payments/liqpay/callback</code></li>
        <li>Система оновлює статус платежу</li>
        <li>Відправляється email підтвердження</li>
      </ol>

      <h3>Статуси платежів</h3>
      <ul>
        <li><strong>pending</strong> - очікує оплати</li>
        <li><strong>paid</strong> - оплачено</li>
        <li><strong>failed</strong> - помилка оплати</li>
        <li><strong>refunded</strong> - повернено</li>
      </ul>

      <h3>Тестування платежів</h3>
      <p>Для тестування в LiqPay Sandbox використовуйте:</p>
      <pre><code>Номер карти: 4000000000000002
Дата: 12/25
CVV: 123</code></pre>
    `
  },
  {
    id: 'email',
    title: 'Email система',
    icon: Mail,
    content: `
      <h3>Налаштування Resend</h3>

      <h4>Environment Variables</h4>
      <pre><code>RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@fusaf.org.ua</code></pre>

      <h3>Типи email повідомлень</h3>
      <ul>
        <li><strong>WELCOME</strong> - привітання нових користувачів</li>
        <li><strong>REGISTRATION_CONFIRMATION</strong> - підтвердження реєстрації</li>
        <li><strong>PAYMENT_SUCCESS</strong> - успішна оплата</li>
        <li><strong>COMPETITION_REMINDER</strong> - нагадування про змагання</li>
        <li><strong>NEWSLETTER</strong> - новини та оголошення</li>
        <li><strong>PASSWORD_RESET</strong> - скидання паролю</li>
        <li><strong>CLUB_INVITE</strong> - запрошення до клубу</li>
      </ul>

      <h3>Відправка email через API</h3>
      <pre><code>POST /api/emails/send
{
  "to": "user@example.com",
  "type": "WELCOME",
  "data": {
    "name": "Іван Петренко",
    "role": "athlete",
    "dashboardUrl": "https://fusaf.org.ua/dashboard"
  }
}</code></pre>

      <h3>Масова розсилка</h3>
      <p>Для відправки новин всім користувачам певної ролі:</p>
      <pre><code>const athletes = await getUserEmailsByRole('athlete');
await EmailService.sendNewsletter(athletes, newsletterData);</code></pre>
    `
  },
  {
    id: 'analytics',
    title: 'Аналітика та звіти',
    icon: Database,
    content: `
      <h3>Доступні звіти</h3>

      <h4>Статистика користувачів</h4>
      <pre><code>GET /api/analytics?type=users&period=month</code></pre>
      <p>Повертає: загальна кількість, нові користувачі, активні, розподіл за ролями</p>

      <h4>Статистика змагань</h4>
      <pre><code>GET /api/analytics?type=competitions&period=month</code></pre>
      <p>Повертає: кількість змагань, реєстрації, популярні категорії</p>

      <h4>Фінансова статистика</h4>
      <pre><code>GET /api/analytics?type=financial&period=month</code></pre>
      <p>Повертає: загальний дохід, успішні платежі, дохід по місяцях</p>

      <h3>Експорт звітів</h3>
      <pre><code>GET /api/analytics?type=full&format=csv
GET /api/analytics?type=full&format=pdf</code></pre>

      <h3>Автоматичні звіти</h3>
      <pre><code>POST /api/analytics/reports
{
  "reportType": "weekly",
  "emails": ["admin@fusaf.org.ua"],
  "schedule": "0 9 * * 1"  // Щопонеділка о 9:00
}</code></pre>
    `
  },
  {
    id: 'backup',
    title: 'Резервне копіювання',
    icon: Database,
    content: `
      <h3>Автоматичне резервне копіювання</h3>

      <h4>Створення резервної копії</h4>
      <pre><code>POST /api/backup
{
  "type": "full"  // full або incremental
}</code></pre>

      <h4>Список резервних копій</h4>
      <pre><code>GET /api/backup</code></pre>

      <h4>Відновлення з резервної копії</h4>
      <div class="warning">
        <strong>⚠️ УВАГА:</strong> Відновлення перезапише існуючі дані!
      </div>
      <pre><code>POST /api/backup/restore
{
  "backupId": "backup_1234567890_abc123"
}</code></pre>

      <h3>Ручне резервне копіювання</h3>
      <p>Експорт важливих таблиць через SQL:</p>
      <pre><code>\\copy users TO 'users_backup.csv' CSV HEADER;
\\copy competitions TO 'competitions_backup.csv' CSV HEADER;
\\copy registrations TO 'registrations_backup.csv' CSV HEADER;</code></pre>

      <h3>Налаштування автоматичного резервного копіювання</h3>
      <pre><code>const backupConfig = {
  frequency: 'daily',      // daily, weekly, monthly
  retentionDays: 30,       // зберігати 30 днів
  includeFiles: true,
  compression: true,
  encryption: true
};</code></pre>
    `
  },
  {
    id: 'security',
    title: 'Безпека',
    icon: Shield,
    content: `
      <h3>Системні логи</h3>

      <h4>Категорії логів</h4>
      <ul>
        <li><strong>auth</strong> - аутентифікація та авторизація</li>
        <li><strong>database</strong> - операції з базою даних</li>
        <li><strong>api</strong> - API запити</li>
        <li><strong>backup</strong> - резервне копіювання</li>
        <li><strong>system</strong> - системні події</li>
      </ul>

      <h4>Рівні важливості</h4>
      <ul>
        <li><strong>info</strong> - інформаційні повідомлення</li>
        <li><strong>warning</strong> - попередження</li>
        <li><strong>error</strong> - помилки</li>
        <li><strong>critical</strong> - критичні події</li>
      </ul>

      <h3>Перегляд логів</h3>
      <pre><code>-- Останні критичні події
SELECT * FROM security_logs
WHERE level = 'critical'
ORDER BY timestamp DESC
LIMIT 50;

-- Події аутентифікації за останню добу
SELECT * FROM security_logs
WHERE category = 'auth'
AND timestamp > NOW() - INTERVAL '1 day'
ORDER BY timestamp DESC;</code></pre>

      <h3>Моніторинг здоров'я системи</h3>
      <pre><code>GET /api/analytics?type=health</code></pre>
      <p>Повертає статус бази даних, email сервісу, аутентифікації та час відповіді</p>
    `
  },
  {
    id: 'maintenance',
    title: 'Технічне обслуговування',
    icon: Settings,
    content: `
      <h3>Щоденні завдання</h3>
      <ul>
        <li>Перевірити статус системи</li>
        <li>Переглянути критичні логи</li>
        <li>Перевірити стан резервних копій</li>
        <li>Перевірити email доставку</li>
      </ul>

      <h3>Тижневі завдання</h3>
      <ul>
        <li>Аналіз статистики користувачів</li>
        <li>Перевірка безпеки (підозріла активність)</li>
        <li>Очистка старих логів</li>
        <li>Перевірка продуктивності</li>
      </ul>

      <h3>Місячні завдання</h3>
      <ul>
        <li>Повний звіт аналітики</li>
        <li>Аудит безпеки</li>
        <li>Оновлення документації</li>
        <li>Планування розвитку</li>
      </ul>

      <h3>Оновлення системи</h3>

      <h4>Оновлення залежностей</h4>
      <pre><code># Перевірка оновлень
bun outdated

# Оновлення залежностей
bun update

# Тестування після оновлення
bun test
bun build</code></pre>

      <h3>Типові проблеми</h3>

      <h4>Сайт не відкривається</h4>
      <ol>
        <li>Перевірити статус Node.js додатку в ADM.tools</li>
        <li>Перевірити логи сервера</li>
        <li>Перевірити DNS записи</li>
        <li>Перевірити SSL сертифікат</li>
      </ol>

      <h4>Помилки аутентифікації</h4>
      <ol>
        <li>Перевірити Google OAuth налаштування</li>
        <li>Перевірити Supabase URL та ключі</li>
        <li>Перевірити NEXTAUTH_URL в environment variables</li>
      </ol>
    `
  }
];

export default function AdminDocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 Документація адміністратора ФУСАФ
          </h1>
          <p className="text-gray-600">
            Повний посібник з управління системою
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Навігаційне меню */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Розділи</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{section.title}</span>
                        {activeSection === section.id && (
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Основний контент */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {currentSection && <currentSection.icon className="h-6 w-6" />}
                  <span>{currentSection?.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: currentSection?.content || ''
                  }}
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}
                />
              </CardContent>
            </Card>

            {/* Корисні посилання */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink className="h-5 w-5" />
                  <span>Корисні посилання</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a
                    href="https://nextjs.org/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Next.js Docs</span>
                  </a>
                  <a
                    href="https://supabase.com/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Supabase Docs</span>
                  </a>
                  <a
                    href="https://resend.com/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Resend Docs</span>
                  </a>
                  <a
                    href="https://www.liqpay.ua/documentation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>LiqPay Docs</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .prose h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #374151;
        }

        .prose ul, .prose ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .prose li {
          margin: 0.5rem 0;
        }

        .prose pre {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .prose code {
          background: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.875rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .prose pre code {
          background: none;
          padding: 0;
        }

        .prose .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .prose p {
          margin: 0.75rem 0;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}
