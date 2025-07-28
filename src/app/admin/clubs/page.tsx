"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Building,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  FileText,
  Eye
} from 'lucide-react';

interface Club {
  id: string;
  name: string;
  fullName: string;
  description: string;
  address: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  legalStatus: string;
  registrationNumber: string;
  foundingDate: string;
  membersCount: number;
  coachesCount: number;
  achievementsCount: number;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  membershipPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClubStats {
  total: number;
  active: number;
  pending: number;
  paid_members: number;
  avg_members: number;
  byRegion: { [key: string]: number };
}

const ukraineRegions = [
  'АР Крим', 'Вінницька область', 'Волинська область', 'Дніпропетровська область',
  'Донецька область', 'Житомирська область', 'Закарпатська область', 'Запорізька область',
  'Івано-Франківська область', 'Київська область', 'Кіровоградська область', 'Луганська область',
  'Львівська область', 'Миколаївська область', 'Одеська область', 'Полтавська область',
  'Рівненська область', 'Сумська область', 'Тернопільська область', 'Харківська область',
  'Херсонська область', 'Хмельницька область', 'Черкаська область', 'Чернівецька область',
  'Чернігівська область', 'м. Київ', 'м. Севастополь'
];

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    region: '',
    page: 1,
    limit: 50
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadClubs();
  }, [filters]);

  const loadClubs = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/clubs?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setClubs(data.clubs);
        setStats(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Помилка завантаження клубів:', data.error);
      }
    } catch (error) {
      console.error('Помилка завантаження клубів:', error);
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

  const handleCreateClub = () => {
    setSelectedClub(null);
    setCreateDialogOpen(true);
  };

  const handleEditClub = (club: Club) => {
    setSelectedClub(club);
    setEditDialogOpen(true);
  };

  const handleViewClub = (club: Club) => {
    setSelectedClub(club);
    setViewDialogOpen(true);
  };

  const handleDeleteClub = (club: Club) => {
    setSelectedClub(club);
    setDeleteDialogOpen(true);
  };

  const handleSaveClub = async (clubData: Partial<Club>, isCreate: boolean = false) => {
    try {
      const response = await fetch('/api/admin/clubs', {
        method: isCreate ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCreate ? clubData : {
          clubId: selectedClub?.id,
          updates: clubData
        })
      });

      if (response.ok) {
        setEditDialogOpen(false);
        setCreateDialogOpen(false);
        setSelectedClub(null);
        loadClubs();

        // Логуємо дію адміністратора
        await logAdminAction(
          isCreate ? 'CREATE_CLUB' : 'UPDATE_CLUB',
          'club',
          isCreate ? 'new' : selectedClub?.id || '',
          clubData
        );
      }
    } catch (error) {
      console.error('Помилка збереження клубу:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClub) return;

    try {
      const response = await fetch('/api/admin/clubs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: selectedClub.id })
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedClub(null);
        loadClubs();

        // Логуємо дію адміністратора
        await logAdminAction('DELETE_CLUB', 'club', selectedClub.id, { name: selectedClub.name });
      }
    } catch (error) {
      console.error('Помилка видалення клубу:', error);
    }
  };

  const logAdminAction = async (action: string, targetType: string, targetId: string, details: any) => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: 'current_admin_id', // TODO: отримати з контексту
          adminEmail: 'admin@fusaf.org.ua', // TODO: отримати з контексту
          action,
          targetType,
          targetId,
          details
        })
      });
    } catch (error) {
      console.error('Помилка логування:', error);
    }
  };

  const handleExport = () => {
    window.open('/api/admin/export?type=clubs&format=csv', '_blank');
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

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління клубами</h1>
          <p className="text-gray-600 mt-1">
            Реєстр спортивних клубів та організацій ФУСАФ
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
          <Button onClick={handleCreateClub}>
            <Plus className="h-4 w-4 mr-2" />
            Додати клуб
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500">Всього клубів</p>
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
              <div className="text-2xl font-bold text-purple-600">{stats.paid_members}</div>
              <p className="text-xs text-gray-500">Оплачено</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{Math.round(stats.avg_members || 0)}</div>
              <p className="text-xs text-gray-500">Середня кількість членів</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Пошук</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Назва клубу..."
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
              <Label>Регіон</Label>
              <Select value={filters.region} onValueChange={(value) => handleFilterChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі регіони" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі регіони</SelectItem>
                  {ukraineRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  status: '',
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

      {/* Таблиця клубів */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Клуби ({clubs.length})
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
                    <TableHead>Клуб</TableHead>
                    <TableHead>Локація</TableHead>
                    <TableHead>Контакти</TableHead>
                    <TableHead>Власник</TableHead>
                    <TableHead>Статистика</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{club.name}</div>
                          {club.fullName && club.fullName !== club.name && (
                            <div className="text-sm text-gray-500">{club.fullName}</div>
                          )}
                          {club.description && (
                            <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                              {club.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {club.city && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              {club.city}
                            </div>
                          )}
                          {club.region && (
                            <div className="text-gray-500">{club.region}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {club.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {club.phone}
                            </div>
                          )}
                          {club.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {club.email}
                            </div>
                          )}
                          {club.website && (
                            <div className="flex items-center">
                              <Globe className="h-3 w-3 mr-1 text-gray-400" />
                              <a href={club.website} target="_blank" rel="noopener noreferrer"
                                 className="text-blue-600 hover:underline">
                                Сайт
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {club.ownerName ? (
                          <div className="text-sm">
                            <div className="font-medium">{club.ownerName}</div>
                            <div className="text-gray-500">{club.ownerEmail}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Не призначено</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1 text-gray-400" />
                            {club.membersCount} членів
                          </div>
                          <div className="text-gray-500">
                            {club.coachesCount} тренерів
                          </div>
                          {club.achievementsCount > 0 && (
                            <div className="flex items-center text-yellow-600">
                              <Award className="h-3 w-3 mr-1" />
                              {club.achievementsCount} досягнень
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(club.status)}
                          {club.membershipPaid && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Оплачено
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewClub(club)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClub(club)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClub(club)}
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
                Показано {clubs.length} з {stats?.total || 0} клубів
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

      {/* Діалоги */}
      <ClubFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        club={null}
        onSave={(data) => handleSaveClub(data, true)}
        title="Створити новий клуб"
      />

      <ClubFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        club={selectedClub}
        onSave={(data) => handleSaveClub(data, false)}
        title="Редагувати клуб"
      />

      <ClubViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        club={selectedClub}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Підтвердження видалення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити клуб <strong>{selectedClub?.name}</strong>?
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

// Компонент форми клубу
function ClubFormDialog({
  open,
  onOpenChange,
  club,
  onSave,
  title
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: Club | null;
  onSave: (data: Partial<Club>) => void;
  title: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    description: '',
    city: '',
    region: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    legalStatus: '',
    registrationNumber: '',
    foundingDate: '',
    status: 'pending'
  });

  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || '',
        fullName: club.fullName || '',
        description: club.description || '',
        city: club.city || '',
        region: club.region || '',
        address: club.address || '',
        phone: club.phone || '',
        email: club.email || '',
        website: club.website || '',
        legalStatus: club.legalStatus || '',
        registrationNumber: club.registrationNumber || '',
        foundingDate: club.foundingDate || '',
        status: club.status || 'pending'
      });
    } else {
      setFormData({
        name: '',
        fullName: '',
        description: '',
        city: '',
        region: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        legalStatus: '',
        registrationNumber: '',
        foundingDate: '',
        status: 'pending'
      });
    }
  }, [club, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Назва клубу *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Повна назва</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Опис</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Місто</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label>Регіон</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть регіон" />
                </SelectTrigger>
                <SelectContent>
                  {ukraineRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Адреса</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Веб-сайт</Label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Правовий статус</Label>
              <Input
                value={formData.legalStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, legalStatus: e.target.value }))}
                placeholder="ФОП, ТОВ, ГО тощо"
              />
            </div>
            <div>
              <Label>Реєстраційний номер</Label>
              <Input
                value={formData.registrationNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата заснування</Label>
              <Input
                type="date"
                value={formData.foundingDate}
                onChange={(e) => setFormData(prev => ({ ...prev, foundingDate: e.target.value }))}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Скасувати
            </Button>
            <Button type="submit">
              Зберегти
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Компонент перегляду клубу
function ClubViewDialog({
  open,
  onOpenChange,
  club
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: Club | null;
}) {
  if (!club) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Деталі клубу</DialogTitle>
          <DialogDescription>
            Повна інформація про {club.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основна інформація */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Основна інформація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Назва</Label>
                  <div className="font-medium">{club.name}</div>
                </div>
                {club.fullName && (
                  <div>
                    <Label className="text-xs text-gray-500">Повна назва</Label>
                    <div>{club.fullName}</div>
                  </div>
                )}
                {club.description && (
                  <div>
                    <Label className="text-xs text-gray-500">Опис</Label>
                    <div className="text-sm">{club.description}</div>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-500">Статус</Label>
                  <div>{getStatusBadge(club.status)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Контактна інформація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {club.phone && (
                  <div>
                    <Label className="text-xs text-gray-500">Телефон</Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {club.phone}
                    </div>
                  </div>
                )}
                {club.email && (
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {club.email}
                    </div>
                  </div>
                )}
                {club.website && (
                  <div>
                    <Label className="text-xs text-gray-500">Веб-сайт</Label>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={club.website} target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:underline">
                        {club.website}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Локація та статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Локація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {club.city && (
                  <div>
                    <Label className="text-xs text-gray-500">Місто</Label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {club.city}
                    </div>
                  </div>
                )}
                {club.region && (
                  <div>
                    <Label className="text-xs text-gray-500">Регіон</Label>
                    <div>{club.region}</div>
                  </div>
                )}
                {club.address && (
                  <div>
                    <Label className="text-xs text-gray-500">Адреса</Label>
                    <div className="text-sm">{club.address}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Кількість членів</Label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    {club.membersCount}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Кількість тренерів</Label>
                  <div>{club.coachesCount}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Досягнення</Label>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-gray-400" />
                    {club.achievementsCount}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Юридична інформація */}
          {(club.legalStatus || club.registrationNumber || club.foundingDate) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Юридична інформація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {club.legalStatus && (
                  <div>
                    <Label className="text-xs text-gray-500">Правовий статус</Label>
                    <div>{club.legalStatus}</div>
                  </div>
                )}
                {club.registrationNumber && (
                  <div>
                    <Label className="text-xs text-gray-500">Реєстраційний номер</Label>
                    <div>{club.registrationNumber}</div>
                  </div>
                )}
                {club.foundingDate && (
                  <div>
                    <Label className="text-xs text-gray-500">Дата заснування</Label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(club.foundingDate).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Власник та дати */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {club.ownerName && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Власник</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Ім'я</Label>
                    <div className="font-medium">{club.ownerName}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <div>{club.ownerEmail}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Системна інформація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Дата створення</Label>
                  <div>{new Date(club.createdAt).toLocaleDateString('uk-UA')}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Останнє оновлення</Label>
                  <div>{new Date(club.updatedAt).toLocaleDateString('uk-UA')}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Членство оплачено</Label>
                  <div>{club.membershipPaid ? 'Так' : 'Ні'}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрити
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStatusBadge(status: string) {
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
}
