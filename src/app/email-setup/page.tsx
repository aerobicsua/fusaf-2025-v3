"use client";

import { useState } from "react";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Settings,
  TestTube,
  CheckCircle,
  XCircle,
  Info,
  Send,
  Key,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";

export default function EmailSetupPage() {
  const { user } = useSimpleAuth();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    emailUser: '',
    emailPassword: '',
    testEmail: user?.email || 'test@example.com'
  });

  const checkEmailService = async () => {
    setTesting(true);
    setTestResult('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult(`✅ Email сервіс працює!\n📧 Налаштування: ${result.config?.service}\n📬 Email: ${result.config?.from}`);
      } else {
        setTestResult(`❌ Email сервіс недоступний:\n${result.error || result.message}`);
      }
    } catch (error) {
      setTestResult(`❌ Помилка перевірки сервісу:\n${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setTesting(false);
    }
  };

  const sendTestEmail = async () => {
    setTesting(true);
    setTestResult('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailConfig.testEmail,
          subject: '🧪 Тестовий лист ФУСАФ',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>🧪 Тестовий лист</h1>
                <p>Федерація України зі Спортивної Аеробіки і Фітнесу</p>
              </div>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <h2>Вітаємо!</h2>
                <p>Це тестовий лист для перевірки роботи email системи ФУСАФ.</p>

                <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3>📋 Інформація про тест:</h3>
                  <p><strong>Час відправки:</strong> ${new Date().toLocaleString('uk-UA')}</p>
                  <p><strong>Отримувач:</strong> ${emailConfig.testEmail}</p>
                  <p><strong>Статус:</strong> Система працює!</p>
                </div>

                <p>Якщо ви отримали цей лист, то email система налаштована правильно.</p>
              </div>

              <div style="text-align: center; margin-top: 20px; padding: 15px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                <p><strong>ФУСАФ</strong> • fusaf.org.ua • info@fusaf.org.ua</p>
              </div>
            </div>
          `,
          text: `Тестовий лист ФУСАФ. Час відправки: ${new Date().toLocaleString('uk-UA')}. Якщо ви отримали цей лист, то система працює!`
        })
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult(`✅ Тестовий лист відправлено!\n📧 На адресу: ${emailConfig.testEmail}\n🆔 ID повідомлення: ${result.messageId}\n\n💡 Перевірте поштову скриньку (включно з папкою "Спам")`);
      } else {
        setTestResult(`❌ Помилка відправки:\n${result.details || result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Помилка тестування:\n${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setTesting(false);
    }
  };

  // Перевірка доступу (тільки для адміністраторів)
  if (!user?.roles?.includes('admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
            <p className="text-gray-600 mb-4">Тільки адміністратори можуть налаштовувати email</p>
            <Button onClick={() => window.location.href = '/'}>
              Повернутися на головну
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📧 Налаштування Email Сервісу
            </h1>
            <p className="text-gray-600">
              Налаштування та тестування відправки email листів для ФУСАФ
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Інструкції */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Інструкція по налаштуванню
                  </CardTitle>
                  <CardDescription>
                    Покрокова інструкція для налаштування Gmail SMTP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium">Увімкніть 2-факторну автентифікацію</p>
                        <p className="text-sm text-gray-600">У вашому Gmail акаунті увімкніть двоетапну перевірку</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium">Створіть пароль додатку</p>
                        <p className="text-sm text-gray-600">
                          Перейдіть в налаштування → Безпека → 2-Step Verification → App passwords
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium">Оновіть .env.local файл</p>
                        <p className="text-sm text-gray-600">Додайте ваш email та пароль додатку</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-medium">Перезапустіть сервер</p>
                        <p className="text-sm text-gray-600">Зупиніть та запустіть dev сервер заново</p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Важливо:</strong> Ніколи не додавайте реальні паролі в git репозиторій.
                      Файл .env.local автоматично ігнорується.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Приклад .env.local
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div>EMAIL_USER=your-email@gmail.com</div>
                    <div>EMAIL_PASSWORD=your-16-char-app-password</div>
                    <div>NEXT_PUBLIC_APP_URL=http://localhost:3000</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Замініть your-email@gmail.com та your-16-char-app-password на ваші дані
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Тестування */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TestTube className="h-5 w-5 mr-2" />
                    Тестування Email Сервісу
                  </CardTitle>
                  <CardDescription>
                    Перевірте чи працює email система
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={checkEmailService}
                      disabled={testing}
                      variant="outline"
                      className="flex-1"
                    >
                      {testing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Перевірити сервіс
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="testEmail">Email для тестування</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      value={emailConfig.testEmail}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, testEmail: e.target.value }))}
                      placeholder="test@example.com"
                    />
                  </div>

                  <Button
                    onClick={sendTestEmail}
                    disabled={testing || !emailConfig.testEmail}
                    className="w-full"
                  >
                    {testing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Відправити тестовий лист
                  </Button>

                  {testResult && (
                    <Alert className={testResult.startsWith('✅') ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <div className={testResult.startsWith('✅') ? "text-green-800" : "text-red-800"}>
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {testResult}
                        </pre>
                      </div>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Статус системи</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Email API</span>
                      <span className="text-yellow-600">🟡 Потребує налаштування</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SMTP з'єднання</span>
                      <span className="text-gray-600">⚪ Не перевірено</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email шаблони</span>
                      <span className="text-green-600">🟢 Готові</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🔧 Швидке виправлення</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Для швидкого тестування:</strong>
                      <br />1. Відкрийте консоль браузера (F12)
                      <br />2. Зареєструйте тестового користувача
                      <br />3. Подивіться email content в консолі
                      <br />4. Налаштуйте реальний SMTP пізніше
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Швидкі посилання */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>🔗 Корисні посилання</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Gmail App Passwords</h4>
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      myaccount.google.com/apppasswords
                    </a>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Nodemailer документація</h4>
                    <a
                      href="https://nodemailer.com/about/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      nodemailer.com/about
                    </a>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Email Preview</h4>
                    <a
                      href="/email-preview"
                      className="text-blue-600 hover:underline"
                    >
                      Переглянути шаблони
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
