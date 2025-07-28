"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Trophy,
  Award,
  UserPlus,
  Building,
  GraduationCap,
  CheckCircle
} from "lucide-react";

export default function MembershipPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleRoleSelection = (role: string) => {
    if (!session) {
      // Перенаправляємо на авторизацію
      router.push('/auth/signin');
      return;
    }

    // Перенаправляємо на вибір ролі з параметром
    router.push(`/auth/role-selection?role=${role}`);
  };

  const membershipTypes = [
    {
      role: "athlete",
      title: "Спортсмен",
      description: "Участь у змаганнях, доступ до тренувань та атестації",
      icon: Trophy,
      color: "bg-blue-100 text-blue-800",
      features: [
        "Участь у змаганнях з спортивної аеробіки та фітнесу",
        "Доступ до календаря змагань та подій",
        "Особистий кабінет для управління профілем",
        "Історія участі та результатів",
        "Доступ до сертифікатів та атестації",
        "Можливість приєднання до клубів"
      ]
    },
    {
      role: "club_owner",
      title: "Власник клубу / Представник",
      description: "Управління клубом, організація змагань та підготовка спортсменів",
      icon: Building,
      color: "bg-green-100 text-green-800",
      features: [
        "Реєстрація та управління спортивним клубом",
        "Організація та проведення змагань",
        "Управління командою спортсменів",
        "Доступ до статистики та звітів",
        "Можливість запрошувати тренерів",
        "Комерційні можливості та спонсорство"
      ]
    },
    {
      role: "coach_judge",
      title: "Тренер / Суддя",
      description: "Підготовка спортсменів, суддівство змагань та професійний розвиток",
      icon: GraduationCap,
      color: "bg-purple-100 text-purple-800",
      features: [
        "Підготовка та тренування спортсменів",
        "Суддівство на змаганнях та турнірах",
        "Доступ до курсів підвищення кваліфікації",
        "Професійна сертифікація та атестація",
        "Участь у семінарах та майстер-класах",
        "Можливість викладання на курсах"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Членство у ФУСАФ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Приєднуйтеся до Федерації України зі Спортивної Аеробіки і Фітнесу та отримайте
            доступ до професійних можливостей та ресурсів у сфері спортивної аеробіки
          </p>
        </div>

        {/* Переваги членства */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Спільнота</h3>
              <p className="text-gray-600">
                Приєднайтеся до активної спільноти спортсменів, тренерів та організаторів
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Змагання</h3>
              <p className="text-gray-600">
                Участь у офіційних змаганнях та турнірах на всіх рівнях
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Сертифікація</h3>
              <p className="text-gray-600">
                Офіційні сертифікати та документи про атестацію
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Типи членства */}
        <div className="grid lg:grid-cols-3 gap-8">
          {membershipTypes.map((type) => {
            const IconComponent = type.icon;

            return (
              <Card key={type.role} className="card-aerobics h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500 to-blue-600">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{type.title}</CardTitle>
                      <Badge className={type.color}>
                        {type.role === "athlete" && "Спортсмен"}
                        {type.role === "club_owner" && "Організатор"}
                        {type.role === "coach_judge" && "Фахівець"}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {type.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3 mb-6">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleRoleSelection(type.role)}
                    className="w-full btn-aerobics-primary"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {session ? "Обрати роль" : "Зареєструватися"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Додаткова інформація */}
        <div className="mt-12 bg-gradient-to-r from-pink-500 to-blue-600 rounded-xl text-white p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Готові приєднатися до ФУСАФ?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Виберіть відповідний тип членства та отримайте доступ до всіх можливостей федерації
            </p>

            {!session && (
              <Button
                onClick={() => router.push('/auth/signin')}
                variant="secondary"
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-100"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Почати реєстрацію
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
