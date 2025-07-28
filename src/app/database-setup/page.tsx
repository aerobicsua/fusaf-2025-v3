"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Play,
  RotateCcw,
  Loader2
} from 'lucide-react';

interface DatabaseStatus {
  success: boolean;
  message: string;
  database?: any;
  tables?: any[];
  connection?: any;
  error?: string;
  details?: string;
}

export default function DatabaseSetupPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/database-setup');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        message: 'Помилка тестування підключення',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    } finally {
      setLoading(false);
    }
  };

  const createTables = async () => {
    setLoading(true);
    setSetupResult(null);

    try {
      const response = await fetch('/api/database-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_tables' })
      });

      const data = await response.json();
      setSetupResult(data);

      // Оновлюємо статус після створення таблиць
      if (data.success) {
        await testConnection();
      }
    } catch (error) {
      setSetupResult({
        success: false,
        message: 'Помилка створення таблиць',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDatabase = async () => {
    if (!confirm('Ви впевнені, що хочете скинути всю базу даних? Це видалить ВСІ дані!')) {
      return;
    }

    setLoading(true);
    setSetupResult(null);

    try {
      const response = await fetch('/api/database-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_database' })
      });

      const data = await response.json();
      setSetupResult(data);

      // Оновлюємо статус після скидання
      if (data.success) {
        await testConnection();
      }
    } catch (error) {
      setSetupResult({
        success: false,
        message: 'Помилка скидання бази даних',
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
                <Database className="h-6 w-6 mr-2 text-blue-600" />
                Налаштування бази даних MySQL
              </h1>
              <p className="text-gray-600 text-sm">Тестування та ініціалізація бази даних ФУСАФ</p>
            </div>
            <a href="/" className="text-gray-500 hover:text-gray-700">
              ← На головну
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Налаштування підключення */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Налаштування підключення
            </CardTitle>
            <CardDescription>
              Поточні налаштування підключення до MySQL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Хост:</strong> {process.env.NEXT_PUBLIC_DB_HOST || 'gy563895.mysql.tools'}
              </div>
              <div>
                <strong>База даних:</strong> gy563895_fusaf2025
              </div>
              <div>
                <strong>Користувач:</strong> gy563895_fusaf2025
              </div>
              <div>
                <strong>Порт:</strong> 3306
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Дії */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Дії з базою даних</CardTitle>
            <CardDescription>
              Виберіть дію для налаштування бази даних
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                onClick={testConnection}
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Тестувати підключення
              </Button>

              <Button
                onClick={createTables}
                disabled={loading}
                variant="outline"
                className="flex items-center"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Створити таблиці
              </Button>

              <Button
                onClick={resetDatabase}
                disabled={loading}
                variant="destructive"
                className="flex items-center"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Скинути базу
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Результат тестування підключення */}
        {status && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                {status.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 text-red-600" />
                )}
                Статус підключення
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={status.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                <AlertDescription>
                  <strong>{status.message}</strong>
                  {status.error && (
                    <div className="mt-2 text-sm">
                      Помилка: {status.error}
                    </div>
                  )}
                  {status.details && (
                    <div className="mt-2 text-sm">
                      Деталі: {status.details}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {status.success && status.database && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Інформація про базу:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Array.isArray(status.database) && status.database.map((info: any, index) => (
                      <div key={index}>
                        <strong>База даних:</strong> {info.current_db}<br />
                        <strong>Версія MySQL:</strong> {info.version}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status.success && status.tables && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Існуючі таблиці ({status.tables.length}):</h4>
                  <div className="flex flex-wrap gap-2">
                    {status.tables.map((table: any, index) => (
                      <Badge key={index} variant="outline">
                        {String(Object.values(table)[0])}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Результат налаштування */}
        {setupResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {setupResult.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 text-red-600" />
                )}
                Результат операції
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={setupResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                <AlertDescription>
                  <strong>{setupResult.message}</strong>
                  {setupResult.error && (
                    <div className="mt-2 text-sm">
                      Помилка: {setupResult.error}
                    </div>
                  )}
                  {setupResult.details && (
                    <div className="mt-2 text-sm">
                      Деталі: {setupResult.details}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {setupResult.success && setupResult.results && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Результати створення:</h4>
                  <div className="space-y-1 text-sm">
                    {setupResult.results.map((result: string, index: number) => (
                      <div key={index} className="font-mono">
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {setupResult.success && setupResult.tables && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Створені таблиці ({setupResult.tables.length}):</h4>
                  <div className="flex flex-wrap gap-2">
                    {setupResult.tables.map((table: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        {String(Object.values(table)[0])}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {setupResult.deletedTables !== undefined && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Видалено таблиць: {setupResult.deletedTables}</h4>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Інструкції */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Інструкції
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>1. Тестування підключення:</strong> Перевіряє з'єднання з MySQL та показує поточний стан бази.
              </div>
              <div>
                <strong>2. Створення таблиць:</strong> Створює всі необхідні таблиці для роботи ФУСАФ згідно з схемою.
              </div>
              <div>
                <strong>3. Скидання бази:</strong> ⚠️ ВИДАЛЯЄ ВСІ таблиці та дані! Використовуйте тільки для повного перезапуску.
              </div>
              <div className="pt-2 border-t">
                <strong>Рекомендований порядок:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Спочатку протестуйте підключення</li>
                  <li>Якщо таблиць немає - створіть їх</li>
                  <li>Перевірте повторно підключення</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
