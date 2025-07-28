"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MigrateDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const migrateClubs = async () => {
    setIsLoading(true);
    setError('');
    setMigrationResult(null);

    try {
      console.log('🔄 Початок міграції клубів...');

      // Отримуємо клуби з localStorage
      const localStorageClubs = localStorage.getItem('approvedClubs');

      if (!localStorageClubs) {
        setError('Клуби не знайдено в localStorage');
        return;
      }

      const clubs = JSON.parse(localStorageClubs);
      console.log(`📊 Знайдено ${clubs.length} клубів в localStorage:`, clubs);

      if (clubs.length === 0) {
        setError('localStorage містить пустий список клубів');
        return;
      }

      // Відправляємо на міграцію
      const response = await fetch('/api/migrate-clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubs })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Міграція успішна:', result);
        setMigrationResult(result);

        // Очищаємо localStorage після успішної міграції (опціонально)
        // localStorage.removeItem('approvedClubs');
      } else {
        console.error('❌ Помилка міграції:', result);
        setError(result.error || 'Невідома помилка міграції');
      }

    } catch (err) {
      console.error('❌ Критична помилка:', err);
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setIsLoading(false);
    }
  };

  const checkLocalStorageData = () => {
    const clubs = localStorage.getItem('approvedClubs');
    const athletes = localStorage.getItem('approvedAthletes');
    const trainers = localStorage.getItem('clubTrainers');
    const competitions = localStorage.getItem('approvedCompetitions');

    console.log('📊 Дані в localStorage:');
    console.log('🏢 Клуби:', clubs ? JSON.parse(clubs).length : 0);
    console.log('🏃 Спортсмени:', athletes ? JSON.parse(athletes).length : 0);
    console.log('👨‍🏫 Тренери:', trainers ? JSON.parse(trainers).length : 0);
    console.log('🏆 Змагання:', competitions ? JSON.parse(competitions).length : 0);

    return {
      clubs: clubs ? JSON.parse(clubs).length : 0,
      athletes: athletes ? JSON.parse(athletes).length : 0,
      trainers: trainers ? JSON.parse(trainers).length : 0,
      competitions: competitions ? JSON.parse(competitions).length : 0
    };
  };

  const localData = checkLocalStorageData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔄 Міграція даних</h1>
              <p className="text-gray-600 text-sm">Перенесення даних з localStorage в MySQL</p>
            </div>
            <a href="/admin-panel" className="text-blue-600 hover:text-blue-700">
              ← Назад до адмін-панелі
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Поточний стан даних */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📊 Поточний стан даних</CardTitle>
            <CardDescription>
              Дані в localStorage, які можна мігрувати в MySQL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{localData.clubs}</div>
                <div className="text-sm text-blue-800">Клубів</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{localData.athletes}</div>
                <div className="text-sm text-green-800">Спортсменів</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{localData.trainers}</div>
                <div className="text-sm text-purple-800">Тренерів</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{localData.competitions}</div>
                <div className="text-sm text-orange-800">Змагань</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Міграція клубів */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🏢 Міграція клубів</CardTitle>
            <CardDescription>
              Перенесення схвалених клубів з localStorage в MySQL базу даних
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {localData.clubs > 0 ? (
              <>
                <Alert>
                  <AlertDescription>
                    Знайдено <strong>{localData.clubs} клубів</strong> в localStorage.
                    Ці клуби будуть перенесені в MySQL базу даних з збереженням всієї інформації.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={migrateClubs}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? '🔄 Міграція...' : '🚀 Мігрувати клуби в MySQL'}
                </Button>
              </>
            ) : (
              <Alert>
                <AlertDescription>
                  В localStorage не знайдено клубів для міграції.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Результат міграції */}
        {migrationResult && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">✅ Міграція завершена!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-green-100 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{migrationResult.results.migrated}</div>
                  <div className="text-sm text-green-800">Мігровано</div>
                </div>
                <div className="text-center p-3 bg-yellow-100 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">{migrationResult.results.skipped}</div>
                  <div className="text-sm text-yellow-800">Пропущено</div>
                </div>
                <div className="text-center p-3 bg-red-100 rounded-lg">
                  <div className="text-xl font-bold text-red-600">{migrationResult.results.errors}</div>
                  <div className="text-sm text-red-800">Помилок</div>
                </div>
                <div className="text-center p-3 bg-blue-100 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{migrationResult.results.totalClubsInDatabase}</div>
                  <div className="text-sm text-blue-800">Всього в MySQL</div>
                </div>
              </div>

              <Alert className="bg-green-100 border-green-300">
                <AlertDescription className="text-green-800">
                  <strong>Успіх!</strong> Тепер лічільники на головній сторінці та в адмін-панелі покажуть правильні дані з MySQL.
                  Оновіть сторінки щоб побачити зміни.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Помилка */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>Помилка:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Інструкції */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ Інструкції</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Що робить міграція:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Читає клуби з localStorage в браузері</li>
                <li>Створює записи в MySQL таблиці `clubs`</li>
                <li>Знаходить або створює власників клубів в таблиці `users`</li>
                <li>Встановлює статус `active` для всіх мігрованих клубів</li>
                <li>Пропускає клуби що вже існують в MySQL</li>
              </ul>
            </div>

            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Після міграції:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Лічільники на головній сторінці покажуть правильні дані</li>
                <li>Адмін-панель відобразить актуальну кількість клубів</li>
                <li>Сторінка "/clubs" покаже всі клуби з MySQL</li>
                <li>localStorage можна очистити (опціонально)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
