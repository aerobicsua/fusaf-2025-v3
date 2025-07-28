"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import Link from "next/link";
import {
  CheckCircle,
  Trophy,
  Mail,
  Calendar,
  ArrowRight,
  User,
  Shield,
  Star
} from "lucide-react";

function RegistrationSuccessContent() {
  const { user } = useSimpleAuth();
  const searchParams = useSearchParams();
  const [membershipInfo, setMembershipInfo] = useState({
    type: '',
    benefits: [] as string[],
    nextSteps: [] as string[]
  });
  const [isPendingClubOwner, setIsPendingClubOwner] = useState(false);

  useEffect(() => {
    // Перевіряємо чи це заявка на реєстрацію клубу
    const isFromClubRegistration = searchParams.get('type') === 'club';
    if (isFromClubRegistration && !user) {
      setIsPendingClubOwner(true);
      setMembershipInfo({
        type: 'Керівник клубу (очікує схвалення)',
        benefits: [
          'Право на керування спортивним клубом після схвалення',
          'Реєстрація спортсменів від клубу',
          'Організація змагань та тренувань',
          'Доступ до статистики та звітів',
          'Участь у раді федерації',
          'Доступ до маркетингових матеріалів'
        ],
        nextSteps: [
          'Дочекайтесь розгляду заявки адміністрацією (3-5 робочих днів)',
          'Перевірте електронну пошту для отримання результату',
          'Після схвалення - увійдіть в систему з надісланими даними',
          'Заповніть додаткову інформацію про ваш клуб'
        ]
      });
      return;
    }

    // Визначаємо тип членства на основі ролей користувача
    if (user?.roles?.includes('athlete')) {
      setMembershipInfo({
        type: 'Спортсмен',
        benefits: [
          'Участь у офіційних змаганнях ФУСАФ',
          'Доступ до календаря спортивних подій',
          'Особистий кабінет спортсмена',
          'Можливість отримання спортивних розрядів',
          'Участь у тренувальних зборах',
          'Доступ до навчальних матеріалів'
        ],
        nextSteps: [
          'Заповніть додаткову інформацію у вашому профілі',
          'Оберіть спортивний клуб для тренувань',
          'Перегляньте календар найближчих змагань',
          'Підготуйте необхідні документи для участі у змаганнях'
        ]
      });
    } else if (user?.roles?.includes('coach_judge')) {
      setMembershipInfo({
        type: 'Тренер/Суддя',
        benefits: [
          'Право на тренерську діяльність',
          'Можливість суддівства змагань',
          'Доступ до професійних курсів',
          'Участь у семінарах та майстер-класах',
          'Офіційна сертифікація ФУСАФ',
          'Доступ до методичних матеріалів'
        ],
        nextSteps: [
          'Пройдіть верифікацію ваших кваліфікацій',
          'Зареєструйтесь на курси підвищення кваліфікації',
          'Приєднайтесь до професійної спільноти тренерів',
          'Подайте заявку на суддівство змагань'
        ]
      });
    } else if (user?.roles?.includes('club_owner')) {
      setMembershipInfo({
        type: 'Власник клубу',
        benefits: [
          'Право на організацію змагань',
          'Реєстрація спортсменів від клубу',
          'Доступ до статистики та звітів',
          'Можливість залучення спонсорів',
          'Участь у раді федерації',
          'Доступ до маркетингових матеріалів'
        ],
        nextSteps: [
          'Зареєструйте ваш спортивний клуб',
          'Додайте інформацію про тренерський склад',
          'Створіть профілі для ваших спортсменів',
          'Почніть планування змагань та тренувань'
        ]
      });
    }
  }, [user, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Головна карта успіху */}
          <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-500 rounded-full">
                  <CheckCircle className="h-16 w-16 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-green-800 mb-4">
                🎉 Вітаємо з успішною реєстрацією!
              </h1>

              <p className="text-lg text-green-700 mb-6">
                Ви успішно стали членом Федерації України зі Спортивної Аеробіки і Фітнесу
              </p>

              {user && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-green-600" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-green-600" />
                      <span className="text-gray-600">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-700">{membershipInfo.type}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Переваги членства */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-600" />
                  Ваші переваги
                </CardTitle>
                <CardDescription>
                  Що вам доступно як члену ФУСАФ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {membershipInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Наступні кроки
                </CardTitle>
                <CardDescription>
                  Рекомендації для початку роботи
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {membershipInfo.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Швидкі дії */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Швидкі дії</CardTitle>
              <CardDescription>
                Почніть використовувати ваше членство прямо зараз
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => window.location.href = '/athlete-panel'}
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  <User className="h-6 w-6" />
                  <span>Мій профіль</span>
                </Button>

                <Button
                  onClick={() => window.location.href = '/competitions'}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  <Trophy className="h-6 w-6" />
                  <span>Змагання</span>
                </Button>

                {user?.roles?.includes('athlete') && (
                  <Button
                    onClick={() => window.location.href = '/clubs'}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-1"
                  >
                    <Shield className="h-6 w-6" />
                    <span>Клуби</span>
                  </Button>
                )}

                {user?.roles?.includes('coach_judge') && (
                  <Button
                    onClick={() => window.location.href = '/courses'}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-1"
                  >
                    <Star className="h-6 w-6" />
                    <span>Курси</span>
                  </Button>
                )}

                {user?.roles?.includes('club_owner') && (
                  <Button
                    onClick={() => window.location.href = '/competitions/create'}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-1"
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Створити змагання</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Важлива інформація */}
          {isPendingClubOwner ? (
            <Alert className="bg-amber-50 border-amber-200">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div><strong>⏳ Заявка на розгляді:</strong> Ваша заявка на реєстрацію клубу надіслана адміністрації ФУСАФ.</div>
                  <div><strong>📧 Email з деталями:</strong> На вашу електронну пошту надіслано підтвердження з реєстраційними даними.</div>
                  <div><strong>🕐 Термін розгляду:</strong> 3-5 робочих днів.</div>
                  <div className="bg-amber-100 p-3 rounded-lg border border-amber-200">
                    <strong>⚠️ Важливо:</strong> Авторизація в системі буде доступна тільки після схвалення заявки адміністратором.
                    Повідомлення про результат розгляду буде надіслано на вашу електронну пошту.
                  </div>
                  <div>Якщо у вас є питання:</div>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>Перевірте папку "Спам" або "Небажані"</li>
                    <li>Зв'яжіться з нами: <a href="mailto:info@fusaf.org.ua" className="text-blue-600 underline">info@fusaf.org.ua</a></li>
                    <li>Телефон підтримки: +38 (044) 123-45-67</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-blue-50 border-blue-200">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div><strong>📧 Email підтвердження:</strong> На ваш email {user?.email} надіслано підтвердження реєстрації з детальною інформацією.</div>
                  <div><strong>🕐 Зазвичай лист приходить протягом 2-5 хвилин.</strong></div>
                  <div>Якщо ви не отримали листа:</div>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>Перевірте папку "Спам" або "Небажані"</li>
                    <li>Переконайтеся, що email адреса введена правильно</li>
                    <li>Зв'яжіться з нами: <a href="mailto:info@fusaf.org.ua" className="text-blue-600 underline">info@fusaf.org.ua</a></li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Кнопка продовження */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Перейти на головну сторінку
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={<div>Завантаження...</div>}>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
