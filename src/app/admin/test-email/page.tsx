"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  AlertTriangle,
  Info,
  Eye
} from 'lucide-react';

export default function TestEmailPage() {
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [configCheck, setConfigCheck] = useState<any>(null);
  const [emailTemplate, setEmailTemplate] = useState<string>('');

  // Перевірка конфігурації email
  const checkConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-email', {
        method: 'GET'
      });
      const data = await response.json();
      setConfigCheck(data);
    } catch (error) {
      setConfigCheck({
        success: false,
        error: 'Помилка перевірки конфігурації'
      });
    } finally {
      setLoading(false);
    }
  };

  // Тестування надсилання email
  const testSendEmail = async () => {
    if (!testEmail) {
      alert('Введіть email адресу');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          name: testName || 'Тестовий користувач',
          demoMode: demoMode
        })
      });

      const data = await response.json();
      setResult(data);

      // Для демо режиму показуємо повідомлення про успіх
      if (data.demoMode && data.emailTemplateGenerated) {
        console.log('Демо режим: email шаблон згенеровано');
      }

    } catch (error) {
      setResult({
        success: false,
        error: 'Помилка тестування email',
        details: error instanceof Error ? error.message : 'Невідома помилка'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              📧 Тестування Email Системи
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Перевірка налаштувань Gmail та тестування надсилання вітальних листів ФУСАФ
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Перевірка конфігурації */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Конфігурація Email
                </CardTitle>
                <CardDescription>
                  Перевірка налаштувань Gmail та змінних середовища
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={checkConfig}
                  disabled={loading}
                  className="w-full mb-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Перевіряю...
                    </>
                  ) : (
                    <>
                      <Info className="mr-2 h-4 w-4" />
                      Перевірити конфігурацію
                    </>
                  )}
                </Button>

                {configCheck && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Gmail User:</span>
                      <Badge variant={configCheck.config?.gmailUser !== 'не налаштовано' ? 'default' : 'destructive'}>
                        {configCheck.config?.gmailUser || 'Не налаштовано'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">App Password:</span>
                      <Badge variant={configCheck.config?.appPasswordConfigured ? 'default' : 'destructive'}>
                        {configCheck.config?.appPasswordConfigured ? 'Налаштовано' : 'Не налаштовано'}
                      </Badge>
                    </div>

                    {configCheck.instructions && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{configCheck.instructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Тестування відправки */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Тестування Email
                </CardTitle>
                <CardDescription>
                  Надсилання тестового вітального листа
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="testEmail">Email адреса</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="testName">Ім'я користувача</Label>
                    <Input
                      id="testName"
                      type="text"
                      placeholder="Тестовий користувач"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="demoMode"
                      checked={demoMode}
                      onCheckedChange={(checked) => setDemoMode(checked as boolean)}
                      disabled={loading}
                    />
                    <Label htmlFor="demoMode" className="text-sm">
                      Демо режим (без реальної відправки)
                    </Label>
                  </div>
                  <Button
                    onClick={testSendEmail}
                    disabled={loading || !testEmail}
                    className="w-full"
                    variant={demoMode ? "outline" : "default"}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {demoMode ? 'Генерую шаблон...' : 'Надсилаю...'}
                      </>
                    ) : (
                      <>
                        {demoMode ? (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Переглянути шаблон email
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Надіслати тестовий email
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Результат тестування */}
          {result && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="mr-2 h-5 w-5 text-red-600" />
                  )}
                  Результат тестування
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Badge variant={result.success ? 'default' : 'destructive'} className="mr-3">
                      {result.success ? 'Успіх' : 'Помилка'}
                    </Badge>
                    <span className="text-sm">
                      {result.message || result.error}
                    </span>
                  </div>

                  {result.success && result.details && (
                    <div className={`p-4 rounded-lg ${result.demoMode ? 'bg-blue-50' : 'bg-green-50'}`}>
                      <h4 className={`font-semibold mb-2 ${result.demoMode ? 'text-blue-800' : 'text-green-800'}`}>
                        {result.demoMode ? 'Деталі демонстрації:' : 'Деталі відправки:'}
                      </h4>
                      <div className={`space-y-1 text-sm ${result.demoMode ? 'text-blue-700' : 'text-green-700'}`}>
                        <div>📧 Від: {result.details.from}</div>
                        <div>📬 До: {result.details.to}</div>
                        <div>⏰ Час: {new Date(result.details.timestamp).toLocaleString('uk-UA')}</div>
                        {result.demoMode && (
                          <div>🎭 Режим: Демонстрація (реальний email не надсилався)</div>
                        )}
                      </div>
                      {result.demoMode && result.emailTemplateGenerated && (
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              const templateUrl = `/api/email-template?name=${encodeURIComponent(testName || 'Тестовий користувач')}&email=${encodeURIComponent(testEmail)}`;
                              window.open(templateUrl, '_blank');
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            👁️ Переглянути email шаблон
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {!result.success && result.details && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Деталі помилки:</h4>
                      <div className="text-sm text-red-700">
                        {result.details}
                      </div>
                      {result.suggestion && (
                        <div className="mt-2 text-sm text-red-600 font-medium">
                          💡 {result.suggestion}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Перегляд email шаблону */}
          {emailTemplate && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-600" />
                  Перегляд Email Шаблону
                </CardTitle>
                <CardDescription>
                  Попередній перегляд вітального листа ФУСАФ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="outline">HTML Email Template</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(emailTemplate);
                          newWindow.document.close();
                        }
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Відкрити в новому вікні
                    </Button>
                  </div>
                  <div
                    className="max-h-96 overflow-auto border bg-white p-4 rounded"
                    dangerouslySetInnerHTML={{ __html: emailTemplate }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Інструкції */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
                Налаштування Gmail App Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p className="text-gray-700">
                  Для роботи email системи потрібно налаштувати App Password для Gmail:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Увійдіть в Google Account (aerobicsua@gmail.com)</li>
                  <li>Увімкніть 2-step verification (якщо ще не увімкнено)</li>
                  <li>Перейдіть в Security → App passwords</li>
                  <li>Створіть новий App Password для "Mail"</li>
                  <li>Скопіюйте згенерований пароль</li>
                  <li>Додайте в .env.local: <code className="bg-gray-100 px-2 py-1 rounded">GMAIL_APP_PASSWORD=your-app-password</code></li>
                  <li>Перезапустіть додаток</li>
                </ol>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    ⚠️ Без налаштування App Password email не буде надсилатися!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
