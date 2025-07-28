"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, CalendarDays, MapPin, Users, Trophy, Star, Clock, Eye, Plus } from "lucide-react";
import { Header } from "@/components/Header";

interface Competition {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'upcoming' | 'registration' | 'ongoing' | 'completed';
  participants: number;
  level: 'local' | 'regional' | 'national' | 'international';
  registrationDeadline?: string;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  views: number;
  featured: boolean;
  image?: string;
}

interface Athlete {
  id: string;
  name: string;
  achievements: string[];
  image?: string;
  club: string;
  region: string;
}

export default function HomePage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [topAthletes, setTopAthletes] = useState<Athlete[]>([]);
  const [clubs, setClubs] = useState<Competition[]>([]);
  const [clubsCount, setClubsCount] = useState(0);
  const [athletesCount, setAthletesCount] = useState(0);
  const [trainersCount, setTrainersCount] = useState(0); // НОВИЙ ЛІЧИЛЬНИК ТРЕНЕРІВ
  const [judgesCount, setJudgesCount] = useState(0); // НОВИЙ ЛІЧИЛЬНИК СУДДІВ
  const [competitionsCount, setCompetitionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomePageData();

    // Автооновлення кожні 5 секунд для відображення змін localStorage
    const interval = setInterval(() => {
      console.log('🔄 Автооновлення головної сторінки...');
      loadHomePageData();
    }, 5000);

    // Слухаємо події оновлення клубів
    const handleClubsUpdate = () => {
      console.log('🔔 Отримано подію оновлення клубів');
      loadHomePageData();
    };

    window.addEventListener('clubsUpdated', handleClubsUpdate);
    window.addEventListener('storage', handleClubsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('clubsUpdated', handleClubsUpdate);
      window.removeEventListener('storage', handleClubsUpdate);
    };
  }, []);

  const loadHomePageData = async () => {
    try {
      // ЗАВАНТАЖУЄМО АКТУАЛЬНІ ДАНІ З LOCALSTORAGE
      console.log('📊 Завантаження даних з localStorage...');

      console.log('✅ Всі демо дані видалено!');

      // Завантажуємо клуби з API
      console.log('🏢 Завантаження клубів з API...');
      try {
        const clubsResponse = await fetch('/api/clubs/approved');
        const clubsData = await clubsResponse.json();
        const clubs = clubsData.success ? clubsData.clubs : [];
        console.log(`🏢 Завантажено клубів з API: ${clubs.length}`);
        setClubsCount(clubs.length);
      } catch (error) {
        console.error('❌ Помилка завантаження клубів з API:', error);
        setClubsCount(0);
      }

      // Завантажуємо інші дані з localStorage (поки що)
      const athletes = JSON.parse(localStorage.getItem('approvedAthletes') || '[]');
      const trainers = JSON.parse(localStorage.getItem('clubTrainers') || '[]');
      const competitions = JSON.parse(localStorage.getItem('approvedCompetitions') || '[]');

      console.log(`🏃 Завантажено спортсменів: ${athletes.length}`);
      console.log(`👨‍🏫 Завантажено тренерів: ${trainers.length}`);

      setAthletesCount(athletes.length);

      // Підраховуємо тренерів та суддів
      const trainerCount = trainers.filter((t: any) => t.roles.includes('coach')).length;
      const judgeCount = trainers.filter((t: any) => t.roles.includes('judge')).length;

      setTrainersCount(trainerCount);
      setJudgesCount(judgeCount);
      setCompetitionsCount(competitions.length);

      // Завантажуємо новини
      const news = JSON.parse(localStorage.getItem('approvedNews') || '[]');
      const publishedNews = news.filter((n: any) => n.status === 'published').slice(0, 6);
      console.log(`📰 Завантажено новин: ${publishedNews.length}`);
      setNews(publishedNews);

      // Топ спортсмени
      const topAthletes = athletes.slice(0, 5); // Показуємо топ 5
      setTopAthletes(topAthletes);

      // Змагання (використовуємо вже завантажену змінну competitions)
      console.log(`🏆 Завантажено змагань: ${competitions.length}`);
      setCompetitions(competitions.slice(0, 6));

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Competition['status']) => {
    const variants = {
      upcoming: { label: 'Очікується', className: 'bg-blue-100 text-blue-800' },
      registration: { label: 'Реєстрація', className: 'bg-green-100 text-green-800' },
      ongoing: { label: 'Проводиться', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Завершено', className: 'bg-gray-100 text-gray-800' }
    };

    const variant = variants[status];
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: Competition['level']) => {
    const variants = {
      local: { label: 'Місцевий', className: 'bg-green-100 text-green-800' },
      regional: { label: 'Регіональний', className: 'bg-blue-100 text-blue-800' },
      national: { label: 'Національний', className: 'bg-purple-100 text-purple-800' },
      international: { label: 'Міжнародний', className: 'bg-red-100 text-red-800' }
    };

    const variant = variants[level];
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🏆 Федерація України зі Спортивної Аеробіки і Фітнесу
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Розвиваємо спортивну аеробіку в Україні • Об'єднуємо спортсменів • Організовуємо змагання
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/membership">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Users className="mr-2 h-5 w-5" />
                  Стати членом ФУСАФ
                </Button>
              </Link>
              <Link href="/competitions">
                <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-blue-600">
                  <Trophy className="mr-2 h-5 w-5" />
                  Переглянути змагання
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{athletesCount}</div>
              <div className="text-gray-600">Спортсменів</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{trainersCount}</div>
              <div className="text-gray-600">Тренерів</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">{judgesCount}</div>
              <div className="text-gray-600">Суддів</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{clubsCount}</div>
              <div className="text-gray-600">Клубів</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{competitionsCount}</div>
              <div className="text-gray-600">Змагань</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Competitions - ОЧИЩЕНО */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">🏆 Найближчі змагання</h2>
            <Link href="/competitions">
              <Button variant="outline">
                Всі змагання
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : competitions.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Trophy className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Змагань поки немає</h3>
                <p className="text-gray-600 mb-6">
                  Наразі не заплановано жодних змагань. Слідкуйте за оновленнями!
                </p>
                <Link href="/membership">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Стати членом ФУСАФ
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((competition) => (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        {getStatusBadge(competition.status)}
                        {getLevelBadge(competition.level)}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{competition.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {new Date(competition.date).toLocaleDateString('uk-UA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        {competition.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="mr-2 h-4 w-4" />
                        {competition.participants} учасників
                      </div>
                      {competition.registrationDeadline && competition.status === 'registration' && (
                        <div className="flex items-center text-orange-600">
                          <Clock className="mr-2 h-4 w-4" />
                          Реєстрація до {new Date(competition.registrationDeadline).toLocaleDateString('uk-UA')}
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <Link href={`/competitions/${competition.id}`}>
                        <Button className="w-full">
                          Детальніше
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest News - ОЧИЩЕНО */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">📰 Останні новини</h2>
            <Link href="/news">
              <Button variant="outline">
                Всі новини
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mx-auto h-16 w-16 text-gray-400 mb-4 text-6xl">📰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Новин поки немає</h3>
                <p className="text-gray-600 mb-6">
                  Слідкуйте за останніми подіями та оновленнями ФУСАФ
                </p>
                <Link href="/membership">
                  <Button variant="outline">
                    Дізнатися більше
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      {item.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="mr-1 h-3 w-3" />
                          Рекомендовано
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(item.date).toLocaleDateString('uk-UA')}</span>
                      <div className="flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        {item.views}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href={`/news/${item.id}`}>
                        <Button variant="outline" className="w-full">
                          Читати далі
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Athletes - ОЧИЩЕНО */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">⭐ Топ спортсмени</h2>
            <Link href="/membership/athletes">
              <Button variant="outline">
                Всі спортсмени
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {topAthletes.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Star className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Спортсменів поки немає</h3>
                <p className="text-gray-600 mb-6">
                  Станьте першим зареєстрованим спортсменом ФУСАФ!
                </p>
                <Link href="/membership/athlete/registration">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Зареєструватися як спортсмен
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topAthletes.map((athlete) => (
                <Card key={athlete.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={athlete.image} alt={athlete.name} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {athlete.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{athlete.name}</CardTitle>
                        <p className="text-gray-600">{athlete.club}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-3">{athlete.region}</p>
                      <div>
                        <h4 className="font-medium mb-2">🏆 Досягнення:</h4>
                        <ul className="space-y-1">
                          {athlete.achievements.map((achievement, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <Star className="mr-2 h-3 w-3 text-yellow-500" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href={`/membership/athletes/${athlete.id}`}>
                        <Button variant="outline" className="w-full">
                          Переглянути профіль
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Приєднуйтесь до ФУСАФ сьогодні!</h2>
          <p className="text-xl mb-8 text-blue-100">
            Станьте частиною найбільшої спільноти спортивної аеробіки в Україні
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/membership/athlete/registration">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Реєстрація спортсмена
              </Button>
            </Link>
            <Link href="/membership/coach-judge/registration">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Реєстрація тренера/судді
              </Button>
            </Link>
            <Link href="/membership/club-owner/registration">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Реєстрація клубу
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ФУСАФ</h3>
              <p className="text-gray-400">
                Федерація України зі Спортивної Аеробіки і Фітнесу
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Навігація</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/competitions" className="hover:text-white">Змагання</Link></li>
                <li><Link href="/news" className="hover:text-white">Новини</Link></li>
                <li><Link href="/membership" className="hover:text-white">Членство</Link></li>
                <li><Link href="/clubs" className="hover:text-white">Клуби</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Реєстрація</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/membership/athlete/registration" className="hover:text-white">Спортсмени</Link></li>
                <li><Link href="/membership/coach-judge/registration" className="hover:text-white">Тренери/Судді</Link></li>
                <li><Link href="/membership/club-owner/registration" className="hover:text-white">Клуби</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Контакти</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 info@fusaf.org.ua</li>
                <li>📞 +380 (44) 123-45-67</li>
                <li>📍 Київ, Україна</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Федерація України зі Спортивної Аеробіки і Фітнесу. Всі права захищені.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
