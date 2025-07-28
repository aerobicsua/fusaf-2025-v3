"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  UserPlus,
  Star,
  Target,
  Trophy,
  Calendar
} from "lucide-react";

export default function CoachJudgeMembershipPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleRegistration = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    router.push('/auth/role-selection?role=coach_judge');
  };

  const benefits = [
    {
      icon: Users,
      title: "Підготовка спортсменів",
      description: "Офіційне право тренувати спортсменів для участі у змаганнях ФУСАФ"
    },
    {
      icon: Trophy,
      title: "Суддівство змагань",
      description: "Участь у суддівстві офіційних змагань різного рівня"
    },
    {
      icon: BookOpen,
      title: "Курси підвищення кваліфікації",
      description: "Доступ до професійних курсів та семінарів"
    },
    {
      icon: Award,
      title: "Сертифікація",
      description: "Офіційні сертифікати та ліцензії тренера/судді"
    },
    {
      icon: Star,
      title: "Професійний рейтинг",
      description: "Участь у рейтингу тренерів та суддів України"
    },
    {
      icon: Calendar,
      title: "Методична підтримка",
      description: "Доступ до навчальних матеріалів та методичних рекомендацій"
    }
  ];

  const requirements = [
    "Вища освіта у галузі фізичної культури та спорту (або суміжних спеціальностей)",
    "Досвід роботи у спорті мінімум 2 роки",
    "Проходження базового курсу підготовки ФУСАФ",
    "Медична довідка про придатність до роботи",
    "Довідка про відсутність судимості",
    "Сплата членського внеску та вартості курсів"
  ];

  const categories = [
    {
      title: "Тренер початківця",
      level: "Категорія C",
      requirements: [
        "Базовий курс ФУСАФ (40 годин)",
        "Практика під наглядом (50 годин)",
        "Здача теоретичного іспиту"
      ],
      rights: [
        "Підготовка спортсменів-початківців",
        "Проведення тренувань у групах",
        "Участь у місцевих змаганнях"
      ]
    },
    {
      title: "Тренер-інструктор",
      level: "Категорія B",
      requirements: [
        "Досвід роботи тренером 3+ роки",
        "Підвищення кваліфікації (60 годин)",
        "Підготовка мінімум 10 спортсменів"
      ],
      rights: [
        "Підготовка спортсменів всіх рівнів",
        "Суддівство регіональних змагань",
        "Проведення майстер-класів"
      ]
    },
    {
      title: "Тренер вищої категорії",
      level: "Категорія A",
      requirements: [
        "Досвід роботи тренером 5+ років",
        "Підготовка призерів національних змагань",
        "Проходження атестації"
      ],
      rights: [
        "Підготовка збірної команди",
        "Суддівство всеукраїнських змагань",
        "Викладання на курсах ФУСАФ"
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
                <span className="text-gray-500">Тренер/Суддя</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Членство для тренерів та суддів
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Розвивайте свою професійну кар'єру у спортивній аеробіці.
            Отримайте офіційний статус та доступ до найкращих освітніх програм
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
                  Можливості для професійного розвитку
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div key={index} className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 rounded-lg bg-purple-100">
                            <IconComponent className="h-6 w-6 text-purple-600" />
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

            {/* Категорії та кваліфікації */}
            <Card>
              <CardHeader>
                <CardTitle>Категорії кваліфікації</CardTitle>
                <CardDescription>
                  Професійний розвиток від початківця до експерта
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categories.map((category, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{category.title}</h3>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {category.level}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Вимоги:</h4>
                          <ul className="space-y-1">
                            {category.requirements.map((req, reqIndex) => (
                              <li key={reqIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Права та можливості:</h4>
                          <ul className="space-y-1">
                            {category.rights.map((right, rightIndex) => (
                              <li key={rightIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span>{right}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Вимоги */}
            <Card>
              <CardHeader>
                <CardTitle>Загальні вимоги</CardTitle>
                <CardDescription>
                  Необхідні документи та умови для членства
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
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
                <GraduationCap className="h-16 w-16 mx-auto text-purple-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Почніть кар'єру</h3>
                <p className="text-gray-600 mb-6">
                  Станьте офіційним тренером або суддею ФУСАФ
                </p>
                <Button
                  onClick={handleRegistration}
                  className="w-full btn-aerobics-primary"
                  size="lg"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Зареєструватися як тренер/суддя
                </Button>
              </CardContent>
            </Card>

            {/* Найближчі курси */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Найближчі курси</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="font-medium text-sm">Базовий курс тренерів</div>
                    <div className="text-xs text-gray-600">15-19 липня, Київ</div>
                    <div className="text-xs text-purple-600">Вартість: 3,500 грн</div>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="font-medium text-sm">Курс суддів категорії C</div>
                    <div className="text-xs text-gray-600">22-24 липня, Львів</div>
                    <div className="text-xs text-blue-600">Вартість: 2,800 грн</div>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="font-medium text-sm">Підвищення кваліфікації</div>
                    <div className="text-xs text-gray-600">5-7 серпня, Одеса</div>
                    <div className="text-xs text-green-600">Вартість: 4,200 грн</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Контакти */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Освітній відділ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <br />
                    <a href="mailto:education@fusaf.org.ua" className="text-blue-600 hover:underline">
                      education@fusaf.org.ua
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Телефон:</span>
                    <br />
                    <a href="tel:+380631234567" className="text-blue-600 hover:underline">
                      +38 (063) 123-45-67
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Методист:</span>
                    <br />
                    Марина Коваленко
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Наші тренери та судді</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">320+</div>
                    <div className="text-sm text-gray-600">Сертифікованих тренерів</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">180+</div>
                    <div className="text-sm text-gray-600">Кваліфікованих суддів</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">45+</div>
                    <div className="text-sm text-gray-600">Курсів щороку</div>
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
