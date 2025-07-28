import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Users, Trophy, Star, Play, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="hero-section min-h-[600px] flex items-center relative z-10">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-pink-600">
                ПОПЕРЕДНІЙ
              </Button>
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-pink-600">
                НАСТУПНИЙ
              </Button>
            </div>
            <h1 className="text-hero">
              Як стати членом федерації
            </h1>
            <p className="text-xl text-white/90 max-w-lg">
              Коли прийде час оновити ваше членство у Федерації України зі Спортивної Аеробіки і Фітнесу,
              ми повідомимо вас електронною поштою.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://ext.same-assets.com/4263373208/2435633138.png"
              alt="Спортивна аеробіка"
              className="w-full h-auto rounded-3xl shadow-2xl float-animation"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/clubs" className="text-gray-700 hover:text-pink-600 font-medium">
              Швидкі посилання
            </Link>
            <Link href="/club-hub" className="text-gray-700 hover:text-pink-600 font-medium">
              Хаб клубу
            </Link>
            <Link href="/shop" className="text-gray-700 hover:text-pink-600 font-medium">
              Магазин
            </Link>
            <Link href="/competitions/find" className="text-gray-700 hover:text-pink-600 font-medium">
              Знайти змагання
            </Link>
            <Link href="/clubs/find" className="text-gray-700 hover:text-pink-600 font-medium">
              Знайти клуб
            </Link>
            <Link href="/report" className="text-gray-700 hover:text-pink-600 font-medium">
              Повідомити про інцидент
            </Link>
          </div>
        </div>
      </section>

      {/* Hub Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-aerobics p-12 bg-gradient-primary text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-6">
                    Хаб: Безпечний та Чесний Спорт
                  </h2>
                  <p className="text-lg text-white/90 mb-8">
                    Наш Хаб Безпечного та Чесного Спорту є воротами до множини корисної
                    інформації, щоб допомогти всім учасникам аеробіки та фітнесу залишатися в безпеці
                    та отримувати підтримку, коли вона їм потрібна.
                  </p>
                  <Button className="btn-aerobics-accent">
                    Дізнатися більше
                  </Button>
                </div>
                <div className="relative">
                  <img
                    src="https://ext.same-assets.com/4263373208/3668085524.svg"
                    alt="Safe and Fair Sport"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Safeguarding Card */}
            <div className="card-aerobics p-8 bg-gradient-primary text-white">
              <h3 className="text-3xl font-bold mb-4">
                Захист та Безпека спорту
              </h3>
              <p className="text-white/90 mb-6">
                Ми прагнемо захистити добробут дітей, молоді та дорослих з групи ризику
                та працюємо над забезпеченням безпечного та приємного досвіду для всіх у нашому спорті.
              </p>
              <Button className="btn-aerobics-secondary">
                Дізнатися більше
              </Button>
            </div>

            {/* Membership Card */}
            <div className="card-aerobics p-8 bg-gradient-secondary text-white">
              <h3 className="text-3xl font-bold mb-4">
                Приєднатися або оновити членство
              </h3>
              <p className="text-white/90 mb-6">
                Хочете стати членом? Ми тут, щоб допомогти та підтримати вас
                на кожному етапі вашого шляху в аеробіці та фітнесі.
              </p>
              <Button className="btn-aerobics-primary">
                Приєднатися або оновити
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-section-title">Новини ФУСАФ</h2>
            <Button variant="outline" className="hidden md:flex">
              Відвідати нашу сторінку новин
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Featured Article */}
            <div className="lg:col-span-1">
              <div className="card-aerobics overflow-hidden">
                <div className="relative">
                  <img
                    src="https://ext.same-assets.com/4263373208/993514707.png"
                    alt="Latest news"
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-pink-600">
                    Остання стаття
                  </Badge>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">ЛИП 03 2025</p>
                  <h3 className="text-xl font-bold mb-3">
                    Новий спортсмен приєднується до Клубу Творців
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Представлений як один з перших членів нового Клубу Творців Спортсменів...
                  </p>
                  <Button variant="ghost" className="text-pink-600 p-0">
                    Читати далі <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Other Articles */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <img
                  src="https://ext.same-assets.com/4263373208/1878683689.png"
                  alt="Competition"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">ЧЕР 26 2025</p>
                  <h4 className="font-semibold text-lg">
                    Квитки в продажу! Чемпіонат України з аеробіки та фітнесу
                  </h4>
                  <Button variant="ghost" className="text-pink-600 p-0 mt-2">
                    Читати далі
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <img
                  src="https://ext.same-assets.com/4263373208/2192526054.png"
                  alt="LGBTQIA+"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">ЧЕР 25 2025</p>
                  <h4 className="font-semibold text-lg">
                    Підтримка LGBTQIA+ спільноти в аеробіці та фітнесі
                  </h4>
                  <Button variant="ghost" className="text-pink-600 p-0 mt-2">
                    Читати далі
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <img
                  src="https://ext.same-assets.com/4263373208/1432157132.jpeg"
                  alt="Inclusion"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">ЧЕР 24 2025</p>
                  <h4 className="font-semibold text-lg">
                    Святкування інклюзивності в ФУСАФ
                  </h4>
                  <Button variant="ghost" className="text-pink-600 p-0 mt-2">
                    Читати далі
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-section-title text-center mb-16">
            Знайдіть аеробіку, фітнес, змагання або курс...
          </h2>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Find Aerobics */}
            <div className="card-aerobics overflow-hidden bg-gradient-secondary text-white">
              <div className="p-8 relative">
                <h3 className="text-3xl font-bold mb-4">Знайти тренування</h3>
                <p className="text-white/90 mb-8">
                  Дізнайтеся, які види аеробіки та фітнесу пропонуються поруч з вами в клубі
                  або спортивному центрі. Зробіть крок ближче до початку
                  вашої спортивної подорожі сьогодні.
                </p>
                <Button className="btn-aerobics-primary">
                  Почати!
                </Button>
                <img
                  src="https://ext.same-assets.com/4263373208/359820159.png"
                  alt="Find aerobics"
                  className="absolute bottom-0 right-0 w-32 h-32 object-cover opacity-50"
                />
              </div>
            </div>

            {/* Find Event */}
            <div className="card-aerobics overflow-hidden bg-gradient-secondary text-white">
              <div className="p-8 relative">
                <h3 className="text-3xl font-bold mb-4">Знайти змагання</h3>
                <p className="text-white/90 mb-8">
                  Ми не можемо дочекатися знову проводити живі змагання.
                  Тут ви знайдете деталі про те, що незабаром відбудеться.
                </p>
                <Button className="btn-aerobics-primary">
                  Знайти змагання
                </Button>
                <img
                  src="https://ext.same-assets.com/4263373208/1555154055.png"
                  alt="Find event"
                  className="absolute bottom-0 right-0 w-32 h-32 object-cover opacity-50"
                />
              </div>
            </div>

            {/* Find Course */}
            <div className="card-aerobics overflow-hidden bg-gradient-secondary text-white">
              <div className="p-8 relative">
                <h3 className="text-3xl font-bold mb-4">Знайти курс</h3>
                <p className="text-white/90 mb-8">
                  Чи ви тренер, інструктор, вчитель, суддя або виконуєте
                  клубну роль, наша мета - підтримати вас та надати
                  необхідний досвід.
                </p>
                <Button className="btn-aerobics-primary">
                  Знайти курс
                </Button>
                <img
                  src="https://ext.same-assets.com/4263373208/2234612739.png"
                  alt="Find course"
                  className="absolute bottom-0 right-0 w-32 h-32 object-cover opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-section-title text-center mb-16">
            Більше способів залучитися до нашого спорту...
          </h2>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Coaching */}
            <div className="card-aerobics overflow-hidden bg-gradient-accent text-white">
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-4">Тренерство</h3>
                <p className="text-white/90 mb-8">
                  Тренерство - це серце аеробіки та фітнесу, і є багато корисних способів залучитися.
                </p>
                <Button className="btn-aerobics-secondary">
                  Дізнатися більше
                </Button>
              </div>
            </div>

            {/* Volunteering */}
            <div className="card-aerobics overflow-hidden bg-gradient-purple text-white">
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-4">Волонтерство</h3>
                <p className="text-white/90 mb-8">
                  Допоможіть своєму місцевому клубу або на світових змаганнях
                  та насолоджуйтеся дивовижним досвідом волонтерства.
                </p>
                <Button className="btn-aerobics-secondary">
                  Дізнатися більше
                </Button>
              </div>
            </div>

            {/* Judging */}
            <div className="card-aerobics overflow-hidden bg-gradient-secondary text-white">
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-4">Суддівство</h3>
                <p className="text-white/90 mb-8">
                  Наші змагання були б неможливі без неймовірної роботи суддів.
                  Дізнайтеся, як ви можете стати одним з них.
                </p>
                <Button className="btn-aerobics-secondary">
                  Дізнатися більше
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Hero Section */}
      <section className="hero-section min-h-[500px] flex items-center relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-bold text-white mb-8 leading-tight">
              Аеробіка та фітнес вітають унікальні відмінності, навички та здібності людей.
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Святкуючи позитивний вплив аеробіки та фітнесу - запуск серії фільмів "Знайди свою неймовірність"
            </p>
            <Button className="btn-aerobics-primary text-lg px-8 py-4">
              Дивитися тут
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">Контакти</h4>
              <p className="text-gray-300">info@fusaf.org.ua</p>
              <p className="text-gray-300">0800 123 456</p>
              <p className="text-gray-300 text-sm mt-2">fusaf.org.ua</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Про нас</h4>
              <Link href="/about" className="block text-gray-300 hover:text-white">Про федерацію</Link>
              <Link href="/faq" className="block text-gray-300 hover:text-white">FAQ</Link>
              <Link href="/commercial" className="block text-gray-300 hover:text-white">Комерційні</Link>
              <Link href="/contact" className="block text-gray-300 hover:text-white">Контакти</Link>
            </div>
            <div>
              <h4 className="font-bold mb-4">Безпечний спорт</h4>
              <Link href="/careers" className="block text-gray-300 hover:text-white">Кар'єра</Link>
              <Link href="/terms" className="block text-gray-300 hover:text-white">Умови використання</Link>
              <Link href="/privacy" className="block text-gray-300 hover:text-white">Конфіденційність</Link>
            </div>
            <div>
              <h4 className="font-bold mb-4">Наші партнери</h4>
              <div className="grid grid-cols-2 gap-4">
                <img src="https://ext.same-assets.com/4263373208/520781729.png" alt="Partner" className="h-8 object-contain" />
                <img src="https://ext.same-assets.com/4263373208/3919885111.png" alt="Partner" className="h-8 object-contain" />
                <img src="https://ext.same-assets.com/4263373208/196985589.png" alt="Partner" className="h-8 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
