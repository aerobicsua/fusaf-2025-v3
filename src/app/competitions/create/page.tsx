"use client";

import { useState } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { useRouter } from 'next/navigation';
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
  Trophy,
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Clock,
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

// Інтерфейс форми змагання
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
  // Документи
  documents: {
    regulation: File | null;
    invitation: File | null;
    additional_docs: File[];
  };
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

export default function CreateCompetitionPage() {
  const { user } = useSimpleAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<CompetitionForm>({
    title: '',
    description: '',
    date: '',
    time: '10:00',
    registration_deadline: '',
    location: '',
    address: '',
    city: '',
    organizing_club: '',
    contact_person: {
      name: '',
      position: 'Директор змагань',
      phone: '',
      email: ''
    },
    program_fees: {
      iw_im: 500,
      mp: 600,
      tr: 800,
      gr: 1000,
      ad: 1200,
      as: 1200
    },
    payment_details: {
      bank_name: '',
      account_number: '',
      account_holder: '',
      swift_code: ''
    },
    max_participants_by_program: {
      iw: 3,
      im: 3,
      mp: 2,
      tr: 2,
      gr: 1,
      ad: 1,
      as: 1
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
    medical_requirements: 'Обов\'язкова медична довідка про допуск до занять спортом',
    insurance_required: true,
    notes: '',
    website: '',
    documents: {
      regulation: null,
      invitation: null,
      additional_docs: []
    }
  });

  // Перевірка доступу
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
            <p className="text-gray-600 mb-4">Увійдіть для створення змагань</p>
            <Button onClick={() => router.push('/')}>
              Повернутися на головну
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canCreateCompetition = user?.roles?.some(role =>
    ['admin', 'club_owner'].includes(role)
  );

  if (!canCreateCompetition) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Недостатньо прав</h1>
            <p className="text-gray-600 mb-4">
              Створювати змагання можуть тільки власники клубів та адміністратори
            </p>
            <Button onClick={() => router.push('/competitions')}>
              Переглянути змагання
            </Button>
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

  const applyRecommendedFees = () => {
    setFormData(prev => ({
      ...prev,
      program_fees: {
        iw_im: 500,
        mp: 600,
        tr: 800,
        gr: 1000,
        ad: 1200,
        as: 1200
      }
    }));
  };

  const applyRecommendedMaxParticipants = () => {
    setFormData(prev => ({
      ...prev,
      max_participants_by_program: { ...DEFAULT_MAX_PARTICIPANTS }
    }));
  };

  // Валідація для кожного кроку
  const validateStep = (step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
      case 1: // Базова інформація
        if (!formData.title.trim()) errors.push('Назва змагання обов\'язкова');
        if (!formData.date) errors.push('Дата проведення обов\'язкова');
        if (!formData.location.trim()) errors.push('Місце проведення обов\'язкове');
        if (!formData.address.trim()) errors.push('Адреса обов\'язкова');
        if (!formData.city.trim()) errors.push('Місто обов\'язкове');
        if (!formData.registration_deadline) errors.push('Дедлайн реєстрації обов\'язковий');
        // Перевірка що дедлайн реєстрації раніше дати змагання
        if (formData.date && formData.registration_deadline && formData.registration_deadline >= formData.date) {
          errors.push('Дедлайн реєстрації повинен бути раніше дати змагання');
        }
        break;

      case 2: // Організатори
        if (!formData.organizing_club.trim()) errors.push('Організуючий клуб обов\'язковий');
        if (!formData.contact_person.name.trim()) errors.push('Ім\'я контактної особи обов\'язкове');
        if (!formData.contact_person.phone.trim()) errors.push('Телефон контактної особи обов\'язковий');
        if (!formData.contact_person.email.trim()) errors.push('Email контактної особи обов\'язковий');
        // Валідація email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.contact_person.email && !emailPattern.test(formData.contact_person.email)) {
          errors.push('Невірний формат email');
        }
        break;

      case 3: // Фінанси
        if (!formData.payment_details.account_holder.trim()) errors.push('Отримувач платежу обов\'язковий');
        if (!formData.payment_details.account_number.trim()) errors.push('Номер рахунку обов\'язковий');
        // Перевірка що хоча б одна вартість програми вказана
        const hasAnyFee = Object.values(formData.program_fees).some(fee => fee > 0);
        if (!hasAnyFee) errors.push('Вкажіть вартість хоча б для однієї програми');
        break;

      case 4: // Технічні вимоги
        if (formData.categories.length === 0) errors.push('Оберіть хоча б одну категорію');
        // Перевірка що хоча б один максимум учасників вказано
        const hasAnyMaxParticipants = Object.values(formData.max_participants_by_program).some(max => max > 0);
        if (!hasAnyMaxParticipants) errors.push('Вкажіть максимум учасників хоча б для однієї програми');
        break;

      case 5: // Логістика
        // Тут можна додати валідацію для логістичних полів за потреби
        break;

      case 6: // Завершення
        // Фінальна валідація перед відправкою
        const step1Validation = validateStep(1);
        const step2Validation = validateStep(2);
        const step3Validation = validateStep(3);
        const step4Validation = validateStep(4);

        errors.push(...step1Validation.errors);
        errors.push(...step2Validation.errors);
        errors.push(...step3Validation.errors);
        errors.push(...step4Validation.errors);
        break;
    }

    return { isValid: errors.length === 0, errors };
  };

  // Функція для переходу до наступного кроку з валідацією
  const handleNextStep = () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      setErrorMessage(validation.errors.join(', '));
      return;
    }
    setErrorMessage('');
    setCurrentStep(Math.min(6, currentStep + 1));
  };

  // Функція для швидкого заповнення демо-даними
  const fillDemoData = () => {
    setFormData({
      ...formData,
      title: 'Демо-змагання зі спортивної аеробіки',
      description: 'Демонстраційне змагання для тестування системи',
      date: '2025-06-15',
      time: '10:00',
      registration_deadline: '2025-05-15',
      location: 'Палац спорту "Україна"',
      address: 'вул. Велика Васильківська, 55, Київ, 03150',
      city: 'Київ',
      organizing_club: 'СК "Демо"',
      contact_person: {
        name: 'Демо Контакт',
        position: 'Директор змагань',
        phone: '+380 67 123 45 67',
        email: 'demo@fusaf.org.ua'
      },
      payment_details: {
        bank_name: 'ПриватБанк',
        account_number: 'UA123456789012345678901234567',
        account_holder: 'СК "Демо"',
        swift_code: 'PBANUA2X'
      },
      categories: ['YOUTH / 12-14 YEARS', 'JUNIORS / 15-17 YEARS'],
      rules: 'Змагання проводяться згідно з правилами FIG та ФУСАФ',
      equipment_requirements: 'Професійні килимки для аеробіки'
    });
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

      // Перевіряємо чи є файли для завантаження
      const hasFiles = formData.documents.regulation ||
                      formData.documents.invitation ||
                      (formData.documents.additional_docs && formData.documents.additional_docs.length > 0);

      let response;

      if (hasFiles) {
        // Відправляємо через FormData для підтримки файлів
        const formDataToSend = new FormData();

        // Додаємо JSON дані змагання (без файлів)
        const competitionDataWithoutFiles = {
          ...formData,
          documents: undefined // Видаляємо документи з JSON частини
        };
        formDataToSend.append('competitionData', JSON.stringify(competitionDataWithoutFiles));

        // Додаємо файли
        if (formData.documents.regulation) {
          formDataToSend.append('regulation', formData.documents.regulation);
        }
        if (formData.documents.invitation) {
          formDataToSend.append('invitation', formData.documents.invitation);
        }
        if (formData.documents.additional_docs) {
          formData.documents.additional_docs.forEach((file) => {
            formDataToSend.append('additional_docs', file);
          });
        }

        response = await fetch('/api/competitions/create', {
          method: 'POST',
          body: formDataToSend,
        });
      } else {
        // Відправляємо звичайний JSON без файлів
        response = await fetch('/api/competitions/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            documents: undefined // Видаляємо пусті документи
          }),
        });
      }

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');

        // Показуємо інформацію про завантажені файли
        if (result.documents) {
          console.log('📁 Завантажені документи:', result.documents);
        }

        setTimeout(() => {
          router.push('/competitions');
        }, 3000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Помилка при створенні змагання');
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
              🏆 Створення нового змагання
            </h1>
            <p className="text-gray-600">
              Заповніть всю необхідну інформацію для організації змагання з спортивної аеробіки
            </p>
          </div>

          {/* Статуси */}
          {submitStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200 mb-6">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Змагання успішно створено! Перенаправлення...
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
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Базова інформація про змагання
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
                  Організатори змагання
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
                      <Label htmlFor="contact_name">Повне ім'я *</Label>
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Вартість участі по програмах</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyRecommendedFees}
                      size="sm"
                    >
                      Застосувати рекомендовані
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Встановіть вартість участі для кожної програми спортивної аеробіки
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AEROBIC_PROGRAMS.map((program) => (
                      <div key={program.code}>
                        <Label htmlFor={`fee_${program.code}`}>
                          {program.name}
                        </Label>
                        <div className="relative">
                          <Input
                            id={`fee_${program.code}`}
                            type="number"
                            min="0"
                            value={formData.program_fees[program.code as keyof typeof formData.program_fees]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              program_fees: {
                                ...prev.program_fees,
                                [program.code]: Number(e.target.value)
                              }
                            }))}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            грн
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Банківські реквізити</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bank_name">Назва банку</Label>
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
                      <Label htmlFor="swift_code">SWIFT код</Label>
                      <Input
                        id="swift_code"
                        value={formData.payment_details.swift_code || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          payment_details: { ...prev.payment_details, swift_code: e.target.value }
                        }))}
                        placeholder="PBANUA2X"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="account_number">Номер рахунку (IBAN)</Label>
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
                    <Label htmlFor="account_holder">Отримувач платежу</Label>
                    <Input
                      id="account_holder"
                      value={formData.payment_details.account_holder}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        payment_details: { ...prev.payment_details, account_holder: e.target.value }
                      }))}
                      placeholder="Спортивний клуб Грація"
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Максимум учасників по програмах</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyRecommendedMaxParticipants}
                      size="sm"
                    >
                      Застосувати рекомендовані
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Встановіть максимальну кількість учасників для кожної програми
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(DEFAULT_MAX_PARTICIPANTS).map(([code, defaultValue]) => {
                      const labels = {
                        iw: 'Individual Women (IW)',
                        im: 'Individual Men (IM)',
                        mp: 'Mixed Pairs (MP)',
                        tr: 'Trio (TR)',
                        gr: 'Group (GR)',
                        ad: 'Aerobic Dance (AD)',
                        as: 'Aerobic Step (AS)'
                      };

                      return (
                        <div key={code}>
                          <Label htmlFor={`max_${code}`} className="text-xs">
                            {labels[code as keyof typeof labels]}
                          </Label>
                          <Input
                            id={`max_${code}`}
                            type="number"
                            min="0"
                            max="10"
                            value={formData.max_participants_by_program[code as keyof typeof formData.max_participants_by_program]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              max_participants_by_program: {
                                ...prev.max_participants_by_program,
                                [code]: Number(e.target.value)
                              }
                            }))}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Категорії змагань *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {COMPETITION_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category_${category}`}
                          checked={formData.categories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label htmlFor={`category_${category}`} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="rules">Правила та положення</Label>
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
                    placeholder="Мінімум 2 килимки одного виробника, звукова система..."
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
                  Логістика та додаткові послуги
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🏨 Розміщення</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accommodation_available"
                      checked={formData.accommodation.available}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        accommodation: { ...prev.accommodation, available: !!checked }
                      }))}
                    />
                    <Label htmlFor="accommodation_available">Організоване розміщення доступне</Label>
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
                          placeholder="Готель, адреса, умови..."
                          rows={2}
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
                            accommodation: { ...prev.accommodation, cost_per_night: Number(e.target.value) }
                          }))}
                          placeholder="800"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🍽️ Харчування</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="meals_available"
                      checked={formData.meals.available}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        meals: { ...prev.meals, available: !!checked }
                      }))}
                    />
                    <Label htmlFor="meals_available">Організоване харчування доступне</Label>
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
                          placeholder="Трьохразове харчування, меню..."
                          rows={2}
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
                            meals: { ...prev.meals, cost_per_meal: Number(e.target.value) }
                          }))}
                          placeholder="150"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🚌 Транспорт</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transportation_available"
                      checked={formData.transportation.available}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        transportation: { ...prev.transportation, available: !!checked }
                      }))}
                    />
                    <Label htmlFor="transportation_available">Організований транспорт доступний</Label>
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
                        placeholder="Трансфер від аеропорту, маршрути..."
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="medical_requirements">Медичні вимоги</Label>
                  <Textarea
                    id="medical_requirements"
                    value={formData.medical_requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, medical_requirements: e.target.value }))}
                    placeholder="Медична довідка, страхування..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insurance_required"
                    checked={formData.insurance_required}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, insurance_required: !!checked }))}
                  />
                  <Label htmlFor="insurance_required">Обов'язкове страхування</Label>
                </div>

                <div>
                  <Label htmlFor="website">Офіційний сайт змагання</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://competition.fusaf.org.ua"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Крок 6: Завершення та документи */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Завершення та документи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="notes">Додаткові примітки</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Додаткова інформація для учасників, особливі вимоги, нагороди..."
                    rows={4}
                  />
                </div>

                {/* Завантаження документів */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📄 Документи змагання</h3>
                  <p className="text-sm text-gray-600">
                    Завантажте необхідні документи у форматі PDF (максимум 10 МБ кожен)
                  </p>

                  {/* Регламент */}
                  <div className="space-y-2">
                    <Label htmlFor="regulation">Регламент змагань (PDF)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        id="regulation"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              alert('Файл занадто великий. Максимальний розмір: 10 МБ');
                              return;
                            }
                            setFormData(prev => ({
                              ...prev,
                              documents: { ...prev.documents, regulation: file }
                            }));
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="regulation" className="cursor-pointer">
                        {formData.documents.regulation ? (
                          <div className="flex items-center justify-center space-x-2 text-green-600">
                            <FileText className="h-5 w-5" />
                            <span>{formData.documents.regulation.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                setFormData(prev => ({
                                  ...prev,
                                  documents: { ...prev.documents, regulation: null }
                                }));
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2 text-gray-500">
                            <Plus className="h-5 w-5" />
                            <span>Натисніть для вибору файлу регламенту</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Запрошення */}
                  <div className="space-y-2">
                    <Label htmlFor="invitation">Запрошення на змагання (PDF)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        id="invitation"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              alert('Файл занадто великий. Максимальний розмір: 10 МБ');
                              return;
                            }
                            setFormData(prev => ({
                              ...prev,
                              documents: { ...prev.documents, invitation: file }
                            }));
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="invitation" className="cursor-pointer">
                        {formData.documents.invitation ? (
                          <div className="flex items-center justify-center space-x-2 text-green-600">
                            <FileText className="h-5 w-5" />
                            <span>{formData.documents.invitation.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                setFormData(prev => ({
                                  ...prev,
                                  documents: { ...prev.documents, invitation: null }
                                }));
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2 text-gray-500">
                            <Plus className="h-5 w-5" />
                            <span>Натисніть для вибору файлу запрошення</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Додаткові документи */}
                  <div className="space-y-2">
                    <Label>Додаткові документи (PDF)</Label>
                    <div className="space-y-2">
                      {formData.documents.additional_docs?.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                documents: {
                                  ...prev.documents,
                                  additional_docs: prev.documents.additional_docs?.filter((_, i) => i !== index) || []
                                }
                              }));
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <input
                          id="additional_docs"
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                alert('Файл занадто великий. Максимальний розмір: 10 МБ');
                                return;
                              }
                              setFormData(prev => ({
                                ...prev,
                                documents: {
                                  ...prev.documents,
                                  additional_docs: [...(prev.documents.additional_docs || []), file]
                                }
                              }));
                            }
                          }}
                          className="hidden"
                        />
                        <label htmlFor="additional_docs" className="cursor-pointer">
                          <div className="flex items-center justify-center space-x-2 text-gray-500">
                            <Plus className="h-5 w-5" />
                            <span>Додати ще один документ</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Підсумок */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Підсумок змагання</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Назва:</strong> {formData.title || 'Не вказано'}
                    </div>
                    <div>
                      <strong>Дата:</strong> {formData.date ? new Date(formData.date).toLocaleDateString('uk-UA') : 'Не вказано'}
                    </div>
                    <div>
                      <strong>Місце:</strong> {formData.location || 'Не вказано'}
                    </div>
                    <div>
                      <strong>Організатор:</strong> {formData.organizing_club || 'Не вказано'}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Вартість по програмах:</strong>
                      <div className="mt-1 text-xs">
                        IW/IM: {formData.program_fees.iw_im} грн,
                        MP: {formData.program_fees.mp} грн,
                        TR: {formData.program_fees.tr} грн,
                        GR: {formData.program_fees.gr} грн,
                        AD: {formData.program_fees.ad} грн,
                        AS: {formData.program_fees.as} грн
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <strong>Максимум учасників по програмах:</strong>
                      <div className="mt-1 text-xs">
                        IW: {formData.max_participants_by_program.iw},
                        IM: {formData.max_participants_by_program.im},
                        MP: {formData.max_participants_by_program.mp},
                        TR: {formData.max_participants_by_program.tr},
                        GR: {formData.max_participants_by_program.gr},
                        AD: {formData.max_participants_by_program.ad},
                        AS: {formData.max_participants_by_program.as}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <strong>Категорії:</strong> {formData.categories.length > 0 ? formData.categories.join(', ') : 'Не обрано'}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Документи:</strong>
                      <div className="mt-1 text-xs">
                        {formData.documents.regulation && '✅ Регламент '}
                        {formData.documents.invitation && '✅ Запрошення '}
                        {formData.documents.additional_docs && formData.documents.additional_docs.length > 0 && `✅ Додаткових: ${formData.documents.additional_docs.length}`}
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Перевірте всі дані перед створенням змагання. Після створення деякі дані можна буде змінити тільки через адміністратора.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Навігація */}
          <div className="flex justify-between items-center mt-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setErrorMessage('');
                  setCurrentStep(Math.max(1, currentStep - 1));
                }}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>

              {/* Кнопка швидкого заповнення */}
              {currentStep === 1 && (
                <Button
                  variant="outline"
                  onClick={fillDemoData}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Демо-дані
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Індикатор прогресу */}
              <div className="text-sm text-gray-500">
                Крок {currentStep} з {steps.length}
              </div>

              {currentStep < 6 ? (
                <Button
                  onClick={handleNextStep}
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
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Створення...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Створити змагання
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
