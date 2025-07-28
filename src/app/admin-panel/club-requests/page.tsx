"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Clock,
  MapPin,
  Mail,
  Phone,
  Globe,
  User,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ClubRequest {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    registeredAt: string;
  };
  club: {
    name: string;
    type: 'club' | 'subdivision';
    address: string;
    city: string;
    region: string;
    zipCode: string;
    description: string;
    experience: string;
    legalStatus: string;
    website?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  documents?: {
    name: string;
    url: string;
  }[];
}

export default function ClubRequestsPage() {
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ClubRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // Спочатку завантажуємо з API
      const response = await fetch('/api/clubs/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
        console.log('✅ Заявки завантажено з API:', data.requests?.length || 0);
      } else {
        console.error('❌ Помилка завантаження з API, використовуємо localStorage');
        // Fallback до localStorage
        const savedRequests = localStorage.getItem('clubRequests');
        if (savedRequests) {
          setRequests(JSON.parse(savedRequests));
        } else {
          setRequests([]);
        }
      }
    } catch (error) {
      console.error('Помилка завантаження заявок:', error);
      // Fallback до localStorage при помилці API
      try {
        const savedRequests = localStorage.getItem('clubRequests');
        if (savedRequests) {
          setRequests(JSON.parse(savedRequests));
        } else {
          setRequests([]);
        }
      } catch (localError) {
        setRequests([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!reviewNotes.trim()) {
      alert('Додайте коментар до рішення');
      return;
    }

    setActionLoading(requestId);
    try {
      const targetRequest = requests.find(req => req.id === requestId);
      if (!targetRequest) return;

      // Оновлюємо заявку через API
      const updateResponse = await fetch('/api/clubs/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: 'approved',
          reviewNotes,
          reviewedBy: 'Адміністратор'
        })
      });

      if (updateResponse.ok) {
        // Оновлюємо локальний стан
        const updatedRequests = requests.map(req =>
          req.id === requestId
            ? {
                ...req,
                status: 'approved' as const,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Адміністратор',
                reviewNotes
              }
            : req
        );
        setRequests(updatedRequests);

        // Також зберігаємо в localStorage як backup
        localStorage.setItem('clubRequests', JSON.stringify(updatedRequests));
      } else {
        throw new Error('Помилка оновлення заявки на сервері');
      }

      // Додаємо схвалений клуб до списку клубів
      const approvedClub = {
        id: `club-${Date.now()}`,
        name: targetRequest.club.name,
        type: targetRequest.club.type,
        address: targetRequest.club.address,
        city: targetRequest.club.city,
        region: targetRequest.club.region,
        zipCode: targetRequest.club.zipCode,
        description: targetRequest.club.description,
        legalStatus: targetRequest.club.legalStatus,
        website: targetRequest.club.website,
        owner: {
          name: targetRequest.user.name,
          email: targetRequest.user.email,
          phone: targetRequest.user.phone
        },
        approvedAt: new Date().toISOString(),
        status: 'active'
      };

      // Зберігаємо клуб в MySQL через API
      console.log('💾 Зберігаємо клуб в MySQL через API...');
      const clubCreateResponse = await fetch('/api/clubs/approved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvedClub)
      });

      if (clubCreateResponse.ok) {
        const clubResult = await clubCreateResponse.json();
        console.log('✅ Клуб збережено в MySQL:', clubResult.clubId);
      } else {
        console.error('❌ Помилка збереження клубу в MySQL');
      }

      // ОНОВЛЮЄМО СТАТИСТИКУ НА ГОЛОВНІЙ СТОРІНЦІ
      // Відправляємо повідомлення для оновлення статистики
      window.dispatchEvent(new CustomEvent('clubsUpdated', {
        detail: { clubsCount: existingClubs.length }
      }));

      console.log(`✅ Клуб додано до localStorage, всього клубів: ${existingClubs.length}`);

      // Надсилаємо email про схвалення
      try {
        await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: targetRequest.user.email,
            userName: targetRequest.user.name,
            clubName: targetRequest.club.name,
            reviewNotes
          })
        });
        console.log('✅ Email про схвалення надіслано');
      } catch (emailError) {
        console.error('❌ Помилка надсилання email:', emailError);
      }

      setReviewNotes('');
      setSelectedRequest(null);

      // Покращене повідомлення з інструкціями
      alert(
        `✅ Заявку схвалено успішно!\n\n` +
        `📧 Email з підтвердженням надіслано на ${targetRequest.user.email}\n\n` +
        `🏢 Клуб "${targetRequest.club.name}" додано до системи!\n\n` +
        `📝 Щоб побачити оновлення:\n` +
        `• Головна сторінка - лічильник "Клубів" оновиться\n` +
        `• Сторінка "Клуби" - клуб з'явиться в списку\n` +
        `• Оновіть сторінки браузера для перегляду змін\n\n` +
        `Всього клубів в системі: ${existingClubs.length}`
      );
    } catch (error) {
      alert('Помилка схвалення заявки');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!reviewNotes.trim()) {
      alert('Вкажіть причину відхилення');
      return;
    }

    setActionLoading(requestId);
    try {
      // Оновлюємо заявку через API
      const updateResponse = await fetch('/api/clubs/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: 'rejected',
          reviewNotes,
          reviewedBy: 'Адміністратор'
        })
      });

      if (updateResponse.ok) {
        // Оновлюємо локальний стан
        const updatedRequests = requests.map(req =>
          req.id === requestId
            ? {
                ...req,
                status: 'rejected' as const,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Адміністратор',
                reviewNotes
              }
            : req
        );
        setRequests(updatedRequests);

        // Також зберігаємо в localStorage як backup
        localStorage.setItem('clubRequests', JSON.stringify(updatedRequests));
      } else {
        throw new Error('Помилка оновлення заявки на сервері');
      }

      setReviewNotes('');
      setSelectedRequest(null);
      alert('Заявку відхилено');
    } catch (error) {
      alert('Помилка відхилення заявки');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: ClubRequest['status']) => {
    const config = {
      pending: { label: 'На розгляді', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Схвалено', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Відхилено', className: 'bg-red-100 text-red-800' }
    };

    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const filteredRequests = requests.filter(req =>
    filter === 'all' || req.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">📋 Заявки на реєстрацію клубів</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">📋 Заявки на реєстрацію клубів</h1>
              <p className="text-gray-600 text-sm">Розгляд та верифікація нових клубів і підрозділів</p>
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
            <div className="text-sm text-gray-600">Всього заявок</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">На розгляді</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Схвалено</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Відхилено</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Фільтр:</span>
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' && 'Всі заявки'}
                {status === 'pending' && 'На розгляді'}
                {status === 'approved' && 'Схвалено'}
                {status === 'rejected' && 'Відхилено'}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Заявок не знайдено</h3>
              <p className="text-gray-600">Наразі немає заявок за обраними критеріями</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl">
                        <Building className="h-5 w-5 mr-2 text-blue-600" />
                        {request.club.name}
                      </CardTitle>
                      <div className="flex items-center space-x-4 mt-2">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline">
                          {request.club.type === 'club' ? 'Спортивний клуб' : 'Підрозділ'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Подано: {new Date(request.submittedAt).toLocaleDateString('uk-UA')}
                      </p>
                      {request.reviewedAt && (
                        <p className="text-sm text-gray-500">
                          Розглянуто: {new Date(request.reviewedAt).toLocaleDateString('uk-UA')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* User Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Заявник
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{request.user.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{request.user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{request.user.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Реєстрація: {new Date(request.user.registeredAt).toLocaleDateString('uk-UA')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Club Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Інформація про клуб
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{request.club.address}, {request.club.city}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Статус: {request.club.legalStatus}</span>
                        </div>
                        {request.club.website && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-gray-400" />
                            <a href={request.club.website} target="_blank" rel="noopener noreferrer"
                               className="text-blue-600 hover:underline">
                              {request.club.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Опис клубу:</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {request.club.description}
                    </p>
                  </div>

                  {/* Review Notes */}
                  {request.reviewNotes && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Коментар адміністратора:</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        {request.reviewNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Деталі
                          </Button>
                        </DialogTrigger>
                      </Dialog>

                      {request.documents && request.documents.length > 0 && (
                        <Button variant="outline" size="sm">
                          📄 Документи ({request.documents.length})
                        </Button>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedRequest(request);
                                setReviewNotes('');
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Схвалити
                            </Button>
                          </DialogTrigger>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedRequest(request);
                                setReviewNotes('');
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Відхилити
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Review Dialog */}
        {selectedRequest && (
          <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Розгляд заявки: {selectedRequest.club.name}
                </DialogTitle>
                <DialogDescription>
                  Додайте коментар та виберіть рішення щодо заявки
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="reviewNotes">Коментар *</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Вкажіть причину рішення або додаткові коментарі..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Скасувати
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={!!actionLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {actionLoading === selectedRequest.id ? 'Обробка...' : 'Відхилити'}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={!!actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === selectedRequest.id ? 'Обробка...' : 'Схвалити'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
