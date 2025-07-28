"use client";

import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();
  const router = useRouter();

  const handleRegistration = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    router.push('/auth/role-selection?role=club_owner');
  };

  const benefits = [
    {
      icon: Building,
      title: "Офіційна реєстрація клубу",
      description: "Зареєструйте свій клуб у федерації та отримайте офіційний статус"
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
      description: "Детальна статистика по клубу, спортсменам та результатам"
    },
    {
      icon: Trophy,
      title: "Участь у рейтингах",
      description: "Клубний рейтинг та можливість отримання нагород"
    },
    {
      icon: Star,
      title: "Спонсорські можливості",
      description: "Доступ до програм спонсорства та комерційних партнерств"
    }
  ];

  const requirements = [
    "Юридична особа або ФОП (для офіційної реєстрації)",
    "Наявність спортивної бази або угода про оренду",
    "Мінімум 2 кваліфікованих тренери у штаті",
    "Документи про право на проведення спортивної діяльності",
    "Страхування спортсменів та відповідальності",
    "Сплата членського внеску відповідно до тарифів"
  ];

  const services = [
    {
      title: "Базовий пакет",
      price: "2,000 грн/рік",
      features: [
        "Реєстрація клубу у федерації",
        "Участь у змаганнях",
        "Доступ до календаря подій",
        "Основна аналітика"
      ]
    },
    {
      title: "Професійний пакет",
      price: "5,000 грн/рік",
      features: [
        "Всі можливості базового пакету",
        "Організація власних змагань",
        "Розширена аналітика",
        "Пріоритетна підтримка",
        "Маркетингові матеріали"
      ]
    },
    {
      title: "Преміум пакет",
      price: "10,000 грн/рік",
      features: [
        "Всі можливості професійного пакету",
        "Індивідуальний менеджер",
        "Спонсорські можливості",
        "Проведення семінарів",
        "Персоналізовані звіти"
      ]
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
                <span className="text-gray-500">Власник клубу</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-blue-600">
              <Building className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Членство для власників клубів
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Розвивайте свій спортивний клуб разом з ФУСАФ. Отримайте всі інструменти
            для успішного управління та організації змагань
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
                  Можливості для розвитку вашого клубу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div key={index} className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 rounded-lg bg-green-100">
                            <IconComponent className="h-6 w-6 text-green-600" />
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

            {/* Пакети послуг */}
            <Card>
              <CardHeader>
                <CardTitle>Пакети послуг</CardTitle>
                <CardDescription>
                  Виберіть оптимальний пакет для вашого клубу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {services.map((service, index) => (
                    <div key={index} className={`border rounded-lg p-6 ${index === 1 ? 'border-green-500 relative' : 'border-gray-200'}`}>
                      {index === 1 && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Популярний
                          </span>
                        </div>
                      )}
                      <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                      <div className="text-2xl font-bold text-green-600 mb-4">{service.price}</div>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
          </div>

          {/* Бічна панель */}
          <div className="space-y-6">
            {/* Кнопка реєстрації */}
            <Card className="card-aerobics">
              <CardContent className="p-6 text-center">
                <Building className="h-16 w-16 mx-auto text-green-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Зареєструйте клуб</h3>
                <p className="text-gray-600 mb-6">
                  Станьте частиною офіційної мережі клубів ФУСАФ
                </p>
                <Button
                  onClick={handleRegistration}
                  className="w-full btn-aerobics-primary"
                  size="lg"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Зареєструвати клуб
                </Button>
              </CardContent>
            </Card>

            {/* Переваги співпраці */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Чому ФУСАФ?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Офіційний статус</div>
                      <div className="text-xs text-gray-600">Визнання на національному рівні</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Професійна підтримка</div>
                      <div className="text-xs text-gray-600">Консультації та методична допомога</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Мережа контактів</div>
                      <div className="text-xs text-gray-600">Співпраця з іншими клубами</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Контакти */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Потрібна консультація?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <br />
                    <a href="mailto:clubs@fusaf.org.ua" className="text-blue-600 hover:underline">
                      clubs@fusaf.org.ua
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Телефон:</span>
                    <br />
                    <a href="tel:+380671234567" className="text-blue-600 hover:underline">
                      +38 (067) 123-45-67
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Менеджер з клубів:</span>
                    <br />
                    Олена Петренко
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Мережа клубів ФУСАФ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">50+</div>
                    <div className="text-sm text-gray-600">Офіційних клубів</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">150+</div>
                    <div className="text-sm text-gray-600">Організованих змагань</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">24</div>
                    <div className="text-sm text-gray-600">Області присутності</div>
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
