"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  MapPin,
  Calendar,
  Trophy,
  Award,
  Star,
  ArrowLeft,
  Camera,
  TrendingUp,
  Heart,
  BarChart3,
  Medal,
  Globe,
  Phone,
  Mail,
  Plus,
  Edit,
  Trash2,
  Upload,
  Play,
  Image,
  Film,
  Download,
  Share
} from 'lucide-react';
import Link from 'next/link';
import type { Athlete, CompetitionResult } from '@/lib/athletes-storage';

export default function AthleteProfilePage() {
  const params = useParams();
  const { user } = useSimpleAuth();
  const athleteId = params.id as string;

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('identity');
  const [editingResult, setEditingResult] = useState<any>(null);
  const [editingMedia, setEditingMedia] = useState<any>(null);
  const [showAddResultDialog, setShowAddResultDialog] = useState(false);
  const [showAddMediaDialog, setShowAddMediaDialog] = useState(false);

  // Форми для додавання даних
  const [newResult, setNewResult] = useState({
    competition: '',
    date: '',
    location: '',
    discipline: 'Спортивна аеробіка',
    category: '',
    rank: '',
    totalScore: '',
    technicScore: '',
    artisticScore: '',
    notes: ''
  });

  const [newMedia, setNewMedia] = useState({
    type: 'image' as 'image' | 'video',
    title: '',
    url: '',
    description: '',
    category: 'competition'
  });

  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/athletes/${athleteId}`);

        if (response.ok) {
          const data = await response.json();
          setAthlete(data.athlete);
        } else if (response.status === 404) {
          setError('Спортсмена не знайдено');
        } else {
          setError('Помилка завантаження профілю');
        }
      } catch (error) {
        setError('Помилка з\'єднання');
        console.error('Помилка завантаження спортсмена:', error);
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) {
      fetchAthlete();
    }
  }, [athleteId]);

  // Перевірка прав на редагування
  const canEdit = !!(user && (
    user?.roles?.includes('admin') ||
    user?.email === athlete?.email ||
    user?.roles?.includes('coach_judge')
  ));

  const getAge = (yearOfBirth?: number) => {
    if (!yearOfBirth) return 'Невідомо';
    return new Date().getFullYear() - yearOfBirth;
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: 'Активний', className: 'bg-green-500 text-white' },
      inactive: { label: 'Неактивний', className: 'bg-gray-500 text-white' },
      suspended: { label: 'Призупинено', className: 'bg-red-500 text-white' }
    };
    const config = configs[status as keyof typeof configs] || configs.active;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getMedalIcon = (medal: string) => {
    const colors = { gold: 'text-yellow-500', silver: 'text-gray-400', bronze: 'text-orange-500' };
    return <Medal className={`h-5 w-5 ${colors[medal as keyof typeof colors]}`} />;
  };

  const getMediaIcon = (type: string) => {
    return type === 'video' ? <Film className="h-5 w-5" /> : <Image className="h-5 w-5" />;
  };

  const handleAddResult = async () => {
    if (!newResult.competition || !newResult.date) {
      alert('Заповніть обов\'язкові поля');
      return;
    }

    // Тимчасово додаємо до локального стану (в реальному проекті - запит до API)
    const result = {
      id: Date.now(),
      competition: newResult.competition,
      date: newResult.date,
      location: newResult.location,
      discipline: newResult.discipline,
      category: newResult.category,
      rank: newResult.rank ? parseInt(newResult.rank) : undefined,
      totalScore: newResult.totalScore ? parseFloat(newResult.totalScore) : undefined,
      technicScore: newResult.technicScore ? parseFloat(newResult.technicScore) : undefined,
      artisticScore: newResult.artisticScore ? parseFloat(newResult.artisticScore) : undefined,
      medal: newResult.rank === '1' ? 'gold' : newResult.rank === '2' ? 'silver' : newResult.rank === '3' ? 'bronze' : undefined,
      notes: newResult.notes
    };

    if (athlete) {
      setAthlete({
        ...athlete,
        competitionResults: [...(athlete.competitionResults || []), result]
      });
    }

    setNewResult({
      competition: '',
      date: '',
      location: '',
      discipline: 'Спортивна аеробіка',
      category: '',
      rank: '',
      totalScore: '',
      technicScore: '',
      artisticScore: '',
      notes: ''
    });
    setShowAddResultDialog(false);
  };

  const handleAddMedia = async () => {
    if (!newMedia.title || !newMedia.url) {
      alert('Заповніть обов\'язкові поля');
      return;
    }

    const media = {
      id: Date.now(),
      type: newMedia.type,
      title: newMedia.title,
      url: newMedia.url,
      description: newMedia.description,
      date: new Date().toISOString(),
      category: newMedia.category
    };

    if (athlete) {
      setAthlete({
        ...athlete,
        media: [...(athlete.media || []), media]
      });
    }

    setNewMedia({
      type: 'image',
      title: '',
      url: '',
      description: '',
      category: 'competition'
    });
    setShowAddMediaDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Завантаження профілю...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Профіль не знайдено</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/membership/athletes">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Повернутися до списку
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Дані для графіків аналітики
  const progressData = [
    { year: '2020', totalScore: 16.2, competitions: 3 },
    { year: '2021', totalScore: 17.1, competitions: 5 },
    { year: '2022', totalScore: 17.8, competitions: 4 },
    { year: '2023', totalScore: 18.5, competitions: 3 }
  ];

  const scoresData = athlete.competitionResults?.slice(-4).map(result => ({
    competition: result.competition?.substring(0, 15) + '...',
    technic: result.technicScore || 0,
    artistic: result.artisticScore || 0
  })) || [];

  const medalDistribution = [
    { name: 'Золото', value: athlete.stats?.medalsByType?.gold || 0, color: '#FFD700' },
    { name: 'Срібло', value: athlete.stats?.medalsByType?.silver || 0, color: '#C0C0C0' },
    { name: 'Бронза', value: athlete.stats?.medalsByType?.bronze || 0, color: '#CD7F32' }
  ].filter(item => item.value > 0);

  const profileImage = athlete.media?.find(item => item.isProfileImage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero секція профілю в стилі FIG */}
      <div className="relative">
        <div
          className="h-96 bg-gradient-to-r from-orange-500 to-pink-600 flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(220, 104, 79, 0.8), rgba(173, 75, 62, 0.8)), url('https://ext.same-assets.com/2725761375/835613720.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center text-white">
              {/* Фото спортсмена */}
              <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center mr-8 shadow-lg overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage.url}
                    alt={`${athlete.firstName} ${athlete.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-orange-600 text-4xl font-bold">
                    {athlete.firstName?.charAt(0)}{athlete.lastName?.charAt(0)}
                  </span>
                )}
              </div>

              {/* Інформація */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {athlete.lastName?.toUpperCase()} {athlete.firstName}
                </h1>
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-xl">{athlete.country}</span>
                  <span className="text-lg ml-2 opacity-75">• {athlete.city}</span>
                </div>
                <div className="flex items-center space-x-4 flex-wrap">
                  {getStatusBadge(athlete.status)}
                  <Badge className="bg-purple-500 text-white">Просунутий</Badge>
                  {athlete.license && (
                    <Badge variant="outline" className="bg-white text-orange-600 border-white">
                      {athlete.license}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Швидка статистика */}
              {athlete.stats && (
                <div className="hidden lg:grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{athlete.stats.totalCompetitions}</div>
                    <div className="text-sm opacity-75">Змагань</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{athlete.stats.wins}</div>
                    <div className="text-sm opacity-75">Перемог</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{athlete.stats.podiums}</div>
                    <div className="text-sm opacity-75">Подіумів</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{athlete.stats.bestScore?.toFixed(1)}</div>
                    <div className="text-sm opacity-75">Кращий бал</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Навігація профілю */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <Link href="/membership/athletes">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад до списку
                </Button>
              </Link>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="identity" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Особисті дані
                  </TabsTrigger>
                  <TabsTrigger value="results" className="flex items-center">
                    <Trophy className="h-4 w-4 mr-2" />
                    Результати
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Медіа
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Аналітика
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Статистика
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-4">
                {canEdit && (
                  <Badge className="bg-blue-500 text-white">
                    <Edit className="h-3 w-3 mr-1" />
                    Можна редагувати
                  </Badge>
                )}
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Публічний профіль</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Особисті дані */}
          <TabsContent value="identity">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Основна інформація */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Основна інформація
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ПРІЗВИЩЕ</label>
                    <p className="text-lg font-semibold">{athlete.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ІМ'Я</label>
                    <p className="text-lg">{athlete.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">КРАЇНА</label>
                    <p className="text-lg flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {athlete.country}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">РІК НАРОДЖЕННЯ</label>
                    <p className="text-lg flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {athlete.yearOfBirth} ({getAge(athlete.yearOfBirth)} років)
                    </p>
                  </div>
                  {athlete.height && athlete.weight && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">ЗРІСТ</label>
                        <p className="text-lg">{athlete.height} см</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">ВАГА</label>
                        <p className="text-lg">{athlete.weight} кг</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Спортивна інформація */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Спортивна інформація
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ДИСЦИПЛІНИ</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {athlete.disciplines?.map((discipline, index) => (
                        <Badge key={index} className="bg-orange-500 text-white">
                          {discipline}
                        </Badge>
                      )) || (
                        <Badge className="bg-orange-500 text-white">
                          Спортивна аеробіка
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">КЛУБ</label>
                    <p className="text-lg">{athlete.club || athlete.clubName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ТРЕНЕР</label>
                    <p className="text-lg">{athlete.coach}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ЛІЦЕНЗІЯ</label>
                    <p className="text-lg">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {athlete.license}
                      </code>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Біографія та досягнення */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Біографія</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {athlete.biography || 'Інформація про біографію спортсмена ще не додана.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Досягнення
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {athlete.achievements?.map((achievement, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Award className="h-5 w-5 mr-2 mt-1 text-orange-500 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {achievement.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {achievement.level}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(achievement.date).toLocaleDateString('uk-UA')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-600">Досягнення ще не додані.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Персональні рекорди */}
            {athlete.personalBests && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Персональні рекорди
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {athlete.personalBests.totalScore?.score?.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Загальний бал</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {athlete.personalBests.totalScore?.competition}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {athlete.personalBests.technicScore?.score?.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Технічна оцінка</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {athlete.personalBests.technicScore?.competition}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {athlete.personalBests.artisticScore?.score?.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Артистична оцінка</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {athlete.personalBests.artisticScore?.competition}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Соціальні мережі */}
            {athlete.socialMedia && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Соціальні мережі</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      {athlete.socialMedia.instagram && (
                        <Badge variant="outline" className="text-sm">
                          📷 {athlete.socialMedia.instagram}
                        </Badge>
                      )}
                      {athlete.socialMedia.facebook && (
                        <Badge variant="outline" className="text-sm">
                          📘 {athlete.socialMedia.facebook}
                        </Badge>
                      )}
                      {athlete.socialMedia.youtube && (
                        <Badge variant="outline" className="text-sm">
                          📺 {athlete.socialMedia.youtube}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Результати змагань */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Результати змагань ({athlete.competitionResults?.length || 0})
                  </span>
                  {canEdit && (
                    <Dialog open={showAddResultDialog} onOpenChange={setShowAddResultDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Додати результат
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Додати результат змагання</DialogTitle>
                          <DialogDescription>
                            Введіть інформацію про новий результат
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="competition">Назва змагання *</Label>
                            <Input
                              id="competition"
                              value={newResult.competition}
                              onChange={(e) => setNewResult({...newResult, competition: e.target.value})}
                              placeholder="Чемпіонат України 2024"
                            />
                          </div>
                          <div>
                            <Label htmlFor="date">Дата *</Label>
                            <Input
                              id="date"
                              type="date"
                              value={newResult.date}
                              onChange={(e) => setNewResult({...newResult, date: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Місце проведення</Label>
                            <Input
                              id="location"
                              value={newResult.location}
                              onChange={(e) => setNewResult({...newResult, location: e.target.value})}
                              placeholder="Київ, Україна"
                            />
                          </div>
                          <div>
                            <Label htmlFor="rank">Місце</Label>
                            <Input
                              id="rank"
                              type="number"
                              value={newResult.rank}
                              onChange={(e) => setNewResult({...newResult, rank: e.target.value})}
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="score">Загальний бал</Label>
                            <Input
                              id="score"
                              type="number"
                              step="0.1"
                              value={newResult.totalScore}
                              onChange={(e) => setNewResult({...newResult, totalScore: e.target.value})}
                              placeholder="18.5"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="technicScore">Технічна оцінка</Label>
                              <Input
                                id="technicScore"
                                type="number"
                                step="0.1"
                                value={newResult.technicScore}
                                onChange={(e) => setNewResult({...newResult, technicScore: e.target.value})}
                                placeholder="9.2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="artisticScore">Артистична оцінка</Label>
                              <Input
                                id="artisticScore"
                                type="number"
                                step="0.1"
                                value={newResult.artisticScore}
                                onChange={(e) => setNewResult({...newResult, artisticScore: e.target.value})}
                                placeholder="9.3"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="notes">Примітки</Label>
                            <Textarea
                              id="notes"
                              value={newResult.notes}
                              onChange={(e) => setNewResult({...newResult, notes: e.target.value})}
                              placeholder="Додаткова інформація"
                              rows={2}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddResultDialog(false)}>
                            Скасувати
                          </Button>
                          <Button onClick={handleAddResult}>Зберегти</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!athlete.competitionResults?.length ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Немає результатів змагань
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {canEdit ? 'Додайте результати змагань спортсмена' : 'Результати змагань ще не додані'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Змагання</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Місце</TableHead>
                          <TableHead>Загальний бал</TableHead>
                          <TableHead>Технічна оцінка</TableHead>
                          <TableHead>Артистична оцінка</TableHead>
                          <TableHead>Медаль</TableHead>
                          {canEdit && <TableHead>Дії</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {athlete.competitionResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{result.competition}</div>
                                <div className="text-sm text-gray-500">{result.location}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(result.date).toLocaleDateString('uk-UA')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={result.rank <= 3 ? "default" : "secondary"}>
                                {result.rank}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {result.totalScore?.toFixed(3)}
                            </TableCell>
                            <TableCell>{result.technicScore?.toFixed(3)}</TableCell>
                            <TableCell>{result.artisticScore?.toFixed(3)}</TableCell>
                            <TableCell>
                              {result.medal && (
                                <div className="flex items-center">
                                  {getMedalIcon(result.medal)}
                                  <span className="ml-1 text-sm capitalize">{result.medal}</span>
                                </div>
                              )}
                            </TableCell>
                            {canEdit && (
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Медіа галерея */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Медіа галерея ({athlete.media?.length || 0})
                  </span>
                  {canEdit && (
                    <Dialog open={showAddMediaDialog} onOpenChange={setShowAddMediaDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          Завантажити
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Завантажити медіа</DialogTitle>
                          <DialogDescription>
                            Додайте фото або відео до профілю
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="type">Тип медіа</Label>
                            <select
                              id="type"
                              value={newMedia.type}
                              onChange={(e) => setNewMedia({...newMedia, type: e.target.value as 'image' | 'video'})}
                              className="w-full mt-1 p-2 border rounded-md"
                            >
                              <option value="image">📸 Фото</option>
                              <option value="video">🎥 Відео</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="title">Назва *</Label>
                            <Input
                              id="title"
                              value={newMedia.title}
                              onChange={(e) => setNewMedia({...newMedia, title: e.target.value})}
                              placeholder="Назва фото/відео"
                            />
                          </div>
                          <div>
                            <Label htmlFor="url">URL посилання *</Label>
                            <Input
                              id="url"
                              value={newMedia.url}
                              onChange={(e) => setNewMedia({...newMedia, url: e.target.value})}
                              placeholder="https://example.com/photo.jpg"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Опис</Label>
                            <Textarea
                              id="description"
                              value={newMedia.description}
                              onChange={(e) => setNewMedia({...newMedia, description: e.target.value})}
                              placeholder="Опис медіа файлу"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Категорія</Label>
                            <select
                              id="category"
                              value={newMedia.category}
                              onChange={(e) => setNewMedia({...newMedia, category: e.target.value})}
                              className="w-full mt-1 p-2 border rounded-md"
                            >
                              <option value="competition">🏆 Змагання</option>
                              <option value="training">💪 Тренування</option>
                              <option value="performance">🎭 Виступи</option>
                              <option value="interview">🎤 Інтерв'ю</option>
                              <option value="team">👥 Команда</option>
                            </select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddMediaDialog(false)}>
                            Скасувати
                          </Button>
                          <Button onClick={handleAddMedia}>Завантажити</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!athlete.media?.length ? (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Немає медіа файлів
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {canEdit ? 'Додайте фото або відео до профілю спортсмена' : 'Медіа файли ще не додані'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {athlete.media.map((media) => (
                      <Card key={media.id} className="overflow-hidden">
                        <div className="relative">
                          {media.type === 'image' ? (
                            <div className="h-48 bg-gray-200 flex items-center justify-center">
                              <Image className="h-16 w-16 text-gray-400" />
                            </div>
                          ) : (
                            <div className="h-48 bg-gray-900 flex items-center justify-center">
                              <div className="text-center text-white">
                                <Play className="h-16 w-16 mx-auto mb-2" />
                                <p>Відео</p>
                              </div>
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge className={media.type === 'video' ? 'bg-red-500' : 'bg-blue-500'}>
                              {getMediaIcon(media.type)}
                              <span className="ml-1 capitalize">{media.type}</span>
                            </Badge>
                          </div>
                          {canEdit && (
                            <div className="absolute top-2 right-2 flex space-x-1">
                              <Button size="sm" variant="outline" className="bg-white">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="bg-white">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">{media.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{media.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(media.date).toLocaleDateString('uk-UA')}</span>
                            <Badge variant="outline" className="text-xs">
                              {media.category}
                            </Badge>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Download className="h-3 w-3 mr-1" />
                              Завантажити
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Share className="h-3 w-3 mr-1" />
                              Поділитися
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Аналітика */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Прогрес по роках */}
              <Card>
                <CardHeader>
                  <CardTitle>Прогрес результатів по роках</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[15, 20]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="totalScore"
                        stroke="#8884d8"
                        strokeWidth={3}
                        name="Загальний бал"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Аналіз балів */}
              {scoresData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Аналіз технічних та артистичних балів</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={scoresData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="competition" angle={-45} textAnchor="end" height={100} />
                        <YAxis domain={[8, 10]} />
                        <Tooltip />
                        <Bar dataKey="technic" fill="#8884d8" name="Технічна оцінка" />
                        <Bar dataKey="artistic" fill="#82ca9d" name="Артистична оцінка" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Статистика */}
          <TabsContent value="stats">
            <div className="space-y-6">
              {/* Загальна статистика */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Загальна статистика
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{athlete.stats?.totalCompetitions || 0}</div>
                      <div className="text-sm text-gray-600">Змагань</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{athlete.stats?.wins || 0}</div>
                      <div className="text-sm text-gray-600">Перемог</div>
                      <div className="text-xs text-gray-500">
                        {athlete.stats?.totalCompetitions ?
                          Math.round((athlete.stats.wins / athlete.stats.totalCompetitions) * 100) : 0}% успішності
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">{athlete.stats?.podiums || 0}</div>
                      <div className="text-sm text-gray-600">Подіумів</div>
                      <div className="text-xs text-gray-500">
                        {athlete.stats?.totalCompetitions ?
                          Math.round((athlete.stats.podiums / athlete.stats.totalCompetitions) * 100) : 0}% на подіумі
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {athlete.stats?.bestScore ? athlete.stats.bestScore.toFixed(1) : '-'}
                      </div>
                      <div className="text-sm text-gray-600">Кращий бал</div>
                      <div className="text-xs text-gray-500">
                        Середній: {athlete.stats?.averageScore ? athlete.stats.averageScore.toFixed(1) : '-'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Розподіл медалей */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Медалі</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                        <div className="text-2xl font-bold text-yellow-600">
                          {athlete.stats?.medalsByType?.gold || 0}
                        </div>
                        <div className="text-sm text-gray-600">Золото</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Medal className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <div className="text-2xl font-bold text-gray-600">
                          {athlete.stats?.medalsByType?.silver || 0}
                        </div>
                        <div className="text-sm text-gray-600">Срібло</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <Award className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                        <div className="text-2xl font-bold text-orange-600">
                          {athlete.stats?.medalsByType?.bronze || 0}
                        </div>
                        <div className="text-sm text-gray-600">Бронза</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {medalDistribution.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Розподіл медалей</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={medalDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {medalDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Зауваження про безпеку */}
      <div className="bg-blue-50 border-t border-blue-200">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-blue-800">
            <p className="text-sm">
              🛡️ <strong>Публічний профіль:</strong> показана тільки загальнодоступна спортивна інформація.
              Приватні дані (контакти, документи) приховано для безпеки.
              {canEdit && (
                <span className="ml-2">
                  ✏️ <strong>Режим редагування увімкнено</strong> - ви можете додавати та змінювати інформацію.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
