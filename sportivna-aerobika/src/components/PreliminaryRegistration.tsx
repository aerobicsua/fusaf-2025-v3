"use client";

import { useState } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { canRegisterTeams } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Trophy,
  Users,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Phone,
  Mail,
  Building,
  X,
  Info,
  Plus,
  Minus
} from 'lucide-react';

// Базові категорії відповідно до скріншота
const BASE_AGE_CATEGORIES = [
  {
    id: 'youth',
    name: 'YOUTH / 12-14 YEARS',
    programs: [
      'Individual Woman',
      'Individual Man',
      'Mixed pair',
      'Trio',
      'Groups',
      'Aerodance Groups'
    ]
  },
  {
    id: 'juniors',
    name: 'JUNIORS / 15-17 YEARS',
    programs: [
      'Individual Woman',
      'Individual Man',
      'Mixed pair',
      'Trio',
      'Groups',
      'Aerodance Groups'
    ]
  },
  {
    id: 'seniors',
    name: 'SENIORS 18+ YEARS',
    programs: [
      'Individual Woman',
      'Individual Man',
      'Mixed pair',
      'Trio',
      'GR',
      'Aerodance Groups'
    ]
  }
];

// Додаткові категорії, які можна додавати
const ADDITIONAL_CATEGORIES = [
  {
    id: 'nd',
    name: 'ND',
    programs: [
      'Individual Woman',
      'Individual Man',
      'Mixed pair',
      'Trio',
      'Groups',
      'Aerodance Groups'
    ]
  },
  {
    id: 'ndmini',
    name: 'NDmini',
    programs: [
      'Individual Woman',
      'Individual Man',
      'Mixed pair',
      'Trio',
      'Groups',
      'Aerodance Groups'
    ]
  }
];

interface Competition {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  address: string;
  registration_deadline: string;
  status: string;
}

interface PreliminaryRegistrationProps {
  competition: Competition;
  onRegistrationSuccess?: (registration?: any) => void;
}

interface ParticipantCategory {
  age_category: string;
  program: string;
  count: number;
}

interface RegistrationData {
  club_name: string;
  organization_name: string;
  contact_person: {
    full_name: string;
    phone: string;
    email: string;
    position?: string;
  };
  participants: ParticipantCategory[];
  notes?: string;
}

export function PreliminaryRegistration({ competition, onRegistrationSuccess }: PreliminaryRegistrationProps) {
  const { user, loading } = useSimpleAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeCategories, setActiveCategories] = useState(BASE_AGE_CATEGORIES);

  const [formData, setFormData] = useState<RegistrationData>({
    club_name: '',
    organization_name: '',
    contact_person: {
      full_name: '',
      phone: '',
      email: '',
      position: ''
    },
    participants: [],
    notes: ''
  });

  // Перевірка доступу - тільки власники клубів, тренери та адміни
  const hasAccess = canRegisterTeams(user?.roles);

  const addCategory = (categoryToAdd: typeof ADDITIONAL_CATEGORIES[0]) => {
    if (!activeCategories.find(cat => cat.id === categoryToAdd.id)) {
      setActiveCategories([...activeCategories, categoryToAdd]);
    }
  };

  const removeCategory = (categoryId: string) => {
    // Не можна видаляти базові категорії
    const baseIds = BASE_AGE_CATEGORIES.map(cat => cat.id);
    if (baseIds.includes(categoryId)) return;

    setActiveCategories(activeCategories.filter(cat => cat.id !== categoryId));

    // Видаляємо учасників цієї категорії
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => {
        const category = activeCategories.find(cat => cat.name === p.age_category);
        return category?.id !== categoryId;
      })
    }));
  };

  const updateParticipantCount = (ageCategory: string, program: string, count: number) => {
    setFormData(prev => {
      const existingIndex = prev.participants.findIndex(
        p => p.age_category === ageCategory && p.program === program
      );

      if (count === 0) {
        // Видаляємо запис якщо кількість 0
        return {
          ...prev,
          participants: prev.participants.filter(
            p => !(p.age_category === ageCategory && p.program === program)
          )
        };
      }

      if (existingIndex >= 0) {
        // Оновлюємо існуючий запис
        const updated = [...prev.participants];
        updated[existingIndex] = { age_category: ageCategory, program, count };
        return { ...prev, participants: updated };
      } else {
        // Додаємо новий запис
        return {
          ...prev,
          participants: [...prev.participants, { age_category: ageCategory, program, count }]
        };
      }
    });
  };

  const getParticipantCount = (ageCategory: string, program: string): number => {
    const participant = formData.participants.find(
      p => p.age_category === ageCategory && p.program === program
    );
    return participant?.count || 0;
  };

  const getTotalParticipants = () => {
    return formData.participants.reduce((sum, p) => sum + p.count, 0);
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage('Необхідна аутентифікація');
      return;
    }

    if (!hasAccess) {
      setErrorMessage('Тільки власники клубів, тренери та адміністратори ФУСАФ можуть подавати попередні реєстрації');
      return;
    }

    // Валідація
    if (!formData.club_name.trim()) {
      setErrorMessage('Вкажіть назву клубу');
      return;
    }

    if (!formData.contact_person.full_name.trim()) {
      setErrorMessage('Вкажіть контактну особу');
      return;
    }

    if (!formData.contact_person.phone.trim()) {
      setErrorMessage('Вкажіть номер телефону');
      return;
    }

    if (!formData.contact_person.email.trim()) {
      setErrorMessage('Вкажіть email адресу');
      return;
    }

    if (formData.participants.length === 0) {
      setErrorMessage('Додайте хоча б одну категорію учасників');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/competitions/${competition.id}/preliminary-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          participants_count: formData.participants,
          competition_id: competition.id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
          onRegistrationSuccess?.();
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Помилка при реєстрації');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Помилка мережі');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Якщо немає доступу, показуємо інформаційне повідомлення
  if (loading) {
    return (
      <Button disabled>
        <Users className="h-4 w-4 mr-2" />
        Завантаження...
      </Button>
    );
  }

  if (!user) {
    return (
      <Button disabled>
        <Users className="h-4 w-4 mr-2" />
        Увійдіть для реєстрації
      </Button>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full opacity-50">
          <Users className="h-4 w-4 mr-2" />
          Попередня реєстрація
        </Button>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Попередню реєстрацію можуть подавати тільки власники/представники клубів, тренери та адміністратори ФУСАФ.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Users className="h-4 w-4 mr-2" />
          Попередня реєстрація
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Trophy className="h-6 w-6 text-blue-600 mr-2" />
            Попередня реєстрація
          </DialogTitle>
          <DialogDescription>
            Подання попередньої реєстрації на {competition.title}
          </DialogDescription>
        </DialogHeader>

        {submitStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Попередню реєстрацію успішно подано! Номер реєстрації буде надіслано на email.
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

        <div className="space-y-6">
          {/* Інформація про змагання */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                  {new Date(competition.date).toLocaleDateString('uk-UA')}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-600 mr-2" />
                  {competition.time || 'Час уточнюється'}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                  {competition.location}
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-blue-600 mr-2" />
                  {competition.address}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Інформація про доступ */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Увага:</strong> Попередню реєстрацію подають тільки власники/представники клубів, тренери або адміністратори ФУСАФ.
              На цьому етапі оплата не проводиться - вона буде на етапі іменної реєстрації.
            </AlertDescription>
          </Alert>

          {/* Основна інформація */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="club_name">Назва клубу *</Label>
              <Input
                id="club_name"
                value={formData.club_name}
                onChange={(e) => setFormData(prev => ({ ...prev, club_name: e.target.value }))}
                placeholder="СК 'Назва'"
              />
            </div>
            <div>
              <Label htmlFor="organization_name">Повна назва організації</Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                placeholder="Повна офіційна назва"
              />
            </div>
          </div>

          {/* Контактна особа */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Контактна особа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">ПІБ контактної особи *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_person.full_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact_person: { ...prev.contact_person, full_name: e.target.value }
                    }))}
                    placeholder="Прізвище Ім'я По батькові"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_position">Посада</Label>
                  <Input
                    id="contact_position"
                    value={formData.contact_person.position}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact_person: { ...prev.contact_person, position: e.target.value }
                    }))}
                    placeholder="Тренер, Директор клубу..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">Телефон *</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_person.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact_person: { ...prev.contact_person, phone: e.target.value }
                    }))}
                    placeholder="+380XXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_person.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact_person: { ...prev.contact_person, email: e.target.value }
                    }))}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Категорії учасників */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Кількість учасників за категоріями
                </CardTitle>

                {/* Кнопки додавання категорій */}
                <div className="flex flex-wrap gap-2">
                  {ADDITIONAL_CATEGORIES.map((category) => {
                    const isActive = activeCategories.find(cat => cat.id === category.id);
                    return !isActive ? (
                      <Button
                        key={category.id}
                        size="sm"
                        variant="outline"
                        onClick={() => addCategory(category)}
                        className="h-8 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Додати {category.name}
                      </Button>
                    ) : null;
                  })}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activeCategories.map((category) => {
                  const isRemovable = !BASE_AGE_CATEGORIES.find(base => base.id === category.id);

                  return (
                    <div key={category.id}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-md p-2 bg-gray-100 rounded flex-1">
                          {category.name}
                        </h3>
                        {isRemovable && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeCategory(category.id)}
                            className="ml-2 h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {/* Таблиця як на скріншоті */}
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left p-3 border-r font-medium">Program</th>
                              <th className="text-center p-3 font-medium w-40">Number of participants</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.programs.map((program, index) => (
                              <tr key={`${category.id}-${program}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-3 border-r border-b">{program}</td>
                                <td className="p-3 border-b text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={getParticipantCount(category.name, program)}
                                    onChange={(e) => updateParticipantCount(
                                      category.name,
                                      program,
                                      Number.parseInt(e.target.value) || 0
                                    )}
                                    className="text-center w-20 mx-auto"
                                    placeholder="0"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Підсумок */}
              {getTotalParticipants() > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-800">
                    Загальна кількість учасників: {getTotalParticipants()}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    💡 Оплата буде проводитися на етапі іменної реєстрації
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Додаткові примітки */}
          <div>
            <Label htmlFor="notes">Додаткові примітки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Додаткова інформація..."
              rows={3}
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || getTotalParticipants() === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Обробка...' : 'Подати реєстрацію'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
