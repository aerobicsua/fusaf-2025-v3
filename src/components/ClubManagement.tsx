"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users,
  Building,
  CheckCircle,
  X,
  Clock,
  UserCheck,
  UserX,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface MembershipRequest {
  id: string;
  clubId: string;
  clubName: string;
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  message: string;
}

interface ClubMember {
  id: string;
  clubId: string;
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  joinDate: string;
  status: 'active' | 'suspended';
  gender: 'male' | 'female';
  birthDate: string;
  categories: string[];
}

export function ClubManagement() {
  const { user } = useSimpleAuth();
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [userClubs, setUserClubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MembershipRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    loadClubData();
  }, []);

  const loadClubData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clubs/membership/manage');
      const result = await response.json();

      if (response.ok) {
        setRequests(result.requests || []);
        setMembers(result.members || []);
        setUserClubs(result.userClubs || []);
      } else {
        console.error('Помилка завантаження даних клубу:', result.error);
      }
    } catch (error) {
      console.error('Помилка завантаження даних клубу:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingRequest(requestId);

    try {
      const response = await fetch('/api/clubs/membership/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action,
          response: responseMessage.trim()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Оновлюємо список заявок
        setRequests(prev => prev.map(req =>
          req.id === requestId
            ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
            : req
        ));

        setSelectedRequest(null);
        setResponseMessage('');

        // Перезавантажуємо дані для оновлення списку учасників
        loadClubData();
      } else {
        alert('Помилка: ' + result.error);
      }
    } catch (error) {
      alert('Помилка при обробці заявки');
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'На розгляді', color: 'bg-yellow-500', icon: Clock },
      approved: { label: 'Схвалено', color: 'bg-green-500', icon: CheckCircle },
      rejected: { label: 'Відхилено', color: 'bg-red-500', icon: X }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  if (!user) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="text-center py-8">
          <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Управління клубом</h3>
          <p className="text-gray-600">
            Увійдіть в систему для управління клубом
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження даних клубу...</p>
        </CardContent>
      </Card>
    );
  }

  if (userClubs.length === 0) {
    return (
      <Card className="border-dashed border-2 border-orange-200">
        <CardContent className="text-center py-8">
          <Building className="h-12 w-12 mx-auto text-orange-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ви не є власником клубу</h3>
          <p className="text-gray-600">
            Тільки власники клубів можуть управляти заявками на вступ
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заявки на вступ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Заявки на вступ
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">
                {requests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              Немає нових заявок на вступ
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{request.athleteName}</h4>
                      <p className="text-sm text-gray-600">{request.athleteEmail}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{request.message}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Подано: {new Date(request.requestDate).toLocaleDateString('uk-UA')}
                    </span>

                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Переглянути
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Заявка на вступ</DialogTitle>
                              <DialogDescription>
                                Розгляд заявки від {request.athleteName}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <strong>Спортсмен:</strong> {request.athleteName}<br />
                                <strong>Email:</strong> {request.athleteEmail}<br />
                                <strong>Дата подачі:</strong> {new Date(request.requestDate).toLocaleDateString('uk-UA')}
                              </div>

                              <div>
                                <strong>Повідомлення:</strong>
                                <p className="mt-1 p-2 bg-gray-50 rounded text-sm">
                                  {request.message}
                                </p>
                              </div>

                              <div>
                                <Label htmlFor="response">Відповідь (необов'язково)</Label>
                                <Textarea
                                  id="response"
                                  value={responseMessage}
                                  onChange={(e) => setResponseMessage(e.target.value)}
                                  placeholder="Ваша відповідь спортсмену..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex space-x-2 pt-4">
                                <Button
                                  onClick={() => handleRequestAction(request.id, 'approve')}
                                  disabled={processingRequest === request.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Схвалити
                                </Button>
                                <Button
                                  onClick={() => handleRequestAction(request.id, 'reject')}
                                  disabled={processingRequest === request.id}
                                  variant="destructive"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Відхилити
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Поточні учасники клубу */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Учасники клубу
            <Badge className="ml-2" variant="outline">
              {members.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              У клубі поки немає учасників
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{member.athleteName}</h4>
                    <p className="text-sm text-gray-600">
                      {member.gender === 'male' ? '♂️ Чоловіча' : '♀️ Жіноча'} •
                      {calculateAge(member.birthDate)} років •
                      З {new Date(member.joinDate).toLocaleDateString('uk-UA')}
                    </p>
                    <div className="flex space-x-1 mt-1">
                      {member.categories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge
                    className={member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                  >
                    {member.status === 'active' ? 'Активний' : 'Призупинено'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
