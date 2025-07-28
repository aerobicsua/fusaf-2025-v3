"use client";

import { useState, useEffect } from 'react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      // Початок з нуля - без демо курсів
      const mockCourses: any[] = [];
      setCourses(mockCourses);
    } catch (error) {
      console.error('Помилка завантаження курсів:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    try {
      setCourses(courses.map((course: any) =>
        course.id === courseId ? { ...course, status: newStatus, updatedAt: new Date().toISOString() } : course
      ));
      alert(`Статус курсу змінено на "${newStatus}"`);
    } catch (error) {
      alert('Помилка зміни статусу');
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей курс?')) return;

    try {
      setCourses(courses.filter((course: any) => course.id !== courseId));
      alert('Курс видалено успішно');
    } catch (error) {
      alert('Помилка видалення курсу');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800',
      registration: 'bg-green-100 text-green-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const labels: Record<string, string> = {
      upcoming: 'Очікується',
      registration: 'Реєстрація',
      ongoing: 'Проводиться',
      completed: 'Завершено',
      cancelled: 'Скасовано'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.upcoming}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      coaching: 'bg-blue-100 text-blue-800',
      judging: 'bg-purple-100 text-purple-800',
      mixed: 'bg-orange-100 text-orange-800'
    };

    const labels: Record<string, string> = {
      coaching: 'Для тренерів',
      judging: 'Для суддів',
      mixed: 'Змішаний'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[type] || styles.mixed}`}>
        {labels[type] || type}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };

    const labels: Record<string, string> = {
      beginner: 'Початковий',
      intermediate: 'Середній',
      advanced: 'Підвищений',
      expert: 'Експертний'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[level] || styles.beginner}`}>
        {labels[level] || level}
      </span>
    );
  };

  const isRegistrationOpen = (course: any) => {
    const today = new Date();
    const deadline = new Date(course.registrationDeadline);
    return today <= deadline && course.status === 'registration';
  };

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchesType = filterType === 'all' || course.type === filterType;
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;

    return matchesSearch && matchesStatus && matchesType && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎓 Управління курсами</h1>
              <p className="text-gray-600 text-sm">Курси підвищення кваліфікації для тренерів та суддів</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin-panel/courses/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                ➕ Створити курс
              </a>
              <a href="/admin-panel" className="text-gray-500 hover:text-gray-700">
                ← Повернутися до панелі
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
            <div className="text-sm text-gray-600">Всього курсів</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {courses.filter((c: any) => c.status === 'registration' || c.status === 'upcoming').length}
            </div>
            <div className="text-sm text-gray-600">Активні курси</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {courses.reduce((sum: number, c: any) => sum + c.registeredParticipants, 0)}
            </div>
            <div className="text-sm text-gray-600">Всього слухачів</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {courses.filter((c: any) => c.format === 'online').length}
            </div>
            <div className="text-sm text-gray-600">Онлайн курси</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Пошук курсів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі статуси</option>
              <option value="upcoming">Очікується</option>
              <option value="registration">Реєстрація</option>
              <option value="ongoing">Проводиться</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Скасовано</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі типи</option>
              <option value="coaching">Для тренерів</option>
              <option value="judging">Для суддів</option>
              <option value="mixed">Змішані</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі рівні</option>
              <option value="beginner">Початковий</option>
              <option value="intermediate">Середній</option>
              <option value="advanced">Підвищений</option>
              <option value="expert">Експертний</option>
            </select>

            <button
              onClick={() => alert('Експорт в розробці')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📊 Експорт
            </button>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Завантаження...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Курсів не знайдено</div>
              <a
                href="/admin-panel/courses/create"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Створити перший курс
              </a>
            </div>
          ) : (
            filteredCourses.map((course: any) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusBadge(course.status)}
                        {getTypeBadge(course.type)}
                        {getLevelBadge(course.level)}
                        {course.format === 'online' && (
                          <span className="px-2 py-1 text-xs bg-cyan-100 text-cyan-800 rounded">
                            💻 Онлайн
                          </span>
                        )}
                        {isRegistrationOpen(course) && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded animate-pulse">
                            🔥 Реєстрація відкрита
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-gray-600 mt-1">{course.description}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">📅 Дати проведення</span>
                      <div className="font-medium">
                        {new Date(course.startDate).toLocaleDateString('uk-UA')} - {new Date(course.endDate).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">👨‍🏫 Викладач</span>
                      <div className="font-medium">{course.instructor}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">👥 Слухачі</span>
                      <div className="font-medium">
                        {course.registeredParticipants} / {course.maxParticipants}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(course.registeredParticipants / course.maxParticipants) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">💰 Вартість</span>
                      <div className="font-medium">{course.price} грн</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">📍 Місце проведення</span>
                      <div className="font-medium">{course.location}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">⏱️ Тривалість</span>
                      <div className="font-medium">{course.duration}</div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">📋 Вимоги:</span>
                    <div className="mt-1">
                      {course.requirements.map((req: string, index: number) => (
                        <div key={index} className="text-sm text-gray-700 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Program */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">📚 Програма курсу:</span>
                    <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {course.program.map((item: string, index: number) => (
                        <div key={index} className="text-sm text-gray-700 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Important Dates and Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">⏰ Дедлайн реєстрації:</span>
                        <div className={`font-medium ${new Date(course.registrationDeadline) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                          {new Date(course.registrationDeadline).toLocaleDateString('uk-UA')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">🏆 Сертифікат:</span>
                        <div className="font-medium">{course.certificate}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">📄 Документи:</span>
                        <div className="font-medium">{course.documents.join(', ')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <select
                        value={course.status}
                        onChange={(e) => handleStatusChange(course.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="upcoming">Очікується</option>
                        <option value="registration">Реєстрація</option>
                        <option value="ongoing">Проводиться</option>
                        <option value="completed">Завершено</option>
                        <option value="cancelled">Скасовано</option>
                      </select>

                      <a
                        href={`/admin-panel/course-applications?course=${course.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        📋 Заявки ({course.registeredParticipants})
                      </a>
                    </div>

                    <div className="flex items-center space-x-3">
                      <a
                        href={`/courses/${course.id}`}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        👁️ Переглянути
                      </a>
                      <a
                        href={`/admin-panel/courses/${course.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        ✏️ Редагувати
                      </a>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        🗑️ Видалити
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
