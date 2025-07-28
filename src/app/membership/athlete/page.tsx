"use client";

import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClubMembershipRequest } from "@/components/ClubMembershipRequest";
import {
  Trophy,
  Calendar,
  Users,
  Award,
  CheckCircle,
  UserPlus,
  Target,
  Star
} from "lucide-react";

export default function AthleteMembershipPage() {
  const { user } = useSimpleAuth();
  const router = useRouter();

  const handleRegistration = () => {
    // Перенаправляємо прямо на форму реєстрації спортсмена
    router.push('/membership/athlete/registration');
  };

  const benefits = [
    {
      icon: Trophy,
      title: "Участь у змаганнях",
      description: "Доступ до всіх офіційних змагань з спортивної аеробіки та фітнесу в Україні"
    },
    {
      icon: Calendar,
      title: "Календар подій",
      description: "Актуальна інформація про майбутні змагання, семінари та тренувальні збори"
    },
    {
      icon: Award,
      title: "Сертифікація",
      description: "Офіційні документи про участь та досягнення у змаганнях"
    },
    {
      icon: Users,
      title: "Спільнота",
      description: "Зв'язок з іншими спортсменами, тренерами та клубами"
    },
    {
      icon: Target,
      title: "Особистий кабінет",
      description: "Управління профілем, перегляд результатів та статистики"
    },
    {
      icon: Star,
      title: "Рейтинг",
      description: "Участь у офіційному рейтингу спортсменів України"
    }
  ];

  const requirements = [
    "Вік від 6 років (з дозволу батьків для неповнолітніх)",
    "Медична довідка про відсутність протипоказань",
    "Страховий поліс спортсмена",
    "Згода на обробку персональних даних",
    "Оплата членського внеску (за потреби)"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Хлібні крихти */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-blue-600">Головна</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/membership" className="text-gray-700 hover:text-blue-600">Членство</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Спортсмен</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-pink-500 to-blue-600">
              <Trophy className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Членство для спортсменів
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Станьте офіційним членом ФУСАФ та отримайте доступ до всіх можливостей
            для розвитку у спортивній аеробіці та фітнесі
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основна інформація */}
          <div className="lg:col-span-2 space-y-8">
            {/* Переваги */}
            <Card>
              <CardHeader>
                <CardTitle>Переваги членства</CardTitle>
                <CardDescription>
                  Що ви отримуєте, ставши членом федерації
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div key={index} className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 rounded-lg bg-blue-100">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Вимоги */}
            <Card>
              <CardHeader>
                <CardTitle>Вимоги для реєстрації</CardTitle>
                <CardDescription>
                  Необхідні документи та умови для членства
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Процес реєстрації */}
            <Card>
              <CardHeader>
                <CardTitle>Як зареєструватися?</CardTitle>
                <CardDescription>
                  Простий процес реєстрації у 4 кроки
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Реєстрація аккаунту</h4>
                        <p className="text-sm text-gray-600">Створіть аккаунт через Google</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Вибір ролі</h4>
                        <p className="text-sm text-gray-600">Оберіть роль "Спортсмен"</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Заповнення профілю</h4>
                        <p className="text-sm text-gray-600">Вкажіть особисту інформацію</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold">Підтвердження</h4>
                        <p className="text-sm text-gray-600">Завантажте необхідні документи</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Бічна панель */}
          <div className="space-y-6">
            {/* Кнопка реєстрації */}
            <Card className="card-aerobics">
              <CardContent className="p-6 text-center">
                <Trophy className="h-16 w-16 mx-auto text-pink-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Готові приєднатися?</h3>
                <p className="text-gray-600 mb-6">
                  Почніть свій шлях у спортивній аеробіці вже сьогодні
                </p>
                <Button
                  onClick={handleRegistration}
                  className="w-full btn-aerobics-primary"
                  size="lg"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Зареєструватися як спортсмен
                </Button>
              </CardContent>
            </Card>

            {/* Клубне/підрозділне членство */}
            {user?.roles?.includes('athlete') && (
              <ClubMembershipRequest />
            )}

            {/* Контакти */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Потрібна допомога?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <br />
                    <a href="mailto:info@fusaf.org.ua" className="text-blue-600 hover:underline">
                      info@fusaf.org.ua
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Телефон:</span>
                    <br />
                    <a href="tel:+380501234567" className="text-blue-600 hover:underline">
                      +38 (050) 123-45-67
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Робочі години:</span>
                    <br />
                    Пн-Пт: 9:00 - 18:00
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Наша спільнота</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">1,200+</div>
                    <div className="text-sm text-gray-600">Активних спортсменів</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">85+</div>
                    <div className="text-sm text-gray-600">Змагань щороку</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">50+</div>
                    <div className="text-sm text-gray-600">Спортивних клубів</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
