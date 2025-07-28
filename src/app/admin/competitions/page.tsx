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
  Trophy,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';

interface Competition {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  registrationDeadline: string;
  location: string;
  address: string;
  city: string;
  region: string;
  organizingClub: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  contactPerson: any;
  programFees: any;
  maxParticipantsByProgram: any;
  categories: string[];
  rules: string;
  status: string;
  registrations: {
    preliminary: number;
    individual: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CompetitionStats {
  total: number;
  draft: number;
  published: number;
  open: number;
  closed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  byRegion: { [key: string]: number };
}

const competitionCategories = [
  'YOUTH / 12-14 YEARS',
  'JUNIORS / 15-17 YEARS',
  'SENIORS 18+ YEARS',
  'ND (за потребою)',
  'NDmini (за потребою)',
  'MASTERS 35+',
  'MASTERS 50+'
];

const competitionStatuses = [
  { value: 'draft', label: 'Чернетка', color: 'gray' },
  { value: 'published', label: 'Опубліковано', color: 'blue' },
  { value: 'registration_open', label: 'Реєстрація відкрита', color: 'green' },
  { value: 'registration_closed', label: 'Реєстрація закрита', color: 'yellow' },
  { value: 'in_progress', label: 'Проводиться', color: 'purple' },
  { value: 'completed', label: 'Завершено', color: 'indigo' },
  { value: 'cancelled', label: 'Скасовано', color: 'red' }
];

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CompetitionStats | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    region: '',
    organizer: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 50
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCompetitions();
  }, [filters]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/competitions?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCompetitions(data.competitions);
        setStats(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Помилка завантаження змагань:', data.error);
      }
    } catch (error) {
      console.error('Помилка завантаження змагань:', error);
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

  const handleCreateCompetition = () => {
    setSelectedCompetition(null);
    setCreateDialogOpen(true);
  };

  const handleEditCompetition = (competition: Competition) => {
    setSelectedCompetition(competition);
    setEditDialogOpen(true);
  };

  const handleViewCompetition = (competition: Competition) => {
    setSelectedCompetition(competition);
    setViewDialogOpen(true);
  };

  const handleDeleteCompetition = (competition: Competition) => {
    setSelectedCompetition(competition);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = async (competition: Competition, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/competitions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: competition.id,
          updates: { status: newStatus }
        })
      });

      if (response.ok) {
        loadCompetitions();

        // Логуємо дію адміністратора
        await logAdminAction(
          'UPDATE_COMPETITION_STATUS',
          'competition',
          competition.id,
          { oldStatus: competition.status, newStatus, title: competition.title }
        );
      }
    } catch (error) {
      console.error('Помилка зміни статусу:', error);
    }
  };

  const handleSaveCompetition = async (competitionData: Partial<Competition>, isCreate: boolean = false) => {
    try {
      const response = await fetch('/api/admin/competitions', {
        method: isCreate ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCreate ? competitionData : {
          competitionId: selectedCompetition?.id,
          updates: competitionData
        })
      });

      if (response.ok) {
        setEditDialogOpen(false);
        setCreateDialogOpen(false);
        setSelectedCompetition(null);
        loadCompetitions();

        // Логуємо дію адміністратора
        await logAdminAction(
          isCreate ? 'CREATE_COMPETITION' : 'UPDATE_COMPETITION',
          'competition',
          isCreate ? 'new' : selectedCompetition?.id || '',
          competitionData
        );
      }
    } catch (error) {
      console.error('Помилка збереження змагання:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompetition) return;

    try {
      const response = await fetch('/api/admin/competitions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId: selectedCompetition.id })
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedCompetition(null);
        loadCompetitions();

        // Логуємо дію адміністратора
        await logAdminAction(
          'DELETE_COMPETITION',
          'competition',
          selectedCompetition.id,
          { title: selectedCompetition.title }
        );
      }
    } catch (error) {
      console.error('Помилка видалення змагання:', error);
    }
  };

  const logAdminAction = async (action: string, targetType: string, targetId: string, details: any) => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: 'current_admin_id',
          adminEmail: 'admin@fusaf.org.ua',
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
    window.open('/api/admin/export?type=competitions&format=csv', '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = competitionStatuses.find(s => s.value === status);
    if (!statusConfig) return <Badge variant="outline">{status}</Badge>;

    const colorClasses = {
      gray: 'bg-gray-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500 text-black',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
      red: 'bg-red-500'
    };

    return <Badge className={colorClasses[statusConfig.color as keyof typeof colorClasses]}>
      {statusConfig.label}
    </Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'published': return <Eye className="h-4 w-4" />;
      case 'registration_open': return <CheckCircle className="h-4 w-4" />;
      case 'registration_closed': return <XCircle className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <Trophy className="h-4 w-4" />;
      case 'cancelled': return <Square className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління змаганнями</h1>
          <p className="text-gray-600 mt-1">
            Календар змагань та турнірів ФУСАФ
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
          <Button onClick={handleCreateCompetition}>
            <Plus className="h-4 w-4 mr-2" />
            Створити змагання
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500">Всього</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.open}</div>
              <p className="text-xs text-gray-500">Відкрито</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.published}</div>
              <p className="text-xs text-gray-500">Опубліковано</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.in_progress}</div>
              <p className="text-xs text-gray-500">Проводиться</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{stats.completed}</div>
              <p className="text-xs text-gray-500">Завершено</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <p className="text-xs text-gray-500">Чернетки</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <p className="text-xs text-gray-500">Скасовано</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.closed}</div>
              <p className="text-xs text-gray-500">Закрито</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label>Пошук</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Назва змагання..."
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
                  {competitionStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
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

            <div>
              <Label>Організатор</Label>
              <Input
                placeholder="Клуб організатор..."
                value={filters.organizer}
                onChange={(e) => handleFilterChange('organizer', e.target.value)}
              />
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
                  search: '',
                  status: '',
                  region: '',
                  organizer: '',
                  date_from: '',
                  date_to: '',
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

      {/* Таблиця змагань */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Змагання ({competitions.length})
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
                    <TableHead>Змагання</TableHead>
                    <TableHead>Дата/Місце</TableHead>
                    <TableHead>Організатор</TableHead>
                    <TableHead>Реєстрації</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitions.map((competition) => (
                    <TableRow key={competition.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{competition.title}</div>
                          {competition.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                              {competition.description}
                            </div>
                          )}
                          {competition.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {competition.categories.slice(0, 2).map((category, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {competition.categories.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{competition.categories.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {new Date(competition.date).toLocaleDateString('uk-UA')}
                          </div>
                          {competition.time && (
                            <div className="flex items-center text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {competition.time}
                            </div>
                          )}
                          {competition.location && (
                            <div className="flex items-center text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {competition.city || competition.location}
                            </div>
                          )}
                          {competition.registrationDeadline && (
                            <div className="text-xs text-yellow-600 mt-1">
                              До: {new Date(competition.registrationDeadline).toLocaleDateString('uk-UA')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {competition.organizingClub && (
                            <div className="font-medium">{competition.organizingClub}</div>
                          )}
                          {competition.organizerName && (
                            <div className="text-gray-500">{competition.organizerName}</div>
                          )}
                          {competition.region && (
                            <div className="text-gray-400 text-xs">{competition.region}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1 text-gray-400" />
                            {competition.registrations.total} всього
                          </div>
                          <div className="text-gray-500 text-xs">
                            {competition.registrations.preliminary} попередні
                          </div>
                          <div className="text-gray-500 text-xs">
                            {competition.registrations.individual} іменні
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(competition.status)}

                          {/* Швидкі дії зміни статусу */}
                          <div className="flex flex-wrap gap-1">
                            {competition.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(competition, 'published')}
                                className="text-xs px-2 py-1 h-6"
                              >
                                Опублікувати
                              </Button>
                            )}
                            {competition.status === 'published' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(competition, 'registration_open')}
                                className="text-xs px-2 py-1 h-6 text-green-600"
                              >
                                Відкрити реєстрацію
                              </Button>
                            )}
                            {competition.status === 'registration_open' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(competition, 'registration_closed')}
                                className="text-xs px-2 py-1 h-6 text-yellow-600"
                              >
                                Закрити реєстрацію
                              </Button>
                            )}
                            {competition.status === 'registration_closed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(competition, 'in_progress')}
                                className="text-xs px-2 py-1 h-6 text-purple-600"
                              >
                                Почати змагання
                              </Button>
                            )}
                            {competition.status === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(competition, 'completed')}
                                className="text-xs px-2 py-1 h-6 text-indigo-600"
                              >
                                Завершити
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewCompetition(competition)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCompetition(competition)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCompetition(competition)}
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
                Показано {competitions.length} з {stats?.total || 0} змагань
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
      <CompetitionFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        competition={null}
        onSave={(data) => handleSaveCompetition(data, true)}
        title="Створити нове змагання"
      />

      <CompetitionFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        competition={selectedCompetition}
        onSave={(data) => handleSaveCompetition(data, false)}
        title="Редагувати змагання"
      />

      <CompetitionViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        competition={selectedCompetition}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Підтвердження видалення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити змагання <strong>{selectedCompetition?.title}</strong>?
              Всі пов'язані реєстрації також будуть видалені. Ця дія не може бути скасована.
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

// Компонент форми змагання
function CompetitionFormDialog({
  open,
  onOpenChange,
  competition,
  onSave,
  title
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: Competition | null;
  onSave: (data: Partial<Competition>) => void;
  title: string;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '10:00',
    registrationDeadline: '',
    location: '',
    address: '',
    city: '',
    region: '',
    organizingClub: '',
    rules: '',
    status: 'draft',
    categories: [] as string[],
    contactPerson: {
      name: '',
      phone: '',
      email: ''
    },
    programFees: {
      individual: 200,
      pairs: 300,
      group: 500
    }
  });

  useEffect(() => {
    if (competition) {
      setFormData({
        title: competition.title || '',
        description: competition.description || '',
        date: competition.date || '',
        time: competition.time || '10:00',
        registrationDeadline: competition.registrationDeadline || '',
        location: competition.location || '',
        address: competition.address || '',
        city: competition.city || '',
        region: competition.region || '',
        organizingClub: competition.organizingClub || '',
        rules: competition.rules || '',
        status: competition.status || 'draft',
        categories: competition.categories || [],
        contactPerson: competition.contactPerson || {
          name: '',
          phone: '',
          email: ''
        },
        programFees: competition.programFees || {
          individual: 200,
          pairs: 300,
          group: 500
        }
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '10:00',
        registrationDeadline: '',
        location: '',
        address: '',
        city: '',
        region: '',
        organizingClub: '',
        rules: '',
        status: 'draft',
        categories: [],
        contactPerson: {
          name: '',
          phone: '',
          email: ''
        },
        programFees: {
          individual: 200,
          pairs: 300,
          group: 500
        }
      });
    }
  }, [competition, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основна інформація */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основна інформація</h3>

            <div>
              <Label>Назва змагання *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
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
                <Label>Дата проведення *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Час початку</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Кінцевий термін реєстрації</Label>
              <Input
                type="date"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
              />
            </div>
          </div>

          {/* Локація */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Локація</h3>

            <div>
              <Label>Місце проведення *</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Палац спорту України"
                required
              />
            </div>

            <div>
              <Label>Адреса</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="вул. Велика Васильківська, 55"
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
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Організатор */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Організатор</h3>

            <div>
              <Label>Організуючий клуб</Label>
              <Input
                value={formData.organizingClub}
                onChange={(e) => setFormData(prev => ({ ...prev, organizingClub: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Контактна особа</Label>
                <Input
                  value={formData.contactPerson.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactPerson: { ...prev.contactPerson, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Телефон</Label>
                <Input
                  value={formData.contactPerson.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactPerson: { ...prev.contactPerson, phone: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.contactPerson.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactPerson: { ...prev.contactPerson, email: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Категорії */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Категорії</h3>
            <div className="grid grid-cols-2 gap-2">
              {competitionCategories.map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Внески */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Вартість участі (грн)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Індивідуальна програма</Label>
                <Input
                  type="number"
                  value={formData.programFees.individual}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    programFees: { ...prev.programFees, individual: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div>
                <Label>Змішані пари</Label>
                <Input
                  type="number"
                  value={formData.programFees.pairs}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    programFees: { ...prev.programFees, pairs: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div>
                <Label>Група</Label>
                <Input
                  type="number"
                  value={formData.programFees.group}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    programFees: { ...prev.programFees, group: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Правила та статус */}
          <div className="space-y-4">
            <div>
              <Label>Правила та умови</Label>
              <Textarea
                value={formData.rules}
                onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                rows={4}
                placeholder="Змагання проводяться згідно з правилами FIG..."
              />
            </div>

            <div>
              <Label>Статус</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {competitionStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
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

// Компонент перегляду змагання
function CompetitionViewDialog({
  open,
  onOpenChange,
  competition
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: Competition | null;
}) {
  if (!competition) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Деталі змагання</DialogTitle>
          <DialogDescription>
            Повна інформація про {competition.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Заголовок з статусом */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{competition.title}</h2>
              {competition.description && (
                <p className="text-gray-600 mt-2">{competition.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(competition.status)}
              {getStatusBadge(competition.status)}
            </div>
          </div>

          {/* Основна інформація */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Дата та час</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Дата проведення</Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(competition.date).toLocaleDateString('uk-UA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                {competition.time && (
                  <div>
                    <Label className="text-xs text-gray-500">Час початку</Label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {competition.time}
                    </div>
                  </div>
                )}
                {competition.registrationDeadline && (
                  <div>
                    <Label className="text-xs text-gray-500">Кінцевий термін реєстрації</Label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-red-400" />
                      {new Date(competition.registrationDeadline).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Локація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Місце проведення</Label>
                  <div className="font-medium">{competition.location}</div>
                </div>
                {competition.address && (
                  <div>
                    <Label className="text-xs text-gray-500">Адреса</Label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {competition.address}
                    </div>
                  </div>
                )}
                {competition.city && (
                  <div>
                    <Label className="text-xs text-gray-500">Місто/Регіон</Label>
                    <div>{competition.city}{competition.region && `, ${competition.region}`}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Організатор та контакти */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Організатор</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {competition.organizingClub && (
                  <div>
                    <Label className="text-xs text-gray-500">Клуб організатор</Label>
                    <div className="font-medium">{competition.organizingClub}</div>
                  </div>
                )}
                {competition.organizerName && (
                  <div>
                    <Label className="text-xs text-gray-500">Відповідальна особа</Label>
                    <div>{competition.organizerName}</div>
                    {competition.organizerEmail && (
                      <div className="text-sm text-gray-500">{competition.organizerEmail}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {competition.contactPerson && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Контактна інформація</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {competition.contactPerson.name && (
                    <div>
                      <Label className="text-xs text-gray-500">Контактна особа</Label>
                      <div className="font-medium">{competition.contactPerson.name}</div>
                    </div>
                  )}
                  {competition.contactPerson.phone && (
                    <div>
                      <Label className="text-xs text-gray-500">Телефон</Label>
                      <div>{competition.contactPerson.phone}</div>
                    </div>
                  )}
                  {competition.contactPerson.email && (
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <div>{competition.contactPerson.email}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Категорії та реєстрації */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competition.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Категорії</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {competition.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Реєстрації</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Всього заявок</Label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    {competition.registrations.total}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Попередні</Label>
                    <div>{competition.registrations.preliminary}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Іменні</Label>
                    <div>{competition.registrations.individual}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правила */}
          {competition.rules && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Правила та умови</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap">{competition.rules}</div>
              </CardContent>
            </Card>
          )}

          {/* Системна інформація */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Системна інформація</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-gray-500">Дата створення</Label>
                <div>{new Date(competition.createdAt).toLocaleDateString('uk-UA')}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Останнє оновлення</Label>
                <div>{new Date(competition.updatedAt).toLocaleDateString('uk-UA')}</div>
              </div>
            </CardContent>
          </Card>
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
  const statusConfig = competitionStatuses.find(s => s.value === status);
  if (!statusConfig) return <Badge variant="outline">{status}</Badge>;

  const colorClasses = {
    gray: 'bg-gray-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500 text-black',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500'
  };

  return <Badge className={colorClasses[statusConfig.color as keyof typeof colorClasses]}>
    {statusConfig.label}
  </Badge>;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'draft': return <FileText className="h-4 w-4" />;
    case 'published': return <Eye className="h-4 w-4" />;
    case 'registration_open': return <CheckCircle className="h-4 w-4" />;
    case 'registration_closed': return <XCircle className="h-4 w-4" />;
    case 'in_progress': return <Play className="h-4 w-4" />;
    case 'completed': return <Trophy className="h-4 w-4" />;
    case 'cancelled': return <Square className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
}
