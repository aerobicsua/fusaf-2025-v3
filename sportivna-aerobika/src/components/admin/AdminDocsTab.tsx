"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  User,
  Shield,
  Mail,
  FileText,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Users,
  Building,
  Trophy,
  Settings,
  Download,
  Copy
} from 'lucide-react';

export function AdminDocsTab() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Документація системи управління ролями ФУСАФ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Повна документація для користувачів системи управління ролями
            Федерації України зі Спортивної Аеробіки і Фітнесу.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Користувачі
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Адміністратори
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="troubleshooting" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Вирішення проблем
          </TabsTrigger>
        </TabsList>

        {/* Користувачі */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Інструкція для спортсменів
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Реєстрація */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  1. Реєстрація в системі
                </h3>
                <div className="space-y-3 ml-7">
                  <p>1. Натисніть кнопку <Badge variant="outline">"Увійти з Google"</Badge> на головній сторінці</p>
                  <p>2. Виберіть ваш Google акаунт або увійдіть в новий</p>
                  <p>3. Надайте дозволи для доступу до базової інформації профілю</p>
                  <p>4. Після входу ви автоматично отримаєте роль <Badge className="bg-blue-500">Спортсмен</Badge></p>
                </div>
              </div>

              {/* Запит на роль */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-500" />
                  2. Запит на додаткову роль
                </h3>
                <div className="space-y-3 ml-7">
                  <p>1. Перейдіть в <Badge variant="outline">Особистий кабінет</Badge></p>
                  <p>2. Знайдіть секцію <Badge variant="outline">"Розширити можливості"</Badge></p>
                  <p>3. Оберіть бажану роль:</p>
                  <div className="ml-4 space-y-2">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-purple-500" />
                      <Badge className="bg-purple-500 mr-2">Власник клубу</Badge>
                      - для управління спортивним клубом
                    </div>
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-orange-500" />
                      <Badge className="bg-orange-500 mr-2">Тренер/Суддя</Badge>
                      - для тренерської діяльності та суддівства
                    </div>
                  </div>
                  <p>4. Заповніть детальну причину запиту (мінімум 10 символів)</p>
                  <p>5. Натисніть <Badge variant="outline">"Подати запит"</Badge></p>
                </div>
              </div>

              {/* Статус запиту */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-500" />
                  3. Відстеження статусу запиту
                </h3>
                <div className="space-y-3 ml-7">
                  <p>Після подання запиту можливі статуси:</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Badge className="bg-yellow-500 mr-3">Очікує розгляду</Badge>
                      - запит надіслано адміністраторам
                    </div>
                    <div className="flex items-center">
                      <Badge className="bg-green-500 mr-3">Схвалено</Badge>
                      - ви отримаєте email та доступ до нових функцій
                    </div>
                    <div className="flex items-center">
                      <Badge className="bg-red-500 mr-3">Відхилено</Badge>
                      - ви отримаєте email з причиною та можете подати новий запит
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-blue-800">📧 Email сповіщення</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Ви отримаєте автоматичне email сповіщення при зміні статусу вашого запиту.
                    </p>
                  </div>
                </div>
              </div>

              {/* Можливості ролей */}
              <div>
                <h3 className="text-lg font-semibold mb-3">🎯 Можливості ролей</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-7">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 mr-2 text-blue-500" />
                        <Badge className="bg-blue-500">Спортсмен</Badge>
                      </div>
                      <ul className="text-sm space-y-1">
                        <li>• Реєстрація на індивідуальні змагання</li>
                        <li>• Перегляд календаря заходів</li>
                        <li>• Доступ до навчальних матеріалів</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Building className="h-5 w-5 mr-2 text-purple-500" />
                        <Badge className="bg-purple-500">Власник клубу</Badge>
                      </div>
                      <ul className="text-sm space-y-1">
                        <li>• Реєстрація команд</li>
                        <li>• Управління учасниками клубу</li>
                        <li>• Організація тренувань</li>
                        <li>• Всі можливості спортсмена</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Trophy className="h-5 w-5 mr-2 text-orange-500" />
                        <Badge className="bg-orange-500">Тренер/Суддя</Badge>
                      </div>
                      <ul className="text-sm space-y-1">
                        <li>• Суддівство змагань</li>
                        <li>• Проведення сертифікації</li>
                        <li>• Доступ до тренерських матеріалів</li>
                        <li>• Всі можливості спортсмена</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Адміністратори */}
        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Інструкція для адміністраторів
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Доступ до панелі */}
              <div>
                <h3 className="text-lg font-semibold mb-3">🔑 Доступ до адмін панелі</h3>
                <div className="space-y-3 ml-7">
                  <p>1. Увійдіть через Google з адміністраторським акаунтом</p>
                  <p>2. Перейдіть за посиланням <Badge variant="outline">/admin</Badge></p>
                  <p>3. Система автоматично перевірить ваші права доступу</p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-medium text-green-800">✅ Адміністраторські акаунти</p>
                    <p className="text-green-700 text-sm mt-1">
                      Наразі адміністраторський доступ налаштований для: andfedos@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Управління запитами */}
              <div>
                <h3 className="text-lg font-semibold mb-3">📋 Управління запитами на ролі</h3>
                <div className="space-y-3 ml-7">
                  <p>1. Відкрийте вкладку <Badge variant="outline">"Запити на ролі"</Badge></p>
                  <p>2. Перегляньте список всіх запитів з фільтрацією за статусом</p>
                  <p>3. Для розгляду запиту:</p>
                  <div className="ml-4 space-y-2">
                    <p>• Натисніть <Badge variant="outline">👁</Badge> для перегляду деталей</p>
                    <p>• Натисніть <Badge variant="outline">✓</Badge> для схвалення/відхилення</p>
                    <p>• Додайте коментар (необов'язково)</p>
                    <p>• Підтвердіть рішення</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-blue-800">📧 Автоматичні сповіщення</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Користувач автоматично отримає email сповіщення про ваше рішення.
                    </p>
                  </div>
                </div>
              </div>

              {/* Статистика */}
              <div>
                <h3 className="text-lg font-semibold mb-3">📊 Статистика та аналітика</h3>
                <div className="space-y-3 ml-7">
                  <p>На головній сторінці адмін панелі ви бачите:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Загальну кількість запитів</li>
                    <li>• Запити, що очікують розгляду</li>
                    <li>• Кількість схвалених запитів</li>
                    <li>• Кількість відхилених запитів</li>
                  </ul>
                  <p>Також доступний експорт даних у CSV форматі.</p>
                </div>
              </div>

              {/* Технічна інформація */}
              <div>
                <h3 className="text-lg font-semibold mb-3">⚙️ Технічна інформація</h3>
                <div className="space-y-3 ml-7">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">🔥 HybridStorage Система</p>
                    <p className="text-sm mt-1">
                      Система використовує HybridStorage для забезпечення синхронізації
                      даних між Netlify serverless функціями.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">🌐 Production URL</p>
                    <p className="text-sm mt-1">
                      https://same-eikk4fzfmr5-latest.netlify.app
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                Часті запитання (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    🔐 Як увійти в систему?
                  </AccordionTrigger>
                  <AccordionContent>
                    Система використовує Google OAuth для автентифікації. Натисніть кнопку
                    "Увійти з Google" та виберіть ваш Google акаунт. Реєстрація не потрібна -
                    акаунт створюється автоматично при першому вході.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    ⏰ Скільки часу розглядається запит на роль?
                  </AccordionTrigger>
                  <AccordionContent>
                    Зазвичай запити розглядаються протягом 1-3 робочих днів. Ви отримаєте
                    email сповіщення одразу після прийняття рішення адміністратором.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    🔄 Можна повторно подати запит після відхилення?
                  </AccordionTrigger>
                  <AccordionContent>
                    Так, ви можете подати новий запит після усунення причин відхилення,
                    вказаних в email сповіщенні від адміністратора.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    📧 Чому не приходять email сповіщення?
                  </AccordionTrigger>
                  <AccordionContent>
                    Перевірте папку "Спам" у вашому email. Сповіщення приходять з адреси
                    noreply@fusaf.org.ua. Якщо проблема залишається, зверніться до адміністратора.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    👥 Чи можна мати декілька ролей одночасно?
                  </AccordionTrigger>
                  <AccordionContent>
                    Так, система підтримує множинні ролі. Наприклад, ви можете бути одночасно
                    спортсменом та власником клубу. Кожна роль надає додаткові можливості.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    🔒 Як стати адміністратором?
                  </AccordionTrigger>
                  <AccordionContent>
                    Адміністраторські права надаються тільки офіційним представникам ФУСАФ.
                    Для отримання доступу зверніться до керівництва федерації.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вирішення проблем */}
        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Вирішення проблем
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">🚫 Проблеми з входом</h3>
                <div className="space-y-3">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="font-medium text-red-800">Помилка: "Доступ заборонено"</p>
                    <p className="text-red-700 text-sm mt-1">
                      <strong>Рішення:</strong> Переконайтесь, що ви використовуєте правильний Google акаунт.
                      Спробуйте вийти та увійти знову.
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="font-medium text-red-800">Помилка: "Сесія закінчилась"</p>
                    <p className="text-red-700 text-sm mt-1">
                      <strong>Рішення:</strong> Оновіть сторінку та увійдіть знову. Сесії дійсні 30 днів.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-600">⚠️ Проблеми з запитами</h3>
                <div className="space-y-3">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="font-medium text-orange-800">Помилка: "У вас вже є активний запит"</p>
                    <p className="text-orange-700 text-sm mt-1">
                      <strong>Рішення:</strong> Ви не можете подавати новий запит, поки попередній
                      не буде розглянуто. Дочекайтесь відповіді адміністратора.
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="font-medium text-orange-800">Помилка: "Опис причини занадто короткий"</p>
                    <p className="text-orange-700 text-sm mt-1">
                      <strong>Рішення:</strong> Опис має містити мінімум 10 символів. Детально
                      опишіть чому вам потрібна ця роль.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">🔧 Технічні проблеми</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-blue-800">Сторінка не завантажується</p>
                    <p className="text-blue-700 text-sm mt-1">
                      <strong>Рішення:</strong> Очистіть кеш браузера (Ctrl+F5) або спробуйте
                      в іншому браузері/інкогніто режимі.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-blue-800">Дані не оновлюються</p>
                    <p className="text-blue-700 text-sm mt-1">
                      <strong>Рішення:</strong> Оновіть сторінку (F5). Система використовує
                      HybridStorage для синхронізації даних.
                    </p>
                  </div>
                </div>
              </div>

              {/* Контакти для підтримки */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">📞 Контакти технічної підтримки</h3>
                <div className="space-y-2">
                  <p>📧 Email: <strong>support@fusaf.org.ua</strong></p>
                  <p>📧 Адміністратор: <strong>andfedos@gmail.com</strong></p>
                  <p>🌐 Сайт: <strong>https://same-eikk4fzfmr5-latest.netlify.app</strong></p>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('support@fusaf.org.ua', 'email')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedSection === 'email' ? 'Скопійовано!' : 'Копіювати Email'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('https://same-eikk4fzfmr5-latest.netlify.app', 'url')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedSection === 'url' ? 'Скопійовано!' : 'Копіювати URL'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
