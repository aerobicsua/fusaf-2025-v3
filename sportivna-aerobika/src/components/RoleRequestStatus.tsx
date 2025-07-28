"use client";

import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, Building, UserCheck, Trophy, AlertCircle, RefreshCw, Bell } from "lucide-react";

const ROLE_NAMES = {
  athlete: 'Спортсмен',
  club_owner: 'Власник клубу',
  coach_judge: 'Тренер/Суддя'
};

const ROLE_ICONS = {
  athlete: Trophy,
  club_owner: Building,
  coach_judge: UserCheck
};

export function RoleRequestStatus() {
  const { data: session, update } = useSession();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [userRequest, setUserRequest] = useState(null);

  // Завантаження статусу користувача
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await fetch('/api/user-role-status');
        if (response.ok) {
          const data = await response.json();
          if (data.hasActiveRequest) {
            setUserRequest(data.roleRequest);
            // Оновлюємо сесію якщо потрібно
            if (true) { // Спрощена система - roleRequest відключений
              await update({
                roleRequest: data.roleRequest
              });
            }
          }
        }
      } catch (error) {
        console.error('Помилка завантаження статусу:', error);
      }
    };

    if (session?.user) { // Спрощена система
      fetchUserStatus();
    }
  }, [session, update]);

  // Auto-refresh для real-time оновлень
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, 30000); // Оновлення кожні 30 секунд

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Симуляція API запиту для оновлення статусу
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Помилка оновлення:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const request = userRequest; // Спрощена система

  if (!request) {
    return null;
  }
  const roleIcon = ROLE_ICONS[(request as any).requestedRole as keyof typeof ROLE_ICONS];
  const roleName = ROLE_NAMES[(request as any).requestedRole as keyof typeof ROLE_NAMES];
  const Icon = roleIcon || UserCheck;

  const getStatusConfig = () => {
    switch ((request as any).status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Запит на розгляді',
          description: `Ваш запит на роль "${roleName}" очікує розгляду адміністратором.`,
          badge: { text: 'Очікує', className: 'bg-yellow-500 text-white' },
          progress: 50
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Запит схвалено!',
          description: `Вітаємо! Ваш запит на роль "${roleName}" було схвалено. Тепер ви маєте повні права цієї ролі.`,
          badge: { text: 'Схвалено', className: 'bg-green-500 text-white' },
          progress: 100
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Запит відхилено',
          description: `На жаль, ваш запит на роль "${roleName}" було відхилено адміністратором.`,
          badge: { text: 'Відхилено', className: 'bg-red-500 text-white' },
          progress: 0
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Невідомий статус',
          description: 'Невідомий статус запиту.',
          badge: { text: 'Невідомо', className: 'bg-gray-500 text-white' },
          progress: 25
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const handleRequestNewRole = () => {
    window.location.reload();
  };

  return (
    <Card className={`border-2 ${config.borderColor} ${config.bgColor} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <span className={`text-lg font-semibold ${config.color}`}>
                {config.title}
              </span>
              <Badge className={`ml-3 ${config.badge.className}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.badge.text}
              </Badge>
            </div>
          </div>

          {/* Кнопки управління */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-blue-100 text-blue-700' : ''}
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="flex items-start space-x-2">
          <StatusIcon className={`h-4 w-4 ${config.color} mt-0.5 flex-shrink-0`} />
          <span>{config.description}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Прогрес бар */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Прогрес обробки</span>
            <span>{config.progress}%</span>
          </div>
          <Progress value={config.progress} className="h-2" />
        </div>

        {/* Інформація про запит */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Деталі запиту:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Запитувана роль:</span>
              <div className="flex items-center space-x-2 mt-1">
                <Icon className="h-4 w-4 text-gray-700" />
                <span className="font-medium">{roleName}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Дата подання:</span>
              <p className="font-medium mt-1">
                {new Date((request as any).requestDate).toLocaleDateString('uk-UA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Статус-специфічна інформація */}
        {(request as any).status === 'pending' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Зверніть увагу:</strong> Поки ваш запит розглядається, ви маєте права спортсмена.
              {autoRefresh && (
                <span className="block mt-1">
                  🔔 Автоматичне оновлення увімкнено. Ви отримаєте сповіщення про зміни.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {(request as any).status === 'approved' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Вітаємо!</strong> Тепер ви можете користуватися всіма функціями ролі "{roleName}".
              Оновіть сторінку, щоб побачити нові можливості.
            </AlertDescription>
          </Alert>
        )}

        {(request as any).status === 'rejected' && (
          <div className="space-y-3">
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Якщо ви вважаєте, що рішення було прийнято помилково, ви можете звернутися до адміністратора
                за додатковою інформацією або подати новий запит з додатковими обґрунтуваннями.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button
                onClick={handleRequestNewRole}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Подати новий запит
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <a href="mailto:info@fusaf.org.ua">
                  Зв'язатися з адміністратором
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Інформація про останнє оновлення */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>
              Маєте питання? Напишіть нам на{" "}
              <a
                href="mailto:info@fusaf.org.ua"
                className="text-blue-600 hover:underline"
              >
                info@fusaf.org.ua
              </a>
            </p>
            <p>
              Оновлено: {lastUpdate.toLocaleTimeString('uk-UA')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
