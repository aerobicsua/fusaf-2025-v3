"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Database,
  Mail,
  Shield,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Activity,
  Server,
  Globe,
  Zap,
  FileText,
  Users,
  BarChart3,
  Clock,
  HardDrive,
  Wifi,
  Eye,
  Bell
} from 'lucide-react';

interface SystemStatus {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connections: number;
    lastBackup: string;
  };
  email: {
    status: 'healthy' | 'warning' | 'error';
    sentToday: number;
    queueSize: number;
    lastEmail: string;
  };
  auth: {
    status: 'healthy' | 'warning' | 'error';
    activeUsers: number;
    failedLogins: number;
    lastLogin: string;
  };
  storage: {
    status: 'healthy' | 'warning' | 'error';
    usedSpace: number;
    totalSpace: number;
    filesCount: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    requestsToday: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

interface BackupInfo {
  id: string;
  type: 'full' | 'incremental';
  size: string;
  date: string;
  status: 'completed' | 'in_progress' | 'failed';
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  category: string;
  message: string;
  details?: string;
}

// Демо-дані системи
const demoSystemStatus: SystemStatus = {
  database: {
    status: 'healthy',
    responseTime: 15,
    connections: 12,
    lastBackup: '2025-01-07T02:00:00Z'
  },
  email: {
    status: 'healthy',
    sentToday: 45,
    queueSize: 3,
    lastEmail: '2025-01-07T10:30:00Z'
  },
  auth: {
    status: 'healthy',
    activeUsers: 8,
    failedLogins: 2,
    lastLogin: '2025-01-07T11:45:00Z'
  },
  storage: {
    status: 'warning',
    usedSpace: 7.2,
    totalSpace: 10,
    filesCount: 1543
  },
  api: {
    status: 'healthy',
    requestsToday: 2847,
    averageResponseTime: 120,
    errorRate: 0.5
  }
};

const demoBackups: BackupInfo[] = [
  {
    id: '1',
    type: 'full',
    size: '2.4 GB',
    date: '2025-01-07T02:00:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'incremental',
    size: '45 MB',
    date: '2025-01-06T02:00:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'full',
    size: '2.3 GB',
    date: '2025-01-05T02:00:00Z',
    status: 'completed'
  }
];

const demoLogs: SystemLog[] = [
  {
    id: '1',
    timestamp: '2025-01-07T11:45:23Z',
    level: 'info',
    category: 'Auth',
    message: 'Користувач успішно увійшов',
    details: 'maria.ivanenko@email.com з IP 192.168.1.100'
  },
  {
    id: '2',
    timestamp: '2025-01-07T11:30:15Z',
    level: 'warning',
    category: 'Storage',
    message: 'Використано 72% дискового простору',
    details: 'Рекомендується очищення старих файлів'
  },
  {
    id: '3',
    timestamp: '2025-01-07T10:30:45Z',
    level: 'info',
    category: 'Email',
    message: 'Відправлено email-сповіщення',
    details: 'Новий користувач зареєстрований'
  },
  {
    id: '4',
    timestamp: '2025-01-07T09:15:30Z',
    level: 'error',
    category: 'API',
    message: 'Помилка при обробці запиту',
    details: 'Timeout при з\'єднанні з зовнішнім сервісом'
  }
];

export function AdminSystemTab() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(demoSystemStatus);
  const [backups, setBackups] = useState<BackupInfo[]>(demoBackups);
  const [logs, setLogs] = useState<SystemLog[]>(demoLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    const statusConfig = {
      healthy: { label: 'Норма', color: 'bg-green-500' },
      warning: { label: 'Увага', color: 'bg-yellow-500' },
      error: { label: 'Помилка', color: 'bg-red-500' }
    };

    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getLogLevelBadge = (level: 'info' | 'warning' | 'error') => {
    const levelConfig = {
      info: { label: 'Інфо', color: 'bg-blue-500' },
      warning: { label: 'Увага', color: 'bg-yellow-500' },
      error: { label: 'Помилка', color: 'bg-red-500' }
    };

    const config = levelConfig[level];
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    // Симуляція оновлення статусу
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const handleCreateBackup = async () => {
    const newBackup: BackupInfo = {
      id: String(Date.now()),
      type: 'full',
      size: '2.5 GB',
      date: new Date().toISOString(),
      status: 'in_progress'
    };
    setBackups(prev => [newBackup, ...prev]);

    // Симуляція процесу резервного копіювання
    setTimeout(() => {
      setBackups(prev => prev.map(backup =>
        backup.id === newBackup.id
          ? { ...backup, status: 'completed' as const }
          : backup
      ));
    }, 5000);
  };

  const handleSendBroadcast = async () => {
    if (!emailSubject || !emailTemplate || !emailRecipients) {
      alert('Заповніть всі поля для розсилки');
      return;
    }

    // Симуляція відправки розсилки
    const newLog: SystemLog = {
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'Email',
      message: 'Розіслано масове повідомлення',
      details: `Тема: ${emailSubject}, Отримувачів: ${emailRecipients.split(',').length}`
    };

    setLogs(prev => [newLog, ...prev]);
    setEmailSubject('');
    setEmailTemplate('');
    setEmailRecipients('');
    alert('Розсилку відправлено успішно!');
  };

  return (
    <div className="space-y-6">
      {/* Загальний статус системи */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">База даних</p>
                <p className="text-lg font-bold">{systemStatus.database.responseTime}ms</p>
              </div>
              <div className="flex flex-col items-end">
                {getStatusIcon(systemStatus.database.status)}
                {getStatusBadge(systemStatus.database.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Email сервіс</p>
                <p className="text-lg font-bold">{systemStatus.email.sentToday}</p>
              </div>
              <div className="flex flex-col items-end">
                {getStatusIcon(systemStatus.email.status)}
                {getStatusBadge(systemStatus.email.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Аутентифікація</p>
                <p className="text-lg font-bold">{systemStatus.auth.activeUsers}</p>
              </div>
              <div className="flex flex-col items-end">
                {getStatusIcon(systemStatus.auth.status)}
                {getStatusBadge(systemStatus.auth.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Сховище</p>
                <p className="text-lg font-bold">{systemStatus.storage.usedSpace}GB</p>
              </div>
              <div className="flex flex-col items-end">
                {getStatusIcon(systemStatus.storage.status)}
                {getStatusBadge(systemStatus.storage.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API запити</p>
                <p className="text-lg font-bold">{systemStatus.api.requestsToday}</p>
              </div>
              <div className="flex flex-col items-end">
                {getStatusIcon(systemStatus.api.status)}
                {getStatusBadge(systemStatus.api.status)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальна інформація про систему */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Статус сервісів
              </span>
              <Button
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Оновити
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">База даних</p>
                    <p className="text-sm text-gray-600">
                      {systemStatus.database.connections} з'єднань •
                      Останній бекап: {new Date(systemStatus.database.lastBackup).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                </div>
                {getStatusBadge(systemStatus.database.status)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Email сервіс</p>
                    <p className="text-sm text-gray-600">
                      {systemStatus.email.sentToday} відправлено •
                      {systemStatus.email.queueSize} в черзі
                    </p>
                  </div>
                </div>
                {getStatusBadge(systemStatus.email.status)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Аутентифікація</p>
                    <p className="text-sm text-gray-600">
                      {systemStatus.auth.activeUsers} активних •
                      {systemStatus.auth.failedLogins} невдалих входів
                    </p>
                  </div>
                </div>
                {getStatusBadge(systemStatus.auth.status)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <HardDrive className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Сховище</p>
                    <p className="text-sm text-gray-600">
                      {systemStatus.storage.usedSpace}GB з {systemStatus.storage.totalSpace}GB •
                      {systemStatus.storage.filesCount} файлів
                    </p>
                  </div>
                </div>
                {getStatusBadge(systemStatus.storage.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Продуктивність API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Запитів сьогодні:</span>
                <span className="font-bold">{systemStatus.api.requestsToday.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Середній час відповіді:</span>
                <span className="font-bold">{systemStatus.api.averageResponseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Рівень помилок:</span>
                <span className="font-bold text-green-600">{systemStatus.api.errorRate}%</span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Режим обслуговування</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Увімкнути режим обслуговування</span>
                </div>
                {maintenanceMode && (
                  <Alert className="mt-2 bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Сайт буде недоступний для користувачів
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Резервні копії */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Резервні копії
            </span>
            <Button onClick={handleCreateBackup} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Створити бекап
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">
                      {backup.type === 'full' ? 'Повний бекап' : 'Інкрементальний'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(backup.date).toLocaleDateString('uk-UA')} • {backup.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {backup.status === 'completed' && (
                    <Badge className="bg-green-500 text-white">Завершено</Badge>
                  )}
                  {backup.status === 'in_progress' && (
                    <Badge className="bg-yellow-500 text-white">В процесі</Badge>
                  )}
                  {backup.status === 'failed' && (
                    <Badge className="bg-red-500 text-white">Помилка</Badge>
                  )}
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Розсилка повідомлень */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Масова розсилка
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-recipients">Отримувачі (через кому)</Label>
              <Input
                id="email-recipients"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="all, athletes, club_owners, coaches"
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Тема листа</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Важливе повідомлення від ФУСАФ"
              />
            </div>
            <div>
              <Label htmlFor="email-template">Текст повідомлення</Label>
              <Textarea
                id="email-template"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                placeholder="Введіть текст повідомлення..."
                rows={5}
              />
            </div>
            <Button onClick={handleSendBroadcast} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Відправити розсилку
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Журнал подій */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Журнал системних подій
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="pt-1">
                  {getLogLevelBadge(log.level)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{log.message}</p>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('uk-UA')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{log.category}</p>
                  {log.details && (
                    <p className="text-sm text-gray-700 mt-1">{log.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
