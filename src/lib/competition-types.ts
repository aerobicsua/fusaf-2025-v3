// Типи для системи реєстрації на змагання ФУСАФ

export interface Competition {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  club_id: string;
  organizer_name: string;
  organizer_phone: string;
  organizer_email: string;
  registration_fee: number;
  entry_fee: number;
  max_participants: number;
  registration_deadline: string;
  status: CompetitionStatus;
  age_groups: string[];
  categories: string[];
  program_types: string[];
  created_at: string;
  updated_at: string;
}

export type CompetitionStatus =
  | 'draft'
  | 'published'
  | 'registration_open'
  | 'registration_closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// Типи реєстрації
export type RegistrationType = 'preliminary' | 'individual';

export interface PreliminaryRegistration {
  id?: string;
  competition_id: string;
  club_name: string;
  organization_name?: string;
  contact_person: {
    full_name: string;
    phone: string;
    email: string;
    position?: string;
  };
  participants_count: ParticipantsByCategory[];
  total_participants: number;
  estimated_fee: number;
  notes?: string;
  registration_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ParticipantsByCategory {
  age_group: string;
  program_type: string;
  category: string;
  male_count: number;
  female_count: number;
  total_count: number;
  notes?: string;
}

export interface IndividualRegistration {
  id?: string;
  competition_id: string;
  preliminary_registration_id?: string;
  participant: ParticipantInfo;
  program_details: ProgramDetails;
  coach_info?: CoachInfo;
  club_info: ClubInfo;
  medical_clearance: boolean;
  insurance_info?: InsuranceInfo;
  emergency_contact: EmergencyContact;
  registration_fee: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  registration_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ParticipantInfo {
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  age_group: string;
  address: string;
  phone?: string;
  email?: string;
  sport_level: string; // розряд
  license_number?: string;
  photo_url?: string;
}

export interface ProgramDetails {
  program_type: string; // індивідуальна, пара, тріо, група
  category: string; // молодший юнак, старший юнак, дорослі і т.д.
  age_group: string;
  music_duration?: number;
  special_requirements?: string;
  equipment_needed?: string[];
}

export interface CoachInfo {
  full_name: string;
  license_number: string;
  phone: string;
  email: string;
  club_name: string;
}

export interface ClubInfo {
  name: string;
  city: string;
  region: string;
  registration_number?: string;
  contact_person: string;
  phone: string;
  email: string;
}

export interface EmergencyContact {
  full_name: string;
  relationship: string;
  phone: string;
  alternative_phone?: string;
}

export interface InsuranceInfo {
  company_name: string;
  policy_number: string;
  expiry_date: string;
  coverage_amount: number;
}

// Офіційні вікові групи ФУСАФ
export const AGE_GROUPS = [
  { value: 'YOUTH', label: 'YOUTH (12-14 years)', category: 'youth', minAge: 12, maxAge: 14 },
  { value: 'JUNIORS', label: 'JUNIORS (15-17 years)', category: 'juniors', minAge: 15, maxAge: 17 },
  { value: 'SENIORS', label: 'SENIORS (18+)', category: 'seniors', minAge: 18, maxAge: 99 },
  { value: 'ND', label: 'ND (категорії по роках народження)', category: 'nd', minAge: 6, maxAge: 99 }
];

// Офіційні види програм ФУСАФ
export const PROGRAM_TYPES = [
  { value: 'individual_woman', label: 'Individual Woman', description: 'Індивідуальна жіноча програма', participants: 1, gender: 'female' },
  { value: 'individual_men', label: 'Individual Men', description: 'Індивідуальна чоловіча програма', participants: 1, gender: 'male' },
  { value: 'mixed_pair', label: 'Mixed Pair', description: '1 хлопець і 1 дівчина', participants: 2, gender: 'mixed' },
  { value: 'trio', label: 'Trio', description: '3 учасники', participants: 3, gender: 'any' },
  { value: 'group', label: 'Group', description: '5 учасників', participants: 5, gender: 'any' },
  { value: 'aerodance', label: 'AERODANCE', description: '8 учасників', participants: 8, gender: 'any' },
  { value: 'aerostep', label: 'AEROSTEP', description: '8 учасників', participants: 8, gender: 'any' }
];

// Категорії змагань
export const COMPETITION_CATEGORIES = [
  { value: 'beginner', label: 'Початківці', description: 'Для новачків у спорті' },
  { value: 'amateur', label: 'Аматори', description: 'Любительський рівень' },
  { value: 'sport_level', label: 'Спортивні розряди', description: 'III, II, I розряди' },
  { value: 'candidate_master', label: 'КМС', description: 'Кандидати в майстри спорту' },
  { value: 'master_sport', label: 'МС', description: 'Майстри спорту' },
  { value: 'open', label: 'Відкрита', description: 'Всі рівні підготовки' }
];

// Спортивні рівні/розряди
export const SPORT_LEVELS = [
  { value: 'none', label: 'Без розряду' },
  { value: 'youth_3', label: 'III юнацький' },
  { value: 'youth_2', label: 'II юнацький' },
  { value: 'youth_1', label: 'I юнацький' },
  { value: 'adult_3', label: 'III дорослий' },
  { value: 'adult_2', label: 'II дорослий' },
  { value: 'adult_1', label: 'I дорослий' },
  { value: 'cms', label: 'КМС (Кандидат в майстри спорту)' },
  { value: 'ms', label: 'МС (Майстер спорту)' },
  { value: 'msmc', label: 'МСМК (Майстер спорту міжнародного класу)' }
];

// Регіони України
export const UKRAINE_REGIONS = [
  'Вінницька область',
  'Волинська область',
  'Дніпропетровська область',
  'Донецька область',
  'Житомирська область',
  'Закарпатська область',
  'Запорізька область',
  'Івано-Франківська область',
  'Київська область',
  'Кіровоградська область',
  'Луганська область',
  'Львівська область',
  'Миколаївська область',
  'Одеська область',
  'Полтавська область',
  'Рівненська область',
  'Сумська область',
  'Тернопільська область',
  'Харківська область',
  'Херсонська область',
  'Хмельницька область',
  'Черкаська область',
  'Чернівецька область',
  'Чернігівська область',
  'м. Київ',
  'м. Севастополь'
];

// Функції для роботи з реєстраціями
export function calculateRegistrationFee(
  participants: ParticipantsByCategory[],
  baseFee: number,
  entryFee = 0
): number {
  const totalParticipants = participants.reduce((sum, p) => sum + p.total_count, 0);
  return totalParticipants * baseFee + entryFee;
}

export function validatePreliminaryRegistration(registration: Partial<PreliminaryRegistration>): string[] {
  const errors: string[] = [];

  if (!registration.club_name?.trim()) {
    errors.push('Назва клубу/організації є обов\'язковою');
  }

  if (!registration.contact_person?.full_name?.trim()) {
    errors.push('ПІБ контактної особи є обов\'язковим');
  }

  if (!registration.contact_person?.phone?.trim()) {
    errors.push('Телефон контактної особи є обов\'язковим');
  }

  if (!registration.contact_person?.email?.trim()) {
    errors.push('Email контактної особи є обов\'язковим');
  }

  if (!registration.participants_count?.length) {
    errors.push('Необхідно вказати хоча б одну категорію учасників');
  }

  registration.participants_count?.forEach((p, index) => {
    if (p.total_count <= 0) {
      errors.push(`Категорія ${index + 1}: кількість учасників має бути більше 0`);
    }
    if (!p.age_group) {
      errors.push(`Категорія ${index + 1}: необхідно вказати вікову групу`);
    }
    if (!p.program_type) {
      errors.push(`Категорія ${index + 1}: необхідно вказати тип програми`);
    }
  });

  return errors;
}

export function validateIndividualRegistration(registration: Partial<IndividualRegistration>): string[] {
  const errors: string[] = [];

  if (!registration.participant?.full_name?.trim()) {
    errors.push('ПІБ учасника є обов\'язковим');
  }

  if (!registration.participant?.date_of_birth) {
    errors.push('Дата народження є обов\'язковою');
  }

  if (!registration.participant?.gender) {
    errors.push('Стать учасника є обов\'язковою');
  }

  if (!registration.participant?.address?.trim()) {
    errors.push('Адреса учасника є обов\'язковою');
  }

  if (!registration.program_details?.program_type) {
    errors.push('Тип програми є обов\'язковим');
  }

  if (!registration.program_details?.category) {
    errors.push('Категорія є обов\'язковою');
  }

  if (!registration.club_info?.name?.trim()) {
    errors.push('Назва клубу є обов\'язковою');
  }

  if (!registration.emergency_contact?.full_name?.trim()) {
    errors.push('ПІБ особи для екстрених випадків є обов\'язковим');
  }

  if (!registration.emergency_contact?.phone?.trim()) {
    errors.push('Телефон для екстрених випадків є обов\'язковим');
  }

  if (!registration.medical_clearance) {
    errors.push('Медична довідка є обов\'язковою для участі в змаганнях');
  }

  return errors;
}

// Генерація реєстраційного номера
export function generateRegistrationNumber(
  competitionId: string,
  type: RegistrationType,
  index: number
): string {
  const prefix = type === 'preliminary' ? 'PR' : 'IN';
  const compId = competitionId.substring(0, 8).toUpperCase();
  const num = index.toString().padStart(3, '0');
  return `${prefix}-${compId}-${num}`;
}

// Перевірка дедлайну реєстрації
export function isRegistrationOpen(deadline: string): boolean {
  return new Date() < new Date(deadline);
}

// Розрахунок віку на дату змагань
export function calculateAge(birthDate: string, competitionDate: string): number {
  const birth = new Date(birthDate);
  const competition = new Date(competitionDate);
  let age = competition.getFullYear() - birth.getFullYear();

  if (competition < new Date(birth.setFullYear(competition.getFullYear()))) {
    age--;
  }

  return age;
}

// Визначення вікової групи за офіційними категоріями ФУСАФ
export function getAgeGroup(age: number): string {
  if (age >= 12 && age <= 14) return 'YOUTH';
  if (age >= 15 && age <= 17) return 'JUNIORS';
  if (age >= 18) return 'SENIORS';
  if (age >= 6 && age <= 11) return 'ND';
  return 'ND';
}

// Отримання деталей вікової групи
export function getAgeGroupDetails(ageGroup: string) {
  return AGE_GROUPS.find(group => group.value === ageGroup);
}

// Перевірка чи підходить вік для вікової групи
export function isAgeValidForGroup(age: number, ageGroup: string): boolean {
  const group = getAgeGroupDetails(ageGroup);
  if (!group) return false;
  return age >= group.minAge && age <= group.maxAge;
}

export default {
  AGE_GROUPS,
  PROGRAM_TYPES,
  COMPETITION_CATEGORIES,
  SPORT_LEVELS,
  UKRAINE_REGIONS,
  calculateRegistrationFee,
  validatePreliminaryRegistration,
  validateIndividualRegistration,
  generateRegistrationNumber,
  isRegistrationOpen,
  calculateAge,
  getAgeGroup
};
