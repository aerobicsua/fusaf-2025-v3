"use client";

import { useState } from "react";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendRegistrationEmail, testEmailSystem } from "@/lib/email-service";
import { Mail, Send, Eye, TestTube } from "lucide-react";

export default function EmailPreviewPage() {
  const { user } = useSimpleAuth();
  const [previewData, setPreviewData] = useState({
    name: "Тест Користувач",
    email: "test@example.com",
    role: "athlete"
  });
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const handleSendTestEmail = async () => {
    setSending(true);
    setTestResult('');

    try {
      const result = await sendRegistrationEmail(previewData);
      setTestResult(result.success ? '✅ Email відправлено успішно!' : `❌ Помилка: ${result.message}`);
    } catch (error) {
      setTestResult(`❌ Помилка: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setSending(false);
    }
  };

  const handleRunEmailTest = async () => {
    setSending(true);
    setTestResult('');

    try {
      await testEmailSystem();
      setTestResult('✅ Тест email системи завершено. Перевірте консоль браузера.');
    } catch (error) {
      setTestResult(`❌ Помилка тесту: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setSending(false);
    }
  };

  // Генерація HTML шаблону для preview
  const generatePreviewHtml = () => {
    const registrationDate = new Date().toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const nextSteps = getNextStepsForRole(previewData.role);
    const loginUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://fusaf.org.ua'}/login`;

    return `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вітаємо з реєстрацією в ФУСАФ!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
        .badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; display: inline-block; margin: 10px 0; }
        .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Вітаємо з реєстрацією!</h1>
        <p>Федерація України зі Спортивної Аеробіки і Фітнесу</p>
    </div>

    <div class="content">
        <h2>Вітаємо, ${previewData.name}!</h2>

        <p>Ви успішно зареєструвалися в <strong>ФУСАФ</strong> як <span class="badge">${getRoleLabel(previewData.role)}</span></p>

        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Ваші дані для входу:</h3>
            <p><strong>Email:</strong> ${previewData.email}</p>
            <p><strong>Роль:</strong> ${getRoleLabel(previewData.role)}</p>
            <p><strong>Дата реєстрації:</strong> ${registrationDate}</p>
        </div>

        <div class="next-steps">
            <h3>🚀 Наступні кроки:</h3>
            <ol>
                ${nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" class="button">🔐 Увійти в систему</a>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>💡 Корисні посилання:</h4>
            <ul>
                <li><a href="https://fusaf.org.ua/competitions">📅 Календар змагань</a></li>
                <li><a href="https://fusaf.org.ua/courses">📚 Курси та навчання</a></li>
                <li><a href="https://fusaf.org.ua/clubs">🏢 Спортивні клуби</a></li>
                <li><a href="https://fusaf.org.ua/instructions">📖 Інструкції та документи</a></li>
            </ul>
        </div>

        <p><strong>Зверніть увагу:</strong> Цей email підтверджує вашу реєстрацію в системі ФУСАФ. Збережіть його для своїх записів.</p>
    </div>

    <div class="footer">
        <p><strong>Федерація України зі Спортивної Аеробіки і Фітнесу</strong></p>
        <p>📧 Email: <a href="mailto:info@fusaf.org.ua">info@fusaf.org.ua</a></p>
        <p>🌐 Сайт: <a href="https://fusaf.org.ua">fusaf.org.ua</a></p>
        <p>📱 Телефон: +38 (044) 123-45-67</p>

        <p style="margin-top: 20px; font-size: 12px; color: #999;">
            Цей лист було надіслано автоматично. Будь ласка, не відповідайте на нього.<br>
            Якщо у вас є питання, зв'яжіться з нами за адресою info@fusaf.org.ua
        </p>
    </div>
</body>
</html>
    `;
  };

  function getRoleLabel(role: string): string {
    switch (role) {
      case 'athlete': return 'Спортсмен';
      case 'coach_judge': return 'Тренер/Суддя';
      case 'club_owner': return 'Власник клубу';
      case 'admin': return 'Адміністратор';
      default: return 'Користувач';
    }
  }

  function getNextStepsForRole(role: string): string[] {
    switch (role) {
      case 'athlete':
        return [
          'Заповніть додаткову інформацію у вашому профілі',
          'Оберіть спортивний клуб для тренувань',
          'Перегляньте календар найближчих змагань',
          'Підготуйте необхідні документи для участі у змаганнях',
          'Зв\'яжіться з тренером для початку підготовки'
        ];
      case 'coach_judge':
        return [
          'Завершіть верифікацію ваших кваліфікацій',
          'Зареєструйтесь на курси підвищення кваліфікації',
          'Приєднайтесь до професійної спільноти тренерів',
          'Подайте заявку на суддівство змагань',
          'Оновіть інформацію про свій досвід та сертифікати'
        ];
      case 'club_owner':
        return [
          'Зареєструйте ваш спортивний клуб в системі',
          'Додайте інформацію про тренерський склад',
          'Створіть профілі для ваших спортсменів',
          'Почніть планування змагань та тренувань',
          'Налаштуйте маркетингові матеріали клубу'
        ];
      default:
        return [
          'Ознайомтеся з можливостями платформи',
          'Заповніть свій профіль',
          'Перегляньте доступні функції',
          'Зв\'яжіться з підтримкою при необхідності'
        ];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📧 Попередній перегляд Email шаблонів
            </h1>
            <p className="text-gray-600">
              Тестування та налагодження email системи ФУСАФ
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Налаштування */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Налаштування тестового email
                  </CardTitle>
                  <CardDescription>
                    Заповніть дані для тестування email шаблону
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ім'я користувача</Label>
                    <Input
                      id="name"
                      value={previewData.name}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Андрій Федосенко"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email адреса</Label>
                    <Input
                      id="email"
                      type="email"
                      value={previewData.email}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="afedos@ukr.net"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Роль користувача</Label>
                    <select
                      value={previewData.role}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full p-2 border rounded-md border-gray-300"
                    >
                      <option value="athlete">Спортсмен</option>
                      <option value="coach_judge">Тренер/Суддя</option>
                      <option value="club_owner">Власник клубу</option>
                      <option value="admin">Адміністратор</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={handleSendTestEmail}
                      disabled={sending}
                      className="w-full"
                    >
                      {sending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Відправка...
                        </div>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Відправити тестовий email
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleRunEmailTest}
                      disabled={sending}
                      variant="outline"
                      className="w-full"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Запустити тест системи
                    </Button>
                  </div>

                  {testResult && (
                    <div className={`p-3 rounded-md text-sm ${
                      testResult.startsWith('✅')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {testResult}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📋 Інформація про email систему</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div><strong>Статус:</strong> Демо режим (email в консолі)</div>
                  <div><strong>Шаблон:</strong> Реєстрація користувача</div>
                  <div><strong>Мова:</strong> Українська</div>
                  <div><strong>Тип:</strong> HTML + текст</div>

                  <div className="pt-3 border-t">
                    <p className="text-gray-600">
                      <strong>Примітка:</strong> Зараз система працює в режимі тестування.
                      Фактичне надсилання email буде налаштовано в продакшн версії.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Попередній перегляд */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Попередній перегляд
                  </CardTitle>
                  <CardDescription>
                    Як буде виглядати email лист для користувача
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: generatePreviewHtml() }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
