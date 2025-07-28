"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LiqPayPayment } from "@/components/LiqPayPayment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  Search,
  Filter,
  DollarSign,
  UserPlus,
  CheckCircle,
  AlertCircle,
  CreditCard
} from "lucide-react";
import {
  getCompetitions,
  createRegistration,
  getRegistrationsByUser,
  getAthleteProfile
} from "@/lib/database";
import type { CompetitionWithClub, Registration } from "@/lib/supabase";

interface CompetitionWithRegistration extends CompetitionWithClub {
  userRegistration?: Registration;
  registrationCount?: number;
}

export default function CompetitionsPage() {
  const { data: session } = useSession();
  const [competitions, setCompetitions] = useState<CompetitionWithRegistration[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionWithRegistration | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const loadCompetitions = useCallback(async () => {
    try {
      const data = await getCompetitions();
      setCompetitions(data);
    } catch (err) {
      setError("Помилка завантаження змагань");
    }
  }, []);

  const loadUserRegistrations = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const data = await getRegistrationsByUser(session.user.id);
      setUserRegistrations(data);
    } catch (err) {
      setError("Помилка завантаження реєстрацій");
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadCompetitions(), loadUserRegistrations()]);
      setLoading(false);
    };

    loadData();
  }, [loadCompetitions, loadUserRegistrations]);

  const isUserRegistered = (competitionId: string): boolean => {
    return userRegistrations.some(reg => reg.competition_id === competitionId);
  };

  const getUserRegistrationStatus = (competitionId: string): 'pending' | 'confirmed' | 'cancelled' | 'waitlist' | undefined => {
    const registration = userRegistrations.find(reg => reg.competition_id === competitionId);
    return registration?.status;
  };

  const getUserRegistrationPaymentStatus = (competitionId: string): 'pending' | 'paid' | 'failed' | 'refunded' | undefined => {
    const registration = userRegistrations.find(reg => reg.competition_id === competitionId);
    return registration?.payment_status;
  };

  const handleRegister = async (competition: CompetitionWithRegistration) => {
    if (!session?.user?.id) {
      setError("Потрібно увійти в систему для реєстрації");
      return;
    }

    if (!selectedAgeGroup || !selectedCategory) {
      setError("Оберіть вікову групу та категорію");
      return;
    }

    setIsRegistering(true);
    try {
      const registration = await createRegistration({
        user_id: session.user.id,
        competition_id: competition.id,
        status: 'pending',
        registration_date: new Date().toISOString(),
        age_group: selectedAgeGroup,
        category: selectedCategory,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (registration) {
        await loadUserRegistrations();
        setSelectedCompetition(null);
        setSelectedAgeGroup("");
        setSelectedCategory("");
      }
    } catch (err) {
      setError("Помилка реєстрації");
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePayment = (competitionId: string) => {
    // Payment logic would go here
    console.log("Payment for competition:", competitionId);
  };

  const filteredCompetitions = competitions.filter(competition => {
    const matchesSearch = competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competition.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competition.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || competition.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Завантаження змагань...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Змагання</h1>
          <p className="text-gray-600">Знайдіть та зареєструйтеся на змагання зі спортивної аеробіки</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Пошук змагань..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Категорія" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі категорії</SelectItem>
              <SelectItem value="junior">Юніори</SelectItem>
              <SelectItem value="senior">Сеніори</SelectItem>
              <SelectItem value="open">Відкрита</SelectItem>
              <SelectItem value="professional">Професійна</SelectItem>
              <SelectItem value="amateur">Аматорська</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Competitions List */}
        <div className="grid lg:grid-cols-1 gap-6">
          {filteredCompetitions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Змагання не знайдено</h3>
                <p className="text-gray-500">Спробуйте змінити параметри пошуку</p>
              </CardContent>
            </Card>
          ) : (
            filteredCompetitions.map((competition) => {
              const isRegistered = isUserRegistered(competition.id);
              const registrationStatus = getUserRegistrationStatus(competition.id);
              const paymentStatus = getUserRegistrationPaymentStatus(competition.id);

              return (
                <Card key={competition.id} className="card-aerobics">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{competition.title}</CardTitle>
                        <CardDescription>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                {new Date(competition.date).toLocaleDateString('uk-UA')}
                              </div>
                              {competition.time && (
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4" />
                                  {competition.time}
                                </div>
                              )}
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4" />
                                {competition.location}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <DollarSign className="mr-2 h-4 w-4" />
                                {competition.registration_fee} грн
                              </div>
                              {competition.max_participants && (
                                <div className="flex items-center">
                                  <Users className="mr-2 h-4 w-4" />
                                  Макс. {competition.max_participants} учасників
                                </div>
                              )}
                              <div className="flex items-center">
                                <Trophy className="mr-2 h-4 w-4" />
                                {competition.club.name}
                              </div>
                            </div>
                          </div>
                        </CardDescription>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">
                          {competition.category}
                        </Badge>

                        {isRegistered && (
                          <Badge
                            className={
                              registrationStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                              paymentStatus === 'paid' ? 'bg-blue-100 text-blue-800' :
                              registrationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {registrationStatus === 'confirmed' && 'Підтверджено'}
                            {paymentStatus === 'paid' && 'Оплачено'}
                            {registrationStatus === 'pending' && 'Очікує оплати'}
                            {registrationStatus === 'cancelled' && 'Скасовано'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {competition.description && (
                      <p className="text-gray-600 mb-4">{competition.description}</p>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {!isRegistered ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => setSelectedCompetition(competition)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Зареєструватися
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Реєстрація на змагання</DialogTitle>
                                <DialogDescription>
                                  {competition.title}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Вікова група</label>
                                  <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Оберіть вікову групу" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {competition.age_groups.map((group) => (
                                        <SelectItem key={group} value={group}>
                                          {group}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Категорія</label>
                                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Оберіть категорію" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {competition.categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                          {category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <Button
                                  onClick={() => handleRegister(competition)}
                                  disabled={isRegistering || !selectedAgeGroup || !selectedCategory}
                                  className="w-full"
                                >
                                  {isRegistering ? 'Реєстрація...' : 'Підтвердити реєстрацію'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <>
                            {registrationStatus === 'confirmed' && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Зареєстровано
                              </Badge>
                            )}
                            {registrationStatus === 'pending' && paymentStatus === 'pending' && (
                              <Button
                                onClick={() => handlePayment(competition.id)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Оплатити
                              </Button>
                            )}
                          </>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">
                        Дедлайн реєстрації: {new Date(competition.registration_deadline).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
