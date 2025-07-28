"use client";

import { useState, useEffect } from 'react';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [selectedMetric, setSelectedMetric] = useState('registrations');
  const [analyticsData, setAnalyticsData] = useState<any>({});

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Симуляція завантаження аналітики
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = {
        summary: {
          totalAthletes: 1245,
          totalCoaches: 67,
          totalClubs: 38,
          totalCompetitions: 12,
          activeUsers: 890,
          newRegistrations: 23,
          monthlyGrowth: 12.5,
          activeCompetitions: 3
        },
        registrations: {
          daily: [
            { date: '2024-07-01', athletes: 5, coaches: 1, clubs: 0 },
            { date: '2024-07-02', athletes: 8, coaches: 0, clubs: 1 },
            { date: '2024-07-03', athletes: 3, coaches: 2, clubs: 0 },
            { date: '2024-07-04', athletes: 12, coaches: 1, clubs: 0 },
            { date: '2024-07-05', athletes: 7, coaches: 0, clubs: 1 },
            { date: '2024-07-06', athletes: 15, coaches: 3, clubs: 0 },
            { date: '2024-07-07', athletes: 9, coaches: 1, clubs: 2 }
          ]
        },
        demographics: {
          regions: [
            { name: 'Київська', count: 245, percentage: 19.7 },
            { name: 'Львівська', count: 187, percentage: 15.0 },
            { name: 'Харківська', count: 156, percentage: 12.5 },
            { name: 'Одеська', count: 134, percentage: 10.8 },
            { name: 'Дніпропетровська', count: 123, percentage: 9.9 },
            { name: 'Інші', count: 400, percentage: 32.1 }
          ],
          ageGroups: [
            { group: '6-8 років', count: 198, percentage: 15.9 },
            { group: '9-11 років', count: 234, percentage: 18.8 },
            { group: '12-14 років', count: 287, percentage: 23.1 },
            { group: '15-17 років', count: 312, percentage: 25.1 },
            { group: '18+ років', count: 214, percentage: 17.2 }
          ],
          gender: [
            { type: 'Жінки', count: 867, percentage: 69.6 },
            { type: 'Чоловіки', count: 378, percentage: 30.4 }
          ]
        },
        competitions: {
          monthly: [
            { month: 'Січень', competitions: 2, participants: 156 },
            { month: 'Лютий', competitions: 1, participants: 89 },
            { month: 'Березень', competitions: 3, participants: 267 },
            { month: 'Квітень', competitions: 2, participants: 134 },
            { month: 'Травень', competitions: 1, participants: 76 },
            { month: 'Червень', competitions: 2, participants: 198 },
            { month: 'Липень', competitions: 1, participants: 87 }
          ],
          levels: [
            { level: 'Місцевий', count: 5, percentage: 41.7 },
            { level: 'Регіональний', count: 4, percentage: 33.3 },
            { level: 'Національний', count: 2, percentage: 16.7 },
            { level: 'Міжнародний', count: 1, percentage: 8.3 }
          ]
        },
        courses: {
          completion: [
            { course: 'Базовий курс тренерів', completed: 23, total: 30, rate: 76.7 },
            { course: 'Підвищення кваліфікації суддів', completed: 18, total: 20, rate: 90.0 },
            { course: 'Онлайн курс', completed: 45, total: 67, rate: 67.2 },
            { course: 'Міжнародна сертифікація', completed: 15, total: 20, rate: 75.0 }
          ]
        },
        activity: {
          website: [
            { metric: 'Унікальні відвідувачі', value: 1567, change: +12.3 },
            { metric: 'Перегляди сторінок', value: 8934, change: +8.7 },
            { metric: 'Середня тривалість сесії', value: 245, change: +15.2 },
            { metric: 'Показник відмов', value: 34.2, change: -5.1 }
          ],
          popular: [
            { page: 'Головна сторінка', views: 2134 },
            { page: 'Змагання', views: 1876 },
            { page: 'Реєстрація спортсменів', views: 1234 },
            { page: 'Новини', views: 987 },
            { page: 'Курси', views: 765 }
          ]
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Помилка завантаження аналітики:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeRanges = [
    { value: 'today', label: 'Сьогодні' },
    { value: 'thisWeek', label: 'Цей тиждень' },
    { value: 'thisMonth', label: 'Цей місяць' },
    { value: 'thisYear', label: 'Цей рік' },
    { value: 'custom', label: 'Обрати період' }
  ];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('uk-UA').format(num);
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
    return (
      <span className={`${color} text-sm font-medium`}>
        {sign}{change.toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження аналітики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📈 Аналітика та статистика</h1>
              <p className="text-gray-600 text-sm">Детальна аналітика роботи системи ФУСАФ</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <a href="/admin-panel" className="text-gray-500 hover:text-gray-700">
                ← Повернутися до панелі
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всього спортсменів</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.summary?.totalAthletes)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                🏃‍♂️
              </div>
            </div>
            <div className="mt-2">
              {formatChange(analyticsData.summary?.monthlyGrowth)}
              <span className="text-gray-500 text-sm ml-2">за місяць</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Тренери та судді</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.summary?.totalCoaches)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                👨‍🏫
              </div>
            </div>
            <div className="mt-2">
              {formatChange(8.2)}
              <span className="text-gray-500 text-sm ml-2">за місяць</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активні змагання</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.summary?.activeCompetitions)}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                🏆
              </div>
            </div>
            <div className="mt-2">
              <span className="text-green-600 text-sm font-medium">Плановано ще 2</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Нові реєстрації</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.summary?.newRegistrations)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                📝
              </div>
            </div>
            <div className="mt-2">
              <span className="text-blue-600 text-sm font-medium">за останні 7 днів</span>
            </div>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Розподіл по областях</h3>
            <div className="space-y-4">
              {analyticsData.demographics?.regions.map((region: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{region.name}</span>
                      <span className="text-sm text-gray-600">{region.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${region.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 ml-4 w-12 text-right">
                    {region.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Вікові групи</h3>
            <div className="space-y-4">
              {analyticsData.demographics?.ageGroups.map((group: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{group.group}</span>
                      <span className="text-sm text-gray-600">{group.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 ml-4 w-12 text-right">
                    {group.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Competitions Analytics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Аналітика змагань</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Змагання по місяцях</h4>
              <div className="space-y-3">
                {analyticsData.competitions?.monthly.map((month: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{month.month}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{month.competitions} змагань</div>
                      <div className="text-xs text-gray-600">{month.participants} учасників</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Рівні змагань</h4>
              <div className="space-y-3">
                {analyticsData.competitions?.levels.map((level: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{level.level}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${level.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{level.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Course Completion */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎓 Завершення курсів</h3>
          <div className="space-y-4">
            {analyticsData.courses?.completion.map((course: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{course.course}</h4>
                  <span className="text-sm font-semibold text-green-600">{course.rate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Завершили: {course.completed} з {course.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${course.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Website Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 Активність сайту</h3>
            <div className="space-y-4">
              {analyticsData.activity?.website.map((metric: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{metric.metric}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {metric.metric.includes('тривалість')
                        ? `${Math.floor(metric.value / 60)}:${(metric.value % 60).toString().padStart(2, '0')}`
                        : metric.metric.includes('відмов')
                          ? `${metric.value}%`
                          : formatNumber(metric.value)
                      }
                    </div>
                    <div className="text-xs">
                      {formatChange(metric.change)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Популярні сторінки</h3>
            <div className="space-y-3">
              {analyticsData.activity?.popular.map((page: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex-1">{page.page}</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(page.views / 2134) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      {formatNumber(page.views)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Експорт звітів</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-lg mb-2">📈</div>
              <div className="font-medium text-gray-900">Детальний звіт</div>
              <div className="text-sm text-gray-600">Повна статистика за період</div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-lg mb-2">📊</div>
              <div className="font-medium text-gray-900">Графіки та діаграми</div>
              <div className="text-sm text-gray-600">Візуальна аналітика</div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-lg mb-2">📋</div>
              <div className="font-medium text-gray-900">Підсумковий звіт</div>
              <div className="text-sm text-gray-600">Основні показники</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
