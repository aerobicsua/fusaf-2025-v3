"use client";

import { useState, useEffect } from "react";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Users,
  Trophy,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Camera,
  Award,
  Book,
  Target,
  Calendar,
  Star
} from "lucide-react";

interface CoachJudgeProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  address: string;

  // Дані англійською для міжнародних змагань
  firstNameEn: string;
  lastNameEn: string;
  passport: string;

  // Професійна інформація
  specialization: string;
  education: string;
  experience: string;
  workExperience: number; // років
  isCoach: boolean;
  isJudge: boolean;

  // Кваліфікація
  coachCategory: string; // A, B, C
  judgeCategory: string; // 1, 2, 3
  qualificationLevel: string;
  currentEmployment: string;

  // Сертифікати
  certificates: string[];
  licenses: string[];
  courses: string[];
  lastAttestation: string;
  nextAttestation: string;

  // Діяльність
  athletesCount: number;
  competitionsJudged: number;
  achievements: string;
  awards: string[];

  // Файли
  photoUrl: string | null;
  documents: {
    diploma: string | null;
    certificates: string | null;
    licenses: string | null;
  };

  // Метадані
  membershipPaid: boolean;
  membershipExpiryDate: string | null;
  status: string;
  registrationDate: string;
}

export default function CoachJudgeProfilePage() {
  const { user, loading } = useSimpleAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CoachJudgeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CoachJudgeProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  // Завантаження профілю через API
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user && !user.roles?.includes('coach_judge')) {
      // Якщо не тренер/суддя, перенаправляємо на загальний профіль
      router.push('/profile');
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, loading, router]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/coach-judge-profile');

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Профіль тренера/судді не знайдено');
          setProfile(null);
          setIsLoading(false);
          return;
        }
        throw new Error('Помилка завантаження профілю');
      }

      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        setEditForm(data.profile);
      } else {
        console.error('Отримано невалідні дані профілю:', data);
        setProfile(null);
      }

    } catch (error) {
      console.error('❌ Помилка завантаження профілю:', error);
      // Використовуємо мокований профіль для демонстрації
      const mockProfile: CoachJudgeProfile = {
        id: "coach-judge-1705234567890",
        firstName: "Марина",
        lastName: "Коваленко",
        middleName: "Сергіївна",
        fullName: "Коваленко Марина Сергіївна",
        email: user?.email || "marina.kovalenko@example.com",
        phone: "+380671234567",
        region: "Львівська область",
        city: "Львів",
        address: "вул. Спортивна, 25, кв. 12",

        // Дані англійською для міжнародних змагань
        firstNameEn: "Marina",
        lastNameEn: "Kovalenko",
        passport: "FP123456",

        specialization: "Спортивна аеробіка",
        education: "ЛДУФК ім. І. Боберського, тренер з спортивної аеробіки, 2015",
        experience: "8 років досвіду в підготовці спортсменів",
        workExperience: 8,
        isCoach: true,
        isJudge: true,

        coachCategory: "B",
        judgeCategory: "2",
        qualificationLevel: "Тренер-інструктор, суддя 2 категорії",
        currentEmployment: "СК Львів Фітнес",

        certificates: [
          "Сертифікат тренера ФУСАФ 2023",
          "Сертифікат судді 2 категорії 2022",
          "Курс підвищення кваліфікації 2024"
        ],
        licenses: [
          "Ліцензія тренера №12345",
          "Ліцензія судді №67890"
        ],
        courses: [
          "Основи спортивної аеробіки",
          "Суддівство змагань",
          "Психологія спорту"
        ],
        lastAttestation: "2023-06-15",
        nextAttestation: "2026-06-15",

        athletesCount: 25,
        competitionsJudged: 18,
        achievements: "Підготувала 3 чемпіонів України, 8 призерів регіональних змагань",
        awards: [
          "Кращий тренер року 2023",
          "Подяка від ФУСАФ 2022"
        ],

        photoUrl: null,
        documents: {
          diploma: null,
          certificates: null,
          licenses: null
        },

        membershipPaid: true,
        membershipExpiryDate: "2025-12-31",
        status: "active",
        registrationDate: "2024-01-15T10:30:00Z"
      };
      setProfile(mockProfile);
      setEditForm(mockProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const regions = [
    "Київська область", "Львівська область", "Дніпропетровська область",
    "Харківська область", "Одеська область", "м. Київ"
  ];

  const specializations = [
    "Спортивна аеробіка", "Фітнес аеробіка", "Степ аеробіка",
    "Гімнастика", "Танці", "Фізичне виховання", "Інше"
  ];

  const coachCategories = ["C", "B", "A", "Вища категорія"];
  const judgeCategories = ["3", "2", "1", "Національна", "Міжнародна"];

  const handleInputChange = (field: string, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Очищуємо помилку при зміні
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editForm.firstName) newErrors.firstName = "Ім'я обов'язкове";
    if (!editForm.lastName) newErrors.lastName = "Прізвище обов'язкове";
    if (!editForm.email) newErrors.email = "Email обов'язковий";
    if (!editForm.phone) newErrors.phone = "Телефон обов'язковий";
    if (!editForm.specialization) newErrors.specialization = "Спеціалізація обов'язкова";
    if (!editForm.education) newErrors.education = "Освіта обов'язкова";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !profile) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/coach-judge-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachJudgeId: profile.id,
          updates: editForm
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Помилка збереження');
      }

      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        setEditForm(data.profile);
        setIsEditing(false);

        console.log('✅ Профіль оновлено:', data.updatedFields);
        alert(`Профіль успішно оновлено! Оновлені поля: ${data.updatedFields?.join(', ')}`);
      } else {
        throw new Error('Отримано невалідну відповідь від сервера');
      }

    } catch (error) {
      console.error('❌ Помилка збереження:', error);
      alert(`Помилка при збереженні профілю: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile!);
    setErrors({});
    setIsEditing(false);
  };

  const getStatusBadge = (status: string, membershipPaid: boolean) => {
    if (!membershipPaid) {
      return <Badge variant="destructive">Очікує оплати</Badge>;
    }

    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Активний</Badge>;
      case 'pending':
        return <Badge variant="secondary">На розгляді</Badge>;
      default:
        return <Badge variant="outline">Невідомий</Badge>;
    }
  };

  const getRoleBadges = (isCoach: boolean, isJudge: boolean) => {
    const badges = [];
    if (isCoach) badges.push(<Badge key="coach" className="bg-blue-500">Тренер</Badge>);
    if (isJudge) badges.push(<Badge key="judge" className="bg-purple-500">Суддя</Badge>);
    return badges;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Завантаження профілю...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Профіль не знайдено. Зверніться до адміністратора.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Профіль тренера/судді</h1>
            <p className="text-gray-600">Управління професійною кваліфікацією та досвідом</p>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge(profile.status, profile.membershipPaid)}
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              disabled={isSaving}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Скасувати
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Редагувати
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Бічна панель */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={profile.photoUrl || undefined} />
                    <AvatarFallback className="text-lg">
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <h3 className="text-xl font-semibold">{profile.fullName}</h3>
                <p className="text-gray-600">{profile.qualificationLevel}</p>
                <p className="text-sm text-gray-500 mt-2">
                  ID: {profile.id}
                </p>

                <div className="mt-4 flex justify-center space-x-2 flex-wrap">
                  {getRoleBadges(profile.isCoach, profile.isJudge)}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{profile.city}</span>
                  </div>
                </div>

                {profile.membershipPaid && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm text-green-800 font-medium">Членство активне</p>
                    <p className="text-xs text-green-600">
                      до {new Date(profile.membershipExpiryDate!).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Швидка статистика */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Досвід:</span>
                    <span className="font-medium text-blue-600">{profile.workExperience} років</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Спортсмени:</span>
                    <span className="font-medium">{profile.athletesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Змагань:</span>
                    <span className="font-medium">{profile.competitionsJudged}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Нагороди:</span>
                    <span className="font-medium text-yellow-600">{profile.awards.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Наступна атестація */}
            {profile.nextAttestation && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Атестація
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Наступна атестація</p>
                    <p className="font-semibold text-blue-600">
                      {new Date(profile.nextAttestation).toLocaleDateString('uk-UA')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Остання: {new Date(profile.lastAttestation).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Основний контент */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Особисті дані</TabsTrigger>
                <TabsTrigger value="qualification">Кваліфікація</TabsTrigger>
                <TabsTrigger value="certificates">Сертифікати</TabsTrigger>
                <TabsTrigger value="activity">Діяльність</TabsTrigger>
              </TabsList>

              {/* Особисті дані */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Особиста інформація</CardTitle>
                    <CardDescription>
                      Основні дані про тренера/суддю
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="lastName">Прізвище</Label>
                        {isEditing ? (
                          <Input
                            id="lastName"
                            value={editForm.lastName || ''}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className={errors.lastName ? "border-red-500" : ""}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.lastName}</p>
                        )}
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="firstName">Ім'я</Label>
                        {isEditing ? (
                          <Input
                            id="firstName"
                            value={editForm.firstName || ''}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className={errors.firstName ? "border-red-500" : ""}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.firstName}</p>
                        )}
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="middleName">По батькові</Label>
                        {isEditing ? (
                          <Input
                            id="middleName"
                            value={editForm.middleName || ''}
                            onChange={(e) => handleInputChange('middleName', e.target.value)}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.middleName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={errors.email ? "border-red-500" : ""}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.email}</p>
                        )}
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={editForm.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={errors.phone ? "border-red-500" : ""}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.phone}</p>
                        )}
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="region">Область</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.region || ''}
                            onValueChange={(value) => handleInputChange('region', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть область" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map(region => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.region}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="city">Місто</Label>
                        {isEditing ? (
                          <Input
                            id="city"
                            value={editForm.city || ''}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.city}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Адреса</Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={editForm.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{profile.address}</p>
                      )}
                    </div>

                    {/* Дані англійською мовою для міжнародних змагань */}
                    <div className="border-t pt-6">
                      <h4 className="font-semibold mb-4 flex items-center">
                        <span>Дані англійською мовою</span>
                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Для міжнародних змагань
                        </span>
                      </h4>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstNameEn">Ім'я англійською</Label>
                          {isEditing ? (
                            <Input
                              id="firstNameEn"
                              value={editForm.firstNameEn || ''}
                              onChange={(e) => handleInputChange('firstNameEn', e.target.value)}
                              placeholder="Marina"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{profile.firstNameEn || '—'}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="lastNameEn">Прізвище англійською</Label>
                          {isEditing ? (
                            <Input
                              id="lastNameEn"
                              value={editForm.lastNameEn || ''}
                              onChange={(e) => handleInputChange('lastNameEn', e.target.value)}
                              placeholder="Kovalenko"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{profile.lastNameEn || '—'}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label htmlFor="passport">Номер закордонного паспорта</Label>
                        {isEditing ? (
                          <Input
                            id="passport"
                            value={editForm.passport || ''}
                            onChange={(e) => handleInputChange('passport', e.target.value)}
                            placeholder="FP123456"
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.passport || '—'}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-semibold mb-4">Ролі та спеціалізація</h4>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="specialization">Спеціалізація</Label>
                          {isEditing ? (
                            <Select
                              value={editForm.specialization || ''}
                              onValueChange={(value) => handleInputChange('specialization', value)}
                            >
                              <SelectTrigger className={errors.specialization ? "border-red-500" : ""}>
                                <SelectValue placeholder="Оберіть спеціалізацію" />
                              </SelectTrigger>
                              <SelectContent>
                                {specializations.map(spec => (
                                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="p-2 bg-gray-50 rounded font-medium text-blue-600">{profile.specialization}</p>
                          )}
                          {errors.specialization && (
                            <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="currentEmployment">Поточне місце роботи</Label>
                          {isEditing ? (
                            <Input
                              id="currentEmployment"
                              value={editForm.currentEmployment || ''}
                              onChange={(e) => handleInputChange('currentEmployment', e.target.value)}
                              placeholder="Назва клубу або організації"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{profile.currentEmployment}</p>
                          )}
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isCoach"
                              checked={editForm.isCoach || false}
                              onCheckedChange={(checked) => handleInputChange('isCoach', checked as boolean)}
                            />
                            <Label htmlFor="isCoach" className="font-medium">
                              Тренер - підготовка спортсменів
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isJudge"
                              checked={editForm.isJudge || false}
                              onCheckedChange={(checked) => handleInputChange('isJudge', checked as boolean)}
                            />
                            <Label htmlFor="isJudge" className="font-medium">
                              Суддя - суддівство змагань
                            </Label>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Кваліфікація */}
              <TabsContent value="qualification">
                <Card>
                  <CardHeader>
                    <CardTitle>Професійна кваліфікація</CardTitle>
                    <CardDescription>
                      Освіта, категорії та досвід роботи
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="education">Освіта</Label>
                      {isEditing ? (
                        <Textarea
                          id="education"
                          value={editForm.education || ''}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          className={errors.education ? "border-red-500" : ""}
                          rows={3}
                          placeholder="Навчальний заклад, спеціальність, рік закінчення"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded min-h-[80px]">
                          {profile.education}
                        </div>
                      )}
                      {errors.education && (
                        <p className="text-red-500 text-sm mt-1">{errors.education}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="coachCategory">Категорія тренера</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.coachCategory || ''}
                            onValueChange={(value) => handleInputChange('coachCategory', value)}
                            disabled={!editForm.isCoach && !profile.isCoach}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть категорію" />
                            </SelectTrigger>
                            <SelectContent>
                              {coachCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">
                            {profile.isCoach ? profile.coachCategory : '—'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="judgeCategory">Категорія судді</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.judgeCategory || ''}
                            onValueChange={(value) => handleInputChange('judgeCategory', value)}
                            disabled={!editForm.isJudge && !profile.isJudge}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть категорію" />
                            </SelectTrigger>
                            <SelectContent>
                              {judgeCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">
                            {profile.isJudge ? profile.judgeCategory : '—'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="experience">Досвід роботи</Label>
                      {isEditing ? (
                        <Textarea
                          id="experience"
                          value={editForm.experience || ''}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          rows={4}
                          placeholder="Опишіть ваш досвід роботи тренером/суддею"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded min-h-[100px]">
                          {profile.experience}
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lastAttestation">Остання атестація</Label>
                        {isEditing ? (
                          <Input
                            id="lastAttestation"
                            type="date"
                            value={editForm.lastAttestation || ''}
                            onChange={(e) => handleInputChange('lastAttestation', e.target.value)}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">
                            {new Date(profile.lastAttestation).toLocaleDateString('uk-UA')}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="nextAttestation">Наступна атестація</Label>
                        {isEditing ? (
                          <Input
                            id="nextAttestation"
                            type="date"
                            value={editForm.nextAttestation || ''}
                            onChange={(e) => handleInputChange('nextAttestation', e.target.value)}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">
                            {new Date(profile.nextAttestation).toLocaleDateString('uk-UA')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Сертифікати */}
              <TabsContent value="certificates">
                <Card>
                  <CardHeader>
                    <CardTitle>Сертифікати та ліцензії</CardTitle>
                    <CardDescription>
                      Професійні документи та підвищення кваліфікації
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Сертифікати */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        Сертифікати
                      </h4>
                      <div className="space-y-2">
                        {profile.certificates.map((cert, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{cert}</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ліцензії */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Ліцензії
                      </h4>
                      <div className="space-y-2">
                        {profile.licenses.map((license, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{license}</span>
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Курси */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Book className="h-5 w-5 mr-2" />
                        Пройдені курси
                      </h4>
                      <div className="space-y-2">
                        {profile.courses.map((course, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{course}</span>
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Завантаження документів */}
                    <div className="border-t pt-6">
                      <h4 className="font-semibold mb-4">Документи</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h5 className="font-medium">Диплом про освіту</h5>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            {profile.documents.diploma ? (
                              <div className="space-y-2">
                                <GraduationCap className="w-8 h-8 text-blue-500 mx-auto" />
                                <p className="text-sm text-green-600">✓ diploma.pdf</p>
                                <p className="text-xs text-gray-500">Завантажено</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <GraduationCap className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-500">Диплом не завантажений</p>
                              </div>
                            )}
                            {isEditing && (
                              <Button size="sm" className="mt-2">
                                <Upload className="h-4 w-4 mr-2" />
                                Завантажити
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-medium">Сертифікати</h5>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            {profile.documents.certificates ? (
                              <div className="space-y-2">
                                <Award className="w-8 h-8 text-green-500 mx-auto" />
                                <p className="text-sm text-green-600">✓ certificates.pdf</p>
                                <p className="text-xs text-gray-500">Завантажено</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Award className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-500">Сертифікати не завантажені</p>
                              </div>
                            )}
                            {isEditing && (
                              <Button size="sm" className="mt-2">
                                <Upload className="h-4 w-4 mr-2" />
                                Завантажити
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Важливо:</strong> Атестація проводиться кожні 3 роки. Для підтримання
                        категорії необхідно проходити курси підвищення кваліфікації.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Діяльність */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Професійна діяльність</CardTitle>
                    <CardDescription>
                      Робота зі спортсменами, участь у змаганнях та досягнення
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Статистика діяльності */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{profile.athletesCount}</div>
                        <div className="text-sm text-gray-600">Спортсменів</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{profile.competitionsJudged}</div>
                        <div className="text-sm text-gray-600">Змагань</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-yellow-600">{profile.awards.length}</div>
                        <div className="text-sm text-gray-600">Нагород</div>
                      </div>
                    </div>

                    {/* Досягнення */}
                    <div>
                      <Label htmlFor="achievements">Професійні досягнення</Label>
                      {isEditing ? (
                        <Textarea
                          id="achievements"
                          value={editForm.achievements || ''}
                          onChange={(e) => handleInputChange('achievements', e.target.value)}
                          rows={4}
                          placeholder="Опишіть ваші досягнення в роботі зі спортсменами"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded min-h-[100px]">
                          {profile.achievements || <span className="text-gray-500 italic">Досягнення не вказані</span>}
                        </div>
                      )}
                    </div>

                    {/* Нагороди */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Нагороди та відзнаки
                      </h4>
                      <div className="space-y-2">
                        {profile.awards.map((award, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded border border-yellow-200">
                            <span className="font-medium">{award}</span>
                            <Star className="h-5 w-5 text-yellow-500" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Список спортсменів */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Спортсмени під керівництвом
                      </h4>
                      <div className="border rounded-lg p-4">
                        <p className="text-gray-500 text-center py-8">
                          Інтеграція зі списком спортсменів буде реалізована в наступних версіях
                        </p>
                      </div>
                    </div>

                    {/* Результати змагань */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Trophy className="h-5 w-5 mr-2" />
                        Результати змагань
                      </h4>
                      <div className="border rounded-lg p-4">
                        <p className="text-gray-500 text-center py-8">
                          Статистика результатів буде реалізована після додавання системи змагань
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Кнопки збереження */}
            {isEditing && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <div className="flex justify-end space-x-4">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Скасувати
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Збереження...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Зберегти зміни
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
