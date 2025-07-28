"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building,
  MapPin,
  Globe,
  Users,
  GraduationCap,
  Calendar,
  ExternalLink,
  Eye,
  Star,
  Search
} from 'lucide-react';

interface Club {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  region: string;
  description: string;
  website?: string;
  legalStatus: string;
  approvedAt: string;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  status: string;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    loadClubs();

    // Додаємо слухач для автооновлення при змінах в localStorage
    const handleStorageChange = () => {
      console.log('🔄 Виявлено зміни в localStorage, оновлюємо клуби...');
      loadClubs();
    };

    // Слухаємо зміни storage
    window.addEventListener('storage', handleStorageChange);

    // Слухаємо custom події
    window.addEventListener('clubsUpdated', handleStorageChange);

    // Оновлюємо кожні 3 секунди (для dev)
    const interval = setInterval(() => {
      const clubs = JSON.parse(localStorage.getItem('approvedClubs') || '[]');
      if (clubs.length > 0) {
        console.log(`🔄 Періодичне оновлення: знайдено ${clubs.length} клубів`);
        setClubs(clubs);
      }
    }, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('clubsUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadClubs = async () => {
    try {
      console.log('🏢 Завантаження клубів з API...');

      // Завантажуємо схвалені клуби з API
      const clubsResponse = await fetch('/api/clubs/approved');
      const clubsData = await clubsResponse.json();

      console.log('📁 Відповідь API clubs/approved:', clubsData);

      if (clubsData.success) {
        const approvedClubs = clubsData.clubs || [];
        console.log(`🏢 Завантажено ${approvedClubs.length} клубів з API:`, approvedClubs);
        setClubs(approvedClubs);

        if (approvedClubs.length === 0) {
          console.log('⚠️ Клубів не знайдено в API!');
          console.log('💡 Можливі причини:');
          console.log('  1. Клуби ще не схвалені адміністратором');
          console.log('  2. Проблема з API або базою даних');
          console.log('  3. Клуби не збережені в MySQL');
        }
      } else {
        console.error('❌ API повернув помилку:', clubsData.error);
        setClubs([]);
      }

    } catch (error) {
      console.error('❌ Помилка завантаження клубів:', error);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  // Фільтрація клубів
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || club.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Унікальні регіони для фільтра
  const regions = [...new Set(clubs.map(club => club.region))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження клубів...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-white/20">
                <Building className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🏢 Клуби та Підрозділи ФУСАФ
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Офіційно зареєстровані спортивні клуби та підрозділи федерації
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{clubs.length}</div>
                <div className="text-sm">Активних клубів</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{regions.length}</div>
                <div className="text-sm">Регіонів</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">
                  {clubs.reduce((total, club) => {
                    const trainers = JSON.parse(localStorage.getItem('clubTrainers') || '[]');
                    return total + trainers.filter((t: any) => t.clubId === club.id).length;
                  }, 0)}
                </div>
                <div className="text-sm">Тренерів</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пошук клубів
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Назва клубу, місто або опис..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Регіон
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Всі регіони</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Знайдено {filteredClubs.length} {filteredClubs.length === 1 ? 'клуб' : 'клубів'}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                console.log('🔄 Ручне оновлення клубів...');
                loadClubs();
              }}
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100"
            >
              🔄 Оновити
            </Button>
            <Link href="/membership/club-owner/registration">
              <Button className="bg-green-600 hover:bg-green-700">
                Зареєструвати клуб
              </Button>
            </Link>
          </div>
        </div>

        {filteredClubs.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {clubs.length === 0 ? 'Клубів поки немає' : 'Нічого не знайдено'}
              </h3>
              <p className="text-gray-600 mb-6">
                {clubs.length === 0
                  ? 'Станьте першим зареєстрованим клубом ФУСАФ!'
                  : 'Спробуйте змінити критерії пошуку'
                }
              </p>
              <Link href="/membership/club-owner/registration">
                <Button>
                  Зареєструвати клуб
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <Card key={club.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={club.avatar} />
                        <AvatarFallback>
                          {club.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg leading-tight mb-2">
                          {club.name}
                        </CardTitle>
                        <Badge variant="outline" className="mb-2">
                          {club.type === 'club' ? 'Спортивний клуб' : 'Підрозділ'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        <p>{club.address}</p>
                        <p>{club.city}, {club.region}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Керівник: {club.owner.name}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Засновано: {club.founded ? new Date(club.founded).toLocaleDateString('uk-UA') : new Date(club.approvedAt).toLocaleDateString('uk-UA')}
                      </span>
                    </div>

                    {club.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-gray-400" />
                        <a
                          href={club.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center"
                        >
                          Веб-сайт <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {club.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="font-semibold text-blue-600">
                          {(() => {
                            const trainers = JSON.parse(localStorage.getItem('clubTrainers') || '[]');
                            return trainers.filter((t: any) => t.clubId === club.id).length;
                          })()}
                        </div>
                        <div>Тренерів</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="font-semibold text-green-600">
                          {(() => {
                            const athletes = JSON.parse(localStorage.getItem('approvedAthletes') || '[]');
                            return athletes.filter((a: any) => a.club === club.id).length;
                          })()}
                        </div>
                        <div>Спортсменів</div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Link href={`/club/${encodeURIComponent(club.name)}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Переглянути
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Хочете зареєструвати свій клуб?</h2>
          <p className="text-lg mb-6 text-green-100">
            Приєднайтесь до офіційної мережі клубів ФУСАФ
          </p>
          <Link href="/membership/club-owner/registration">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              <Building className="h-5 w-5 mr-2" />
              Подати заявку на реєстрацію
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
