"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  UserCheck,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building,
  Award,
  Calendar,
  Trophy,
  Target,
  Users
} from 'lucide-react';

interface Athlete {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  region: string;
  city: string;
  club: string;
  coach: string;
  sportCategory: string;
  experience: string;
  specialization: string;
  bio: string;
  achievements: string;
  avatar: string;
  isPublicProfile: boolean;
  showEmail: boolean;
  showPhone: boolean;
  status: string;
  membershipPaid: boolean;
  createdAt: string;
}

interface AthleteStats {
  total: number;
  male: number;
  female: number;
  paidMembers: number;
  byRegion: { [key: string]: number };
  byClub: { [key: string]: number };
}

export default function AdminAthletesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AthleteStats | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    region: '',
    club: '',
    category: '',
    status: ''
  });

  useEffect(() => {
    loadAthletes();
  }, [filters]);

  const loadAthletes = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/athletes?${queryParams}`);
      const data = await response.json();

      if (data.athletes) {
        setAthletes(data.athletes);
        setStats(data.stats);
      } else {
        console.error('Помилка завантаження спортсменів:', data.error);
      }
    } catch (error) {
      console.error('Помилка завантаження спортсменів:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewDetails = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setDetailsDialogOpen(true);
  };

  const handleStatusToggle = async (athlete: Athlete) => {
    try {
      const newStatus = athlete.status === 'active' ? 'suspended' : 'active';

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: athlete.id,
          updates: { status: newStatus }
        })
      });

      if (response.ok) {
        loadAthletes();
      }
    } catch (error) {
      console.error('Помилка зміни статусу:', error);
    }
  };

  const handleExport = () => {
    window.open('/api/admin/export?type=athletes&format=csv', '_blank');
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Чоловік';
      case 'female': return 'Жінка';
      default: return 'Не вказано';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'no-rank': return 'Без розряду';
      case 'youth-3': return '3 юн. розряд';
      case 'youth-2': return '2 юн. розряд';
      case 'youth-1': return '1 юн. розряд';
      case 'sport-3': return '3 спорт. розряд';
      case 'sport-2': return '2 спорт. розряд';
      case 'sport-1': return '1 спорт. розряд';
      case 'cms': return 'КМС';
      case 'ms': return 'МС';
      case 'msic': return 'МСМК';
      default: return category || 'Не вказано';
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

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління спортсменами</h1>
          <p className="text-gray-600 mt-1">
            Перегляд та управління всіма зареєстрованими спортсменами ФУСАФ
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Додати спортсмена
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500">Всього спортсменів</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.male}</div>
              <p className="text-xs text-gray-500">Чоловіків</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-pink-600">{stats.female}</div>
              <p className="text-xs text-gray-500">Жінок</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.paidMembers}</div>
              <p className="text-xs text-gray-500">Оплачено членство</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Статистика по регіонах та клубах */}
      {stats && (Object.keys(stats.byRegion).length > 0 || Object.keys(stats.byClub).length > 0) && (
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

          {Object.keys(stats.byClub).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">По клубах</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byClub)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([club, count]) => (
                      <div key={club} className="flex justify-between">
                        <span className="text-sm">{club}</span>
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
                  placeholder="Ім'я, прізвище..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Стать</Label>
              <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі</SelectItem>
                  <SelectItem value="male">Чоловіки</SelectItem>
                  <SelectItem value="female">Жінки</SelectItem>
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
              <Label>Клуб</Label>
              <Input
                placeholder="Клуб..."
                value={filters.club}
                onChange={(e) => handleFilterChange('club', e.target.value)}
              />
            </div>

            <div>
              <Label>Категорія</Label>
              <Input
                placeholder="Розряд..."
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  gender: '',
                  region: '',
                  club: '',
                  category: '',
                  status: ''
                })}
                className="w-full"
              >
                Очистити
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця спортсменів */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Спортсмени ({athletes.length})
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
                    <TableHead>Спортсмен</TableHead>
                    <TableHead>Вік/Стать</TableHead>
                    <TableHead>Локація</TableHead>
                    <TableHead>Клуб/Тренер</TableHead>
                    <TableHead>Категорія</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {athletes.map((athlete) => (
                    <TableRow key={athlete.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={athlete.avatar} alt={athlete.name} />
                            <AvatarFallback>
                              {athlete.firstName?.charAt(0)}{athlete.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{athlete.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {athlete.showEmail ? athlete.email : '***@***.***'}
                            </div>
                            {athlete.phone && athlete.showPhone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {athlete.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {athlete.dateOfBirth && (
                            <div>{calculateAge(athlete.dateOfBirth)} років</div>
                          )}
                          <div className="text-gray-500">{getGenderLabel(athlete.gender)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {athlete.city && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              {athlete.city}
                            </div>
                          )}
                          {athlete.region && (
                            <div className="text-gray-500">{athlete.region}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {athlete.club && (
                            <div className="flex items-center">
                              <Building className="h-3 w-3 mr-1 text-gray-400" />
                              {athlete.club}
                            </div>
                          )}
                          {athlete.coach && (
                            <div className="text-gray-500 flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {athlete.coach}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {athlete.sportCategory && (
                            <Badge variant="outline" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              {getCategoryLabel(athlete.sportCategory)}
                            </Badge>
                          )}
                          {athlete.experience && (
                            <div className="text-gray-500 mt-1">
                              Стаж: {athlete.experience}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(athlete.status)}
                          {athlete.membershipPaid && (
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
                            onClick={() => handleViewDetails(athlete)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusToggle(athlete)}
                            className={athlete.status === 'suspended' ? 'text-green-600' : 'text-yellow-600'}
                          >
                            {athlete.status === 'suspended' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
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

      {/* Діалог деталей спортсмена */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Деталі спортсмена</DialogTitle>
            <DialogDescription>
              Повна інформація про {selectedAthlete?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedAthlete && (
            <div className="space-y-6">
              {/* Основна інформація */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedAthlete.avatar} alt={selectedAthlete.name} />
                  <AvatarFallback className="text-2xl">
                    {selectedAthlete.firstName?.charAt(0)}{selectedAthlete.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedAthlete.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {selectedAthlete.email}
                    </div>
                    {selectedAthlete.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedAthlete.phone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Зареєстрований: {new Date(selectedAthlete.createdAt).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    {getStatusBadge(selectedAthlete.status)}
                    {selectedAthlete.membershipPaid && (
                      <Badge className="bg-green-500">Оплачено</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Спортивна інформація */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Спортивна інформація</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedAthlete.club && (
                      <div>
                        <Label className="text-xs text-gray-500">Клуб</Label>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedAthlete.club}
                        </div>
                      </div>
                    )}

                    {selectedAthlete.coach && (
                      <div>
                        <Label className="text-xs text-gray-500">Тренер</Label>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedAthlete.coach}
                        </div>
                      </div>
                    )}

                    {selectedAthlete.sportCategory && (
                      <div>
                        <Label className="text-xs text-gray-500">Спортивна категорія</Label>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-gray-400" />
                          {getCategoryLabel(selectedAthlete.sportCategory)}
                        </div>
                      </div>
                    )}

                    {selectedAthlete.experience && (
                      <div>
                        <Label className="text-xs text-gray-500">Стаж</Label>
                        <div>{selectedAthlete.experience}</div>
                      </div>
                    )}

                    {selectedAthlete.specialization && (
                      <div>
                        <Label className="text-xs text-gray-500">Спеціалізація</Label>
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedAthlete.specialization}
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
                    {selectedAthlete.city && (
                      <div>
                        <Label className="text-xs text-gray-500">Місто</Label>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedAthlete.city}
                        </div>
                      </div>
                    )}

                    {selectedAthlete.region && (
                      <div>
                        <Label className="text-xs text-gray-500">Регіон</Label>
                        <div>{selectedAthlete.region}</div>
                      </div>
                    )}

                    {selectedAthlete.dateOfBirth && (
                      <div>
                        <Label className="text-xs text-gray-500">Вік</Label>
                        <div>{calculateAge(selectedAthlete.dateOfBirth)} років ({getGenderLabel(selectedAthlete.gender)})</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Біографія та досягнення */}
              {(selectedAthlete.bio || selectedAthlete.achievements) && (
                <div className="space-y-4">
                  {selectedAthlete.bio && (
                    <div>
                      <Label className="text-sm font-medium">Про себе</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedAthlete.bio}</p>
                    </div>
                  )}

                  {selectedAthlete.achievements && (
                    <div>
                      <Label className="text-sm font-medium">Досягнення</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedAthlete.achievements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Закрити
            </Button>
            {selectedAthlete && (
              <Button onClick={() => {
                // TODO: відкрити форму редагування
                console.log('Редагувати спортсмена:', selectedAthlete.id);
              }}>
                Редагувати
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
