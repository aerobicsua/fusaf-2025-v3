"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  CheckCircle,
  XCircle,
  Loader,
  Server,
  Table,
  Trash2,
  RefreshCw,
  User
} from 'lucide-react';

export default function TestDatabasePage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [clearing, setClearing] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminResult, setAdminResult] = useState<any>(null);
  const [checkingUsers, setCheckingUsers] = useState(false);
  const [usersResult, setUsersResult] = useState<any>(null);
  const [clearingUsers, setClearingUsers] = useState(false);

  const testDatabase = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();

      setResult(data);
      console.log('Результат тестування БД:', data);
    } catch (error) {
      console.error('Помилка тестування:', error);
      setResult({
        success: false,
        error: 'Помилка запиту до API',
        details: { message: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setTesting(false);
    }
  };

  const clearLocalStorage = () => {
    setClearing(true);

    // Очищаємо всі дані localStorage
    const keys = [
      'approvedClubs',
      'clubTrainers',
      'approvedAthletes',
      'coachJudgeApplications',
      'approvedCompetitions',
      'approvedNews',
      'user',
      'authToken'
    ];

    keys.forEach(key => localStorage.removeItem(key));

    setTimeout(() => {
      setClearing(false);
      window.location.reload(); // Перезавантажуємо сторінку
    }, 1000);
  };

  const createAdmin = async () => {
    setCreatingAdmin(true);
    setAdminResult(null);

    try {
      // Спочатку створюємо адміністратора через API
      const response = await fetch('/api/create-admin', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        // Створюємо повний об'єкт користувача для localStorage
        const adminUser = {
          id: "admin-fusaf-2024",
          email: "aerobicsua@gmail.com",
          name: "Адміністратор ФУСАФ",
          roles: ["admin", "user", "coach_judge", "club_owner"],
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: true,
          profile: {
            firstName: "Адміністратор",
            lastName: "ФУСАФ",
            middleName: "",
            dateOfBirth: "1980-01-01",
            gender: "male",
            phone: "+380441234567",

            country: "Україна",
            region: "м. Київ",
            city: "Київ",
            address: "вул. Спортивна, 1",
            zipCode: "01001",

            club: "Федерація України зі Спортивної Аеробіки і Фітнесу",
            coach: "",
            sportCategory: "Майстер спорту міжнародного класу",
            experience: "Адміністратор системи ФУСАФ",
            specialization: "Спортивна аеробіка",

            bio: "Адміністратор системи Федерації України зі Спортивної Аеробіки і Фітнесу",
            website: "https://fusaf.org.ua",
            socialMedia: {
              instagram: "@fusaf_ukraine",
              facebook: "fusaf.ukraine",
              telegram: "@fusaf_ukraine"
            },

            achievements: "Адміністратор ФУСАФ",
            competitions: [],

            isPublicProfile: false,
            showEmail: false,
            showPhone: false,
            emailNotifications: true,

            avatar: ""
          }
        };

        // Зберігаємо в localStorage для системи авторизації
        const adminUserData = {
          user: adminUser,
          password: "fusaf2025",
          lastLogin: new Date().toISOString()
        };

        // Оновлюємо список користувачів
        const existingUsers = JSON.parse(localStorage.getItem('simple-auth-users') || '[]');
        const filteredUsers = existingUsers.filter((u: any) => u.user.email !== "aerobicsua@gmail.com");
        const updatedUsers = [...filteredUsers, adminUserData];

        localStorage.setItem('simple-auth-users', JSON.stringify(updatedUsers));

        // Також зберігаємо в постійне сховище оновлених користувачів
        const updatedUsersKey = 'fusaf-updated-users';
        let updatedUsersStorage: { [email: string]: any } = {};

        try {
          const existing = localStorage.getItem(updatedUsersKey);
          if (existing) {
            updatedUsersStorage = JSON.parse(existing);
          }
        } catch (error) {
          console.warn('⚠️ Помилка завантаження оновлених користувачів:', error);
        }

        updatedUsersStorage[adminUser.email] = adminUser;
        localStorage.setItem(updatedUsersKey, JSON.stringify(updatedUsersStorage));

        console.log('✅ Адміністратора створено в localStorage');
        console.log('✅ Адміністратора збережено в постійне сховище');
      }

      setAdminResult(data);
    } catch (error: unknown) {
      console.error('Помилка створення адміністратора:', error);
      setAdminResult({
        success: false,
        error: 'Помилка запиту до API',
        details: { message: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const checkUsers = async () => {
    setCheckingUsers(true);
    setUsersResult(null);

    try {
      const response = await fetch('/api/manage-users');
      const data = await response.json();

      setUsersResult(data);
      console.log('Результат перевірки користувачів:', data);
    } catch (error: unknown) {
      console.error('Помилка перевірки користувачів:', error);
      setUsersResult({
        success: false,
        error: 'Помилка запиту до API',
        details: { message: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setCheckingUsers(false);
    }
  };

  const clearUsers = async () => {
    setClearingUsers(true);

    try {
      const response = await fetch('/api/manage-users', {
        method: 'DELETE'
      });
      const data = await response.json();

      setUsersResult(data);
      console.log('Результат очищення користувачів:', data);
    } catch (error: unknown) {
      console.error('Помилка очищення користувачів:', error);
      setUsersResult({
        success: false,
        error: 'Помилка запиту до API',
        details: { message: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setClearingUsers(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">🗄️ Тестування бази даних</h1>
            <p className="text-gray-600">
              Перевірка підключення до MySQL бази даних та очищення демо даних
            </p>
          </div>

          {/* Кнопки управління */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 max-w-6xl mx-auto">
            <Button
              onClick={testDatabase}
              disabled={testing}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {testing ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              {testing ? 'Тестування...' : 'Тестувати БД'}
            </Button>

            <Button
              onClick={createAdmin}
              disabled={creatingAdmin}
              className="bg-green-500 hover:bg-green-600"
            >
              {creatingAdmin ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              {creatingAdmin ? 'Створення...' : 'Створити Адміна'}
            </Button>

            <Button
              onClick={checkUsers}
              disabled={checkingUsers}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {checkingUsers ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <User className="h-4 w-4 mr-2" />}
              {checkingUsers ? 'Перевірка...' : 'Перевірити БД'}
            </Button>

            <Button
              onClick={clearUsers}
              disabled={clearingUsers}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {clearingUsers ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {clearingUsers ? 'Очищення...' : 'Очистити БД'}
            </Button>

            <Button
              onClick={clearLocalStorage}
              disabled={clearing}
              variant="destructive"
            >
              {clearing ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {clearing ? 'Очищення...' : 'Очистити localStorage'}
            </Button>
          </div>

          {/* Результат створення адміністратора */}
          {adminResult && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {adminResult.success ? (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2 text-red-500" />
                  )}
                  {adminResult.success ? 'Адміністратора створено!' : 'Помилка створення адміністратора'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {adminResult.success ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-md">
                      <h3 className="font-medium text-green-800 mb-2">Адміністратор створений успішно!</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Email:</strong> {adminResult.credentials?.email}</div>
                        <div><strong>Пароль:</strong> {adminResult.credentials?.password}</div>
                        <div><strong>Ролі:</strong> {adminResult.admin?.roles?.join(', ')}</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-blue-800 text-sm">
                        💡 <strong>Тепер можете увійти в систему з цими credentials через форму входу!</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-md">
                    <h3 className="font-medium text-red-800 mb-2">Помилка:</h3>
                    <p className="text-red-700">{adminResult.error}</p>
                    {adminResult.details && (
                      <pre className="text-xs text-red-600 mt-2">
                        {JSON.stringify(adminResult.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Результат перевірки/очищення користувачів */}
          {usersResult && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {usersResult.success ? (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2 text-red-500" />
                  )}
                  {usersResult.success ? 'Операція успішна!' : 'Помилка операції'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersResult.success ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="font-medium text-blue-800 mb-2">{usersResult.message}</h3>
                      {usersResult.users && (
                        <div className="space-y-2 text-sm">
                          <div><strong>Користувачів у БД:</strong> {usersResult.users.length}</div>
                          {usersResult.users.length > 0 && (
                            <div className="bg-white p-3 rounded border max-h-40 overflow-y-auto">
                              {usersResult.users.map((user: any, index: number) => (
                                <div key={index} className="text-xs border-b border-gray-200 pb-1 mb-1">
                                  <strong>{user.email}</strong> - {user.name} ({user.roles})
                                </div>
                              ))}
                            </div>
                          )}
                          {usersResult.deletedCount !== undefined && (
                            <div><strong>Видалено:</strong> {usersResult.deletedCount} користувачів</div>
                          )}
                          {usersResult.remainingCount !== undefined && (
                            <div><strong>Залишилось:</strong> {usersResult.remainingCount} користувачів</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-md">
                    <h3 className="font-medium text-red-800 mb-2">Помилка:</h3>
                    <p className="text-red-700">{usersResult.error}</p>
                    {usersResult.details && (
                      <pre className="text-xs text-red-600 mt-2">
                        {JSON.stringify(usersResult.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Результат тестування БД */}
          {result && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2 text-red-500" />
                  )}
                  {result.success ? 'Підключення успішне!' : 'Помилка підключення'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-4">
                    {/* Інформація про базу даних */}
                    <div>
                      <h3 className="font-medium mb-2 flex items-center">
                        <Server className="h-4 w-4 mr-2" />
                        Параметри підключення:
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><strong>Хост:</strong> {result.database?.host}</div>
                          <div><strong>Порт:</strong> {result.database?.port}</div>
                          <div><strong>База:</strong> {result.database?.database}</div>
                          <div><strong>Користувач:</strong> {result.database?.user}</div>
                        </div>
                      </div>
                    </div>

                    {/* Тестовий запит */}
                    {result.testResult && (
                      <div>
                        <h3 className="font-medium mb-2">Тестовий запит:</h3>
                        <div className="bg-green-50 p-3 rounded-md">
                          <pre className="text-sm text-green-800">
                            {JSON.stringify(result.testResult[0], null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Таблиці в БД */}
                    {result.tables && (
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <Table className="h-4 w-4 mr-2" />
                          Таблиці в базі даних ({result.tables.length}):
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.tables.map((table: any, index: number) => (
                            <Badge key={index} variant="outline">
                              {String(Object.values(table)[0])}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Тестування виконано: {new Date(result.timestamp).toLocaleString('uk-UA')}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-md">
                      <h3 className="font-medium text-red-800 mb-2">Помилка:</h3>
                      <p className="text-red-700">{result.error}</p>
                    </div>

                    {result.details && (
                      <div>
                        <h3 className="font-medium mb-2">Деталі помилки:</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <pre className="text-sm text-gray-700">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {result.config && (
                      <div>
                        <h3 className="font-medium mb-2">Конфігурація:</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <pre className="text-sm text-gray-700">
                            {JSON.stringify(result.config, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Інструкції */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Інструкції</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-medium">1.</span>
                  <span>Натисніть <strong>"Тестувати БД"</strong> для перевірки підключення до MySQL</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-medium">2.</span>
                  <span>Натисніть <strong>"Очистити дані"</strong> для видалення всіх демо даних з localStorage</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-medium">3.</span>
                  <span>Після успішного підключення можна налаштовувати міграції та таблиці БД</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
