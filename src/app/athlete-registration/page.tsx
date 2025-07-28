"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import PaymentForm from '@/components/payments/PaymentForm';
import PaymentStatus from '@/components/payments/PaymentStatus';
import {
  UserPlus,
  Trophy,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Building,
  Mail,
  Phone,
  User
} from 'lucide-react';

interface Competition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  location: any;
  categories: any[];
  registration_fee: number;
  max_participants: number;
  current_participants: number;
  status: string;
  organizer: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  club: string;
  city: string;
  region: string;
  notes: string;
}

type RegistrationStep = 'competition' | 'athlete' | 'payment' | 'success';

export default function AthleteRegistrationPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('competition');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    category: '',
    club: '',
    city: '',
    region: '',
    notes: ''
  });

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/competitions?status=registration_open&limit=20');
      const data = await response.json();

      if (data.success) {
        setCompetitions(data.competitions || []);
      } else {
        setError('Помилка завантаження змагань');
      }
    } catch (error) {
      console.error('Помилка завантаження змагань:', error);
      setError('Помилка мережі');
    } finally {
      setLoading(false);
    }
  };

  const handleCompetitionSelect = (competition: Competition) => {
    setSelectedCompetition(competition);
    setCurrentStep('athlete');
  };

  const handleAthleteDataSubmit = () => {
    // Валідація обов'язкових полів
    const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth', 'gender', 'category'];
    const missingFields = requiredFields.filter(field => !registrationData[field as keyof RegistrationData]);

    if (missingFields.length > 0) {
      setError('Заповніть всі обов\'язкові поля');
      return;
    }

    if (selectedCompetition?.registration_fee && selectedCompetition.registration_fee > 0) {
      setCurrentStep('payment');
    } else {
      // Безкоштовна реєстрація
      submitRegistration();
    }
  };

  const submitRegistration = async () => {
    if (!selectedCompetition) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/athlete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: selectedCompetition.id,
          ...registrationData
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep('success');
      } else {
        setError(data.error || 'Помилка реєстрації');
      }
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      setError('Помилка мережі');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setSuccessPaymentId(paymentId);
    setCurrentStep('success');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAvailableCategories = () => {
    if (!selectedCompetition?.categories) return [];
    try {
      return typeof selectedCompetition.categories === 'string'
        ? JSON.parse(selectedCompetition.categories)
        : selectedCompetition.categories;
    } catch {
      return [];
    }
  };

  const isRegistrationClosed = (competition: Competition) => {
    const deadline = new Date(competition.registration_deadline);
    const now = new Date();
    return deadline < now || competition.status !== 'registration_open';
  };

  const getStepIcon = (step: RegistrationStep) => {
    const stepIndex = ['competition', 'athlete', 'payment', 'success'].indexOf(step);
    const currentIndex = ['competition', 'athlete', 'payment', 'success'].indexOf(currentStep);

    if (stepIndex < currentIndex || currentStep === 'success') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stepIndex === currentIndex) {
      return <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{stepIndex + 1}</div>;
    } else {
      return <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">{stepIndex + 1}</div>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Завантаження змагань...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Реєстрація на змагання</h1>
        <p className="text-gray-600">
          Оберіть змагання та заповніть форму для участі
        </p>
      </div>

      {/* Прогрес реєстрації */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex items-center">
            {getStepIcon('competition')}
            <span className="ml-2 text-sm font-medium">Змагання</span>
          </div>
          <div className="w-12 h-px bg-gray-300"></div>
          <div className="flex items-center">
            {getStepIcon('athlete')}
            <span className="ml-2 text-sm font-medium">Дані спортсмена</span>
          </div>
          {selectedCompetition?.registration_fee && selectedCompetition.registration_fee > 0 && (
            <>
              <div className="w-12 h-px bg-gray-300"></div>
              <div className="flex items-center">
                {getStepIcon('payment')}
                <span className="ml-2 text-sm font-medium">Оплата</span>
              </div>
            </>
          )}
          <div className="w-12 h-px bg-gray-300"></div>
          <div className="flex items-center">
            {getStepIcon('success')}
            <span className="ml-2 text-sm font-medium">Завершення</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Крок 1: Вибір змагання */}
      {currentStep === 'competition' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-orange-500" />
                Оберіть змагання
              </CardTitle>
              <CardDescription>
                Доступні змагання з відкритою реєстрацією
              </CardDescription>
            </CardHeader>
            <CardContent>
              {competitions.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Наразі немає доступних змагань для реєстрації</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {competitions.map((competition) => (
                    <Card
                      key={competition.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isRegistrationClosed(competition) ? 'opacity-50' : 'hover:border-blue-300'
                      }`}
                      onClick={() => !isRegistrationClosed(competition) && handleCompetitionSelect(competition)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{competition.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {competition.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(competition.start_date)} - {formatDate(competition.end_date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {competition.location?.city || 'Не вказано'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {competition.current_participants || 0} / {competition.max_participants || '∞'} учасників
                          </div>
                          {competition.registration_fee > 0 && (
                            <div className="flex items-center text-sm text-gray-600">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Реєстраційний збір: {formatAmount(competition.registration_fee)}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            Реєстрація до: {formatDate(competition.registration_deadline)}
                          </div>
                        </div>

                        {isRegistrationClosed(competition) ? (
                          <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-center">
                            <span className="text-sm text-red-600">Реєстрація закрита</span>
                          </div>
                        ) : (
                          <Button className="w-full mt-4">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Обрати це змагання
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Крок 2: Дані спортсмена */}
      {currentStep === 'athlete' && selectedCompetition && (
        <div className="space-y-6">
          {/* Інформація про вибране змагання */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-orange-500" />
                Вибране змагання
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">{selectedCompetition.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedCompetition.description}</p>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Дати:</span> {formatDate(selectedCompetition.start_date)} - {formatDate(selectedCompetition.end_date)}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Місце:</span> {selectedCompetition.location?.city || 'Не вказано'}
                  </div>
                  {selectedCompetition.registration_fee > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Реєстраційний збір:</span>
                      <span className="font-bold text-blue-600 ml-1">
                        {formatAmount(selectedCompetition.registration_fee)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep('competition')}
                className="mt-4"
              >
                Обрати інше змагання
              </Button>
            </CardContent>
          </Card>

          {/* Форма даних спортсмена */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Дані спортсмена
              </CardTitle>
              <CardDescription>
                Заповніть всі обов'язкові поля (позначені *)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Основні дані */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lastName">Прізвище *</Label>
                  <Input
                    id="lastName"
                    value={registrationData.lastName}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Іваненко"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">Ім'я *</Label>
                  <Input
                    id="firstName"
                    value={registrationData.firstName}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Іван"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="middleName">По батькові</Label>
                  <Input
                    id="middleName"
                    value={registrationData.middleName}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, middleName: e.target.value }))}
                    placeholder="Іванович"
                  />
                </div>
              </div>

              {/* Контактні дані */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={registrationData.email}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="ivan@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={registrationData.phone}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+380..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Особисті дані */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Дата народження *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={registrationData.dateOfBirth}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Стать *</Label>
                  <Select value={registrationData.gender} onValueChange={(value) => setRegistrationData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть стать" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Чоловіча</SelectItem>
                      <SelectItem value="female">Жіноча</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Категорія *</Label>
                  <Select value={registrationData.category} onValueChange={(value) => setRegistrationData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть категорію" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCategories().map((category: any) => (
                        <SelectItem key={category.name || category} value={category.name || category}>
                          {category.name || category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Місце та клуб */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="region">Область</Label>
                  <Input
                    id="region"
                    value={registrationData.region}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, region: e.target.value }))}
                    placeholder="Київська"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Місто</Label>
                  <Input
                    id="city"
                    value={registrationData.city}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Київ"
                  />
                </div>
                <div>
                  <Label htmlFor="club">Клуб/Команда</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="club"
                      value={registrationData.club}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, club: e.target.value }))}
                      placeholder="Назва клубу"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Додаткові нотатки */}
              <div>
                <Label htmlFor="notes">Додаткові нотатки</Label>
                <Textarea
                  id="notes"
                  value={registrationData.notes}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Особливі потреби, побажання, тощо..."
                  rows={3}
                />
              </div>

              {/* Інформація про наступний крок */}
              {selectedCompetition.registration_fee > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Наступний крок: Оплата реєстраційного збору</p>
                      <p className="mt-1">
                        Сума до оплати: <strong>{formatAmount(selectedCompetition.registration_fee)}</strong>
                      </p>
                      <p className="mt-1">
                        Оплата здійснюється через безпечну систему LiqPay.
                        Реєстрація буде підтверджена автоматично після успішної оплати.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('competition')}
                >
                  Назад
                </Button>
                <Button
                  onClick={handleAthleteDataSubmit}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    'Обробка...'
                  ) : selectedCompetition.registration_fee > 0 ? (
                    'Перейти до оплати'
                  ) : (
                    'Завершити реєстрацію'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Крок 3: Оплата */}
      {currentStep === 'payment' && selectedCompetition && (
        <div className="space-y-6">
          <PaymentForm
            competitionId={selectedCompetition.id}
            competitionTitle={selectedCompetition.title}
            registrationFee={selectedCompetition.registration_fee}
            registrationData={registrationData}
            userEmail={registrationData.email}
            userPhone={registrationData.phone}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setCurrentStep('athlete')}
          />
        </div>
      )}

      {/* Крок 4: Успішне завершення */}
      {currentStep === 'success' && (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Реєстрацію успішно завершено!
              </CardTitle>
              <CardDescription>
                Вітаємо! Ви успішно зареєструвалися на змагання
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-800">Змагання:</h4>
                    <p>{selectedCompetition?.title}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Учасник:</h4>
                    <p>{registrationData.firstName} {registrationData.lastName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Категорія:</h4>
                    <p>{registrationData.category}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Email:</h4>
                    <p>{registrationData.email}</p>
                  </div>
                </div>

                {successPaymentId && selectedCompetition?.registration_fee > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-green-800 mb-3">Інформація про платіж:</h4>
                    <PaymentStatus
                      paymentId={successPaymentId}
                      autoRefresh={false}
                      showDetails={false}
                    />
                  </div>
                )}

                <div className="p-4 bg-green-100 rounded-lg">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                    <div className="text-sm text-green-800">
                      <p>Підтвердження реєстрації відправлено на {registrationData.email}</p>
                      <p className="mt-1">
                        Детальна інформація про змагання, розклад та додаткові інструкції
                        будуть відправлені окремим листом найближчим часом.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setCurrentStep('competition');
                      setSelectedCompetition(null);
                      setRegistrationData({
                        firstName: '',
                        lastName: '',
                        middleName: '',
                        email: '',
                        phone: '',
                        dateOfBirth: '',
                        gender: '',
                        category: '',
                        club: '',
                        city: '',
                        region: '',
                        notes: ''
                      });
                      setSuccessPaymentId(null);
                      setError(null);
                    }}
                    variant="outline"
                  >
                    Зареєструватися на інше змагання
                  </Button>
                  <Button onClick={() => window.location.href = '/'}>
                    На головну
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
