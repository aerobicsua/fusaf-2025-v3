"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PreliminaryRegistration } from '@/components/PreliminaryRegistration';
import { IndividualRegistration } from '@/components/IndividualRegistration';
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
  AlertCircle
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
}

// Демонстраційні дані змагань
const demoCompetitions: Competition[] = [
  {
    id: 'comp-1',
    title: 'Кубок України зі спортивної аеробіки 2025',
    description: 'Офіційні змагання федерації України зі спортивної аеробіки та фітнесу. Змагання проводяться згідно з міжнародними правилами FIG.',
    date: '2025-04-15',
    time: '10:00',
    location: 'Палац спорту "Україна"',
    address: 'вул. Велика Васильківська, 55, Київ, 03150',
    registration_fee: 300,
    entry_fee: 200,
    max_participants: 200,
    registration_deadline: '2025-04-01',
    status: 'registration_open',
    club: {
      name: 'СК "Грація"',
      city: 'Київ'
    },
    preliminary_registrations: [{ count: 5 }],
    individual_registrations: [{ count: 12 }]
  },
  {
    id: 'comp-2',
    title: 'Чемпіонат Львівської області',
    description: 'Регіональний чемпіонат з різних категорій та вікових груп.',
    date: '2025-03-20',
    time: '09:30',
    location: 'Спорткомплекс "Арена Львів"',
    address: 'вул. Стрийська, 199, Львів',
    registration_fee: 250,
    entry_fee: 150,
    max_participants: 150,
    registration_deadline: '2025-03-10',
    status: 'registration_open',
    club: {
      name: 'Аеробіка Львів',
      city: 'Львів'
    },
    preliminary_registrations: [{ count: 3 }],
    individual_registrations: [{ count: 8 }]
  },
  {
    id: 'comp-3',
    title: 'Першість Дніпропетровської області',
    description: 'Відкрита першість для всіх вікових груп та категорій.',
    date: '2025-05-10',
    time: '11:00',
    location: 'ПК "Метеор"',
    address: 'пр. Гагаріна, 99, Дніпро',
    registration_fee: 200,
    entry_fee: 100,
    max_participants: 120,
    registration_deadline: '2025-04-25',
    status: 'published',
    club: {
      name: 'Фітнес-Динаміка',
      city: 'Дніпро'
    },
    preliminary_registrations: [{ count: 2 }],
    individual_registrations: [{ count: 4 }]
  }
];

export default function CompetitionsPage() {
  const { data: session } = useSession();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [registrationMode, setRegistrationMode] = useState<'preliminary' | 'individual' | null>(null);

  useEffect(() => {
    loadCompetitions();
  }, [filter]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);

      // Використовуємо демонстраційні дані
      let filteredCompetitions = [...demoCompetitions];

      if (filter !== 'all') {
        filteredCompetitions = filteredCompetitions.filter(comp => comp.status === filter);
      }

      setCompetitions(filteredCompetitions);
      console.log(`✅ Завантажено ${filteredCompetitions.length} демонстраційних змагань`);

    } catch (error) {
      console.error('Error loading competitions:', error);
      // Завжди показуємо демонстраційні дані при помилці
      setCompetitions(demoCompetitions);
    } finally {
      setLoading(false);
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

  const canUserRegister = (competition: Competition) => {
    // Будь-який зареєстрований користувач може подавати реєстрацію
    return session && isRegistrationAvailable(competition);
  };

  const canUserCreateCompetition = () => {
    // Тільки власники клубів та адміністратори можуть створювати змагання
    return session && ['club_owner', 'admin'].includes(session.user?.role || '');
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

  if (loading) {
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
            <div className="mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                🎯 Демонстраційний режим - Система реєстрації готова!
              </Badge>
            </div>
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

            {/* Кнопка створення змагання */}
            {canUserCreateCompetition() && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Створити змагання
              </Button>
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
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Створити перше змагання
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {competitions.map((competition) => {
              const { preliminaryCount, individualCount } = getRegistrationStats(competition);
              const isAvailable = isRegistrationAvailable(competition);
              const userCanRegister = canUserRegister(competition);

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

                      {userCanRegister && (
                        <div className="grid grid-cols-2 gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedCompetition(competition);
                                  setRegistrationMode('preliminary');
                                }}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Попередня
                              </Button>
                            </DialogTrigger>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedCompetition(competition);
                                  setRegistrationMode('individual');
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Іменна
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      )}

                      {!session && isAvailable && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Увійдіть для реєстрації на змагання
                          </p>
                          <Button size="sm" variant="outline">
                            Увійти в систему
                          </Button>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full"
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

        {/* Діалоги реєстрації */}
        {selectedCompetition && registrationMode === 'preliminary' && (
          <Dialog open={true} onOpenChange={() => handleRegistrationCancel()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Попередня реєстрація</DialogTitle>
                <DialogDescription>
                  Реєстрація загальної кількості учасників за категоріями
                </DialogDescription>
              </DialogHeader>
              <PreliminaryRegistration
                competitionId={selectedCompetition.id}
                competitionTitle={selectedCompetition.title}
                registrationFee={selectedCompetition.registration_fee}
                entryFee={selectedCompetition.entry_fee}
                onSuccess={handleRegistrationSuccess}
                onCancel={handleRegistrationCancel}
              />
            </DialogContent>
          </Dialog>
        )}

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
      </div>
    </div>
  );
}
