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
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Plus,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Building,
  Award,
  Calendar,
  MoreHorizontal,
  FileText
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  club: string;
  coach: string;
  sportCategory: string;
  experience: string;
  roles: string[];
  status: string;
  emailVerified: boolean;
  membershipPaid: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

interface UserStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  athletes: number;
  admins: number;
  coaches: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    region: '',
    page: 1,
    limit: 50
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/users?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setStats(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Помилка завантаження користувачів:', data.error);
      }
    } catch (error) {
      console.error('Помилка завантаження користувачів:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : prev.page // Скидаємо сторінку при зміні фільтрів
    }));
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleStatusToggle = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          updates: { status: newStatus }
        })
      });

      if (response.ok) {
        loadUsers(); // Перезавантажуємо список
      }
    } catch (error) {
      console.error('Помилка зміни статусу:', error);
    }
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          updates
        })
      });

      if (response.ok) {
        setEditDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (error) {
      console.error('Помилка оновлення користувача:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id })
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (error) {
      console.error('Помилка видалення користувача:', error);
    }
  };

  const handleExport = () => {
    window.open('/api/admin/export?type=users&format=csv', '_blank');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'athlete': return 'Спортсмен';
      case 'coach_judge': return 'Тренер/Суддя';
      case 'club_owner': return 'Власник клубу';
      case 'admin': return 'Адміністратор';
      default: return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Активний</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Очікує</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Заблокований</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPrimaryRole = (roles: string[]) => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('coach_judge')) return 'coach_judge';
    if (roles.includes('club_owner')) return 'club_owner';
    if (roles.includes('athlete')) return 'athlete';
    return 'user';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління користувачами</h1>
          <p className="text-gray-600 mt-1">
            Перегляд, редагування та управління всіма користувачами системи
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Додати користувача
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500">Всього</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-gray-500">Активних</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-gray-500">Очікують</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
              <p className="text-xs text-gray-500">Заблокованих</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.athletes}</div>
              <p className="text-xs text-gray-500">Спортсменів</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.coaches}</div>
              <p className="text-xs text-gray-500">Тренерів</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{stats.admins}</div>
              <p className="text-xs text-gray-500">Адмінів</p>
            </CardContent>
          </Card>
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
              <Label>Пошук</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ім'я, email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Статус</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі статуси" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі статуси</SelectItem>
                  <SelectItem value="active">Активні</SelectItem>
                  <SelectItem value="pending">Очікують</SelectItem>
                  <SelectItem value="suspended">Заблоковані</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Роль</Label>
              <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі ролі" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі ролі</SelectItem>
                  <SelectItem value="athlete">Спортсмени</SelectItem>
                  <SelectItem value="coach_judge">Тренери/Судді</SelectItem>
                  <SelectItem value="club_owner">Власники клубів</SelectItem>
                  <SelectItem value="admin">Адміністратори</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Регіон</Label>
              <Input
                placeholder="Регіон..."
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  role: '',
                  region: '',
                  page: 1,
                  limit: 50
                })}
                className="w-full"
              >
                Очистити
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця користувачів */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Користувачі ({users.length})
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
                    <TableHead>Користувач</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Локація</TableHead>
                    <TableHead>Клуб</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата реєстрації</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.roles.map(role => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {getRoleLabel(role)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.city && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              {user.city}, {user.region}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.club && (
                          <div className="flex items-center text-sm">
                            <Building className="h-3 w-3 mr-1 text-gray-400" />
                            {user.club}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(user.status)}
                          {user.membershipPaid && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Оплачено
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                          </div>
                          {user.lastLogin && (
                            <div className="text-xs text-gray-500">
                              Останній вхід: {new Date(user.lastLogin).toLocaleDateString('uk-UA')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusToggle(user)}
                            className={user.status === 'suspended' ? 'text-green-600' : 'text-yellow-600'}
                          >
                            {user.status === 'suspended' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                Показано {users.length} з {stats?.total || 0} користувачів
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

      {/* Діалог редагування */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редагування користувача</DialogTitle>
            <DialogDescription>
              Оновіть інформацію про користувача {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSave={handleUpdateUser}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Діалог видалення */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Підтвердження видалення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити користувача <strong>{selectedUser?.name}</strong>?
              Ця дія не може бути скасована.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Компонент форми редагування користувача
function EditUserForm({
  user,
  onSave,
  onCancel
}: {
  user: User;
  onSave: (updates: Partial<User>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    email: user.email,
    phone: user.phone,
    region: user.region,
    city: user.city,
    club: user.club,
    coach: user.coach,
    sportCategory: user.sportCategory,
    status: user.status,
    roles: user.roles,
    membershipPaid: user.membershipPaid,
    emailVerified: user.emailVerified
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ім'я</Label>
          <Input
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
        </div>
        <div>
          <Label>Прізвище</Label>
          <Input
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Телефон</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label>Статус</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Активний</SelectItem>
              <SelectItem value="pending">Очікує</SelectItem>
              <SelectItem value="suspended">Заблокований</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Регіон</Label>
          <Input
            value={formData.region}
            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
          />
        </div>
        <div>
          <Label>Місто</Label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>Клуб</Label>
        <Input
          value={formData.club}
          onChange={(e) => setFormData(prev => ({ ...prev, club: e.target.value }))}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.membershipPaid}
            onChange={(e) => setFormData(prev => ({ ...prev, membershipPaid: e.target.checked }))}
          />
          <span className="text-sm">Членство оплачено</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.emailVerified}
            onChange={(e) => setFormData(prev => ({ ...prev, emailVerified: e.target.checked }))}
          />
          <span className="text-sm">Email підтверджено</span>
        </label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Скасувати
        </Button>
        <Button type="submit">
          Зберегти зміни
        </Button>
      </DialogFooter>
    </form>
  );
}
