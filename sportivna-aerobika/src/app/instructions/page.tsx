"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  UserPlus,
  LogIn,
  Trophy,
  Users,
  Building,
  GraduationCap,
  CreditCard,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Info,
  Target,
  Star,
  Award,
  Calendar
} from "lucide-react";

export default function InstructionsPage() {
  const instructionSections = [
    {
      id: "registration",
      title: "Реєстрація в системі",
      description: "Як створити аккаунт та обрати роль",
      icon: UserPlus,
      color: "bg-blue-100 text-blue-800",
      steps: [
        "Натисніть кнопку 'Увійти з Google' у верхньому правому куті",
        "Оберіть ваш Google аккаунт або створіть новий",
        "Після входу ви будете перенаправлені на сторінку вибору ролі",
        "Оберіть відповідну роль: Спортсмен, Власник клубу, або Тренер/Суддя",
        "Заповніть додаткову інформацію про себе",
        "Підтвердіть реєстрацію"
      ]
    },
    {
      id: "athlete",
      title: "Інструкції для спортсменів",
      description: "Як користуватися системою спортсменам",
      icon: Trophy,
      color: "bg-yellow-100 text-yellow-800",
      steps: [
        "Заповніть ваш профіль спортсмена в особистому кабінеті",
        "Приєднайтеся до спортивного клубу або створіть запит",
        "Переглядайте доступні змагання в розділі 'Змагання'",
        "Реєструйтеся на змагання, використовуючи кнопку 'Зареєструватися'",
        "Сплачуйте участь через інтегровану систему LiqPay (якщо потрібно)",
        "Відстежуйте свої результати та статистику в кабінеті",
        "Отримуйте сертифікати та документи після змагань"
      ]
    },
    {
      id: "club-owner",
      title: "Інструкції для власників клубів",
      description: "Як управляти клубом та організовувати змагання",
      icon: Building,
      color: "bg-green-100 text-green-800",
      steps: [
        "Зареєструйте ваш клуб в системі через особистий кабінет",
        "Заповніть інформацію про клуб: назва, адреса, контакти",
        "Запросіть спортсменів приєднатися до вашого клубу",
        "Створюйте змагання через розділ 'Створити змагання'",
        "Налаштуйте деталі змагання: дата, час, категорії, вартість",
        "Відстежуйте реєстрації учасників та управляйте списками",
        "Переглядайте аналітику та звіти по клубу та змаганням"
      ]
    },
    {
      id: "coach-judge",
      title: "Інструкції для тренерів та суддів",
      description: "Професійні функції та можливості",
      icon: GraduationCap,
      color: "bg-purple-100 text-purple-800",
      steps: [
        "Отримайте сертифікацію через систему курсів ФУСАФ",
        "Запишіться на курси підвищення кваліфікації",
        "Приєднайтеся до клубів як тренер або суддя",
        "Управляйте групами спортсменів через кабінет тренера",
        "Беріть участь у суддівстві змагань",
        "Ведіть облік своїх підопічних та їх результатів",
        "Проходіть атестацію та підвищуйте категорію"
      ]
    }
  ];

  const paymentInstructions = [
    "Оберіть змагання та натисніть 'Зареєструватися'",
    "Заповніть форму реєстрації та підтвердіть участь",
    "Якщо змагання платне, ви будете перенаправлені на сторінку оплати",
    "Оберіть зручний спосіб оплати: картка, мобільний банкінг, або електронні гроші",
    "Введіть необхідні дані та підтвердіть платіж",
    "Після успішної оплати ви отримаєте підтвердження на email",
    "Ваш статус участі зміниться на 'Оплачено' в особистому кабінеті"
  ];

  const faqItems = [
    {
      question: "Як змінити свою роль в системі?",
      answer: "Роль можна змінити тільки через службу підтримки. Зв'яжіться з нами за email info@fusaf.org.ua з поясненням причини зміни ролі."
    },
    {
      question: "Що робити, якщо я забув пароль?",
      answer: "Система використовує вхід через Google, тому відновлення паролю відбувається через Google. Перейдіть на accounts.google.com для відновлення доступу."
    },
    {
      question: "Як отримати сертифікат після змагання?",
      answer: "Сертифікати автоматично з'являються в вашому особистому кабінеті після обробки результатів змагання. Це може тривати до 5 робочих днів."
    },
    {
      question: "Можна ли зареєструватися на змагання без клубу?",
      answer: "Для участі у більшості змагань потрібна приналежність до клубу. Створіть запит на приєднання до клубу або зв'яжіться з організаторами."
    },
    {
      question: "Як скасувати реєстрацію на змагання?",
      answer: "Скасування можливе не пізніше ніж за 48 годин до початку змагання через особистий кабінет. Повернення коштів відбувається згідно з правилами."
    },
    {
      question: "Де знайти результати змагань?",
      answer: "Всі результати публікуються в розділі 'Результати' та дублюються в особистих кабінетах учасників."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Інструкції користувача
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Детальний посібник з використання платформи ФУСАФ для всіх типів користувачів
          </p>
        </div>

        {/* Швидкий старт */}
        <Card className="mb-12 bg-gradient-to-r from-pink-50 to-blue-50 border-none">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Star className="h-6 w-6 mr-2 text-pink-600" />
              Швидкий старт
            </CardTitle>
            <CardDescription>
              Основні кроки для початку роботи з платформою
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Реєстрація</h3>
                <p className="text-sm text-gray-600">Створіть аккаунт через Google</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Вибір ролі</h3>
                <p className="text-sm text-gray-600">Оберіть тип користувача</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Профіль</h3>
                <p className="text-sm text-gray-600">Заповніть особисті дані</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2">Початок роботи</h3>
                <p className="text-sm text-gray-600">Використовуйте всі можливості</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Детальні інструкції */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {instructionSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.id} className="card-aerobics h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500 to-blue-600">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <Badge className={section.color}>
                        {section.id === "registration" && "Загальне"}
                        {section.id === "athlete" && "Спортсмени"}
                        {section.id === "club-owner" && "Власники клубів"}
                        {section.id === "coach-judge" && "Тренери/Судді"}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Оплата */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-green-600" />
              Система оплати
            </CardTitle>
            <CardDescription>
              Як здійснювати оплату за участь у змаганнях
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Покрокова інструкція:</h3>
                <div className="space-y-3">
                  {paymentInstructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Способи оплати:</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Банківські картки Visa/MasterCard</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Мобільний банкінг (Приват24, Monobank)</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Apple Pay / Google Pay</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Важливо</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Всі платежі обробляються через захищену систему LiqPay.
                        Скасування реєстрації можливе не пізніше ніж за 48 годин до змагання.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-6 w-6 mr-2 text-blue-600" />
              Часті запитання
            </CardTitle>
            <CardDescription>
              Відповіді на найпоширеніші питання користувачів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Підтримка */}
        <Card className="bg-gradient-to-r from-pink-500 to-blue-600 text-white">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Потрібна додаткова допомога?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Наша команда підтримки готова відповісти на ваші запитання
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Email підтримка</h3>
                  <a href="mailto:support@fusaf.org.ua" className="text-sm opacity-90 hover:underline">
                    support@fusaf.org.ua
                  </a>
                </div>
                <div className="text-center">
                  <Phone className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Телефон</h3>
                  <a href="tel:+380501234567" className="text-sm opacity-90 hover:underline">
                    +38 (050) 123-45-67
                  </a>
                </div>
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Робочі години</h3>
                  <p className="text-sm opacity-90">Пн-Пт: 9:00 - 18:00</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-pink-600 hover:bg-gray-100"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Написати в підтримку
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-pink-600"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Зателефонувати
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
