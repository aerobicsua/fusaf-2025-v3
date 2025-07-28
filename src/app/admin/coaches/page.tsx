"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  User,
  Award,
  FileText,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  Globe,
  AlertTriangle,
  Star,
  Users,
  Trophy,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface Coach {
  id: string;
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  region: string;
  city: string;
  address: string;
  coachType: string;
  qualificationLevel: string;
  licenseNumber: string;
  licenseIssuedDate: string;
  licenseExpiryDate: string;
  licenseStatus: string;
  qualifications: string[];
  specializations: string[];
  experienceYears: number;
  primaryClub: string;
  employmentStatus: string;
  documents: any[];
  photoUrl: string;
  website: string;
  socialMedia: any;
  athletesTrained: number;
  competitionsJudged: number;
  achievements: any[];
  certificates: any[];
  certificatesCount: number;
  validCertificates: number;
  status: string;
  emailVerified: boolean;
  profileVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CoachStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  coaches: number;
  judges: number;
  both: number;
  active_licenses: number;
  expired_licenses: number;
  avg_experience: number;
  byRegion: { [key: string]: number };
  byQualification: { [key: string]: number };
}

const coachTypes = [
  { value: 'coach', label: 'Тренер', icon: Users },
  { value: 'judge', label: 'Суддя', icon: Shield },
  { value: 'both', label: 'Тренер/Суддя', icon: Award }
];

const qualificationLevels = [
  'Початківець',
  'III категорія',
  'II категорія',
  'I категорія',
  'Кандидат у майстри спорту',
  'Майстер спорту',
  'Майстер спорту міжнародного класу',
  'Заслужений майстер спорту',
  'Заслужений тренер України',
  'Міжнародна категорія'
];

const specializations = [
  'Спортивна аеробіка',
  'Степ-аеробіка',
  'Фітнес-аеробіка',
  'Акробатична аеробіка',
  'Танцювальна аеробіка',
  'Групові програми',
  'Індивідуальні програми',
  'Парні програми',
  'Тріо програми',
  'Групи 5+',
  'Аеробіка молодших',
  'Юнацька аеробіка',
  'Доросла аеробіка',
  'Ветеранська аеробіка'
];

const licenseStatuses = [
  { value: 'active', label: 'Активна', color: 'green' },
  { value: 'expired', label: 'Закінчилась', color: 'red' },
  { value: 'suspended', label: 'Призупинена', color: 'yellow' },
  { value: 'revoked', label: 'Анульована', color: 'gray' }
];

const employmentStatuses = [
  { value: 'full_time', label: 'Повна зайнятість' },
  { value: 'part_time', label: 'Часткова зайнятість' },
  { value: 'volunteer', label: 'Волонтер' },
  { value: 'retired', label: 'На пенсії' }
];

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CoachStats | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [certificatesDialogOpen, setCertificatesDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    qualification: '',
    specialization: '',
    region: '',
    license_status: '',
    page: 1,
    limit: 50
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCoaches();
  }, [filters]);

  const loadCoaches = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/coaches?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCoaches(data.coaches);
        setStats(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Помилка завантаження тренерів/суддів:', data.error);
      }
    } catch (error) {
      console.error('Помилка завантаження тренерів/суддів:', error);
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

  const handleCreateCoach = () => {
    setSelectedCoach(null);
    setCreateDialogOpen(true);
  };

  const handleEditCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setEditDialogOpen(true);
  };

  const handleViewDetails = (coach: Coach) => {
    setSelectedCoach(coach);
    setDetailsDialogOpen(true);
  };

  const handleViewCertificates = (coach: Coach) => {
    setSelectedCoach(coach);
    setCertificatesDialogOpen(true);
  };

  const handleDeleteCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = async (coach: Coach, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/coaches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: coach.id,
          updates: { status: newStatus }
        })
      });

      if (response.ok) {
        loadCoaches();
        await logAdminAction(
          'UPDATE_COACH_STATUS',
          'coach',
          coach.id,
          { oldStatus: coach.status, newStatus, name: coach.fullName }
        );
      }
    } catch (error) {
      console.error('Помилка зміни статусу:', error);
    }
  };

  const handleSaveCoach = async (coachData: Partial<Coach>, isCreate: boolean = false) => {
    try {
      const response = await fetch('/api/admin/coaches', {
        method: isCreate ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCreate ? coachData : {
          coachId: selectedCoach?.id,
          updates: coachData
        })
      });

      if (response.ok) {
        setEditDialogOpen(false);
        setCreateDialogOpen(false);
        setSelectedCoach(null);
        loadCoaches();

        await logAdminAction(
          isCreate ? 'CREATE_COACH' : 'UPDATE_COACH',
          'coach',
          isCreate ? 'new' : selectedCoach?.id || '',
          coachData
        );
      }
    } catch (error) {
      console.error('Помилка збереження тренера/судді:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCoach) return;

    try {
      const response = await fetch('/api/admin/coaches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId: selectedCoach.id })
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedCoach(null);
        loadCoaches();

        await logAdminAction(
          'DELETE_COACH',
          'coach',
          selectedCoach.id,
          { name: selectedCoach.fullName }
        );
      }
    } catch (error) {
      console.error('Помилка видалення тренера/судді:', error);
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
    window.open('/api/admin/export?type=coaches&format=csv', '_blank');
  };

  const getCoachTypeBadge = (type: string) => {
    const typeConfig = coachTypes.find(t => t.value === type);
    if (!typeConfig) return <Badge variant="outline">{type}</Badge>;

    const IconComponent = typeConfig.icon;
    return (
      <Badge variant="secondary">
        <IconComponent className="h-3 w-3 mr-1" />
        {typeConfig.label}
      </Badge>
    );
  };

  const getLicenseStatusBadge = (status: string) => {
    const statusConfig = licenseStatuses.find(s => s.value === status);
    if (!statusConfig) return <Badge variant="outline">{status}</Badge>;

    const colorClasses = {
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500 text-black',
      gray: 'bg-gray-500'
    };

    return (
      <Badge className={colorClasses[statusConfig.color as keyof typeof colorClasses]}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Активний</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Очікує</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Призупинений</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-600">Неактивний</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const isLicenseExpiring = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління тренерами та суддями</h1>
          <p className="text-gray-600 mt-1">
            Реєстр кваліфікованих тренерів та суддів ФУСАФ з сертифікатами та ліцензіями
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
          <Button onClick={handleCreateCoach}>
            <Plus className="h-4 w-4 mr-2" />
            Додати тренера/суддю
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
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
              <div className="text-2xl font-bold text-purple-600">{stats.coaches}</div>
              <p className="text-xs text-gray-500">Тренерів</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{stats.judges}</div>
              <p className="text-xs text-gray-500">Суддів</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.both}</div>
              <p className="text-xs text-gray-500">Тренер/Суддя</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">{stats.active_licenses}</div>
              <p className="text-xs text-gray-500">Активні ліцензії</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.expired_licenses}</div>
              <p className="text-xs text-gray-500">Прострочені</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-cyan-600">{Math.round(stats.avg_experience || 0)}</div>
              <p className="text-xs text-gray-500">Середній стаж</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-pink-600">{stats.suspended}</div>
              <p className="text-xs text-gray-500">Призупинених</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Статистика по регіонах та кваліфікаціях */}
      {stats && (Object.keys(stats.byRegion).length > 0 || Object.keys(stats.byQualification).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(stats.byRegion).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">По регіонах</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byRegion)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([region, count]) => (
                      <div key={region} className="flex justify-between">
                        <span className="text-sm">{region}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(stats.byQualification).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">По кваліфікаціях</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byQualification)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([qualification, count]) => (
                      <div key={qualification} className="flex justify-between">
                        <span className="text-sm">{qualification}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label>Пошук</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ім'я, email, клуб..."
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
                  <SelectItem value="suspended">Призупинені</SelectItem>
                  <SelectItem value="inactive">Неактивні</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Кваліфікація</Label>
              <Select value={filters.qualification} onValueChange={(value) => handleFilterChange('qualification', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі кваліфікації" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі кваліфікації</SelectItem>
                  {qualificationLevels.map((qualification) => (
                    <SelectItem key={qualification} value={qualification}>
                      {qualification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Спеціалізація</Label>
              <Select value={filters.specialization} onValueChange={(value) => handleFilterChange('specialization', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі спеціалізації" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі спеціалізації</SelectItem>
                  {specializations.map((specialization) => (
                    <SelectItem key={specialization} value={specialization}>
                      {specialization}
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

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  qualification: '',
                  specialization: '',
                  region: '',
                  license_status: '',
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

      {/* Таблиця тренерів/суддів */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Тренери та судді ({coaches.length})
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
                    <TableHead>Тренер/Суддя</TableHead>
                    <TableHead>Тип/Кваліфікація</TableHead>
                    <TableHead>Ліцензія</TableHead>
                    <TableHead>Локація</TableHead>
                    <TableHead>Досвід/Статистика</TableHead>
                    <TableHead>Сертифікати</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coaches.map((coach) => (
                    <TableRow key={coach.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {coach.photoUrl ? (
                              <img src={coach.photoUrl} alt={coach.fullName} className="w-10 h-10 rounded-full" />
                            ) : (
                              <User className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{coach.fullName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {coach.email}
                            </div>
                            {coach.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {coach.phone}
                              </div>
                            )}
                            {coach.dateOfBirth && (
                              <div className="text-xs text-gray-400">
                                {calculateAge(coach.dateOfBirth)} років
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getCoachTypeBadge(coach.coachType)}
                          {coach.qualificationLevel && (
                            <div>
                              <Badge variant="outline" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {coach.qualificationLevel}
                              </Badge>
                            </div>
                          )}
                          {coach.specializations.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {coach.specializations.slice(0, 2).join(', ')}
                              {coach.specializations.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getLicenseStatusBadge(coach.licenseStatus)}
                          {coach.licenseNumber && (
                            <div className="text-xs text-gray-500 font-mono">
                              {coach.licenseNumber}
                            </div>
                          )}
                          {coach.licenseExpiryDate && (
                            <div className={`text-xs ${
                              isLicenseExpiring(coach.licenseExpiryDate) ? 'text-orange-600' : 'text-gray-500'
                            }`}>
                              До: {new Date(coach.licenseExpiryDate).toLocaleDateString('uk-UA')}
                              {isLicenseExpiring(coach.licenseExpiryDate) && (
                                <AlertTriangle className="h-3 w-3 inline ml-1" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {coach.city && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              {coach.city}
                            </div>
                          )}
                          {coach.region && (
                            <div className="text-gray-500">{coach.region}</div>
                          )}
                          {coach.primaryClub && (
                            <div className="flex items-center text-gray-500 mt-1">
                              <Building className="h-3 w-3 mr-1" />
                              {coach.primaryClub}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-400" />
                            {coach.experienceYears} років
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {coach.athletesTrained} спортсменів
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Trophy className="h-3 w-3 mr-1" />
                            {coach.competitionsJudged} змагань
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center">
                            <CreditCard className="h-3 w-3 mr-1 text-gray-400" />
                            {coach.certificatesCount} всього
                          </div>
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {coach.validCertificates} дійсних
                          </div>
                          {coach.certificatesCount > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewCertificates(coach)}
                              className="text-xs h-6"
                            >
                              Переглянути
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(coach.status)}

                          {/* Швидкі дії зміни статусу */}
                          <div className="flex flex-wrap gap-1">
                            {coach.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(coach, 'active')}
                                className="text-xs px-2 py-1 h-6 text-green-600"
                              >
                                Активувати
                              </Button>
                            )}
                            {coach.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(coach, 'suspended')}
                                className="text-xs px-2 py-1 h-6 text-yellow-600"
                              >
                                Призупинити
                              </Button>
                            )}
                            {coach.status === 'suspended' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(coach, 'active')}
                                className="text-xs px-2 py-1 h-6 text-green-600"
                              >
                                Відновити
                              </Button>
                            )}
                          </div>

                          {/* Верифікація */}
                          <div className="flex space-x-1">
                            {coach.emailVerified && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Email ✓
                              </Badge>
                            )}
                            {coach.profileVerified && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                Профіль ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(coach)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCoach(coach)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCoach(coach)}
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
                Показано {coaches.length} з {stats?.total || 0} тренерів/суддів
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
      <CoachFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        coach={null}
        onSave={(data) => handleSaveCoach(data, true)}
        title="Створити нового тренера/суддю"
      />

      <CoachFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        coach={selectedCoach}
        onSave={(data) => handleSaveCoach(data, false)}
        title="Редагувати тренера/суддю"
      />

      <CoachDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        coach={selectedCoach}
      />

      <CertificatesDialog
        open={certificatesDialogOpen}
        onOpenChange={setCertificatesDialogOpen}
        coach={selectedCoach}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Підтвердження видалення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити тренера/суддю <strong>{selectedCoach?.fullName}</strong>?
              Всі пов'язані сертифікати також будуть видалені. Ця дія не може бути скасована.
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

// Компонент форми тренера/судді
function CoachFormDialog({
  open,
  onOpenChange,
  coach,
  onSave,
  title
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: Coach | null;
  onSave: (data: Partial<Coach>) => void;
  title: string;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    country: 'Україна',
    region: '',
    city: '',
    address: '',
    coachType: 'coach',
    qualificationLevel: '',
    licenseNumber: '',
    licenseIssuedDate: '',
    licenseExpiryDate: '',
    licenseStatus: 'active',
    experienceYears: 0,
    primaryClub: '',
    employmentStatus: 'full_time',
    photoUrl: '',
    website: '',
    athletesTrained: 0,
    competitionsJudged: 0,
    status: 'pending',
    qualifications: [] as string[],
    specializations: [] as string[]
  });

  useEffect(() => {
    if (coach) {
      setFormData({
        firstName: coach.firstName || '',
        lastName: coach.lastName || '',
        middleName: coach.middleName || '',
        email: coach.email || '',
        phone: coach.phone || '',
        dateOfBirth: coach.dateOfBirth || '',
        gender: coach.gender || 'male',
        country: coach.country || 'Україна',
        region: coach.region || '',
        city: coach.city || '',
        address: coach.address || '',
        coachType: coach.coachType || 'coach',
        qualificationLevel: coach.qualificationLevel || '',
        licenseNumber: coach.licenseNumber || '',
        licenseIssuedDate: coach.licenseIssuedDate || '',
        licenseExpiryDate: coach.licenseExpiryDate || '',
        licenseStatus: coach.licenseStatus || 'active',
        experienceYears: coach.experienceYears || 0,
        primaryClub: coach.primaryClub || '',
        employmentStatus: coach.employmentStatus || 'full_time',
        photoUrl: coach.photoUrl || '',
        website: coach.website || '',
        athletesTrained: coach.athletesTrained || 0,
        competitionsJudged: coach.competitionsJudged || 0,
        status: coach.status || 'pending',
        qualifications: coach.qualifications || [],
        specializations: coach.specializations || []
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'male',
        country: 'Україна',
        region: '',
        city: '',
        address: '',
        coachType: 'coach',
        qualificationLevel: '',
        licenseNumber: '',
        licenseIssuedDate: '',
        licenseExpiryDate: '',
        licenseStatus: 'active',
        experienceYears: 0,
        primaryClub: '',
        employmentStatus: 'full_time',
        photoUrl: '',
        website: '',
        athletesTrained: 0,
        competitionsJudged: 0,
        status: 'pending',
        qualifications: [],
        specializations: []
      });
    }
  }, [coach, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleQualificationToggle = (qualification: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(qualification)
        ? prev.qualifications.filter(q => q !== qualification)
        : [...prev.qualifications, qualification]
    }));
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList>
              <TabsTrigger value="personal">Особисті дані</TabsTrigger>
              <TabsTrigger value="professional">Професійні дані</TabsTrigger>
              <TabsTrigger value="qualifications">Кваліфікації</TabsTrigger>
              <TabsTrigger value="additional">Додаткова інформація</TabsTrigger>
            </TabsList>

            {/* Особисті дані */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Прізвище *</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Ім'я *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>По-батькові</Label>
                  <Input
                    value={formData.middleName}
                    onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Телефон</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Дата народження</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Стать</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Чоловік</SelectItem>
                      <SelectItem value="female">Жінка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Країна</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
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
                <Label>Адреса</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </TabsContent>

            {/* Професійні дані */}
            <TabsContent value="professional" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Тип діяльності</Label>
                  <Select value={formData.coachType} onValueChange={(value) => setFormData(prev => ({ ...prev, coachType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {coachTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Рівень кваліфікації</Label>
                  <Select value={formData.qualificationLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, qualificationLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualificationLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Номер ліцензії</Label>
                  <Input
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Статус ліцензії</Label>
                  <Select value={formData.licenseStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, licenseStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {licenseStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Дата видачі ліцензії</Label>
                  <Input
                    type="date"
                    value={formData.licenseIssuedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseIssuedDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Дата закінчення ліцензії</Label>
                  <Input
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseExpiryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Досвід (років)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Статус зайнятості</Label>
                  <Select value={formData.employmentStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, employmentStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Основний клуб</Label>
                <Input
                  value={formData.primaryClub}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryClub: e.target.value }))}
                />
              </div>
            </TabsContent>

            {/* Кваліфікації */}
            <TabsContent value="qualifications" className="space-y-4">
              <div>
                <Label className="text-lg font-medium">Додаткові кваліфікації</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {qualificationLevels.map((qualification) => (
                    <label key={qualification} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.qualifications.includes(qualification)}
                        onCheckedChange={() => handleQualificationToggle(qualification)}
                      />
                      <span className="text-sm">{qualification}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-lg font-medium">Спеціалізації</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {specializations.map((specialization) => (
                    <label key={specialization} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.specializations.includes(specialization)}
                        onCheckedChange={() => handleSpecializationToggle(specialization)}
                      />
                      <span className="text-sm">{specialization}</span>
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Додаткова інформація */}
            <TabsContent value="additional" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>URL фотографії</Label>
                  <Input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div>
                  <Label>Веб-сайт</Label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Підготовлено спортсменів</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.athletesTrained}
                    onChange={(e) => setFormData(prev => ({ ...prev, athletesTrained: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Суддівство змагань</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.competitionsJudged}
                    onChange={(e) => setFormData(prev => ({ ...prev, competitionsJudged: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label>Статус</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Очікує перевірки</SelectItem>
                    <SelectItem value="active">Активний</SelectItem>
                    <SelectItem value="suspended">Призупинений</SelectItem>
                    <SelectItem value="inactive">Неактивний</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

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

// Компонент перегляду деталей тренера/судді
function CoachDetailsDialog({
  open,
  onOpenChange,
  coach
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: Coach | null;
}) {
  if (!coach) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Деталі тренера/судді</DialogTitle>
          <DialogDescription>
            Повна інформація про {coach.fullName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основна інформація з фото */}
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              {coach.photoUrl ? (
                <img src={coach.photoUrl} alt={coach.fullName} className="w-24 h-24 rounded-lg object-cover" />
              ) : (
                <User className="h-12 w-12 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{coach.fullName}</h2>
              <div className="flex space-x-2 mt-2">
                {getCoachTypeBadge(coach.coachType)}
                {getLicenseStatusBadge(coach.licenseStatus)}
                {getStatusBadge(coach.status)}
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {coach.email}
                </div>
                {coach.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {coach.phone}
                  </div>
                )}
                {coach.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <a href={coach.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {coach.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Деталізована інформація в таблицях */}
          <Tabs defaultValue="professional" className="space-y-4">
            <TabsList>
              <TabsTrigger value="professional">Професійна інформація</TabsTrigger>
              <TabsTrigger value="personal">Особисті дані</TabsTrigger>
              <TabsTrigger value="qualifications">Кваліфікації</TabsTrigger>
              <TabsTrigger value="statistics">Статистика</TabsTrigger>
            </TabsList>

            <TabsContent value="professional">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ліцензія та кваліфікація</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Рівень кваліфікації</Label>
                      <div className="font-medium">{coach.qualificationLevel || 'Не вказано'}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Номер ліцензії</Label>
                      <div className="font-mono">{coach.licenseNumber || 'Не вказано'}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Дата видачі</Label>
                      <div>{coach.licenseIssuedDate ? new Date(coach.licenseIssuedDate).toLocaleDateString('uk-UA') : 'Не вказано'}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Дата закінчення</Label>
                      <div>{coach.licenseExpiryDate ? new Date(coach.licenseExpiryDate).toLocaleDateString('uk-UA') : 'Не вказано'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Робота та досвід</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Основний клуб</Label>
                      <div className="font-medium">{coach.primaryClub || 'Не вказано'}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Статус зайнятості</Label>
                      <div>{employmentStatuses.find(s => s.value === coach.employmentStatus)?.label || coach.employmentStatus}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Досвід роботи</Label>
                      <div>{coach.experienceYears} років</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="personal">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Особиста інформація</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Дата народження</Label>
                      <div>{coach.dateOfBirth ? new Date(coach.dateOfBirth).toLocaleDateString('uk-UA') : 'Не вказано'}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Стать</Label>
                      <div>{coach.gender === 'male' ? 'Чоловік' : 'Жінка'}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Вік</Label>
                      <div>{coach.dateOfBirth ? calculateAge(coach.dateOfBirth) + ' років' : 'Не вказано'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Локація</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Країна</Label>
                      <div>{coach.country}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Регіон</Label>
                      <div>{coach.region || 'Не вказано'}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Місто</Label>
                      <div>{coach.city || 'Не вказано'}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Адреса</Label>
                      <div>{coach.address || 'Не вказано'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="qualifications">
              <div className="space-y-6">
                {coach.qualifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Додаткові кваліфікації</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {coach.qualifications.map((qualification, index) => (
                          <Badge key={index} variant="secondary">
                            <Award className="h-3 w-3 mr-1" />
                            {qualification}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {coach.specializations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Спеціалізації</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {coach.specializations.map((specialization, index) => (
                          <Badge key={index} variant="outline">
                            <Star className="h-3 w-3 mr-1" />
                            {specialization}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Сертифікати</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Всього сертифікатів</Label>
                        <div className="text-2xl font-bold">{coach.certificatesCount}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Дійсних</Label>
                        <div className="text-2xl font-bold text-green-600">{coach.validCertificates}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="statistics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Тренерська діяльність</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Підготовлено спортсменів</Label>
                      <div className="text-2xl font-bold text-blue-600">{coach.athletesTrained}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Досвід роботи</Label>
                      <div className="text-lg">{coach.experienceYears} років</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Суддівська діяльність</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Судив змагання</Label>
                      <div className="text-2xl font-bold text-purple-600">{coach.competitionsJudged}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Досягнення</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-sm text-gray-500">Кількість досягнень</Label>
                      <div className="text-2xl font-bold text-yellow-600">{coach.achievements.length}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Системна інформація */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Системна інформація</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Дата реєстрації</Label>
                <div>{new Date(coach.createdAt).toLocaleString('uk-UA')}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Останнє оновлення</Label>
                <div>{new Date(coach.updatedAt).toLocaleString('uk-UA')}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email підтверджено</Label>
                <div>{coach.emailVerified ? 'Так' : 'Ні'}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Профіль верифіковано</Label>
                <div>{coach.profileVerified ? 'Так' : 'Ні'}</div>
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

// Компонент перегляду сертифікатів
function CertificatesDialog({
  open,
  onOpenChange,
  coach
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: Coach | null;
}) {
  if (!coach) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Сертифікати тренера/судді</DialogTitle>
          <DialogDescription>
            Сертифікати та кваліфікації {coach.fullName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {coach.certificates.length > 0 ? (
            <div className="space-y-4">
              {coach.certificates.map((cert, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{cert.certificate_name}</h3>
                        <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div>Видано: {new Date(cert.issue_date).toLocaleDateString('uk-UA')}</div>
                          {cert.expiry_date && (
                            <div>До: {new Date(cert.expiry_date).toLocaleDateString('uk-UA')}</div>
                          )}
                          {cert.certificate_number && (
                            <div>№ {cert.certificate_number}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={cert.verification_status === 'verified' ? 'default' : 'secondary'}>
                          {cert.verification_status === 'verified' ? 'Підтверджено' :
                           cert.verification_status === 'pending' ? 'На перевірці' : 'Відхилено'}
                        </Badge>
                        {cert.expiry_date && new Date(cert.expiry_date) < new Date() && (
                          <Badge variant="destructive">Прострочений</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Немає сертифікатів</h3>
              <p className="text-gray-500">У цього тренера/судді поки немає завантажених сертифікатів</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрити
          </Button>
          <Button>
            Додати сертифікат
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getCoachTypeBadge(type: string) {
  const typeConfig = coachTypes.find(t => t.value === type);
  if (!typeConfig) return <Badge variant="outline">{type}</Badge>;

  const IconComponent = typeConfig.icon;
  return (
    <Badge variant="secondary">
      <IconComponent className="h-3 w-3 mr-1" />
      {typeConfig.label}
    </Badge>
  );
}

function getLicenseStatusBadge(status: string) {
  const statusConfig = licenseStatuses.find(s => s.value === status);
  if (!statusConfig) return <Badge variant="outline">{status}</Badge>;

  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500 text-black',
    gray: 'bg-gray-500'
  };

  return (
    <Badge className={colorClasses[statusConfig.color as keyof typeof colorClasses]}>
      {statusConfig.label}
    </Badge>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Активний</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Очікує</Badge>;
    case 'suspended':
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Призупинений</Badge>;
    case 'inactive':
      return <Badge variant="outline" className="text-gray-600">Неактивний</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  return age;
}

function isLicenseExpiring(expiryDate: string) {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
}
