"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Building,
  Send,
  CheckCircle,
  Clock,
  X,
  UserPlus,
  AlertTriangle
} from 'lucide-react';

interface ClubMembershipRequestProps {
  athleteId?: string;
}

interface Club {
  id: string;
  name: string;
  city: string;
  owner: string;
  membersCount: number;
  status: 'active' | 'pending' | 'suspended';
}

interface MembershipRequest {
  id: string;
  clubId: string;
  clubName: string;
  athleteId: string;
  athleteName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  responseDate?: string;
  message: string;
  response?: string;
}

// Клуби завантажуються з бази даних після верифікації
const demoClubs: Club[] = [];

export function ClubMembershipRequest({ athleteId }: ClubMembershipRequestProps) {
  const { user } = useSimpleAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadClubs();
    loadRequests();
  }, []);

  const loadClubs = async () => {
    try {
      // В реальній системі тут би був запит до API
      setClubs(demoClubs);
    } catch (error) {
      console.error('Помилка завантаження клубів:', error);
    }
  };

  const loadRequests = async () => {
    try {
      // В реальній системі тут би був запит до API для отримання заявок користувача
      const demoRequests: MembershipRequest[] = [
        {
          id: 'req-1',
          clubId: 'club-1',
          clubName: 'СК "Грація"',
          athleteId: session?.user?.email || '',
          athleteName: session?.user?.name || '',
          status: 'pending',
          requestDate: '2025-01-15',
          message: 'Хочу приєднатися до вашого клубу для участі в змаганнях'
        }
      ];
      setRequests(demoRequests);
    } catch (error) {
      console.error('Помилка завантаження заявок:', error);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedClub || !message.trim()) {
      setErrorMessage('Оберіть клуб та напишіть повідомлення');
      return;
    }

    // Перевіряємо чи немає вже активної заявки до цього клубу
    const existingRequest = requests.find(req =>
      req.clubId === selectedClub && req.status === 'pending'
    );

    if (existingRequest) {
      setErrorMessage('У вас вже є активна заявка до цього клубу');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/clubs/membership/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubId: selectedClub,
          message: message.trim()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSelectedClub('');
        setMessage('');
        loadRequests(); // Перезавантажуємо заявки
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Помилка при подачі заявки');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Помилка при відправці заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'На розгляді', color: 'bg-yellow-500' },
      approved: { label: 'Схвалено', color: 'bg-green-500' },
      rejected: { label: 'Відхилено', color: 'bg-red-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  if (!user) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Членство в клубах</h3>
          <p className="text-gray-600">
            Увійдіть в систему для подачі заявки на вступ до клубу
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Поточні заявки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Мої заявки на вступ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              У вас поки немає заявок на вступ до клубів
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{request.clubName}</h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    Подано: {new Date(request.requestDate).toLocaleDateString('uk-UA')}
                  </div>
                  {request.response && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <strong>Відповідь:</strong> {request.response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Подача нової заявки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Подати заявку на вступ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Заявку успішно подано! Очікуйте на відповідь від власника клубу.
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="club-select">Оберіть клуб *</Label>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть клуб для вступу" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{club.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {club.city} • {club.membersCount} учасників
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Повідомлення для власника клубу *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Розкажіть про себе та чому хочете приєднатися до цього клубу..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleSubmitRequest}
            disabled={isSubmitting || !selectedClub || !message.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Відправка...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Подати заявку
              </>
            )}
          </Button>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Примітка:</strong> Після схвалення заявки власником клубу,
              ви зможете брати участь у змаганнях від імені цього клубу.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
