"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Calendar,
  Users,
  BookOpen,
  Award,
  Settings,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin,
  Clock,
  Star,
  GraduationCap,
  Shield
} from "lucide-react";
import Link from "next/link";

// Mock data - це буде замінено на реальні дані з Supabase
const mockProfile = {
  id: "1",
  name: "Олексій Коваленко",
  email: "oleksiy@example.com",
  phone: "+380671234567",
  city: "Одеса",
  specializations: ["Спортивна аеробіка", "Фітнес", "Акробатика"],
  certifications: [
    "Тренер з аеробіки категорії А",
    "Міжнародний суддя FIG",
    "Інструктор з фітнесу"
  ],
  experienceYears: 12,
  education: "Національний університет фізичного виховання і спорту України",
  coachingPhilosophy: "Індивідуальний підхід до кожного спортсмена, розвиток не тільки фізичних, але й ментальних якостей.",
  availableForJudging: true,
  judgeLevel: "Міжнародний суддя категорії А"
};

const mockUpcomingCompetitions = [
  {
    id: 1,
    title: "Чемпіонат України з спортивної аеробіки",
    date: "2025-09-15",
    location: "Київ, Палац спорту",
    role: "Головний суддя",
    status: "confirmed"
  },
  {
    id: 2,
    title: "Кубок міста Одеса",
    date: "2025-08-20",
    location: "Одеса, Спорткомплекс",
    role: "Суддя",
    status: "invited"
  },
  {
    id: 3,
    title: "Міжнародний турнір з фітнесу",
    date: "2025-10-10",
    location: "Одеса, Арена",
    role: "Технічний делегат",
    status: "pending"
  }
];

const mockAthletes = [
  {
    id: 1,
    name: "Анна Іваненко",
    age: 16,
    level: "junior",
    achievements: "Чемпіон області 2024",
    trainingSchedule: "Пн, Ср, Пт - 18:00-20:00"
  },
  {
    id: 2,
    name: "Максим Петренко",
    age: 19,
    level: "senior",
    achievements: "Срібний призер України 2024",
    trainingSchedule: "Вт, Чт, Сб - 19:00-21:00"
  },
  {
    id: 3,
    name: "Софія Коваленко",
    age: 14,
    level: "beginner",
    achievements: "Переможець регіонального турніру",
    trainingSchedule: "Пн, Ср - 17:00-18:30"
  }
];

const mockCourses = [
  {
    id: 1,
    title: "Семінар з сучасної аеробіки",
    date: "2025-07-15",
    location: "Київ",
    duration: "2 дні",
    credits: 10,
    status: "available"
  },
  {
    id: 2,
    title: "Курс підвищення кваліфікації суддів",
    date: "2025-08-10",
    location: "Львів",
    duration: "3 дні",
    credits: 15,
    status: "registered"
  },
  {
    id: 3,
    title: "Майстер-клас з хореографії",
    date: "2025-09-05",
    location: "Одеса",
    duration: "1 день",
    credits: 5,
    status: "completed"
  }
];

export default function CoachJudgeDashboard() {
  const { user } = useSimpleAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockProfile);

  if (!user || !user.roles?.includes("coach_judge")) {
    router.push("/profile");
    return null;
  }

  const handleSaveProfile = () => {
    // Тут буде логіка збереження через Supabase
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "invited":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "available":
        return "bg-gray-100 text-gray-800";
      case "registered":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Підтверджено";
      case "invited":
        return "Запрошення";
      case "pending":
        return "Очікує";
      case "available":
        return "Доступний";
      case "registered":
        return "Зареєстровано";
      case "completed":
        return "Завершено";
      default:
        return "Невідомо";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner":
        return "Початківець";
      case "junior":
        return "Юніор";
      case "senior":
        return "Сеніор";
      default:
        return level;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Панель тренера/судді
          </h1>
          <p className="text-gray-600">
            Управляйте своєю тренерською діяльністю та суддівством
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активні спортсмени</p>
                  <p className="text-2xl font-bold text-gray-900">{mockAthletes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Судейство</p>
                  <p className="text-2xl font-bold text-gray-900">{mockUpcomingCompetitions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Досвід</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.experienceYears} років</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Сертифікати</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.certifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Основний контент */}
        <Tabs defaultValue="judging" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="judging">Суддівство</TabsTrigger>
            <TabsTrigger value="athletes">Спортсмени</TabsTrigger>
            <TabsTrigger value="courses">Курси</TabsTrigger>
            <TabsTrigger value="profile">Профіль</TabsTrigger>
            <TabsTrigger value="schedule">Розклад</TabsTrigger>
          </TabsList>

          {/* Вкладка суддівства */}
          <TabsContent value="judging" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Судейство змагань</h2>
              <Button className="btn-aerobics-primary">
                Переглянути всі змагання
              </Button>
            </div>

            <div className="grid gap-6">
              {mockUpcomingCompetitions.map((competition) => (
                <Card key={competition.id} className="card-aerobics">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{competition.title}</CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(competition.date).toLocaleDateString('uk-UA')}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {competition.location}
                            </span>
                            <span className="flex items-center">
                              <Shield className="h-4 w-4 mr-1" />
                              {competition.role}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(competition.status)}>
                        {getStatusText(competition.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Роль: <span className="font-medium">{competition.role}</span>
                      </div>
                      <div className="flex space-x-2">
                        {competition.status === "invited" && (
                          <>
                            <Button size="sm" className="btn-aerobics-primary">
                              Прийняти
                            </Button>
                            <Button variant="outline" size="sm">
                              Відхилити
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          Деталі
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Вкладка спортсменів */}
          <TabsContent value="athletes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Мої спортсмени</h2>
              <Button className="btn-aerobics-secondary">
                Додати спортсмена
              </Button>
            </div>

            <div className="grid gap-4">
              {mockAthletes.map((athlete) => (
                <Card key={athlete.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {athlete.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{athlete.name}</h3>
                          <p className="text-sm text-gray-600">
                            {athlete.age} років • {getLevelText(athlete.level)}
                          </p>
                          <p className="text-sm text-gray-500">{athlete.achievements}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">Розклад тренувань:</p>
                        <p className="text-sm font-medium">{athlete.trainingSchedule}</p>
                        <div className="flex space-x-2 mt-3">
                          <Button variant="outline" size="sm">
                            Профіль
                          </Button>
                          <Button variant="outline" size="sm">
                            Програма
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Вкладка курсів */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Курси підвищення кваліфікації</h2>
              <Button className="btn-aerobics-accent">
                Знайти курси
              </Button>
            </div>

            <div className="grid gap-4">
              {mockCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(course.date).toLocaleDateString('uk-UA')}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {course.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.duration}
                          </span>
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            {course.credits} кредитів
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(course.status)}>
                          {getStatusText(course.status)}
                        </Badge>
                        {course.status === "available" && (
                          <Button size="sm" className="btn-aerobics-primary">
                            Зареєструватися
                          </Button>
                        )}
                        {course.status === "registered" && (
                          <Button variant="outline" size="sm">
                            Деталі
                          </Button>
                        )}
                        {course.status === "completed" && (
                          <Button variant="outline" size="sm">
                            Сертифікат
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Вкладка профілю */}
          <TabsContent value="profile" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Професійний профіль</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="btn-aerobics-secondary">
                  <Edit className="mr-2 h-4 w-4" />
                  Редагувати
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} className="btn-aerobics-primary">
                    <Save className="mr-2 h-4 w-4" />
                    Зберегти
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    <X className="mr-2 h-4 w-4" />
                    Скасувати
                  </Button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Особиста інформація */}
              <Card>
                <CardHeader>
                  <CardTitle>Особиста інформація</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Повне ім'я
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Місто
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.city}
                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Досвід роботи
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profile.experienceYears}
                        onChange={(e) => setProfile({...profile, experienceYears: Number(e.target.value)})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.experienceYears} років</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Професійна інформація */}
              <Card>
                <CardHeader>
                  <CardTitle>Професійна інформація</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Освіта
                    </label>
                    {isEditing ? (
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={2}
                        value={profile.education}
                        onChange={(e) => setProfile({...profile, education: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.education}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Спеціалізації
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profile.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сертифікати
                    </label>
                    <div className="space-y-2">
                      {profile.certifications.map((cert) => (
                        <div key={cert} className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Рівень судді
                    </label>
                    <Badge className="bg-purple-100 text-purple-800">
                      {profile.judgeLevel}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Доступний для суддівства</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Філософія тренування */}
            <Card>
              <CardHeader>
                <CardTitle>Філософія тренування</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={4}
                    value={profile.coachingPhilosophy}
                    onChange={(e) => setProfile({...profile, coachingPhilosophy: e.target.value})}
                  />
                ) : (
                  <p className="text-gray-900">{profile.coachingPhilosophy}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка розкладу */}
          <TabsContent value="schedule" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Мій розклад</h2>

            <div className="grid md:grid-cols-7 gap-4">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((day, index) => (
                <Card key={day}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-center text-sm">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Тут будуть заняття з бази даних */}
                    {index < 5 && (
                      <div className="bg-blue-50 p-2 rounded text-xs">
                        <div className="font-medium">18:00-20:00</div>
                        <div className="text-gray-600">Групові тренування</div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="bg-purple-50 p-2 rounded text-xs">
                        <div className="font-medium">20:00-21:00</div>
                        <div className="text-gray-600">Індивідуальне</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Швидкі дії</CardTitle>
              </CardHeader>
              <CardContent className="flex space-x-4">
                <Button className="btn-aerobics-primary">
                  Додати тренування
                </Button>
                <Button variant="outline">
                  Переглянути календар
                </Button>
                <Button variant="outline">
                  Налаштування розкладу
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
