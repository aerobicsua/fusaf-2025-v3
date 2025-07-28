"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Clock,
  MapPin,
  Users,
  Star,
  Calendar,
  Search,
  Filter,
  BookOpen,
  Award,
  Trophy,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function CoursesPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симулюємо завантаження
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">📚 Курси та навчання ФУСАФ</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Професійне навчання, сертифікація та підвищення кваліфікації у сфері спортивної аеробіки і фітнесу
            </p>
          </div>

          {/* Фільтри та пошук */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Пошук курсів..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Фільтри
            </Button>
          </div>

          {/* Контент курсів */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Завантаження курсів...</p>
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Курси поки що відсутні</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Наразі немає доступних курсів. Слідкуйте за оновленнями!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/competitions">
                  <Button>
                    <Trophy className="mr-2 h-4 w-4" />
                    Переглянути змагання
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    На головну
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Інформаційна секція */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Сертифікація тренерів</h3>
                <p className="text-gray-600">
                  Професійна підготовка та сертифікація тренерів зі спортивної аеробіки
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Суддівські курси</h3>
                <p className="text-gray-600">
                  Навчання та кваліфікація суддів для проведення змагань
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Методичні семінари</h3>
                <p className="text-gray-600">
                  Вивчення нових методик та підходів у тренувальному процесі
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
