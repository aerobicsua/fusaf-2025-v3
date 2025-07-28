"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
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
  User,
  MapPin,
  Clock,
  Medal,
  Star,
  Settings,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";
import Link from "next/link";

// Mock data - це буде замінено на реальні дані з Supabase
const mockProfile = {
  id: "1",
  name: "Марія Петренко",
  email: "maria@example.com",
  phone: "+380501234567",
  city: "Львів",
  dateOfBirth: "1995-03-15",
  club: "Спортивний клуб 'Олімп'",
  sportLevel: "professional",
  coachName: "Олексій Коваленко",
  achievements: "Чемпіон України 2023, Срібний призер Європи 2022",
  medicalClearance: true,
  insuranceValid: true
};

const mockCompetitions = [
  {
    id: 1,
    title: "Чемпіонат України з спортивної аеробіки",
    date: "2025-09-15",
    location: "Київ, Палац спорту",
    status: "registered",
    category: "Професіонали"
  },
  {
    id: 2,
    title: "Кубок міста Львів",
    date: "2025-08-20",
    location: "Львів, Спорткомплекс",
    status: "confirmed",
    category: "Відкрита"
  },
  {
    id: 3,
    title: "Міжнародний турнір з фітнесу",
    date: "2025-10-10",
    location: "Одеса, Арена",
    status: "pending",
    category: "Міжнародна"
  }
];

const mockResults = [
  {
    id: 1,
    competition: "Чемпіонат України 2024",
    date: "2024-09-15",
    place: 1,
    category: "Професіонали",
    score: "9.85"
  },
  {
    id: 2,
    competition: "Кубок Європи 2024",
    date: "2024-07-20",
    place: 2,
    category: "Професіонали",
    score: "9.72"
  },
  {
    id: 3,
    competition: "Національний чемпіонат 2024",
    date: "2024-05-10",
    place: 1,
    category: "Професіонали",
    score: "9.90"
  }
];

export default function AthleteDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockProfile);

  if (!user || user.user_metadata?.role !== "athlete") {
    router.push("/auth/role-selection");
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
      case "registered":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Підтверджено";
      case "registered":
        return "Зареєстровано";
      case "pending":
        return "Очікує";
      default:
        return "Невідомо";
    }
  };

  const getPlaceIcon = (place: number) => {
    switch (place) {
      case 1:
        return <Medal className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Особистий кабінет спортсмена
          </h1>
          <p className="text-gray-600">
            Управляйте своїм профілем, переглядайте змагання та результати
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Участь у змаганнях</p>
                  <p className="text-2xl font-bold text-gray-900">{mockCompetitions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Medal className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Перші місця</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockResults.filter(r => r.place === 1).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Середній бал</p>
                  <p className="text-2xl font-bold text-gray-900">9.82</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Статус профілю</p>
                  <p className="text-sm font-bold text-green-600">Активний</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Основний контент */}
        <Tabs defaultValue="competitions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="competitions">Змагання</TabsTrigger>
            <TabsTrigger value="results">Результати</TabsTrigger>
            <TabsTrigger value="profile">Профіль</TabsTrigger>
            <TabsTrigger value="documents">Документи</TabsTrigger>
          </TabsList>

          {/* Вкладка змагань */}
          <TabsContent value="competitions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Мої змагання</h2>
              <Link href="/competitions">
                <Button className="btn-aerobics-primary">
                  Переглянути всі змагання
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {mockCompetitions.map((competition) => (
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
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(competition.status)}>
                          {getStatusText(competition.status)}
                        </Badge>
                        <Badge variant="outline">{competition.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Реєстрація: {competition.status === "confirmed" ? "Підтверджена" : "Активна"}
                      </div>
                      <div className="flex space-x-2">
                        {competition.status === "registered" && (
                          <Button variant="outline" size="sm">
                            Скасувати реєстрацію
                          </Button>
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

          {/* Вкладка результатів */}
          <TabsContent value="results" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Мої результати</h2>

            <div className="grid gap-4">
              {mockResults.map((result) => (
                <Card key={result.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        {getPlaceIcon(result.place)}
                        <div>
                          <h3 className="font-semibold">{result.competition}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(result.date).toLocaleDateString('uk-UA')} • {result.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{result.place} місце</p>
                        <p className="text-sm text-gray-600">Бал: {result.score}</p>
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
              <h2 className="text-2xl font-bold text-gray-900">Профіль спортсмена</h2>
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
                      Дата народження
                    </label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">
                        {new Date(profile.dateOfBirth).toLocaleDateString('uk-UA')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Спортивна інформація */}
              <Card>
                <CardHeader>
                  <CardTitle>Спортивна інформація</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Клуб
                    </label>
                    <p className="text-gray-900">{profile.club}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Рівень спортсмена
                    </label>
                    <Badge className="bg-blue-100 text-blue-800">
                      {profile.sportLevel === "professional" ? "Професіонал" : profile.sportLevel}
                    </Badge>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тренер
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.coachName}
                        onChange={(e) => setProfile({...profile, coachName: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.coachName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Досягнення
                    </label>
                    {isEditing ? (
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                        value={profile.achievements}
                        onChange={(e) => setProfile({...profile, achievements: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.achievements}</p>
                    )}
                  </div>

                  {/* Статус документів */}
                  <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Статус документів
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {profile.medicalClearance ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm">Медична довідка</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {profile.insuranceValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm">Спортивна страховка</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Вкладка документів */}
          <TabsContent value="documents" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Документи</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Медична довідка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {profile.medicalClearance ? "Дійсна до: 15.12.2025" : "Не завантажена"}
                      </p>
                      <Badge className={profile.medicalClearance ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {profile.medicalClearance ? "Дійсна" : "Потрібна"}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      {profile.medicalClearance ? "Переглянути" : "Завантажити"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Спортивна страховка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {profile.insuranceValid ? "Дійсна до: 01.01.2026" : "Не завантажена"}
                      </p>
                      <Badge className={profile.insuranceValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {profile.insuranceValid ? "Дійсна" : "Потрібна"}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      {profile.insuranceValid ? "Переглянути" : "Завантажити"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Рекомендації</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Важливо!</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Переконайтеся, що всі ваші документи є актуальними перед реєстрацією на змагання.
                        Медична довідка має бути не старше 1 року, а спортивна страховка - дійсною на момент проведення змагання.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
