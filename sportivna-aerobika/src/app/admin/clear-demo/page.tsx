"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  User,
  Shield
} from 'lucide-react';

interface ClearResult {
  success: boolean;
  message: string;
  data?: {
    users: number;
    clubs: number;
    club_requests: number;
    superadmin: {
      email: string;
      password: string;
      note: string;
    };
  };
  error?: string;
  details?: string;
}

export default function ClearDemoPage() {
  const [result, setResult] = useState<ClearResult | null>(null);
  const [loading, setLoading] = useState(false);

  const clearDemoData = async () => {
    if (!confirm('УВАГА! Це видалить ВСІ дані з бази даних. Залишиться тільки суперадміністратор. Ви впевнені?')) {
      return;
    }

    if (!confirm('ОСТАННЯ ПЕРЕВІРКА! Всі спортсмени, клуби, змагання будуть видалені. Продовжити?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/clear-demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Помилка очищення даних',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Trash2 className="h-6 w-6 mr-2 text-red-600" />
                Очищення демо даних
              </h1>
              <p className="text-gray-600 text-sm">⚠️ НЕБЕЗПЕЧНА ОПЕРАЦІЯ - видалить всі дані з бази</p>
            </div>
            <a href="/admin-panel" className="text-gray-500 hover:text-gray-700">
              ← Назад до адмін панелі
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Попередження */}
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>УВАГА!</strong> Ця операція незворотна і видалить ВСІ дані з бази даних MySQL,
            включаючи всіх користувачів, клуби, змагання, результати тощо.
            Залишиться тільки один суперадміністратор.
          </AlertDescription>
        </Alert>

        {/* Що буде очищено */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Що буде видалено
            </CardTitle>
            <CardDescription>
              Список всіх таблиць та даних, які будуть очищені
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Користувачі та профілі:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Всі користувачі (крім суперадміна)</li>
                  <li>• Профілі спортсменів</li>
                  <li>• Профілі тренерів/суддів</li>
                  <li>• Заявки на ролі</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Клуби та змагання:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Всі клуби та підрозділи</li>
                  <li>• Заявки на реєстрацію клубів</li>
                  <li>• Змагання та результати</li>
                  <li>• Реєстрації на змагання</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Контент:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Новини</li>
                  <li>• Курси та реєстрації</li>
                  <li>• Завантажені файли</li>
                  <li>• Логи активності</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Що залишиться:</h4>
                <ul className="space-y-1 text-sm text-green-600">
                  <li>• ✅ Суперадміністратор</li>
                  <li>• ✅ Системні налаштування</li>
                  <li>• ✅ Структура бази даних</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Суперадміністратор */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Суперадміністратор
            </CardTitle>
            <CardDescription>
              Єдиний користувач, який залишиться в системі
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-semibold">Суперадміністратор ФУСАФ</span>
              </div>
              <div className="space-y-1 text-sm">
                <div><strong>Email:</strong> aerobicsua@gmail.com</div>
                <div><strong>Пароль:</strong> fusaf2025</div>
                <div><strong>Ролі:</strong> admin, superadmin</div>
                <div><strong>Права:</strong> Повний доступ до всіх функцій</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Кнопка очищення */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-600">Виконати очищення</CardTitle>
            <CardDescription>
              Натисніть кнопку нижче для початку процесу очищення
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={clearDemoData}
              disabled={loading}
              variant="destructive"
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Database className="h-4 w-4 mr-2 animate-spin" />
                  Очищення в процесі...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  ОЧИСТИТИ ВСІ ДЕМО ДАНІ
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Результат */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 text-red-600" />
                )}
                Результат операції
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                <AlertDescription>
                  <strong>{result.message}</strong>
                  {result.error && (
                    <div className="mt-2 text-sm">
                      Помилка: {result.error}
                    </div>
                  )}
                  {result.details && (
                    <div className="mt-2 text-sm">
                      Деталі: {result.details}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {result.success && result.data && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Стан бази після очищення:</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <Badge variant="outline">Користувачі: {result.data.users}</Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">Клуби: {result.data.clubs}</Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">Заявки: {result.data.club_requests}</Badge>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">✅ Суперадміністратор створений:</h5>
                    <div className="text-sm space-y-1">
                      <div><strong>Email:</strong> {result.data.superadmin.email}</div>
                      <div><strong>Пароль:</strong> {result.data.superadmin.password}</div>
                      <div className="text-green-600">{result.data.superadmin.note}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
