"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Code,
  ExternalLink,
  Book,
  Shield,
  Zap,
  Database,
  Users,
  Trophy,
  Building,
  FileText,
  Activity,
  Settings,
  Download
} from 'lucide-react';

// Динамічно завантажуємо SwaggerUI тільки на клієнті
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
});

// Імпортуємо стилі Swagger UI
import 'swagger-ui-react/swagger-ui.css';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  tags: string[];
  auth: boolean;
}

const apiEndpoints: ApiEndpoint[] = [
  // Authentication
  { method: 'POST', path: '/api/auth/login', description: 'Вхід користувача', tags: ['Authentication'], auth: false },
  { method: 'POST', path: '/api/auth/register', description: 'Реєстрація користувача', tags: ['Authentication'], auth: false },
  { method: 'GET', path: '/api/auth/profile', description: 'Профіль користувача', tags: ['Authentication'], auth: true },

  // Athletes
  { method: 'GET', path: '/api/athletes', description: 'Список спортсменів', tags: ['Athletes'], auth: false },
  { method: 'POST', path: '/api/athletes', description: 'Створити спортсмена', tags: ['Athletes'], auth: true },
  { method: 'GET', path: '/api/athletes/{id}', description: 'Деталі спортсмена', tags: ['Athletes'], auth: false },

  // Coaches
  { method: 'GET', path: '/api/admin/coaches', description: 'Список тренерів/суддів', tags: ['Coaches'], auth: true },
  { method: 'POST', path: '/api/admin/coaches', description: 'Створити тренера/суддю', tags: ['Coaches'], auth: true },
  { method: 'GET', path: '/api/admin/coaches/certificates', description: 'Сертифікати тренера', tags: ['Coaches'], auth: true },

  // Clubs
  { method: 'GET', path: '/api/clubs', description: 'Список клубів', tags: ['Clubs'], auth: false },
  { method: 'POST', path: '/api/admin/clubs', description: 'Створити клуб', tags: ['Clubs'], auth: true },

  // Competitions
  { method: 'GET', path: '/api/competitions', description: 'Список змагань', tags: ['Competitions'], auth: false },
  { method: 'POST', path: '/api/admin/competitions', description: 'Створити змагання', tags: ['Competitions'], auth: true },
  { method: 'POST', path: '/api/athlete-registration', description: 'Реєстрація на змагання', tags: ['Competitions'], auth: true },

  // News
  { method: 'GET', path: '/api/news', description: 'Список новин', tags: ['News'], auth: false },
  { method: 'POST', path: '/api/admin/news', description: 'Створити новину', tags: ['News'], auth: true },

  // Admin
  { method: 'GET', path: '/api/admin/users', description: 'Управління користувачами', tags: ['Admin'], auth: true },
  { method: 'GET', path: '/api/admin/logs', description: 'Логи дій адміністраторів', tags: ['Admin'], auth: true },
  { method: 'POST', path: '/api/admin/notifications', description: 'Відправка сповіщень', tags: ['Admin'], auth: true },
  { method: 'GET', path: '/api/admin/export', description: 'Експорт даних', tags: ['Admin'], auth: true },

  // System
  { method: 'GET', path: '/api/health', description: 'Перевірка здоров\'я системи', tags: ['System'], auth: false },
  { method: 'GET', path: '/api/docs', description: 'OpenAPI специфікація', tags: ['System'], auth: false }
];

const tagIcons = {
  Authentication: Shield,
  Athletes: Users,
  Coaches: Activity,
  Clubs: Building,
  Competitions: Trophy,
  News: FileText,
  Admin: Settings,
  System: Database
};

const tagColors = {
  Authentication: 'bg-blue-500',
  Athletes: 'bg-green-500',
  Coaches: 'bg-purple-500',
  Clubs: 'bg-orange-500',
  Competitions: 'bg-red-500',
  News: 'bg-yellow-500',
  Admin: 'bg-gray-500',
  System: 'bg-indigo-500'
};

const methodColors = {
  GET: 'bg-green-500',
  POST: 'bg-blue-500',
  PUT: 'bg-yellow-500',
  DELETE: 'bg-red-500',
  PATCH: 'bg-purple-500'
};

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'swagger'>('overview');
  const [swaggerSpec, setSwaggerSpec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Завантажуємо OpenAPI специфікацію
    fetch('/api/docs')
      .then(res => res.json())
      .then(spec => {
        setSwaggerSpec(spec);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load API spec:', err);
        setLoading(false);
      });
  }, []);

  const groupedEndpoints = apiEndpoints.reduce((acc, endpoint) => {
    endpoint.tags.forEach(tag => {
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(endpoint);
    });
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Code className="h-8 w-8 mr-3 text-blue-600" />
                FUSAF API Documentation
              </h1>
              <p className="text-gray-600 mt-2">
                Повна документація API для системи Федерації України зі Спортивної Аеробіки і Фітнесу
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overview')}
              >
                <Book className="h-4 w-4 mr-2" />
                Огляд
              </Button>
              <Button
                variant={activeTab === 'swagger' ? 'default' : 'outline'}
                onClick={() => setActiveTab('swagger')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Swagger UI
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/api/docs', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                OpenAPI JSON
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {/* API Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{apiEndpoints.length}</div>
                      <div className="text-sm text-gray-500">API Endpoints</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">JWT</div>
                      <div className="text-sm text-gray-500">Authentication</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Zap className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">v1.0</div>
                      <div className="text-sm text-gray-500">API Version</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">REST</div>
                      <div className="text-sm text-gray-500">API Style</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 Швидкий старт</CardTitle>
                <CardDescription>
                  Основні кроки для роботи з FUSAF API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">1. Отримання токена авторизації</h4>
                  <pre className="text-sm bg-black text-green-400 p-3 rounded overflow-x-auto">
{`curl -X POST https://fusaf.org.ua/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'`}
                  </pre>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">2. Використання токена в запитах</h4>
                  <pre className="text-sm bg-black text-green-400 p-3 rounded overflow-x-auto">
{`curl -X GET https://fusaf.org.ua/api/auth/profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}
                  </pre>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">3. Приклад відповіді</h4>
                  <pre className="text-sm bg-black text-green-400 p-3 rounded overflow-x-auto">
{`{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "roles": ["user"]
  },
  "message": "Profile retrieved successfully"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints by Category */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">📋 API Endpoints</h2>

              {Object.entries(groupedEndpoints).map(([tag, endpoints]) => {
                const IconComponent = tagIcons[tag as keyof typeof tagIcons] || Activity;
                const tagColor = tagColors[tag as keyof typeof tagColors] || 'bg-gray-500';

                return (
                  <Card key={tag}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <IconComponent className="h-5 w-5 mr-2" />
                        {tag}
                        <Badge className={`ml-2 ${tagColor}`}>
                          {endpoints.length} endpoints
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {endpoints.map((endpoint, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge className={methodColors[endpoint.method as keyof typeof methodColors]}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
                                {endpoint.path}
                              </code>
                              <span className="text-sm text-gray-600">
                                {endpoint.description}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {endpoint.auth && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Auth Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Authentication Guide */}
            <Card>
              <CardHeader>
                <CardTitle>🔐 Аутентифікація та авторизація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Типи ролей користувачів:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900">user</div>
                      <div className="text-sm text-blue-700">Звичайний користувач</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-900">athlete</div>
                      <div className="text-sm text-green-700">Спортсмен</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-900">coach</div>
                      <div className="text-sm text-purple-700">Тренер/суддя</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="font-medium text-orange-900">club_owner</div>
                      <div className="text-sm text-orange-700">Власник клубу</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="font-medium text-red-900">admin</div>
                      <div className="text-sm text-red-700">Адміністратор (повний доступ)</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Rate Limiting:</h4>
                  <div className="space-y-2">
                    <div className="text-sm">• Загальні запити: <strong>100 запитів/хвилину</strong></div>
                    <div className="text-sm">• Авторизація: <strong>10 спроб/хвилину</strong></div>
                    <div className="text-sm">• Адмін функції: <strong>50 запитів/хвилину</strong></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Завантаження Swagger UI...</span>
              </div>
            ) : swaggerSpec ? (
              <SwaggerUI
                spec={swaggerSpec}
                deepLinking={true}
                docExpansion="list"
                defaultModelsExpandDepth={2}
                defaultModelExpandDepth={2}
                displayRequestDuration={true}
                filter={true}
                showExtensions={true}
                showCommonExtensions={true}
                tryItOutEnabled={true}
                requestInterceptor={(request: any) => {
                  // Додати base URL для requests
                  if (!request.url.startsWith('http')) {
                    request.url = `${window.location.origin}${request.url}`;
                  }
                  return request;
                }}
              />
            ) : (
              <div className="p-8 text-center">
                <div className="text-red-600 mb-2">Помилка завантаження API специфікації</div>
                <Button onClick={() => window.location.reload()}>
                  Спробувати знову
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
