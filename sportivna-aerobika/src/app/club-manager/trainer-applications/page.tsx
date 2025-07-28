"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Header } from '@/components/Header';
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
  User,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

interface CoachJudgeApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  preferredClub: {
    id: string;
    name: string;
  };
  applicationMessage: string;
  roles: string[];
  judgeInfo?: {
    category: string;
    license: string;
  };
  education: string;
  specialization: string;
  experience: string;
  certificates: string;
  achievements: string;
  firstNameEn?: string;
  lastNameEn?: string;
  passport?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export default function TrainerApplicationsPage() {
  const { user } = useSimpleAuth();
  const [applications, setApplications] = useState<CoachJudgeApplication[]>([]);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApplication, setSelectedApplication] = useState<CoachJudgeApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserClubsAndApplications();
    }
  }, [user]);

  const loadUserClubsAndApplications = async () => {
    try {
      // Знаходимо клуби, де поточний користувач є власником
      const approvedClubs = JSON.parse(localStorage.getItem('approvedClubs') || '[]');
      const myClubs = approvedClubs.filter((club: any) =>
        club.owner.email === user?.email
      );
      setUserClubs(myClubs);

      // Завантажуємо заявки тренерів для клубів користувача
      const allApplications = JSON.parse(localStorage.getItem('coachJudgeApplications') || '[]');
      const myClubApplications = allApplications.filter((app: CoachJudgeApplication) =>
        myClubs.some(club => club.id === app.preferredClub.id)
      );
      setApplications(myClubApplications);
    } catch (error) {
      console.error('Помилка завантаження заявок:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    if (!reviewNotes.trim()) {
      alert('Додайте коментар до рішення');
      return;
    }

    setActionLoading(applicationId);
    try {
      const targetApplication = applications.find(app => app.id === applicationId);
      if (!targetApplication) return;

      // Оновлюємо заявку
      const allApplications = JSON.parse(localStorage.getItem('coachJudgeApplications') || '[]');
      const updatedApplications = allApplications.map((app: CoachJudgeApplication) =>
        app.id === applicationId
          ? {
              ...app,
              status: 'approved' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.name || 'Керівник клубу',
              reviewNotes
            }
          : app
      );
      localStorage.setItem('coachJudgeApplications', JSON.stringify(updatedApplications));

      // Додаємо схваленого тренера/суддю до клубу
      const clubTrainer = {
        id: `trainer-${Date.now()}`,
        name: targetApplication.name,
        email: targetApplication.email,
        phone: targetApplication.phone,
        region: targetApplication.region,
        city: targetApplication.city,
        clubId: targetApplication.preferredClub.id,
        clubName: targetApplication.preferredClub.name,
        roles: targetApplication.roles,
        judgeInfo: targetApplication.judgeInfo,
        education: targetApplication.education,
        specialization: targetApplication.specialization,
        experience: targetApplication.experience,
        certificates: targetApplication.certificates,
        achievements: targetApplication.achievements,
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name || 'Керівник клубу',
        status: 'active'
      };

      // Зберігаємо тренера до списку клубних тренерів
      const existingTrainers = JSON.parse(localStorage.getItem('clubTrainers') || '[]');
      existingTrainers.push(clubTrainer);
      localStorage.setItem('clubTrainers', JSON.stringify(existingTrainers));

      // Надсилаємо email сповіщення про схвалення
      try {
        await fetch('/api/send-trainer-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: targetApplication.email,
            trainerName: targetApplication.name,
            clubName: targetApplication.preferredClub.name,
            decision: 'approved',
            reviewNotes,
            clubManagerName: user?.name || 'Керівник клубу'
          })
        });
        console.log('✅ Email сповіщення про схвалення надіслано');
      } catch (emailError) {
        console.error('❌ Помилка надсилання email сповіщення:', emailError);
      }

      // Оновлюємо локальний стан
      setApplications(prev => prev.map(app =>
        app.id === applicationId
          ? { ...app, status: 'approved', reviewedAt: new Date().toISOString(), reviewNotes }
          : app
      ));

      setReviewNotes('');
      setSelectedApplication(null);
      alert('Заявку схвалено! Тренер тепер є членом вашого клубу. Email сповіщення надіслано.');
    } catch (error) {
      alert('Помилка схвалення заявки');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!reviewNotes.trim()) {
      alert('Вкажіть причину відхилення');
      return;
    }

    setActionLoading(applicationId);
    try {
      const targetApplication = applications.find(app => app.id === applicationId);
      if (!targetApplication) return;

      // Оновлюємо заявку
      const allApplications = JSON.parse(localStorage.getItem('coachJudgeApplications') || '[]');
      const updatedApplications = allApplications.map((app: CoachJudgeApplication) =>
        app.id === applicationId
          ? {
              ...app,
              status: 'rejected' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.name || 'Керівник клубу',
              reviewNotes
            }
          : app
      );
      localStorage.setItem('coachJudgeApplications', JSON.stringify(updatedApplications));

      // Надсилаємо email сповіщення про відхилення
      try {
        await fetch('/api/send-trainer-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: targetApplication.email,
            trainerName: targetApplication.name,
            clubName: targetApplication.preferredClub.name,
            decision: 'rejected',
            reviewNotes,
            clubManagerName: user?.name || 'Керівник клубу'
          })
        });
        console.log('✅ Email сповіщення про відхилення надіслано');
      } catch (emailError) {
        console.error('❌ Помилка надсилання email сповіщення:', emailError);
      }

      // Оновлюємо локальний стан
      setApplications(prev => prev.map(app =>
        app.id === applicationId
          ? { ...app, status: 'rejected', reviewedAt: new Date().toISOString(), reviewNotes }
          : app
      ));

      setReviewNotes('');
      setSelectedApplication(null);
      alert('Заявку відхилено. Email сповіщення надіслано тренеру.');
    } catch (error) {
      alert('Помилка відхилення заявки');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: CoachJudgeApplication['status']) => {
    const config = {
      pending: { label: 'На розгляді', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Схвалено', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Відхилено', className: 'bg-red-100 text-red-800' }
    };

    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const filteredApplications = applications.filter(app =>
    filter === 'all' || app.status === filter
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ заборонено</h1>
          <p className="text-gray-600">Увійдіть в систему як керівник клубу</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження заявок...</p>
        </div>
      </div>
    );
  }

  if (userClubs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ви не є керівником жодного клубу</h1>
          <p className="text-gray-600">Щоб переглядати заявки тренерів, вам потрібно зареєструвати клуб</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">👨‍🏫 Заявки тренерів/суддів</h1>
              <p className="text-gray-600 text-sm">
                Розгляд заявок для {userClubs.length === 1 ? `клубу "${userClubs[0].name}"` : `${userClubs.length} клубів`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-600">Всього заявок</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">На розгляді</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Схвалено</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(a => a.status === 'rejected').length}
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

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Заявок не знайдено</h3>
              <p className="text-gray-600">Наразі немає заявок за обраними критеріями</p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl">
                        <User className="h-5 w-5 mr-2 text-blue-600" />
                        {application.name}
                      </CardTitle>
                      <div className="flex items-center space-x-4 mt-2">
                        {getStatusBadge(application.status)}
                        <div className="flex space-x-2">
                          {application.roles.map(role => (
                            <Badge key={role} variant="outline">
                              {role === 'coach' ? 'Тренер' : 'Суддя'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Подано: {new Date(application.submittedAt).toLocaleDateString('uk-UA')}
                      </p>
                      {application.reviewedAt && (
                        <p className="text-sm text-gray-500">
                          Розглянуто: {new Date(application.reviewedAt).toLocaleDateString('uk-UA')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Контактна інформація</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{application.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{application.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{application.city}, {application.region}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Професійна інформація</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Освіта:</strong> {application.education}</div>
                        <div><strong>Спеціалізація:</strong> {application.specialization}</div>
                        <div><strong>Досвід:</strong> {application.experience}</div>
                        {application.judgeInfo && (
                          <div>
                            <strong>Суддівська ліцензія:</strong> {application.judgeInfo.category === 'international' ? 'FIG' : 'Національна'}
                            #{application.judgeInfo.license}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {application.applicationMessage && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Повідомлення від заявника:</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {application.applicationMessage}
                      </p>
                    </div>
                  )}

                  {application.reviewNotes && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Коментар керівника:</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        {application.reviewNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t flex items-center justify-end">
                    {application.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedApplication(application);
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
                                setSelectedApplication(application);
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
        {selectedApplication && (
          <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Розгляд заявки: {selectedApplication.name}
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
                    onClick={() => setSelectedApplication(null)}
                  >
                    Скасувати
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedApplication.id)}
                    disabled={!!actionLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {actionLoading === selectedApplication.id ? 'Обробка...' : 'Відхилити'}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedApplication.id)}
                    disabled={!!actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === selectedApplication.id ? 'Обробка...' : 'Схвалити'}
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
