"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download,
  Users,
  Building,
  Trophy,
  AlertCircle,
  Database
} from 'lucide-react';
// Тип RoleRequest для TypeScript
interface RoleRequest {
  id: string;
  userEmail: string;
  userName: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewComment?: string;
}

const ROLE_ICONS = {
  athlete: Trophy,
  club_owner: Building,
  coach_judge: UserCheck
};

const ROLE_NAMES = {
  athlete: 'Спортсмен',
  club_owner: 'Власник клубу',
  coach_judge: 'Тренер/Суддя'
};

export function AdminRoleRequestsTab() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('🎛️ AdminRoleRequestsTab з HYBRID STORAGE:', {
    requestsCount: requests.length,
    loading,
    statusFilter,
    hasSelectedRequest: !!selectedRequest
  });

  // Завантаження запитів через API
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Завантаження через API, фільтр:', statusFilter);

      // Завантажуємо через публічний admin endpoint
      const response = await fetch(`/api/admin-requests${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`);

      if (response.ok) {
        const data = await response.json();
        const allRequests = data.requests || [];

        console.log('✅ Завантажено через API:', {
          total: allRequests.length,
          storageType: 'API_ENDPOINT',
          debug: data.debug
        });

        setRequests(allRequests);
      } else {
        console.error('❌ Помилка API відповіді:', response.status);
        setRequests([]);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження через API:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, fetchRequests]);

  // Обробка запиту (схвалення/відхилення) через API
  const handleRequestReview = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setIsProcessing(true);
      console.log('🔄 Обробка запиту через API:', { requestId, status });

      // Відправляємо запит на сервер
      const response = await fetch('/api/role-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status,
          comment: reviewComment.trim()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Запит оновлено через API:', result.message);

        // Оновлюємо список запитів
        await fetchRequests();
        setReviewDialogOpen(false);
        setSelectedRequest(null);
        setReviewComment('');

        // Показуємо повідомлення про успіх
        alert(`${status === 'approved' ? 'Запит схвалено' : 'Запит відхилено'}. Email сповіщення відправлено користувачу.`);
      } else {
        const error = await response.json();
        console.error('❌ Помилка API:', error);
        alert(`Помилка: ${error.error || 'Не вдалося оновити запит'}`);
      }
    } catch (error) {
      console.error('💥 Помилка при обробці запиту:', error);
      alert('Помилка при обробці запиту');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: {
        label: 'Очікує',
        icon: Clock,
        className: 'bg-yellow-500 text-white'
      },
      approved: {
        label: 'Схвалено',
        icon: CheckCircle,
        className: 'bg-green-500 text-white'
      },
      rejected: {
        label: 'Відхилено',
        icon: XCircle,
        className: 'bg-red-500 text-white'
      }
    };

    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRoleIcon = (role: string) => {
    const Icon = ROLE_ICONS[role as keyof typeof ROLE_ICONS] || Users;
    return <Icon className="h-4 w-4" />;
  };

  const getRoleName = (role: string) => {
    return ROLE_NAMES[role as keyof typeof ROLE_NAMES] || role;
  };

  const getStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    return {
      total,
      pending,
      approved,
      rejected,
      storageType: 'API_ENDPOINT',
      lastUpdate: new Date().toISOString()
    };
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Користувач,Email,Поточна роль,Запитувана роль,Статус,Дата запиту,Розглянув,Дата розгляду\n" +
      requests.map(req =>
        `"${req.userName}","${req.userEmail}","${getRoleName(req.currentRole)}","${getRoleName(req.requestedRole)}","${req.status}","${new Date(req.requestDate).toLocaleDateString('uk-UA')}","${req.reviewedBy || ''}","${req.reviewDate ? new Date(req.reviewDate).toLocaleDateString('uk-UA') : ''}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "role_requests_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Debug інформація з API */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-sm text-green-800 flex items-center">
            <Database className="h-4 w-4 mr-2" />
            🔥 API Централізація - Проблему синхронізації вирішено!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-green-700 space-y-1">
            <p>📊 Завантажено запитів: <strong>{requests.length}</strong></p>
            <p>🔄 Статус завантаження: <strong>{loading ? 'Завантажується...' : 'Завершено'}</strong></p>
            <p>🎛️ Фільтр: <strong>{statusFilter}</strong></p>
            <p>💾 Сховище: <strong>Admin API (/api/admin-requests)</strong></p>
            <p>✅ Синхронізація: <strong>Централізована через API</strong></p>
            <p>⏰ Останнє оновлення: <strong>{new Date().toLocaleTimeString('uk-UA')}</strong></p>
            <p className="text-green-600 font-semibold">
              🎉 Athlete ↔ Admin синхронізація!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всього запитів</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Очікують</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Схвалено</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Відхилено</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фільтри та дії */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Фільтри та дії
            </span>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Експорт CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <Label>Статус</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі запити</SelectItem>
                  <SelectItem value="pending">Очікують</SelectItem>
                  <SelectItem value="approved">Схвалені</SelectItem>
                  <SelectItem value="rejected">Відхилені</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця запитів */}
      <Card>
        <CardHeader>
          <CardTitle>
            Запити на ролі ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Користувач</TableHead>
                    <TableHead>Поточна роль</TableHead>
                    <TableHead>Запитувана роль</TableHead>
                    <TableHead>Дата запиту</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.userName}</p>
                          <p className="text-sm text-gray-500">{request.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(request.currentRole)}
                          <span>{getRoleName(request.currentRole)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(request.requestedRole)}
                          <span className="font-medium">{getRoleName(request.requestedRole)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString('uk-UA')}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Деталі запиту на роль</DialogTitle>
                                <DialogDescription>
                                  Детальна інформація про запит користувача
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Користувач</Label>
                                    <p className="font-medium">{request.userName}</p>
                                    <p className="text-sm text-gray-500">{request.userEmail}</p>
                                  </div>
                                  <div>
                                    <Label>Дата запиту</Label>
                                    <p>{new Date(request.requestDate).toLocaleString('uk-UA')}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Поточна роль</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      {getRoleIcon(request.currentRole)}
                                      <span>{getRoleName(request.currentRole)}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Запитувана роль</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      {getRoleIcon(request.requestedRole)}
                                      <span className="font-medium">{getRoleName(request.requestedRole)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label>Причина запиту</Label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm">{request.reason}</p>
                                  </div>
                                </div>

                                <div>
                                  <Label>Статус</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(request.status)}
                                  </div>
                                </div>

                                {request.reviewedBy && (
                                  <div className="border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Розглянув</Label>
                                        <p>{request.reviewedBy}</p>
                                      </div>
                                      <div>
                                        <Label>Дата розгляду</Label>
                                        <p>{request.reviewDate ? new Date(request.reviewDate).toLocaleString('uk-UA') : '-'}</p>
                                      </div>
                                    </div>

                                    {request.reviewComment && (
                                      <div className="mt-3">
                                        <Label>Коментар</Label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm">{request.reviewComment}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setReviewDialogOpen(true);
                                }}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Діалог розгляду запиту */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Розгляд запиту на роль</DialogTitle>
            <DialogDescription>
              Оберіть дію та додайте коментар (необов'язково)
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Інформація про запит:</h4>
                <p><strong>Користувач:</strong> {selectedRequest.userName}</p>
                <p><strong>Запитувана роль:</strong> {getRoleName(selectedRequest.requestedRole)}</p>
                <p><strong>Причина:</strong> {selectedRequest.reason}</p>
              </div>

              <div>
                <Label htmlFor="comment">Коментар (необов'язково)</Label>
                <Textarea
                  id="comment"
                  placeholder="Додайте коментар до рішення..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2">
            <Button
              onClick={() => selectedRequest && handleRequestReview(selectedRequest.id, 'rejected')}
              variant="outline"
              disabled={isProcessing}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <UserX className="h-4 w-4 mr-2" />
              {isProcessing ? 'Обробка...' : 'Відхилити'}
            </Button>
            <Button
              onClick={() => selectedRequest && handleRequestReview(selectedRequest.id, 'approved')}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {isProcessing ? 'Обробка...' : 'Схвалити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
