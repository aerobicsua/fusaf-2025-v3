"use client";

import { useState } from 'react';
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

export default function DemoProfilePage() {
  const [activeTab, setActiveTab] = useState('identity');
  const [canEdit, setCanEdit] = useState(true); // Демо режим - можна редагувати
  const [editingResult, setEditingResult] = useState<any>(null);
  const [editingMedia, setEditingMedia] = useState<any>(null);

  const athlete = {
    firstName: 'Марія',
    lastName: 'Спортсменко',
    name: 'Марія Спортсменко',
    gender: 'female',
    yearOfBirth: 1999,
    country: 'Україна',
    city: 'Київ',
    region: 'м. Київ',
    club: 'Київський Центр Аеробіки',
    coach: 'Ірина Тренерська',
    trainingSite: 'Спортивний комплекс "Олімпійський"',
    disciplines: ['Спортивна аеробіка', 'Індивідуальні змагання'],
    status: 'active',
    licenseLevel: 'advanced',
    license: 'UKR2024001',
    title: 'Майстер спорту України',
    height: 165,
    weight: 55,
    biography: 'Талановита спортсменка з багаторічним досвідом у спортивній аеробіці. Розпочала займатися аеробікою у віці 8 років.',
    interests: ['Танці', 'Фітнес', 'Здоровий спосіб життя', 'Музика', 'Подорожі'],
    languages: ['Українська', 'Англійська', 'Російська'],
    achievements: [
      {
        title: 'Чемпіон України зі спортивної аеробіки 2023',
        description: 'Перше місце в індивідуальних змаганнях серед жінок',
        type: 'Competition',
        level: 'National',
        date: '2023-06-15'
      },
      {
        title: 'Призер Європейського кубку 2023',
        description: 'Третє місце в індивідуальних змаганнях',
        type: 'Competition',
        level: 'International',
        date: '2023-03-20'
      }
    ],
    socialMedia: {
      instagram: '@maria_aerobics_ukr',
      facebook: 'maria.aerobics.ukraine',
      youtube: 'Maria Aerobics UA'
    },
    personalBests: {
      totalScore: { score: 18.850, competition: 'Чемпіонат України 2023' },
      technicScore: { score: 9.200, competition: 'Європейський кубок 2023' },
      artisticScore: { score: 9.650, competition: 'Чемпіонат України 2023' }
    },
    stats: {
      totalCompetitions: 15,
      wins: 6,
      podiums: 11,
      bestScore: 18.850,
      averageScore: 17.450,
      medalsByType: { gold: 6, silver: 3, bronze: 2 }
    },
    // Детальні результати змагань
    competitionResults: [
      {
        id: 1,
        competition: 'Чемпіонат України 2023',
        date: '2023-06-15',
        location: 'Київ, Україна',
        discipline: 'Індивідуальні змагання',
        category: 'Жінки, старша група',
        rank: 1,
        totalScore: 18.850,
        technicScore: 9.200,
        artisticScore: 9.650,
        medal: 'gold',
        notes: 'Новий особистий рекорд'
      },
      {
        id: 2,
        competition: 'Європейський кубок 2023',
        date: '2023-03-20',
        location: 'Будапешт, Угорщина',
        discipline: 'Індивідуальні змагання',
        category: 'Жінки, старша група',
        rank: 3,
        totalScore: 18.200,
        technicScore: 9.100,
        artisticScore: 9.100,
        medal: 'bronze',
        notes: 'Дебют на міжнародній арені'
      },
      {
        id: 3,
        competition: 'Кубок України 2022',
        date: '2022-11-12',
        location: 'Львів, Україна',
        discipline: 'Індивідуальні змагання',
        category: 'Жінки, старша група',
        rank: 2,
        totalScore: 17.950,
        technicScore: 8.950,
        artisticScore: 9.000,
        medal: 'silver',
        notes: 'Стабільне виступлення'
      },
      {
        id: 4,
        competition: 'Чемпіонат України 2022',
        date: '2022-08-15',
        location: 'Одеса, Україна',
        discipline: 'Індивідуальні змагання',
        category: 'Жінки, старша група',
        rank: 1,
        totalScore: 18.150,
        technicScore: 9.050,
        artisticScore: 9.100,
        medal: 'gold',
        notes: 'Перший національний титул'
      }
    ],
    // Медіа файли
    media: [
      {
        id: 1,
        type: 'image',
        title: 'Чемпіонат України 2023 - Золота медаль',
        url: 'https://ext.same-assets.com/2725761375/competition-photo-1.jpg',
        description: 'Фото з нагородження на чемпіонаті України',
        date: '2023-06-15',
        category: 'competition'
      },
      {
        id: 2,
        type: 'video',
        title: 'Програма на Європейському кубку 2023',
        url: 'https://ext.same-assets.com/2725761375/performance-video-1.mp4',
        description: 'Повне виконання програми в Будапешті',
        date: '2023-03-20',
        category: 'performance'
      },
      {
        id: 3,
        type: 'image',
        title: 'Тренування з тренером Іриною',
        url: 'https://ext.same-assets.com/2725761375/training-photo-1.jpg',
        description: 'Підготовка до чемпіонату',
        date: '2023-05-10',
        category: 'training'
      },
      {
        id: 4,
        type: 'video',
        title: 'Інтерв\'ю після перемоги',
        url: 'https://ext.same-assets.com/2725761375/interview-video-1.mp4',
        description: 'Коментарі після здобуття золота',
        date: '2023-06-15',
        category: 'interview'
      },
      {
        id: 5,
        type: 'image',
        title: 'Команда України на Європейському кубку',
        url: 'https://ext.same-assets.com/2725761375/team-photo-1.jpg',
        description: 'Збірна команда України в Будапешті',
        date: '2023-03-18',
        category: 'team'
      }
    ]
  };

  // Дані для графіків аналітики
  const progressData = [
    { year: '2020', totalScore: 16.2, competitions: 3 },
    { year: '2021', totalScore: 17.1, competitions: 5 },
    { year: '2022', totalScore: 17.8, competitions: 4 },
    { year: '2023', totalScore: 18.5, competitions: 3 }
  ];

  const scoresData = [
    { competition: 'Чемпіонат 2022', technic: 9.05, artistic: 9.10 },
    { competition: 'Кубок 2022', technic: 8.95, artistic: 9.00 },
    { competition: 'Європейський кубок 2023', technic: 9.10, artistic: 9.10 },
    { competition: 'Чемпіонат 2023', technic: 9.20, artistic: 9.65 }
  ];

  const medalDistribution = [
    { name: 'Золото', value: 6, color: '#FFD700' },
    { name: 'Срібло', value: 3, color: '#C0C0C0' },
    { name: 'Бронза', value: 2, color: '#CD7F32' }
  ];

  const getAge = (yearOfBirth: number) => {
    return new Date().getFullYear() - yearOfBirth;
  };

  const getMedalIcon = (medal: string) => {
    const colors = { gold: 'text-yellow-500', silver: 'text-gray-400', bronze: 'text-orange-500' };
    return <Medal className={`h-5 w-5 ${colors[medal as keyof typeof colors]}`} />;
  };

  const getMediaIcon = (type: string) => {
    return type === 'video' ? <Film className="h-5 w-5" /> : <Image className="h-5 w-5" />;
  };

  const handleEditResult = (result: any) => {
    setEditingResult(result);
  };

  const handleEditMedia = (media: any) => {
    setEditingMedia(media);
  };

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
              <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center mr-8 shadow-lg">
                <span className="text-orange-600 text-4xl font-bold">МС</span>
              </div>

              {/* Інформація */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {athlete.lastName.toUpperCase()} {athlete.firstName}
                </h1>
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-xl">{athlete.country}</span>
                  <span className="text-lg ml-2 opacity-75">• {athlete.city}</span>
                </div>
                <div className="flex items-center space-x-4 flex-wrap">
                  <Badge className="bg-green-500 text-white">Активний</Badge>
                  <Badge className="bg-purple-500 text-white">Просунутий</Badge>
                  <Badge variant="outline" className="bg-white text-orange-600 border-white">
                    {athlete.license}
                  </Badge>
                </div>
              </div>

              {/* Швидка статистика */}
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
                  <div className="text-2xl font-bold">{athlete.stats.bestScore.toFixed(1)}</div>
                  <div className="text-sm opacity-75">Кращий бал</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Навігація профілю */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад на головну
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

          {/* Особисті дані - без змін */}
          <TabsContent value="identity">
            {/* ... Попередній код для особистих даних ... */}
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
                      {athlete.disciplines.map((discipline, index) => (
                        <Badge key={index} className="bg-orange-500 text-white">
                          {discipline}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">КЛУБ</label>
                    <p className="text-lg">{athlete.club}</p>
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
                  <p className="text-gray-700 leading-relaxed">{athlete.biography}</p>
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
                    {athlete.achievements.map((achievement, index) => (
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Персональні рекорди */}
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
                        {athlete.personalBests.totalScore.score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Загальний бал</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {athlete.personalBests.totalScore.competition}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {athlete.personalBests.technicScore.score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Технічна оцінка</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {athlete.personalBests.technicScore.competition}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {athlete.personalBests.artisticScore.score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Артистична оцінка</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {athlete.personalBests.artisticScore.competition}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Соціальні мережі */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Соціальні мережі</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Badge variant="outline" className="text-sm">
                      📷 {athlete.socialMedia.instagram}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      📘 {athlete.socialMedia.facebook}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      📺 {athlete.socialMedia.youtube}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Результати змагань */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Результати змагань ({athlete.competitionResults.length})
                  </span>
                  {canEdit && (
                    <Dialog>
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
                            <Label htmlFor="competition">Назва змагання</Label>
                            <Input id="competition" placeholder="Чемпіонат України 2024" />
                          </div>
                          <div>
                            <Label htmlFor="date">Дата</Label>
                            <Input id="date" type="date" />
                          </div>
                          <div>
                            <Label htmlFor="rank">Місце</Label>
                            <Input id="rank" type="number" placeholder="1" />
                          </div>
                          <div>
                            <Label htmlFor="score">Загальний бал</Label>
                            <Input id="score" type="number" step="0.1" placeholder="18.5" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Зберегти</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                            {result.totalScore.toFixed(3)}
                          </TableCell>
                          <TableCell>{result.technicScore.toFixed(3)}</TableCell>
                          <TableCell>{result.artisticScore.toFixed(3)}</TableCell>
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditResult(result)}
                                >
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
                    Медіа галерея ({athlete.media.length})
                  </span>
                  {canEdit && (
                    <Dialog>
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
                            <Label htmlFor="title">Назва</Label>
                            <Input id="title" placeholder="Назва фото/відео" />
                          </div>
                          <div>
                            <Label htmlFor="description">Опис</Label>
                            <Textarea id="description" placeholder="Опис медіа файлу" />
                          </div>
                          <div>
                            <Label htmlFor="file">Файл</Label>
                            <Input id="file" type="file" accept="image/*,video/*" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Завантажити</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white"
                              onClick={() => handleEditMedia(media)}
                            >
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
                      <div className="text-3xl font-bold text-blue-600">{athlete.stats.totalCompetitions}</div>
                      <div className="text-sm text-gray-600">Змагань</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{athlete.stats.wins}</div>
                      <div className="text-sm text-gray-600">Перемог</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((athlete.stats.wins / athlete.stats.totalCompetitions) * 100)}% успішності
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">{athlete.stats.podiums}</div>
                      <div className="text-sm text-gray-600">Подіумів</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((athlete.stats.podiums / athlete.stats.totalCompetitions) * 100)}% на подіумі
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{athlete.stats.bestScore.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Кращий бал</div>
                      <div className="text-xs text-gray-500">
                        Середній: {athlete.stats.averageScore.toFixed(1)}
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
                        <div className="text-2xl font-bold text-yellow-600">{athlete.stats.medalsByType.gold}</div>
                        <div className="text-sm text-gray-600">Золото</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Medal className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <div className="text-2xl font-bold text-gray-600">{athlete.stats.medalsByType.silver}</div>
                        <div className="text-sm text-gray-600">Срібло</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <Award className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                        <div className="text-2xl font-bold text-orange-600">{athlete.stats.medalsByType.bronze}</div>
                        <div className="text-sm text-gray-600">Бронза</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
