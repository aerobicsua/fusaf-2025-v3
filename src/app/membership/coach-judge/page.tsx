"use client";

import { useState, useEffect } from "react";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  MapPin,
  Mail,
  Clock,
  Users,
  Trophy,
  Target
} from "lucide-react";

// Список областей України
const REGIONS = [
  "Вінницька область",
  "Волинська область",
  "Дніпропетровська область",
  "Донецька область",
  "Житомирська область",
  "Закарпатська область",
  "Запорізька область",
  "Івано-Франківська область",
  "Київська область",
  "Кіровоградська область",
  "Луганська область",
  "Львівська область",
  "Миколаївська область",
  "Одеська область",
  "Полтавська область",
  "Рівненська область",
  "Сумська область",
  "Тернопільська область",
  "Харківська область",
  "Херсонська область",
  "Хмельницька область",
  "Черкаська область",
  "Чернівецька область",
  "Чернігівська область",
  "м. Київ",
  "АР Крим"
];

const SPECIALIZATIONS = [
  "Спортивна аеробіка",
  "Фітнес",
  "Гімнастика",
  "Танці",
  "Фізичне виховання",
  "Інша"
];

interface CoachJudge {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  specialization: string;
  isCoach: boolean;
  isJudge: boolean;
  workExperience: number;
  coachCategory?: string;
  judgeCategory?: string;
  athletesCount: number;
  competitionsJudged: number;
  photoUrl?: string;
  qualificationLevel: string;
}

export default function CoachJudgeMembershipPage() {
  const { user } = useSimpleAuth();
  const router = useRouter();
  const [coachesJudges, setCoachesJudges] = useState<CoachJudge[]>([]);
  const [filteredCoachesJudges, setFilteredCoachesJudges] = useState<CoachJudge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Фільтри
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedRole, setSelectedRole] = useState(""); // all, coach, judge

  const handleRegistration = () => {
    router.push('/membership/coach-judge/registration');
  };

  // Завантаження даних тренерів/суддів
  useEffect(() => {
    loadCoachesJudges();
  }, []);

  // Фільтрація при зміні критеріїв
  useEffect(() => {
    filterCoachesJudges();
  }, [searchTerm, selectedRegion, selectedSpecialization, selectedRole, coachesJudges]);

  const loadCoachesJudges = async () => {
    try {
      setIsLoading(true);

      // Демонстраційні дані
      const demoCoachesJudges: CoachJudge[] = [
        {
          id: "1",
          firstName: "Марина",
          lastName: "Коваленко",
          fullName: "Коваленко Марина Сергіївна",
          email: "marina.kovalenko@example.com",
          phone: "+380671234567",
          region: "Львівська область",
          city: "Львів",
          specialization: "Спортивна аеробіка",
          isCoach: true,
          isJudge: true,
          workExperience: 8,
          coachCategory: "B",
          judgeCategory: "2",
          athletesCount: 25,
          competitionsJudged: 18,
          qualificationLevel: "Тренер-інструктор, суддя 2 категорії"
        },
        {
          id: "2",
          firstName: "Андрій",
          lastName: "Петренко",
          fullName: "Петренко Андрій Володимирович",
          email: "andriy.petrenko@example.com",
          phone: "+380672345678",
          region: "Київська область",
          city: "Київ",
          specialization: "Фітнес",
          isCoach: true,
          isJudge: false,
          workExperience: 12,
          coachCategory: "A",
          athletesCount: 40,
          competitionsJudged: 0,
          qualificationLevel: "Тренер вищої категорії"
        },
        {
          id: "3",
          firstName: "Олена",
          lastName: "Іваненко",
          fullName: "Іваненко Олена Миколаївна",
          email: "olena.ivanenko@example.com",
          phone: "+380673456789",
          region: "Дніпропетровська область",
          city: "Дніпро",
          specialization: "Гімнастика",
          isCoach: false,
          isJudge: true,
          workExperience: 6,
          judgeCategory: "1",
          athletesCount: 0,
          competitionsJudged: 32,
          qualificationLevel: "Суддя 1 категорії"
        },
        {
          id: "4",
          firstName: "Ігор",
          lastName: "Мельник",
          fullName: "Мельник Ігор Олександрович",
          email: "igor.melnik@example.com",
          phone: "+380674567890",
          region: "Харківська область",
          city: "Харків",
          specialization: "Спортивна аеробіка",
          isCoach: true,
          isJudge: true,
          workExperience: 15,
          coachCategory: "A",
          judgeCategory: "1",
          athletesCount: 35,
          competitionsJudged: 45,
          qualificationLevel: "Заслужений тренер, суддя міжнародної категорії"
        },
        {
          id: "5",
          firstName: "Тетяна",
          lastName: "Сидоренко",
          fullName: "Сидоренко Тетяна Василівна",
          email: "tetyana.sydorenko@example.com",
          phone: "+380675678901",
          region: "Одеська область",
          city: "Одеса",
          specialization: "Танці",
          isCoach: true,
          isJudge: false,
          workExperience: 5,
          coachCategory: "C",
          athletesCount: 18,
          competitionsJudged: 0,
          qualificationLevel: "Тренер початківець"
        }
      ];

      setCoachesJudges(demoCoachesJudges);
      setFilteredCoachesJudges(demoCoachesJudges);

    } catch (error) {
      console.error('Помилка завантаження тренерів/суддів:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCoachesJudges = () => {
    let filtered = [...coachesJudges];

    // Фільтр за пошуком
    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фільтр за областю
    if (selectedRegion) {
      filtered = filtered.filter(person => person.region === selectedRegion);
    }

    // Фільтр за спеціалізацією
    if (selectedSpecialization) {
      filtered = filtered.filter(person => person.specialization === selectedSpecialization);
    }

    // Фільтр за роллю
    if (selectedRole === "coach") {
      filtered = filtered.filter(person => person.isCoach);
    } else if (selectedRole === "judge") {
      filtered = filtered.filter(person => person.isJudge);
    }

    setFilteredCoachesJudges(filtered);
  };

  const getRoleBadges = (isCoach: boolean, isJudge: boolean) => {
    const badges = [];
    if (isCoach) {
      badges.push(
        <Badge key="coach" className="bg-blue-500 text-white">
          Тренер
        </Badge>
      );
    }
    if (isJudge) {
      badges.push(
        <Badge key="judge" className="bg-purple-500 text-white">
          Суддя
        </Badge>
      );
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Хлібні крихти */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-purple-600">Головна</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/membership" className="text-gray-700 hover:text-purple-600">Членство</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Тренери та судді</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Тренери та судді ФУСАФ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Знайдіть кваліфікованих тренерів та суддів зі спортивної аеробіки у вашому регіоні
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Фільтри */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Фільтри
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Пошук */}
                <div>
                  <Label htmlFor="search">Пошук</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Ім'я, місто, спеціалізація..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Роль */}
                <div>
                  <Label htmlFor="role">Роль</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Всі ролі" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі ролі</SelectItem>
                      <SelectItem value="coach">Тільки тренери</SelectItem>
                      <SelectItem value="judge">Тільки судді</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Область */}
                <div>
                  <Label htmlFor="region">Область</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Всі області" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі області</SelectItem>
                      {REGIONS.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Спеціалізація */}
                <div>
                  <Label htmlFor="specialization">Спеціалізація</Label>
                  <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="Всі спеціалізації" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі спеціалізації</SelectItem>
                      {SPECIALIZATIONS.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Кнопка реєстрації */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleRegistration}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Стати тренером/суддею
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Список тренерів/суддів */}
          <div className="lg:col-span-3">
            {/* Статистика результатів */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold">
                  Знайдено: {filteredCoachesJudges.length} з {coachesJudges.length}
                </h2>
                {(searchTerm || selectedRegion || selectedSpecialization || selectedRole) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedRegion("");
                      setSelectedSpecialization("");
                      setSelectedRole("");
                    }}
                  >
                    Очистити фільтри
                  </Button>
                )}
              </div>
            </div>

            {/* Завантаження */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Завантаження тренерів та суддів...</p>
              </div>
            )}

            {/* Результати */}
            {!isLoading && (
              <div className="grid gap-6">
                {filteredCoachesJudges.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Тренерів/суддів не знайдено
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Спробуйте змінити критерії пошуку або очистити фільтри
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedRegion("");
                          setSelectedSpecialization("");
                          setSelectedRole("");
                        }}
                      >
                        Очистити фільтри
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredCoachesJudges.map((person) => (
                    <Card key={person.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Аватар */}
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={person.photoUrl} />
                            <AvatarFallback className="text-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                              {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Основна інформація */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {person.fullName}
                                </h3>
                                <p className="text-purple-600 font-medium">
                                  {person.qualificationLevel}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                {getRoleBadges(person.isCoach, person.isJudge)}
                              </div>
                            </div>

                            <div className="mt-3 grid md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{person.city}, {person.region}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Target className="h-4 w-4 text-gray-400" />
                                  <span>{person.specialization}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{person.workExperience} років досвіду</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {person.isCoach && (
                                  <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4 text-blue-400" />
                                    <span>{person.athletesCount} спортсменів</span>
                                  </div>
                                )}
                                {person.isJudge && (
                                  <div className="flex items-center space-x-2">
                                    <Trophy className="h-4 w-4 text-purple-400" />
                                    <span>{person.competitionsJudged} змагань</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-blue-600">{person.email}</span>
                                </div>
                              </div>
                            </div>

                            {/* Категорії */}
                            <div className="mt-4 flex space-x-2">
                              {person.coachCategory && (
                                <Badge variant="outline" className="border-blue-200 text-blue-700">
                                  Тренер кат. {person.coachCategory}
                                </Badge>
                              )}
                              {person.judgeCategory && (
                                <Badge variant="outline" className="border-purple-200 text-purple-700">
                                  Суддя кат. {person.judgeCategory}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
