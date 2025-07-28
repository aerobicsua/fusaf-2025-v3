"use client";

import { useState, useEffect } from 'react';

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLicense, setFilterLicense] = useState('all');

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      // Початок з нуля - без демо тренерів
      const mockCoaches: any[] = [];
      setCoaches(mockCoaches);
    } catch (error) {
      console.error('Помилка завантаження тренерів:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (coachId: string, newRoles: string[]) => {
    try {
      // Симуляція оновлення ролей
      setCoaches(coaches.map((coach: any) =>
        coach.id === coachId ? { ...coach, roles: newRoles } : coach
      ));
      alert('Ролі оновлено успішно');
    } catch (error) {
      alert('Помилка оновлення ролей');
    }
  };

  const handleLicenseRenewal = async (coachId: string) => {
    const newExpiry = prompt('Введіть нову дату закінчення ліцензії (YYYY-MM-DD):');
    if (!newExpiry) return;

    try {
      setCoaches(coaches.map((coach: any) =>
        coach.id === coachId ? { ...coach, licenseExpiry: newExpiry } : coach
      ));
      alert('Ліцензію продовжено успішно');
    } catch (error) {
      alert('Помилка продовження ліцензії');
    }
  };

  const handleBlock = async (coachId: string, block: boolean) => {
    try {
      setCoaches(coaches.map((coach: any) =>
        coach.id === coachId ? { ...coach, blocked: block } : coach
      ));
      alert(`Тренера/суддю ${block ? 'заблоковано' : 'розблоковано'} успішно`);
    } catch (error) {
      alert('Помилка зміни статусу');
    }
  };

  const isLicenseExpiring = (expiry: string) => {
    const expiryDate = new Date(expiry);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 30;
  };

  const filteredCoaches = coaches.filter((coach: any) => {
    const matchesSearch = coach.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.club?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || coach.roles.includes(filterRole);

    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && !coach.blocked) ||
                         (filterStatus === 'blocked' && coach.blocked);

    const matchesLicense = filterLicense === 'all' ||
                          (filterLicense === 'expiring' && isLicenseExpiring(coach.licenseExpiry)) ||
                          (filterLicense === 'valid' && !isLicenseExpiring(coach.licenseExpiry));

    return matchesSearch && matchesRole && matchesStatus && matchesLicense;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">👨‍🏫 Управління тренерами та суддями</h1>
              <p className="text-gray-600 text-sm">Управління ролями, ліцензіями та кваліфікаціями</p>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin-panel" className="text-gray-500 hover:text-gray-700">
                ← Повернутися до панелі
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <input
                type="text"
                placeholder="Пошук по імені, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі ролі</option>
              <option value="coach">Тільки тренери</option>
              <option value="judge">Тільки судді</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі статуси</option>
              <option value="active">Активні</option>
              <option value="blocked">Заблоковані</option>
            </select>

            <select
              value={filterLicense}
              onChange={(e) => setFilterLicense(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі ліцензії</option>
              <option value="valid">Дійсні ліцензії</option>
              <option value="expiring">Закінчуються</option>
            </select>

            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={() => alert('Експорт в розробці')}
            >
              📊 Експорт XLS
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{coaches.length}</div>
            <div className="text-sm text-gray-600">Всього тренерів/суддів</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {coaches.filter((c: any) => c.roles.includes('coach')).length}
            </div>
            <div className="text-sm text-gray-600">Тренери</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {coaches.filter((c: any) => c.roles.includes('judge')).length}
            </div>
            <div className="text-sm text-gray-600">Судді</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">
              {coaches.filter((c: any) => isLicenseExpiring(c.licenseExpiry)).length}
            </div>
            <div className="text-sm text-gray-600">Ліцензії закінчуються</div>
          </div>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCoaches.map((coach: any) => (
            <div key={coach.id} className="bg-white rounded-lg shadow-md p-6">

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {coach.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{coach.name}</h3>
                    <p className="text-sm text-gray-500">{coach.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {coach.roles.map((role: string) => (
                    <span
                      key={role}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        role === 'coach'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {role === 'coach' ? 'Тренер' : 'Суддя'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Спеціалізація:</span>
                  <div className="font-medium">{coach.specialization}</div>
                </div>
                <div>
                  <span className="text-gray-500">Досвід:</span>
                  <div className="font-medium">{coach.experience}</div>
                </div>
                <div>
                  <span className="text-gray-500">Клуб:</span>
                  <div className="font-medium">{coach.club}</div>
                </div>
                <div>
                  <span className="text-gray-500">Область:</span>
                  <div className="font-medium">{coach.region}</div>
                </div>
              </div>

              {/* License */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Ліцензія</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isLicenseExpiring(coach.licenseExpiry)
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isLicenseExpiring(coach.licenseExpiry) ? 'Закінчується' : 'Дійсна'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  № {coach.licenseNumber} • до {new Date(coach.licenseExpiry).toLocaleDateString('uk-UA')}
                </div>
                {isLicenseExpiring(coach.licenseExpiry) && (
                  <button
                    onClick={() => handleLicenseRenewal(coach.id)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    🔄 Продовжити ліцензію
                  </button>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="text-center bg-blue-50 rounded p-2">
                  <div className="font-bold text-blue-600">{coach.athletesTrained}</div>
                  <div className="text-gray-600">Підготовлено спортсменів</div>
                </div>
                <div className="text-center bg-purple-50 rounded p-2">
                  <div className="font-bold text-purple-600">{coach.competitionsJudged}</div>
                  <div className="text-gray-600">Суддівств змагань</div>
                </div>
              </div>

              {/* Certificates */}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Сертифікати:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {coach.certificates.map((cert: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const currentRoles = coach.roles;
                      const hasCoach = currentRoles.includes('coach');
                      const hasJudge = currentRoles.includes('judge');

                      let newRoles = [...currentRoles];
                      if (hasCoach && hasJudge) {
                        newRoles = ['coach']; // Remove judge
                      } else if (hasCoach) {
                        newRoles = ['judge']; // Switch to judge
                      } else {
                        newRoles = ['coach', 'judge']; // Add both
                      }

                      handleRoleUpdate(coach.id, newRoles);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ⚡ Змінити ролі
                  </button>
                  <a
                    href={`/admin-panel/coaches/${coach.id}`}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    ✏️ Редагувати
                  </a>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBlock(coach.id, !coach.blocked)}
                    className={`text-sm font-medium ${
                      coach.blocked
                        ? 'text-green-600 hover:text-green-800'
                        : 'text-orange-600 hover:text-orange-800'
                    }`}
                  >
                    {coach.blocked ? '✅ Розблокувати' : '🚫 Блокувати'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCoaches.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Тренерів/суддів не знайдено</div>
          </div>
        )}
      </div>
    </div>
  );
}
