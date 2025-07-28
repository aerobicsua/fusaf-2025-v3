"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trophy, Users, DollarSign } from 'lucide-react';

export default function TestCompetitionPage() {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  // Тестове змагання з правильними категоріями ФУСАФ
  const testCompetition = {
    title: "Кубок України зі спортивної аеробіки 2025",
    description: "Офіційні змагання федерації України зі спортивної аеробіки та фітнесу. Змагання проводяться згідно з міжнародними правилами FIG.",
    date: "2025-04-15",
    time: "10:00",
    location: "Палац спорту \"Україна\"",
    address: "вул. Велика Васильківська, 55, Київ, 03150",
    organizer_name: "Федерація України зі спортивної аеробіки і фітнесу",
    organizer_phone: "+380442345678",
    organizer_email: "info@fusaf.org.ua",
    registration_fee: 300,
    entry_fee: 200,
    max_participants: 200,
    registration_deadline: "2025-04-01",
    status: "registration_open",

    // Оновлені вікові групи
    age_groups: [
      "YOUTH (12-14 years)",
      "JUNIORS (15-17 years)",
      "SENIORS (18+)",
      "ND (категорії по роках народження)"
    ],

    // Оновлені категорії змагань
    categories: [
      "National Development (ND)",
      "National Level",
      "International Level"
    ],

    // Оновлені види програм
    program_types: [
      "Individual Woman",
      "Individual Men",
      "Mixed Pair",
      "Trio",
      "Group",
      "AERODANCE",
      "AEROSTEP"
    ]
  };

  const createTestCompetition = async () => {
    setLoading(true);

    try {
      // Імітація створення змагання
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Test competition created:', testCompetition);
      setCreated(true);

    } catch (error) {
      console.error('Error creating test competition:', error);
      alert('Помилка створення тестового змагання');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🏆 Створення тестового змагання
            </h1>
            <p className="text-gray-600">
              Тестове змагання з оновленими категоріями ФУСАФ
            </p>
          </div>

          {/* Превью тестового змагання */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-blue-600" />
                Превью тестового змагання
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Основна інформація */}
              <div>
                <h3 className="text-xl font-semibold mb-2">{testCompetition.title}</h3>
                <p className="text-gray-600 mb-4">{testCompetition.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(testCompetition.date).toLocaleDateString('uk-UA')} о {testCompetition.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {testCompetition.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    Макс. {testCompetition.max_participants} учасників
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {testCompetition.registration_fee + testCompetition.entry_fee} грн
                  </div>
                </div>
              </div>

              {/* Вікові групи */}
              <div>
                <h4 className="font-semibold mb-2">Вікові групи:</h4>
                <div className="flex flex-wrap gap-2">
                  {testCompetition.age_groups.map((group, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Види програм */}
              <div>
                <h4 className="font-semibold mb-2">Види програм:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {testCompetition.program_types.map((type, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700 justify-center">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Категорії */}
              <div>
                <h4 className="font-semibold mb-2">Категорії змагань:</h4>
                <div className="flex flex-wrap gap-2">
                  {testCompetition.categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Організатор */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Організатор:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>{testCompetition.organizer_name}</div>
                  <div>📞 {testCompetition.organizer_phone}</div>
                  <div>📧 {testCompetition.organizer_email}</div>
                  <div>📍 {testCompetition.address}</div>
                </div>
              </div>

              {/* Фінансова інформація */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Вартість участі:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Реєстраційний внесок:</span>
                    <div className="font-semibold">{testCompetition.registration_fee} грн</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Вступний внесок:</span>
                    <div className="font-semibold">{testCompetition.entry_fee} грн</div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <span className="text-gray-600">Загальна сума:</span>
                  <div className="text-lg font-bold text-blue-600">
                    {testCompetition.registration_fee + testCompetition.entry_fee} грн
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопка створення */}
          <div className="text-center">
            {!created ? (
              <Button
                onClick={createTestCompetition}
                disabled={loading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Створюємо тестове змагання...
                  </>
                ) : (
                  <>
                    <Trophy className="h-5 w-5 mr-2" />
                    Створити тестове змагання
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-green-600 font-semibold text-lg">
                  ✅ Тестове змагання створено!
                </div>
                <div className="text-sm text-gray-600">
                  Тепер можна тестувати систему реєстрації з новими категоріями ФУСАФ
                </div>
                <Button
                  onClick={() => window.location.href = '/competitions'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Переглянути змагання
                </Button>
              </div>
            )}
          </div>

          {/* Інформація про оновлені категорії */}
          <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">
                📋 Оновлені категорії ФУСАФ
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Вікові групи:</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>SENIORS</strong> - 18+ років</li>
                    <li>• <strong>JUNIORS</strong> - 15-17 років</li>
                    <li>• <strong>YOUTH</strong> - 12-14 років</li>
                    <li>• <strong>ND</strong> - категорії по роках народження</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Види програм:</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>Individual Woman</strong> - жіноча індивідуальна</li>
                    <li>• <strong>Individual Men</strong> - чоловіча індивідуальна</li>
                    <li>• <strong>Mixed Pair</strong> - 1 хлопець і 1 дівчина</li>
                    <li>• <strong>Trio</strong> - 3 учасники</li>
                    <li>• <strong>Group</strong> - 5 учасників</li>
                    <li>• <strong>AERODANCE</strong> - 8 учасників</li>
                    <li>• <strong>AEROSTEP</strong> - 8 учасників</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
