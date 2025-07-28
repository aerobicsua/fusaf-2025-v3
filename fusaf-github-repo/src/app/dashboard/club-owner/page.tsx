"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getClubsByOwner,
  getCompetitionsByUser,
  getRegistrationsByCompetition,
  getCompetitionStats,
  getClubStats
} from "@/lib/database";
import type { User, Club, Competition } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  TrendingUp,
  Plus,
  Settings,
  Eye
} from "lucide-react";

export default function ClubOwnerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);

        // Отримуємо інформацію про користувача
        const authUser = await getCurrentUser();
        if (!authUser) {
          router.push('/auth/signin');
          return;
        }
        setUser(authUser);

        const userClubs = await getClubsByOwner(authUser.id);
        setClubs(userClubs);

        const userCompetitions = await getCompetitionsByUser(authUser.id);
        setCompetitions(userCompetitions);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto" />
            <p className="mt-4 text-gray-600">Завантаження панелі управління...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Панель управління власника клубу
          </h1>
          <p className="text-gray-600">
            Керуйте клубами та змаганнями
          </p>
        </div>

        {/* Статистика */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Клуби</p>
                  <p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Змагання</p>
                  <p className="text-2xl font-bold text-gray-900">{competitions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активні змагання</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {competitions.filter(c => c.status === 'registration_open').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Завершені</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {competitions.filter(c => c.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Клуби */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Мої клуби</h2>
            <Button className="btn-aerobics-primary">
              <Plus className="h-4 w-4 mr-2" />
              Створити клуб
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <Card key={club.id} className="card-aerobics">
                <CardHeader>
                  <CardTitle className="text-lg">{club.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {club.address}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Створено: {new Date(club.created_at).toLocaleDateString('uk-UA')}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Змагання */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Мої змагання</h2>
            <Button
              className="btn-aerobics-primary"
              onClick={() => router.push('/competitions/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Створити змагання
            </Button>
          </div>

          <div className="grid gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="card-aerobics">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{competition.title}</CardTitle>
                      <CardDescription>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(competition.date).toLocaleDateString('uk-UA', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {competition.location}
                            </div>
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant="outline">
                        {competition.status === "published" && "Опубліковано"}
                        {competition.status === "registration_open" && "Реєстрація відкрита"}
                        {competition.status === "registration_closed" && "Реєстрація закрита"}
                        {competition.status === "completed" && "Завершено"}
                        {competition.status === "draft" && "Чернетка"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {competition.description && (
                    <p className="text-gray-600 mb-4">{competition.description}</p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Створено: {new Date(competition.created_at).toLocaleDateString('uk-UA')}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Переглянути
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Налаштування
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
