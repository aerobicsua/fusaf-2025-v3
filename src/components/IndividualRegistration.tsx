"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus,
  Calendar,
  MapPin,
  DollarSign,
  Trophy,
  User,
  Phone,
  Mail,
  Building,
  CheckCircle,
  AlertTriangle,
  FileText,
  CreditCard,
  Users,
  X,
  Plus
} from 'lucide-react';

interface IndividualRegistrationProps {
  competitionId: string;
  competitionTitle: string;
  competitionDate: string;
  registrationFee: number;
  entryFee: number;
  onSuccess: (registration: any) => void;
  onCancel: () => void;
}

interface ClubMember {
  id: string;
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  gender: 'male' | 'female';
  birthDate: string;
  categories: string[];
  status: 'active' | 'suspended';
}

interface SelectedParticipant {
  memberId: string;
  athleteName: string;
  gender: 'male' | 'female';
  age: number;
  categories: string[];
}

// Обмеження по категоріях
const CATEGORY_LIMITS = {
  IW: { count: 1, genders: ['female'], name: 'Individual Women' },
  IM: { count: 1, genders: ['male'], name: 'Individual Men' },
  MP: { count: 2, genders: ['male', 'female'], name: 'Mixed Pairs', genderRequirement: 'mixed' },
  TR: { count: 3, genders: ['male', 'female'], name: 'Trio' },
  GR: { count: 5, genders: ['male', 'female'], name: 'Group' },
  AD: { count: 8, genders: ['male', 'female'], name: 'Aerobic Dance' },
  AS: { count: 8, genders: ['male', 'female'], name: 'Aerobic Step' }
};

const AGE_CATEGORIES = [
  'YOUTH / 12-14 YEARS',
  'JUNIORS / 15-17 YEARS',
  'SENIORS 18+ YEARS',
  'ND',
  'NDmini'
];

export function IndividualRegistration({
  competitionId,
  competitionTitle,
  competitionDate,
  registrationFee,
  entryFee,
  onSuccess,
  onCancel
}: IndividualRegistrationProps) {
  const { user } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Дані реєстрації
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<SelectedParticipant[]>([]);
  const [coachName, setCoachName] = useState('');
  const [coachPhone, setCoachPhone] = useState('');
  const [clubName, setClubName] = useState('');
  const [notes, setNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Помилки та повідомлення
  const [errorMessage, setErrorMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadClubMembers();
  }, []);

  const loadClubMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await fetch('/api/clubs/membership/manage');
      const result = await response.json();

      if (response.ok) {
        setClubMembers(result.members || []);
        if (result.members?.length > 0) {
          // Автоматично встановлюємо назву клубу
          setClubName('СК "Грація"'); // В реальній системі отримуємо з API
        }
      } else {
        console.error('Помилка завантаження учасників клубу:', result.error);
      }
    } catch (error) {
      console.error('Помилка завантаження учасників клубу:', error);
    } finally {
      setLoadingMembers(false);
    }
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

  const getAvailableMembers = () => {
    if (!selectedProgram) return [];

    const limits = CATEGORY_LIMITS[selectedProgram as keyof typeof CATEGORY_LIMITS];
    if (!limits) return [];

    return clubMembers.filter(member => {
      // Перевіряємо стать
      if (!limits.genders.includes(member.gender)) return false;

      // Перевіряємо категорії учасника
      const programCode = selectedProgram;
      if (!member.categories.includes(programCode)) return false;

      // Перевіряємо чи не вибраний вже
      if (selectedParticipants.some(p => p.memberId === member.id)) return false;

      return true;
    });
  };

  const addParticipant = (memberId: string) => {
    const member = clubMembers.find(m => m.id === memberId);
    if (!member) return;

    const limits = CATEGORY_LIMITS[selectedProgram as keyof typeof CATEGORY_LIMITS];
    if (!limits) return;

    // Перевіряємо ліміт кількості
    if (selectedParticipants.length >= limits.count) {
      setErrorMessage(`Максимальна кількість учасників для ${limits.name}: ${limits.count}`);
      return;
    }

    // Для Mixed Pairs перевіряємо вимогу різних статей
    if (selectedProgram === 'MP' && selectedParticipants.length === 1) {
      const firstParticipant = selectedParticipants[0];
      if (firstParticipant.gender === member.gender) {
        setErrorMessage('Mixed Pairs повинні складатися з 1 хлопця та 1 дівчини');
        return;
      }
    }

    const newParticipant: SelectedParticipant = {
      memberId: member.id,
      athleteName: member.athleteName,
      gender: member.gender,
      age: calculateAge(member.birthDate),
      categories: member.categories
    };

    setSelectedParticipants(prev => [...prev, newParticipant]);
    setErrorMessage('');
  };

  const removeParticipant = (memberId: string) => {
    setSelectedParticipants(prev => prev.filter(p => p.memberId !== memberId));
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage('');

    switch (step) {
      case 1: // Програма та категорія
        if (!selectedProgram) {
          setErrorMessage('Оберіть програму змагань');
          return false;
        }
        if (!selectedCategory) {
          setErrorMessage('Оберіть вікову категорію');
          return false;
        }
        return true;

      case 2: // Учасники
        const limits = CATEGORY_LIMITS[selectedProgram as keyof typeof CATEGORY_LIMITS];
        if (!limits) return false;

        if (selectedParticipants.length === 0) {
          setErrorMessage('Додайте хоча б одного учасника');
          return false;
        }

        if (selectedParticipants.length !== limits.count) {
          setErrorMessage(`Для ${limits.name} потрібно рівно ${limits.count} учасників`);
          return false;
        }

        // Для Mixed Pairs перевіряємо різні статі
        if (selectedProgram === 'MP') {
          const genders = selectedParticipants.map(p => p.gender);
          if (!genders.includes('male') || !genders.includes('female')) {
            setErrorMessage('Mixed Pairs повинні складатися з 1 хлопця та 1 дівчини');
            return false;
          }
        }

        return true;

      case 3: // Тренер та клуб
        if (!coachName.trim()) {
          setErrorMessage('Вкажіть ім\'я тренера');
          return false;
        }
        if (!coachPhone.trim()) {
          setErrorMessage('Вкажіть телефон тренера');
          return false;
        }
        if (!clubName.trim()) {
          setErrorMessage('Вкажіть назву клубу');
          return false;
        }
        return true;

      case 4: // Підтвердження
        if (!agreedToTerms) {
          setErrorMessage('Підтвердіть згоду з умовами участі');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const registrationData = {
        competitionId,
        program: selectedProgram,
        category: selectedCategory,
        participants: selectedParticipants,
        coach: {
          name: coachName,
          phone: coachPhone
        },
        club: clubName,
        notes: notes.trim(),
        registrationFee,
        entryFee,
        totalFee: registrationFee + entryFee
      };

      const response = await fetch('/api/competitions/register/individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          onSuccess(result.registration);
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Помилка при реєстрації');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Помилка при відправці реєстрації');
    } finally {
      setLoading(false);
    }
  };

  if (loadingMembers) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження учасників клубу...</p>
        </CardContent>
      </Card>
    );
  }

  if (clubMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-orange-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Немає учасників клубу
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              У вашому клубі поки немає учасників. Спочатку потрібно прийняти заявки спортсменів на вступ до клубу.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={onCancel} variant="outline">
              Закрити
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статуси */}
      {submitStatus === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Іменну реєстрацію успішно подано!
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

      {/* Прогрес */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div className={`w-16 h-0.5 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Крок 1: Програма та категорія */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Програма та категорія
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="program">Програма змагань *</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть програму" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LIMITS).map(([code, limits]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center justify-between w-full">
                        <span>{limits.name} ({code})</span>
                        <Badge variant="outline" className="ml-2">
                          {limits.count} {limits.count === 1 ? 'особа' : 'осіб'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProgram && (
                <p className="text-sm text-gray-600 mt-1">
                  {CATEGORY_LIMITS[selectedProgram as keyof typeof CATEGORY_LIMITS]?.name} -
                  потрібно {CATEGORY_LIMITS[selectedProgram as keyof typeof CATEGORY_LIMITS]?.count} учасників
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Вікова категорія *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть вікову категорію" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Крок 2: Вибір учасників */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Учасники
              {selectedProgram && (
                <Badge className="ml-2">
                  {selectedParticipants.length} / {CATEGORY_LIMITS[selectedProgram as keyof typeof CATEGORY_LIMITS]?.count}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Вибрані учасники */}
            {selectedParticipants.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Вибрані учасники:</h4>
                {selectedParticipants.map((participant) => (
                  <div key={participant.memberId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <span className="font-medium">{participant.athleteName}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {participant.gender === 'male' ? '♂️' : '♀️'} {participant.age} років
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeParticipant(participant.memberId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Доступні учасники */}
            {getAvailableMembers().length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium">Доступні учасники клубу:</h4>
                {getAvailableMembers().map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{member.athleteName}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {member.gender === 'male' ? '♂️ Чоловіча' : '♀️ Жіноча'} •
                        {calculateAge(member.birthDate)} років
                      </span>
                      <div className="flex space-x-1 mt-1">
                        {member.categories.map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addParticipant(member.id)}
                      disabled={selectedParticipants.length >= (CATEGORY_LIMITS[selectedProgram as keyof typeof CATEGORY_LIMITS]?.count || 0)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Додати
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {selectedProgram
                    ? `Немає доступних учасників для програми ${CATEGORY_LIMITS[selectedProgram as keyof typeof CATEGORY_LIMITS]?.name}`
                    : 'Спочатку оберіть програму змагань'
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Крок 3: Тренер та клуб */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Тренер та клуб
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="coach-name">Ім'я тренера *</Label>
              <Input
                id="coach-name"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Повне ім'я тренера"
              />
            </div>

            <div>
              <Label htmlFor="coach-phone">Телефон тренера *</Label>
              <Input
                id="coach-phone"
                value={coachPhone}
                onChange={(e) => setCoachPhone(e.target.value)}
                placeholder="+380 XX XXX XX XX"
              />
            </div>

            <div>
              <Label htmlFor="club-name">Назва клубу *</Label>
              <Input
                id="club-name"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Назва спортивного клубу"
              />
            </div>

            <div>
              <Label htmlFor="notes">Додаткові примітки</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Додаткова інформація..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Крок 4: Підтвердження */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Підтвердження реєстрації
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Підсумок */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">Підсумок реєстрації:</h4>
              <p><strong>Змагання:</strong> {competitionTitle}</p>
              <p><strong>Програма:</strong> {CATEGORY_LIMITS[selectedProgram as keyof typeof CATEGORY_LIMITS]?.name} ({selectedProgram})</p>
              <p><strong>Категорія:</strong> {selectedCategory}</p>
              <p><strong>Учасники:</strong> {selectedParticipants.map(p => p.athleteName).join(', ')}</p>
              <p><strong>Тренер:</strong> {coachName}</p>
              <p><strong>Клуб/Підрозділ:</strong> {clubName}</p>
            </div>

            {/* Вартість */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Вартість участі:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Реєстраційний внесок:</span>
                  <span>{registrationFee} грн</span>
                </div>
                {entryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Вступний внесок:</span>
                    <span>{entryFee} грн</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Загалом:</span>
                  <span>{registrationFee + entryFee} грн</span>
                </div>
              </div>
            </div>

            {/* Згода */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-5">
                Підтверджую згоду з умовами участі у змаганнях та правилами ФУСАФ
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Навігація */}
      <div className="flex justify-between">
        {currentStep === 1 ? (
          <Button onClick={onCancel} variant="outline">
            Скасувати
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            variant="outline"
          >
            Назад
          </Button>
        )}

        {currentStep < 4 ? (
          <Button onClick={handleNextStep}>
            Далі
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading || !agreedToTerms}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Реєстрація...' : 'Подати реєстрацію'}
          </Button>
        )}
      </div>
    </div>
  );
}
