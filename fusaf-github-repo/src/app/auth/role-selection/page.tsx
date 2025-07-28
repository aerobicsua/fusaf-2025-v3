"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Shield, Building2 } from "lucide-react";

const roles = [
  {
    id: "athlete",
    title: "Спортсмен",
    description: "Я займаюся спортивною аеробікою або фітнесом та хочу брати участь у змаганнях",
    icon: Trophy,
    features: [
      "Реєстрація на змагання",
      "Перегляд результатів",
      "Доступ до курсів",
      "Особистий профіль спортсмена"
    ],
    color: "bg-gradient-primary"
  },
  {
    id: "club_owner",
    title: "Власник/Представник клубу",
    description: "Я представляю спортивний клуб та хочу організовувати змагання",
    icon: Building2,
    features: [
      "Створення змагань",
      "Управління учасниками",
      "Аналітика та звіти",
      "Реєстрація спортсменів клубу"
    ],
    color: "bg-gradient-secondary"
  },
  {
    id: "coach_judge",
    title: "Тренер/Суддя",
    description: "Я тренер або суддя та хочу працювати на змаганнях",
    icon: Shield,
    features: [
      "Суддівство змагань",
      "Доступ до навчальних матеріалів",
      "Сертифікація",
      "Календар призначень"
    ],
    color: "bg-gradient-accent"
  }
];

export default function RoleSelectionPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleSelect = async (roleId: string) => {
    if (!session) return;

    setIsUpdating(true);
    try {
      // Тут би зазвичай була API call для оновлення ролі в базі даних
      // Наразі просто симулюємо оновлення сесії
      await update({
        ...session,
        user: {
          ...session.user,
          role: roleId
        }
      });

      // Перенаправляємо на відповідну панель управління
      switch (roleId) {
        case "athlete":
          router.push("/dashboard/athlete");
          break;
        case "club_owner":
          router.push("/dashboard/club-owner");
          break;
        case "coach_judge":
          router.push("/dashboard/coach-judge");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!session) {
    if (typeof window !== 'undefined') {
      router.push("/");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Ласкаво просимо, {session.user?.name}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Виберіть свою роль у ФУСАФ, щоб отримати
              персоналізований досвід та доступ до відповідних функцій.
            </p>
          </div>

          {/* Картки ролей */}
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role) => {
              const IconComponent = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <Card
                  key={role.id}
                  className={`card-aerobics cursor-pointer transition-all duration-300 ${
                    isSelected ? "ring-4 ring-pink-400 scale-105" : "hover:scale-105"
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardHeader className={`${role.color} text-white p-6`}>
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-8 w-8" />
                      <div>
                        <CardTitle className="text-2xl">{role.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardDescription className="text-gray-600 mb-4 text-base">
                      {role.description}
                    </CardDescription>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Можливості:</h4>
                      <ul className="space-y-1">
                        {role.features.map((feature) => (
                          <li key={feature} className="text-sm text-gray-600 flex items-center">
                            <span className="w-2 h-2 bg-pink-400 rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Кнопка підтвердження */}
          {selectedRole && (
            <div className="text-center mt-12">
              <Button
                onClick={() => handleRoleSelect(selectedRole)}
                disabled={isUpdating}
                className="btn-aerobics-primary text-lg px-8 py-4"
              >
                {isUpdating ? "Збереження..." : "Підтвердити вибір"}
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Ви зможете змінити роль пізніше в налаштуваннях профілю
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
