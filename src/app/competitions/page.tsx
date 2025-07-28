"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import Link from 'next/link';
import { canRegisterTeams, canRegisterIndividual } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PreliminaryRegistration } from '@/components/PreliminaryRegistration';
import { IndividualRegistration } from '@/components/IndividualRegistration';
import { NotificationSubscription } from '@/components/NotificationSubscription';
import { ExportParticipants } from '@/components/ExportParticipants';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Trophy,
  UserPlus,
  FileText,
  Plus,
  Filter,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  Award,
  Target,
  Info,
  Edit,
  Settings
} from 'lucide-react';



interface Competition {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  registration_fee: number;
  entry_fee: number;
  max_participants: number;
  registration_deadline: string;
  status: string;
  club: {
    name: string;
    city: string;
  };
  preliminary_registrations: Array<{ count: number }>;
  individual_registrations: Array<{ count: number }>;
  categories?: string[];
  rules?: string;
  contact_person?: {
    name: string;
    phone: string;
    email: string;
  };
  prizes?: string[];
  schedule?: {
    registration: string;
    warmup: string;
    competition: string;
    awards: string;
  };
}

// Очищені дані - починаємо з нуля
const demoCompetitions: Competition[] = [];

export default function CompetitionsPage() {
  const { user, loading } = useSimpleAuth();

  // Логування для діагностики
  console.log('🏆 CompetitionsPage render:', {
    user: user?.email,
    roles: user?.roles,
    timestamp: new Date().toISOString()
  });

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [competitionsLoading, setCompetitionsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [registrationMode, setRegistrationMode] = useState<'preliminary' | 'individual' | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [competitionDetails, setCompetitionDetails] = useState<Competition | null>(null);

  useEffect(() => {
    loadCompetitions();
  }, [filter]);

  const loadCompetitions = async () => {
    try {
      setCompetitionsLoading(true);

      // Завантажуємо змагання з порожнього списку (початок з нуля)
      let filteredCompetitions = [...demoCompetitions];

      if (filter !== 'all') {
        filteredCompetitions = filteredCompetitions.filter(comp => comp.status === filter);
      }

      setCompetitions(filteredCompetitions);
      console.log(`✅ Завантажено ${filteredCompetitions.length} змагань`);

    } catch (error) {
      console.error('Error loading competitions:', error);
      // Завжди показуємо демонстраційні дані при помилці
      setCompetitions(demoCompetitions);
    } finally {
      setCompetitionsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Чернетка', color: 'bg-gray-500' },
      published: { label: 'Опубліковано', color: 'bg-blue-500' },
      registration_open: { label: 'Реєстрація відкрита', color: 'bg-green-500' },
      registration_closed: { label: 'Реєстрація закрита', color: 'bg-yellow-500' },
      in_progress: { label: 'Проходить', color: 'bg-purple-500' },
      completed: { label: 'Завершено', color: 'bg-gray-600' },
      cancelled: { label: 'Скасовано', color: 'bg-red-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const isRegistrationAvailable = (competition: Competition) => {
    return competition.status === 'registration_open' &&
           new Date() < new Date(competition.registration_deadline);
  };

  const canUserRegisterTeams = (competition: Competition) => {
    // Тільки власники клубів, тренери та адміни можуть подавати попередні реєстрації
    return user && isRegistrationAvailable(competition) && canRegisterTeams(user?.roles);
  };

  const canUserRegisterIndividual = (competition: Competition) => {
    // Іменну реєстрацію можуть подавати всі авторизовані користувачі
    return user && isRegistrationAvailable(competition) && canRegisterIndividual(user?.roles);
  };

  const canUserCreateCompetition = () => {
    // Тільки власники клубів та адміністратори можуть створювати змагання
    const hasPermission = user && user?.roles?.some(role => ['admin', 'club_owner'].includes(role));

    // Дебаг інформація
    console.log('🔍 Debug створення змагання:', {
      session: !!user,
      user: user?.email,
      roles: user?.roles,
      hasPermission
    });

    return hasPermission;
  };

  const getRegistrationStats = (competition: Competition) => {
    const preliminaryCount = competition.preliminary_registrations?.[0]?.count || 0;
    const individualCount = competition.individual_registrations?.[0]?.count || 0;
    return { preliminaryCount, individualCount };
  };

  const handleRegistrationSuccess = (registration: any) => {
    alert(`✅ Реєстрація успішна!\n\nНомер реєстрації: ${registration.registration_number || registration.id}`);
    setRegistrationMode(null);
    setSelectedCompetition(null);
    loadCompetitions(); // Оновлюємо список змагань
  };

  const handleRegistrationCancel = () => {
    setRegistrationMode(null);
    setSelectedCompetition(null);
  };

  const handleShowDetails = (competition: Competition) => {
    setCompetitionDetails(competition);
    setDetailsDialogOpen(true);
  };

  if (competitionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Завантаження змагань...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок та фільтри */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏆 Календар змагань ФУСАФ
            </h1>
            <p className="text-gray-600">
              Офіційні змагання з спортивної аеробіки та фітнесу в Україні
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* Фільтри */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Всі змагання</option>
                <option value="registration_open">Відкрита реєстрація</option>
                <option value="published">Опубліковані</option>
                <option value="in_progress">Проходять</option>
                <option value="completed">Завершені</option>
              </select>
            </div>

            {/* Кнопка створення змагань - ПРАЦЮЄ! */}
            {canUserCreateCompetition() && (
              <Link href="/competitions/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Створити змагання
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Список змагань */}
        {competitions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Змагань не знайдено</h3>
              <p className="text-gray-600 mb-4">
                На даний момент немає змагань за обраними критеріями
              </p>
              {canUserCreateCompetition() && (
                <Link href="/competitions/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Створити перше змагання
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {competitions.map((competition) => {
              const { preliminaryCount, individualCount } = getRegistrationStats(competition);
              const isAvailable = isRegistrationAvailable(competition);
              const userCanRegisterTeams = canUserRegisterTeams(competition);
              const userCanRegisterIndividual = canUserRegisterIndividual(competition);

              return (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg leading-tight">
                        {competition.title}
                      </CardTitle>
                      {getStatusBadge(competition.status)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {competition.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Основна інформація */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(competition.date).toLocaleDateString('uk-UA')} о {competition.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {competition.location}, {competition.club?.city}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Реєстрація до: {new Date(competition.registration_deadline).toLocaleDateString('uk-UA')}
                      </div>
                    </div>

                    {/* Фінансова інформація */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Реєстраційний внесок:</span>
                        <span className="font-semibold">{competition.registration_fee} грн</span>
                      </div>
                      {competition.entry_fee > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Вступний внесок:</span>
                          <span className="font-semibold">{competition.entry_fee} грн</span>
                        </div>
                      )}
                    </div>

                    {/* Статистика реєстрацій */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-lg font-bold text-blue-600">{preliminaryCount}</div>
                        <div className="text-xs text-blue-600">Попередні</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-lg font-bold text-green-600">{individualCount}</div>
                        <div className="text-xs text-green-600">Іменні</div>
                      </div>
                    </div>

                    {/* Кнопки дій */}
                    <div className="space-y-2">
                      {!isAvailable && (
                        <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Реєстрація закрита або змагання завершено
                        </div>
                      )}

                      {/* Кнопки реєстрації для власників клубів, тренерів та адмінів */}
                      {userCanRegisterTeams && (
                        <div className="space-y-2">
                          <PreliminaryRegistration
                            competition={competition}
                            onRegistrationSuccess={handleRegistrationSuccess}
                          />
                        </div>
                      )}

                      {/* Іменна реєстрація для адмінів, власників клубів та тренерів */}
                      {userCanRegisterIndividual &&
                        user?.roles?.some(role => ['admin', 'club_owner', 'coach_judge'].includes(role)) && (
                        <div className="mt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedCompetition(competition);
                                  setRegistrationMode('individual');
                                }}
                                className="w-full"
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Іменна реєстрація
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      )}

                      {/* Повідомлення для чистих спортсменів */}
                      {user?.roles?.length === 1 &&
                        user?.roles?.includes('athlete') &&
                        !canRegisterTeams(user?.roles) && (
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                          💡 Спортсмени можуть переглядати змагання та інформацію.
                          Реєстрацію подають тренери або представники клубів.
                        </div>
                      )}

                      {!user && isAvailable && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Увійдіть для реєстрації на змагання
                          </p>
                          <Button size="sm" variant="outline">
                            Увійти в систему
                          </Button>
                        </div>
                      )}

                      {/* Кнопка редагування для власників клубів та адмінів */}
                      {user?.roles?.some(role => ['admin', 'club_owner'].includes(role)) && (
                        <Link href={`/competitions/${competition.id}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mb-2"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Редагувати
                          </Button>
                        </Link>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full"
                        onClick={() => handleShowDetails(competition)}
                      >
                        Детальна інформація
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Додаткові функції */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Підписка на сповіщення */}
          <NotificationSubscription />

          {/* Експорт учасників - тільки для організаторів */}
          {user?.roles?.some(role => ['admin', 'club_owner', 'coach_judge'].includes(role)) && (
            <ExportParticipants
              competitionId="comp-1"
              competitionTitle="Кубок України зі спортивної аеробіки 2025"
            />
          )}
        </div>

        {/* Діалог іменної реєстрації */}
        {selectedCompetition && registrationMode === 'individual' && (
          <Dialog open={true} onOpenChange={() => handleRegistrationCancel()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Іменна реєстрація</DialogTitle>
                <DialogDescription>
                  Реєстрація конкретного учасника на змагання
                </DialogDescription>
              </DialogHeader>
              <IndividualRegistration
                competitionId={selectedCompetition.id}
                competitionTitle={selectedCompetition.title}
                competitionDate={selectedCompetition.date}
                registrationFee={selectedCompetition.registration_fee}
                entryFee={selectedCompetition.entry_fee}
                onSuccess={handleRegistrationSuccess}
                onCancel={handleRegistrationCancel}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Діалог детальної інформації */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <Info className="h-6 w-6 text-blue-600 mr-2" />
                Детальна інформація про змагання
              </DialogTitle>
              <DialogDescription>
                Повна інформація про {competitionDetails?.title}
              </DialogDescription>
            </DialogHeader>

            {competitionDetails && (
              <div className="space-y-6">
                {/* Основна інформація */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-blue-600" />
                      {competitionDetails.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{competitionDetails.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(competitionDetails.date).toLocaleDateString('uk-UA')} о {competitionDetails.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{competitionDetails.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Максимум {competitionDetails.max_participants} учасників</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Реєстрація до: {new Date(competitionDetails.registration_deadline).toLocaleDateString('uk-UA')}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">📍 Адреса проведення:</h4>
                      <p className="text-gray-700">{competitionDetails.address}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Фінансова інформація */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Вартість участі
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{competitionDetails.registration_fee} грн</div>
                        <div className="text-sm text-blue-600">Реєстраційний внесок</div>
                      </div>
                      {competitionDetails.entry_fee > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{competitionDetails.entry_fee} грн</div>
                          <div className="text-sm text-green-600">Вступний внесок</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Категорії */}
                {competitionDetails.categories && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2 text-purple-600" />
                        Категорії змагань
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {competitionDetails.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="justify-start p-2">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Розклад змагань */}
                {competitionDetails.schedule && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-orange-600" />
                        Розклад дня змагань
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">📝 Реєстрація учасників</span>
                          <span className="text-gray-600">{competitionDetails.schedule.registration}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">🏃‍♀️ Розминка</span>
                          <span className="text-gray-600">{competitionDetails.schedule.warmup}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                          <span className="font-medium">🏆 Змагання</span>
                          <span className="text-blue-600 font-semibold">{competitionDetails.schedule.competition}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                          <span className="font-medium">🥇 Нагородження</span>
                          <span className="text-yellow-600 font-semibold">{competitionDetails.schedule.awards}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Призи */}
                {competitionDetails.prizes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-yellow-600" />
                        Призовий фонд
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {competitionDetails.prizes.map((prize, index) => (
                          <div key={index} className="flex items-center p-2 bg-yellow-50 rounded">
                            <span className="text-yellow-600 mr-2">🏆</span>
                            <span>{prize}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Правила */}
                {competitionDetails.rules && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-600" />
                        Правила та вимоги
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{competitionDetails.rules}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Документи змагання */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Документи змагання
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Регламент */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">Регламент змагань</p>
                            <p className="text-sm text-blue-600">Офіційні правила проведення</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            // Симуляція завантаження файлу
                            const link = document.createElement('a');
                            link.href = '/demo-regulation.pdf';
                            link.download = `Регламент_${competitionDetails?.title}.pdf`;
                            link.click();
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          📥 Завантажити
                        </Button>
                      </div>

                      {/* Запрошення */}
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Запрошення на змагання</p>
                            <p className="text-sm text-green-600">Інформація для учасників</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            // Симуляція завантаження файлу
                            const link = document.createElement('a');
                            link.href = '/demo-invitation.pdf';
                            link.download = `Запрошення_${competitionDetails?.title}.pdf`;
                            link.click();
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          📥 Завантажити
                        </Button>
                      </div>

                      {/* Додаткові документи */}
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-purple-600" />
                          <div>
                            <p className="font-medium text-purple-900">Додаткові документи</p>
                            <p className="text-sm text-purple-600">Інструкції та додаткова інформація</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            // Симуляція завантаження архіву
                            const link = document.createElement('a');
                            link.href = '/demo-additional-docs.zip';
                            link.download = `Додаткові_документи_${competitionDetails?.title}.zip`;
                            link.click();
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          📦 Завантажити архів
                        </Button>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          💡 <strong>Увага:</strong> Всі документи у форматі PDF.
                          Переконайтесь, що ви ознайомились з регламентом перед реєстрацією.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Контактна інформація */}
                {competitionDetails.contact_person && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-green-600" />
                        Контактна особа
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="font-medium">{competitionDetails.contact_person.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-600" />
                          <a href={`tel:${competitionDetails.contact_person.phone}`} className="text-blue-600 hover:underline">
                            {competitionDetails.contact_person.phone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-600" />
                          <a href={`mailto:${competitionDetails.contact_person.email}`} className="text-blue-600 hover:underline">
                            {competitionDetails.contact_person.email}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Організатор */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-blue-600" />
                      Організатор
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{competitionDetails.club.name}</p>
                        <p className="text-gray-600 text-sm">{competitionDetails.club.city}</p>
                      </div>
                      <Badge variant="outline">
                        Акредитований клуб ФУСАФ
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Кнопка закриття */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setDetailsDialogOpen(false)}
                    variant="outline"
                  >
                    Закрити
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
