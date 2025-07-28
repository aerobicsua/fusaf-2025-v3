"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Clock,
  Save,
  ArrowLeft,
  Building,
  Phone,
  Mail,
  Globe,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Loader
} from 'lucide-react';

// Використовуємо той самий інтерфейс що і для створення
interface CompetitionForm {
  title: string;
  description: string;
  date: string;
  time: string;
  registration_deadline: string;
  location: string;
  address: string;
  city: string;
  organizing_club: string;
  contact_person: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  // Фінанси по видах програм
  program_fees: {
    iw_im: number;  // Individual Women/Men
    mp: number;     // Mixed Pairs
    tr: number;     // Trio
    gr: number;     // Group
    ad: number;     // Aerobic Dance
    as: number;     // Aerobic Step
  };
  payment_details: {
    bank_name: string;
    account_number: string;
    account_holder: string;
    swift_code?: string;
  };
  // Технічні вимоги - максимальна кількість учасників по програмах
  max_participants_by_program: {
    iw: number;     // Individual Women
    im: number;     // Individual Men
    mp: number;     // Mixed Pairs
    tr: number;     // Trio
    gr: number;     // Group
    ad: number;     // Aerobic Dance
    as: number;     // Aerobic Step
  };
  categories: string[];
  rules: string;
  equipment_requirements: string;
  accommodation: {
    available: boolean;
    details: string;
    cost_per_night?: number;
  };
  meals: {
    available: boolean;
    details: string;
    cost_per_meal?: number;
  };
  transportation: {
    available: boolean;
    details: string;
  };
  medical_requirements: string;
  insurance_required: boolean;
  notes: string;
  website?: string;
  status: string;
}

// Програми спортивної аеробіки згідно FIG
const AEROBIC_PROGRAMS = [
  { code: 'iw_im', name: 'Individual Women/Men (IW/IM)', defaultFee: 500, shortName: 'IW/IM' },
  { code: 'mp', name: 'Mixed Pairs (MP)', defaultFee: 600, shortName: 'MP' },
  { code: 'tr', name: 'Trio (TR)', defaultFee: 800, shortName: 'TR' },
  { code: 'gr', name: 'Group (GR)', defaultFee: 1000, shortName: 'GR' },
  { code: 'ad', name: 'Aerobic Dance (AD)', defaultFee: 1200, shortName: 'AD' },
  { code: 'as', name: 'Aerobic Step (AS)', defaultFee: 1200, shortName: 'AS' }
];

// Максимальна кількість учасників по програмах за замовчуванням
const DEFAULT_MAX_PARTICIPANTS = {
  iw: 3,  // Individual Women
  im: 3,  // Individual Men
  mp: 2,  // Mixed Pairs
  tr: 2,  // Trio
  gr: 1,  // Group
  ad: 1,  // Aerobic Dance
  as: 1   // Aerobic Step
};

const COMPETITION_CATEGORIES = [
  'YOUTH / 12-14 YEARS',
  'JUNIORS / 15-17 YEARS',
  'SENIORS 18+ YEARS',
  'ND',
  'NDmini'
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Чернетка' },
  { value: 'published', label: 'Опубліковано' },
  { value: 'registration_open', label: 'Реєстрація відкрита' },
  { value: 'registration_closed', label: 'Реєстрація закрита' },
  { value: 'in_progress', label: 'Проходить' },
  { value: 'completed', label: 'Завершено' },
  { value: 'cancelled', label: 'Скасовано' }
];

export default function EditCompetitionPage() {
  const { user } = useSimpleAuth();
  const router = useRouter();
  const params = useParams();
  const competitionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<CompetitionForm>({
    title: '',
    description: '',
    date: '',
    time: '',
    registration_deadline: '',
    location: '',
    address: '',
    city: '',
    organizing_club: '',
    contact_person: {
      name: '',
      position: '',
      phone: '',
      email: ''
    },
    program_fees: {
      iw_im: 0,
      mp: 0,
      tr: 0,
      gr: 0,
      ad: 0,
      as: 0
    },
    payment_details: {
      bank_name: '',
      account_number: '',
      account_holder: '',
      swift_code: ''
    },
    max_participants_by_program: {
      iw: 0,
      im: 0,
      mp: 0,
      tr: 0,
      gr: 0,
      ad: 0,
      as: 0
    },
    categories: [],
    rules: '',
    equipment_requirements: '',
    accommodation: {
      available: false,
      details: ''
    },
    meals: {
      available: false,
      details: ''
    },
    transportation: {
      available: false,
      details: ''
    },
    medical_requirements: '',
    insurance_required: true,
    notes: '',
    website: '',
    status: 'draft'
  });

  // Завантаження даних змагання
  useEffect(() => {
    const loadCompetition = async () => {
      try {
        // В реальній системі тут би був запит до API
        // Зараз використовуємо демо-дані
        const demoCompetitions = [
          {
            id: 'comp-1',
            title: 'Кубок України зі спортивної аеробіки 2025',
            description: 'Офіційні змагання федерації України зі спортивної аеробіки та фітнесу.',
            date: '2025-04-15',
            time: '10:00',
            location: 'Палац спорту "Україна"',
            address: 'вул. Велика Васільківська, 55, Київ, 03150',
            city: 'Київ',
            registration_fee: 300,
            entry_fee: 200,
            max_participants: 200,
            registration_deadline: '2026-03-15',
            status: 'registration_open',
            organizing_club: 'СК "Грація"',
            contact_person: {
              name: 'Іваненко Марія Петрівна',
              position: 'Директор змагань',
              phone: '+380 67 123 45 67',
              email: 'competitions@fusaf.org.ua'
            },
            payment_details: {
              bank_name: 'ПриватБанк',
              account_number: 'UA123456789012345678901234567',
              account_holder: 'СК "Грація"',
              swift_code: 'PBANUA2X'
            },
            categories: [
              'YOUTH / 12-14 YEARS',
              'JUNIORS / 15-17 YEARS',
              'SENIORS 18+ YEARS'
            ],
            rules: 'Змагання проводяться згідно з правилами FIG та ФУСАФ.',
            equipment_requirements: 'Мінімум 2 килимки одного виробника',
            accommodation: {
              available: true,
              details: 'Готель "Прем\'єр Палац"',
              cost_per_night: 800
            },
            meals: {
              available: true,
              details: 'Трьохразове харчування',
              cost_per_meal: 150
            },
            transportation: {
              available: true,
              details: 'Трансфер від готелю'
            },
            medical_requirements: 'Обов\'язкова медична довідка',
            insurance_required: true,
            notes: 'Додаткова інформація для учасників',
            website: 'https://competition.fusaf.org.ua'
          }
        ];

        const competition = demoCompetitions.find(c => c.id === competitionId);

        if (competition) {
          setFormData({
            title: competition.title,
            description: competition.description,
            date: competition.date,
            time: competition.time,
            registration_deadline: competition.registration_deadline,
            location: competition.location,
            address: competition.address,
            city: competition.city,
            organizing_club: competition.organizing_club,
            contact_person: competition.contact_person,
            // Нові поля для фінансів по програмах - встановлюємо значення за замовчуванням
            program_fees: {
              iw_im: 500,
              mp: 600,
              tr: 800,
              gr: 1000,
              ad: 1200,
              as: 1200
            },
            payment_details: competition.payment_details,
            // Нові поля для максимальної кількості учасників по програмах
            max_participants_by_program: {
              iw: 3,
              im: 3,
              mp: 2,
              tr: 2,
              gr: 1,
              ad: 1,
              as: 1
            },
            categories: competition.categories,
            rules: competition.rules,
            equipment_requirements: competition.equipment_requirements,
            accommodation: competition.accommodation,
            meals: competition.meals,
            transportation: competition.transportation,
            medical_requirements: competition.medical_requirements,
            insurance_required: competition.insurance_required,
            notes: competition.notes,
            website: competition.website,
            status: competition.status
          });
        } else {
          setErrorMessage('Змагання не знайдено');
        }
      } catch (error) {
        setErrorMessage('Помилка завантаження змагання');
      } finally {
        setLoading(false);
      }
    };

    if (competitionId) {
      loadCompetition();
    }
  }, [competitionId]);

  // Перевірка доступу
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
            <p className="text-gray-600 mb-4">Увійдіть для редагування змагань</p>
            <Button onClick={() => router.push('/')}>
              Повернутися на головну
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canEditCompetition = user?.roles?.some(role =>
    ['admin', 'club_owner'].includes(role)
  );

  if (!canEditCompetition) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Недостатньо прав</h1>
            <p className="text-gray-600 mb-4">
              Редагувати змагання можуть тільки власники клубів та адміністратори
            </p>
            <Button onClick={() => router.push('/competitions')}>
              Переглянути змагання
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Завантаження змагання...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Валідація
      if (!formData.title.trim()) {
        throw new Error('Вкажіть назву змагання');
      }
      if (!formData.date) {
        throw new Error('Вкажіть дату змагання');
      }
      if (!formData.location.trim()) {
        throw new Error('Вкажіть місце проведення');
      }
      if (!formData.contact_person.name.trim()) {
        throw new Error('Вкажіть контактну особу');
      }
      if (formData.categories.length === 0) {
        throw new Error('Оберіть хоча б одну категорію');
      }

      const response = await fetch(`/api/competitions/${competitionId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          router.push('/competitions');
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Помилка при збереженні змагання');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Невідома помилка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Базова інформація', icon: Trophy },
    { id: 2, title: 'Організатори', icon: Users },
    { id: 3, title: 'Фінанси', icon: DollarSign },
    { id: 4, title: 'Технічні вимоги', icon: FileText },
    { id: 5, title: 'Логістика', icon: MapPin },
    { id: 6, title: 'Завершення', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/competitions')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Повернутися до змагань
            </Button>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ✏️ Редагування змагання
            </h1>
            <p className="text-gray-600">
              Внесіть зміни до даних змагання "{formData.title}"
            </p>
          </div>

          {/* Статуси */}
          {submitStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200 mb-6">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Зміни успішно збережено! Перенаправлення...
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert className="bg-red-50 border-red-200 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Прогрес */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer ${
                        isActive
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : isCompleted
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Крок 1: Базова інформація */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Базова інформація про змагання
                  </div>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Назва змагання *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Кубок України зі спортивної аеробіки 2025"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Опис змагання</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Детальний опис змагання, його цілей та особливостей..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Дата проведення *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Час початку</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="registration_deadline">Дедлайн реєстрації *</Label>
                  <Input
                    id="registration_deadline"
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Місце проведення</h3>

                  <div>
                    <Label htmlFor="location">Назва місця *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder='Палац спорту "Україна"'
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Повна адреса *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="вул. Велика Васильківська, 55, Київ, 03150"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Місто *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Київ"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Крок 2: Організатори */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Організатори та контактна інформація
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="organizing_club">Організуючий клуб *</Label>
                  <Input
                    id="organizing_club"
                    value={formData.organizing_club}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizing_club: e.target.value }))}
                    placeholder='СК "Грація"'
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Контактна особа</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_name">Ім'я та прізвище *</Label>
                      <Input
                        id="contact_name"
                        value={formData.contact_person.name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contact_person: { ...prev.contact_person, name: e.target.value }
                        }))}
                        placeholder="Іваненко Марія Петрівна"
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
                        placeholder="Директор змагань"
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
                        placeholder="+380 67 123 45 67"
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
                        placeholder="competitions@fusaf.org.ua"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Веб-сайт змагання</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://competition.fusaf.org.ua"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Крок 3: Фінанси */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Фінансові умови
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Вартість участі по програмах</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AEROBIC_PROGRAMS.map((program) => (
                      <div key={program.code}>
                        <Label htmlFor={`fee_${program.code}`}>
                          {program.name} *
                        </Label>
                        <div className="flex">
                          <Input
                            id={`fee_${program.code}`}
                            type="number"
                            min="0"
                            value={formData.program_fees[program.code as keyof typeof formData.program_fees]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              program_fees: {
                                ...prev.program_fees,
                                [program.code]: Number.parseInt(e.target.value) || 0
                              }
                            }))}
                            placeholder={program.defaultFee.toString()}
                          />
                          <span className="ml-2 flex items-center text-gray-600">грн</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Банківські реквізити</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bank_name">Назва банку *</Label>
                      <Input
                        id="bank_name"
                        value={formData.payment_details.bank_name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          payment_details: { ...prev.payment_details, bank_name: e.target.value }
                        }))}
                        placeholder="ПриватБанк"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_holder">Отримувач *</Label>
                      <Input
                        id="account_holder"
                        value={formData.payment_details.account_holder}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          payment_details: { ...prev.payment_details, account_holder: e.target.value }
                        }))}
                        placeholder="СК Грація"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="account_number">Номер рахунку (IBAN) *</Label>
                    <Input
                      id="account_number"
                      value={formData.payment_details.account_number}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        payment_details: { ...prev.payment_details, account_number: e.target.value }
                      }))}
                      placeholder="UA123456789012345678901234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="swift_code">SWIFT код</Label>
                    <Input
                      id="swift_code"
                      value={formData.payment_details.swift_code}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        payment_details: { ...prev.payment_details, swift_code: e.target.value }
                      }))}
                      placeholder="PBANUA2X"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Крок 4: Технічні вимоги */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Технічні вимоги та категорії
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Максимальна кількість учасників по програмах</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="max_iw">Individual Women (IW)</Label>
                      <Input
                        id="max_iw"
                        type="number"
                        min="0"
                        value={formData.max_participants_by_program.iw}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          max_participants_by_program: {
                            ...prev.max_participants_by_program,
                            iw: Number.parseInt(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_im">Individual Men (IM)</Label>
                      <Input
                        id="max_im"
                        type="number"
                        min="0"
                        value={formData.max_participants_by_program.im}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          max_participants_by_program: {
                            ...prev.max_participants_by_program,
                            im: Number.parseInt(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_mp">Mixed Pairs (MP)</Label>
                      <Input
                        id="max_mp"
                        type="number"
                        min="0"
                        value={formData.max_participants_by_program.mp}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          max_participants_by_program: {
                            ...prev.max_participants_by_program,
                            mp: Number.parseInt(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_tr">Trio (TR)</Label>
                      <Input
                        id="max_tr"
                        type="number"
                        min="0"
                        value={formData.max_participants_by_program.tr}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          max_participants_by_program: {
                            ...prev.max_participants_by_program,
                            tr: Number.parseInt(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_gr">Group (GR)</Label>
                      <Input
                        id="max_gr"
                        type="number"
                        min="0"
                        value={formData.max_participants_by_program.gr}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          max_participants_by_program: {
                            ...prev.max_participants_by_program,
                            gr: Number.parseInt(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_ad">Aerobic Dance (AD)</Label>
                      <Input
                        id="max_ad"
                        type="number"
                        min="0"
                        value={formData.max_participants_by_program.ad}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          max_participants_by_program: {
                            ...prev.max_participants_by_program,
                            ad: Number.parseInt(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_as">Aerobic Step (AS)</Label>
                      <Input
                        id="max_as"
                        type="number"
                        min="0"
                        value={formData.max_participants_by_program.as}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          max_participants_by_program: {
                            ...prev.max_participants_by_program,
                            as: Number.parseInt(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Вікові категорії *</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COMPETITION_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category_${category}`}
                          checked={formData.categories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label
                          htmlFor={`category_${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="rules">Правила змагань</Label>
                  <Textarea
                    id="rules"
                    value={formData.rules}
                    onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                    placeholder="Змагання проводяться згідно з правилами FIG та ФУСАФ..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="equipment_requirements">Технічні вимоги до обладнання</Label>
                  <Textarea
                    id="equipment_requirements"
                    value={formData.equipment_requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipment_requirements: e.target.value }))}
                    placeholder="Мінімум 2 килимки одного виробника..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Крок 5: Логістика */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Логістика та розміщення
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Розміщення</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accommodation_available"
                      checked={formData.accommodation.available}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        accommodation: { ...prev.accommodation, available: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="accommodation_available">Доступне розміщення</Label>
                  </div>

                  {formData.accommodation.available && (
                    <div className="space-y-4 pl-6">
                      <div>
                        <Label htmlFor="accommodation_details">Деталі розміщення</Label>
                        <Textarea
                          id="accommodation_details"
                          value={formData.accommodation.details}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            accommodation: { ...prev.accommodation, details: e.target.value }
                          }))}
                          placeholder="Готель Прем'єр Палац, 4 зірки..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="accommodation_cost">Вартість за ніч (грн)</Label>
                        <Input
                          id="accommodation_cost"
                          type="number"
                          min="0"
                          value={formData.accommodation.cost_per_night || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            accommodation: {
                              ...prev.accommodation,
                              cost_per_night: Number.parseInt(e.target.value) || undefined
                            }
                          }))}
                          placeholder="800"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Харчування</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="meals_available"
                      checked={formData.meals.available}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        meals: { ...prev.meals, available: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="meals_available">Доступне харчування</Label>
                  </div>

                  {formData.meals.available && (
                    <div className="space-y-4 pl-6">
                      <div>
                        <Label htmlFor="meals_details">Деталі харчування</Label>
                        <Textarea
                          id="meals_details"
                          value={formData.meals.details}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            meals: { ...prev.meals, details: e.target.value }
                          }))}
                          placeholder="Трьохразове харчування в ресторані готелю..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="meals_cost">Вартість за прийом їжі (грн)</Label>
                        <Input
                          id="meals_cost"
                          type="number"
                          min="0"
                          value={formData.meals.cost_per_meal || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            meals: {
                              ...prev.meals,
                              cost_per_meal: Number.parseInt(e.target.value) || undefined
                            }
                          }))}
                          placeholder="150"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Транспорт</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transportation_available"
                      checked={formData.transportation.available}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        transportation: { ...prev.transportation, available: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="transportation_available">Доступний транспорт</Label>
                  </div>

                  {formData.transportation.available && (
                    <div className="pl-6">
                      <Label htmlFor="transportation_details">Деталі транспорту</Label>
                      <Textarea
                        id="transportation_details"
                        value={formData.transportation.details}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          transportation: { ...prev.transportation, details: e.target.value }
                        }))}
                        placeholder="Трансфер від аеропорту та готелю до місця змагань..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Крок 6: Завершення */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Медичні вимоги та завершення
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="medical_requirements">Медичні вимоги</Label>
                  <Textarea
                    id="medical_requirements"
                    value={formData.medical_requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, medical_requirements: e.target.value }))}
                    placeholder="Обов'язкова медична довідка про стан здоров'я..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insurance_required"
                    checked={formData.insurance_required}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      insurance_required: checked as boolean
                    }))}
                  />
                  <Label htmlFor="insurance_required">Обов'язкове страхування</Label>
                </div>

                <div>
                  <Label htmlFor="notes">Додаткові примітки</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Додаткова інформація для учасників..."
                    rows={4}
                  />
                </div>

                {/* Попередній перегляд */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Попередній перегляд</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Назва:</strong> {formData.title}</p>
                    <p><strong>Дата:</strong> {formData.date}</p>
                    <p><strong>Місце:</strong> {formData.location}</p>
                    <p><strong>Організатор:</strong> {formData.organizing_club}</p>
                    <p><strong>Контакт:</strong> {formData.contact_person.name}</p>
                    <p><strong>Категорії:</strong> {formData.categories.join(', ')}</p>
                    <p><strong>Статус:</strong> {STATUS_OPTIONS.find(opt => opt.value === formData.status)?.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Навігація */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>

            {currentStep < 6 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Далі
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
