"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Activity,
  Shield,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Database,
  Globe
} from 'lucide-react';

interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface LogStats {
  total: number;
  unique_admins: number;
  creates: number;
  updates: number;
  deletes: number;
  today: number;
  byAction: { [key: string]: number };
  byAdmin: { [key: string]: number };
}

const actionCategories = {
  'CREATE_USER': { label: 'Створення користувача', color: 'green', icon: User },
  'UPDATE_USER': { label: 'Оновлення користувача', color: 'blue', icon: User },
  'DELETE_USER': { label: 'Видалення користувача', color: 'red', icon: User },
  'CREATE_CLUB': { label: 'Створення клубу', color: 'green', icon: Shield },
  'UPDATE_CLUB': { label: 'Оновлення клубу', color: 'blue', icon: Shield },
  'DELETE_CLUB': { label: 'Видалення клубу', color: 'red', icon: Shield },
  'CREATE_COMPETITION': { label: 'Створення змагання', color: 'green', icon: Activity },
  'UPDATE_COMPETITION': { label: 'Оновлення змагання', color: 'blue', icon: Activity },
  'DELETE_COMPETITION': { label: 'Видалення змагання', color: 'red', icon: Activity },
  'UPDATE_COMPETITION_STATUS': { label: 'Зміна статусу змагання', color: 'yellow', icon: Activity },
  'CREATE_NEWS': { label: 'Створення новини', color: 'green', icon: FileText },
  'UPDATE_NEWS': { label: 'Оновлення новини', color: 'blue', icon: FileText },
  'DELETE_NEWS': { label: 'Видалення новини', color: 'red', icon: FileText },
  'FEATURE_NEWS': { label: 'Рекомендована новина', color: 'yellow', icon: FileText },
  'PIN_NEWS': { label: 'Закріплення новини', color: 'purple', icon: FileText },
  'EXPORT_DATA': { label: 'Експорт даних', color: 'indigo', icon: Download },
  'LOGIN': { label: 'Вхід в систему', color: 'gray', icon: CheckCircle },
  'LOGOUT': { label: 'Вихід з системи', color: 'gray', icon: Clock },
  'SYSTEM_CHANGE': { label: 'Системні зміни', color: 'orange', icon: Settings }
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    admin_email: '',
    action: '',
    target_type: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 100
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/logs?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setStats(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Помилка завантаження логів:', data.error);
      }
    } catch (error) {
      console.error('Помилка завантаження логів:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : prev.page
    }));
  };

  const handleViewDetails = (log: AdminLog) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const handleClearOldLogs = async () => {
    if (!confirm('Ви впевнені, що хочете видалити логи старше 90 днів?')) return;

    try {
      const response = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 90 })
      });

      if (response.ok) {
        loadLogs();
      }
    } catch (error) {
      console.error('Помилка очистки логів:', error);
    }
  };

  const handleExport = () => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'page' && key !== 'limit') {
        queryParams.append(key, value.toString());
      }
    });

    window.open(`/api/admin/export?type=logs&format=csv&${queryParams}`, '_blank');
  };

  const getActionBadge = (action: string) => {
    const actionConfig = actionCategories[action as keyof typeof actionCategories] || {
      label: action,
      color: 'gray',
      icon: Activity
    };

    const colorClasses = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500 text-black',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
      orange: 'bg-orange-500',
      gray: 'bg-gray-500'
    };

    const IconComponent = actionConfig.icon;

    return (
      <Badge className={colorClasses[actionConfig.color as keyof typeof colorClasses]}>
        <IconComponent className="h-3 w-3 mr-1" />
        {actionConfig.label}
      </Badge>
    );
  };

  const getTargetTypeIcon = (targetType: string) => {
    switch (targetType) {
      case 'user': return <User className="h-4 w-4" />;
      case 'club': return <Shield className="h-4 w-4" />;
      case 'competition': return <Activity className="h-4 w-4" />;
      case 'news': return <FileText className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const formatUserAgent = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Інший';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Логи дій адміністраторів</h1>
          <p className="text-gray-600 mt-1">
            Аудит всіх дій адміністраторів в системі для безпеки та контролю
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
          <Button onClick={handleClearOldLogs} variant="outline" className="text-orange-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Очистити старі
          </Button>
          <Button onClick={loadLogs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Оновити
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500">Всього дій</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.unique_admins}</div>
              <p className="text-xs text-gray-500">Адміністраторів</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.creates}</div>
              <p className="text-xs text-gray-500">Створено</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.updates}</div>
              <p className="text-xs text-gray-500">Оновлено</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.deletes}</div>
              <p className="text-xs text-gray-500">Видалено</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.today}</div>
              <p className="text-xs text-gray-500">Сьогодні</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Топ адміністратори та дії */}
      {stats && (Object.keys(stats.byAdmin).length > 0 || Object.keys(stats.byAction).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(stats.byAdmin).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Активність адміністраторів</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byAdmin)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([admin, count]) => (
                      <div key={admin} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{admin}</span>
                        </div>
                        <Badge variant="secondary">{count} дій</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(stats.byAction).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Популярні дії</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byAction)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([action, count]) => (
                      <div key={action} className="flex justify-between items-center">
                        <div className="text-sm">{actionCategories[action as keyof typeof actionCategories]?.label || action}</div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Фільтри */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Фільтри та пошук
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Адміністратор</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Email адміністратора..."
                  value={filters.admin_email}
                  onChange={(e) => handleFilterChange('admin_email', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Дія</Label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі дії" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі дії</SelectItem>
                  {Object.entries(actionCategories).map(([action, config]) => (
                    <SelectItem key={action} value={action}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Тип об'єкта</Label>
              <Select value={filters.target_type} onValueChange={(value) => handleFilterChange('target_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі типи" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі типи</SelectItem>
                  <SelectItem value="user">Користувачі</SelectItem>
                  <SelectItem value="club">Клуби</SelectItem>
                  <SelectItem value="competition">Змагання</SelectItem>
                  <SelectItem value="news">Новини</SelectItem>
                  <SelectItem value="system">Система</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Дата від</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  admin_email: '',
                  action: '',
                  target_type: '',
                  date_from: '',
                  date_to: '',
                  page: 1,
                  limit: 100
                })}
                className="w-full"
              >
                Очистити
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця логів */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Логи дій ({logs.length})
            </div>
            <div className="text-sm text-gray-500">
              Сторінка {filters.page} з {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата/Час</TableHead>
                    <TableHead>Адміністратор</TableHead>
                    <TableHead>Дія</TableHead>
                    <TableHead>Об'єкт</TableHead>
                    <TableHead>IP/Браузер</TableHead>
                    <TableHead>Деталі</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {new Date(log.createdAt).toLocaleDateString('uk-UA')}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(log.createdAt).toLocaleTimeString('uk-UA')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-400" />
                            {log.adminEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTargetTypeIcon(log.targetType)}
                          <div className="text-sm">
                            <div className="capitalize">{log.targetType}</div>
                            {log.targetId && log.targetId !== 'new' && (
                              <div className="text-gray-500 text-xs font-mono">
                                {log.targetId.substring(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Globe className="h-3 w-3 mr-1 text-gray-400" />
                            {log.ipAddress}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {formatUserAgent(log.userAgent)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Пагінація */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Показано {logs.length} з {stats?.total || 0} логів
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => handleFilterChange('page', (filters.page - 1).toString())}
                >
                  Попередня
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= totalPages}
                  onClick={() => handleFilterChange('page', (filters.page + 1).toString())}
                >
                  Наступна
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Діалог деталей */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Деталі дії адміністратора</DialogTitle>
            <DialogDescription>
              Повна інформація про виконану дію
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              {/* Основна інформація */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Дата та час</Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(selectedLog.createdAt).toLocaleString('uk-UA')}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Адміністратор</Label>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedLog.adminEmail}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Дія</Label>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Тип об'єкта</Label>
                  <div className="flex items-center">
                    {getTargetTypeIcon(selectedLog.targetType)}
                    <span className="ml-2 capitalize">{selectedLog.targetType}</span>
                  </div>
                </div>
              </div>

              {/* Технічна інформація */}
              <div className="space-y-3">
                <h3 className="font-medium">Технічна інформація</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div>
                    <Label className="text-xs text-gray-500">ID об'єкта</Label>
                    <div className="font-mono text-sm">{selectedLog.targetId}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">IP адреса</Label>
                    <div className="font-mono text-sm">{selectedLog.ipAddress}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">User Agent</Label>
                    <div className="text-sm break-all">{selectedLog.userAgent}</div>
                  </div>
                </div>
              </div>

              {/* Деталі дії */}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Деталі дії</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Закрити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
