"use client";

import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building,
  Users,
  Calendar,
  BarChart3,
  Trophy,
  UserPlus,
  CheckCircle,
  Star,
  Target,
  Award
} from "lucide-react";

export default function ClubOwnerMembershipPage() {
  const { user } = useSimpleAuth();
  const router = useRouter();

  const handleRegistration = () => {
    // Перенаправляємо прямо на форму реєстрації керівника клубу/підрозділу
    router.push('/membership/club-owner/registration');
  };

  const benefits = [
    {
      icon: Building,
      title: "Офіційна реєстрація клубу/підрозділу",
      description: "Зареєструйте свій клуб або підрозділ у федерації та отримайте офіційний статус"
    },
    {
      icon: Calendar,
      title: "Організація змагань",
      description: "Право проводити офіційні змагання під егідою ФУСАФ"
    },
    {
      icon: Users,
      title: "Управління спортсменами",
      description: "Інструменти для роботи з командою та відстеження прогресу"
    },
    {
      icon: BarChart3,
      title: "Аналітика та звіти",
      description: "Детальна статистика по клубу/підрозділу, спортсменам та результатам"
    },
    {
      icon: Trophy,
      title: "Участь в офіційних змаганнях",
      description: "Представляйте своїх спортсменів на змаганнях усіх рівнів"
    },
    {
      icon: CheckCircle,
      title: "Сертифікація тренерів",
      description: "Допомога у підготовці та сертифікації тренерського складу"
    }
  ];

  const requirements = [
    {
      icon: UserPlus,
      title: "Керівник організації",
      description: "Ви повинні бути керівником, директором або засновником клубу/підрозділу"
    },
    {
      icon: Building,
      title: "Офіційна реєстрація",
      description: "Клуб/підрозділ має бути офіційно зареєстрований як юридична особа або ФОП"
    },
    {
      icon: Target,
      title: "Спортивна спеціалізація",
      description: "Основна діяльність має включати спортивну аеробіку або фітнес"
    },
    {
      icon: Award,
      title: "Досвід керівництва",
      description: "Наявність досвіду у сфері спорту або керівництва організаціями"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Заповнення заявки",
      description: "Заповніть детальну форму з інформацією про себе та ваш клуб/підрозділ"
    },
    {
      number: "02",
      title: "Завантаження документів",
      description: "Додайте документи про реєстрацію юридичної особи або ФОП"
    },
    {
      number: "03",
      title: "Розгляд заявки",
      description: "Адміністрація ФУСАФ розглядає заявку протягом 3-5 робочих днів"
    },
    {
      number: "04",
      title: "Активація аккаунту",
      description: "Після схвалення ви отримаєте доступ до особистого кабінету"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Хлібні крихти */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-pink-600">Головна</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/membership" className="text-gray-700 hover:text-pink-600">Членство</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Керівник клубу/підрозділу</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
              <Building className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Членство для Керівників Клубів/Підрозділів
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Офіційно зареєструйте ваш клуб або підрозділ у Федерації України зі Спортивної Аеробіки і Фітнесу
            та отримайте доступ до всіх можливостей для розвитку вашої організації
          </p>
        </div>

        {/* Переваги членства */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Переваги членства для клубів/підрозділів
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-pink-100">
                      <benefit.icon className="h-6 w-6 text-pink-600" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Вимоги до членства */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Вимоги до керівників клубів/підрозділів
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {requirements.map((requirement, index) => (
              <Card key={index} className="border-purple-200 hover:border-purple-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <requirement.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">{requirement.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {requirement.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Процес реєстрації */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Процес реєстрації клубу/підрозділу
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{step.number}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Інформація про вартість */}
        <div className="mb-16">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800">Членський внесок</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">₴1,200</div>
              <p className="text-green-700 mb-4">на рік для клубу/підрозділу</p>
              <div className="space-y-2 text-sm text-green-600">
                <p>✓ Офіційна реєстрація в ФУСАФ</p>
                <p>✓ Право проводити змагання</p>
                <p>✓ Доступ до всіх сервісів платформи</p>
                <p>✓ Підтримка та консультації</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Кнопка реєстрації */}
        <div className="text-center mb-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Готові розпочати?</CardTitle>
              <CardDescription>
                Зареєструйте ваш клуб/підрозділ у ФУСАФ та отримайте доступ до всіх можливостей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRegistration}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Подати заявку на реєстрацію
              </Button>

              {user && (
                <p className="text-sm text-gray-600 mt-3">
                  Ви ввійшли як {user?.name || user?.email}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Додаткова інформація */}
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-xl font-semibold mb-4">Додаткова інформація</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Документи для реєстрації:</h4>
              <ul className="space-y-1">
                <li>• Витяг з ЄДР або свідоцтво про реєстрацію ФОП</li>
                <li>• Статут організації (для юридичних осіб)</li>
                <li>• Довідка про податкову реєстрацію</li>
                <li>• Документи, що підтверджують право керування</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Контактна інформація:</h4>
              <ul className="space-y-1">
                <li>📧 Email: clubs@fusaf.org.ua</li>
                <li>📞 Телефон: +38 (050) 123-45-67</li>
                <li>🕒 Час роботи: Пн-Пт 9:00-18:00</li>
                <li>📍 Адреса: м. Київ, вул. Спортивна, 1</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
