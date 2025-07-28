"use client";

export const dynamic = 'force-dynamic';

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
import {
  Building,
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
  Calendar,
  Award,
  BarChart3
} from "lucide-react";

interface ClubOwnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  position: string; // посада в клубі
  email: string;
  phone: string;
  region: string;
  city: string;
  address: string;

  // Інформація про клуб
  clubName: string;
  clubAddress: string;
  clubDescription: string;
  clubHistory: string;
  legalStatus: string;
  registrationNumber: string;
  foundingDate: string;
  website: string;

  // Статистика
  membersCount: number;
  coachesCount: number;
  achievementsCount: number;
  yearsActive: number;

  // Файли
  photoUrl: string | null;
  documents: {
    registration: string | null;
    license: string | null;
    insurance: string | null;
  };

  // Метадані
  membershipPaid: boolean;
  membershipExpiryDate: string | null;
  status: string;
  registrationDate: string;
}

export default function ClubOwnerProfilePage() {
  const { user, loading } = useSimpleAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ClubOwnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ClubOwnerProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  // Завантаження профілю через API
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user && !user.roles?.includes('club_owner')) {
      // Якщо не власник клубу, перенаправляємо на загальний профіль
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

      const response = await fetch('/api/club-owner-profile');

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Профіль власника клубу не знайдено');
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
      const mockProfile: ClubOwnerProfile = {
        id: "club-owner-1705234567890",
        firstName: "Олена",
        lastName: "Петренко",
        middleName: "Іванівна",
        fullName: "Петренко Олена Іванівна",
        position: "Директор клубу",
        email: user?.email || "elena.petrenko@example.com",
        phone: "+380671234567",
        region: "Київська область",
        city: "Київ",
        address: "вул. Спортивна, 15, оф. 201",

        clubName: "СК Київ Аеробік",
        clubAddress: "вул. Спортивна, 15, Київ",
        clubDescription: "Професійний клуб спортивної аеробіки з 15-річною історією",
        clubHistory: "Заснований у 2009 році, клуб підготував понад 200 спортсменів",
        legalStatus: "ТОВ",
        registrationNumber: "12345678",
        foundingDate: "2009-03-15",
        website: "https://kyiv-aerobic.com.ua",

        membersCount: 45,
        coachesCount: 8,
        achievementsCount: 23,
        yearsActive: 15,

        photoUrl: null,
        documents: {
          registration: null,
          license: null,
          insurance: null
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

  const legalStatuses = [
    "ТОВ", "ФОП", "Громадська організація", "Благодійна організація", "Інше"
  ];

  const handleInputChange = (field: string, value: string) => {
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
    if (!editForm.clubName) newErrors.clubName = "Назва клубу обов'язкова";
    if (!editForm.clubAddress) newErrors.clubAddress = "Адреса клубу обов'язкова";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !profile) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/club-owner-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubOwnerId: profile.id,
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
            <h1 className="text-3xl font-bold text-gray-900">Профіль власника клубу</h1>
            <p className="text-gray-600">Управління даними клубу та особистою інформацією</p>
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
                <p className="text-gray-600">{profile.position}</p>
                <p className="text-sm text-gray-500 mt-2">
                  ID: {profile.id}
                </p>

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

            {/* Швидка статистика клубу */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Статистика клубу</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Спортсмени:</span>
                    <span className="font-medium text-blue-600">{profile.membersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Тренери:</span>
                    <span className="font-medium">{profile.coachesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Нагороди:</span>
                    <span className="font-medium text-yellow-600">{profile.achievementsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Років діяльності:</span>
                    <span className="font-medium text-green-600">{profile.yearsActive}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Основний контент */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Особисті дані</TabsTrigger>
                <TabsTrigger value="club">Клуб/Підрозділ</TabsTrigger>
                <TabsTrigger value="documents">Документи</TabsTrigger>
                <TabsTrigger value="team">Команда</TabsTrigger>
              </TabsList>

              {/* Особисті дані */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Особиста інформація</CardTitle>
                    <CardDescription>
                      Основні дані про представника клубу
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
                        <Label htmlFor="position">Посада в клубі</Label>
                        {isEditing ? (
                          <Input
                            id="position"
                            value={editForm.position || ''}
                            onChange={(e) => handleInputChange('position', e.target.value)}
                            placeholder="Директор, Засновник, Керівник"
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.position}</p>
                        )}
                      </div>

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
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Інформація про клуб */}
              <TabsContent value="club">
                <Card>
                  <CardHeader>
                    <CardTitle>Інформація про клуб</CardTitle>
                    <CardDescription>
                      Детальна інформація про спортивний клуб
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clubName">Назва клубу</Label>
                        {isEditing ? (
                          <Input
                            id="clubName"
                            value={editForm.clubName || ''}
                            onChange={(e) => handleInputChange('clubName', e.target.value)}
                            className={errors.clubName ? "border-red-500" : ""}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded font-medium text-blue-600">
                            {profile.clubName}
                          </p>
                        )}
                        {errors.clubName && (
                          <p className="text-red-500 text-sm mt-1">{errors.clubName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="legalStatus">Правовий статус</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.legalStatus || ''}
                            onValueChange={(value) => handleInputChange('legalStatus', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть статус" />
                            </SelectTrigger>
                            <SelectContent>
                              {legalStatuses.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.legalStatus}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clubAddress">Адреса клубу</Label>
                      {isEditing ? (
                        <Input
                          id="clubAddress"
                          value={editForm.clubAddress || ''}
                          onChange={(e) => handleInputChange('clubAddress', e.target.value)}
                          className={errors.clubAddress ? "border-red-500" : ""}
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{profile.clubAddress}</p>
                      )}
                      {errors.clubAddress && (
                        <p className="text-red-500 text-sm mt-1">{errors.clubAddress}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="registrationNumber">Номер реєстрації</Label>
                        {isEditing ? (
                          <Input
                            id="registrationNumber"
                            value={editForm.registrationNumber || ''}
                            onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{profile.registrationNumber}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="foundingDate">Дата заснування</Label>
                        {isEditing ? (
                          <Input
                            id="foundingDate"
                            type="date"
                            value={editForm.foundingDate || ''}
                            onChange={(e) => handleInputChange('foundingDate', e.target.value)}
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">
                            {new Date(profile.foundingDate).toLocaleDateString('uk-UA')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="website">Веб-сайт</Label>
                      {isEditing ? (
                        <Input
                          id="website"
                          type="url"
                          value={editForm.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://example.com"
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">
                          {profile.website ? (
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.website}
                            </a>
                          ) : (
                            '—'
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="clubDescription">Опис клубу</Label>
                      {isEditing ? (
                        <Textarea
                          id="clubDescription"
                          value={editForm.clubDescription || ''}
                          onChange={(e) => handleInputChange('clubDescription', e.target.value)}
                          rows={3}
                          placeholder="Коротко опишіть діяльність клубу"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded min-h-[80px]">
                          {profile.clubDescription || <span className="text-gray-500 italic">Опис не вказаний</span>}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="clubHistory">Історія та досягнення</Label>
                      {isEditing ? (
                        <Textarea
                          id="clubHistory"
                          value={editForm.clubHistory || ''}
                          onChange={(e) => handleInputChange('clubHistory', e.target.value)}
                          rows={4}
                          placeholder="Розкажіть про історію клубу та основні досягнення"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded min-h-[100px]">
                          {profile.clubHistory || <span className="text-gray-500 italic">Історія не вказана</span>}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Документи */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Документи клубу</CardTitle>
                    <CardDescription>
                      Офіційні документи та ліцензії клубу
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Реєстраційні документи</h4>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {profile.documents.registration ? (
                            <div className="space-y-2">
                              <FileText className="w-8 h-8 text-blue-500 mx-auto" />
                              <p className="text-sm text-green-600">✓ registration_docs.pdf</p>
                              <p className="text-xs text-gray-500">Завантажено</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                              <p className="text-sm text-gray-500">Документи не завантажені</p>
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
                        <h4 className="font-medium">Ліцензія на діяльність</h4>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {profile.documents.license ? (
                            <div className="space-y-2">
                              <Award className="w-8 h-8 text-green-500 mx-auto" />
                              <p className="text-sm text-green-600">✓ sport_license.pdf</p>
                              <p className="text-xs text-gray-500">Завантажено</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Award className="w-8 h-8 text-gray-400 mx-auto" />
                              <p className="text-sm text-gray-500">Ліцензія не завантажена</p>
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

                      <div className="space-y-3 md:col-span-2">
                        <h4 className="font-medium">Страхові документи</h4>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {profile.documents.insurance ? (
                            <div className="space-y-2">
                              <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                              <p className="text-sm text-green-600">✓ insurance_policy.pdf</p>
                              <p className="text-xs text-gray-500">Завантажено</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <CheckCircle className="w-8 h-8 text-gray-400 mx-auto" />
                              <p className="text-sm text-gray-500">Страхові документи не завантажені</p>
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

                    <Alert className="bg-blue-50 border-blue-200">
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Важливо:</strong> Усі документи повинні бути чинними та оновлюватися відповідно до
                        вимог законодавства. Для участі у змаганнях ФУСАФ необхідні всі документи.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Команда */}
              <TabsContent value="team">
                <Card>
                  <CardHeader>
                    <CardTitle>Команда клубу</CardTitle>
                    <CardDescription>
                      Список спортсменів, тренерів та статистика
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Статистика команди */}
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{profile.membersCount}</div>
                        <div className="text-sm text-gray-600">Спортсменів</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{profile.coachesCount}</div>
                        <div className="text-sm text-gray-600">Тренерів</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-yellow-600">{profile.achievementsCount}</div>
                        <div className="text-sm text-gray-600">Нагород</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{profile.yearsActive}</div>
                        <div className="text-sm text-gray-600">Років</div>
                      </div>
                    </div>

                    {/* Список спортсменів */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Спортсмени клубу
                      </h4>
                      <div className="border rounded-lg p-4">
                        <p className="text-gray-500 text-center py-8">
                          Інтеграція зі списком спортсменів буде реалізована в наступних версіях
                        </p>
                      </div>
                    </div>

                    {/* Список тренерів */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Trophy className="h-5 w-5 mr-2" />
                        Тренерський склад
                      </h4>
                      <div className="border rounded-lg p-4">
                        <p className="text-gray-500 text-center py-8">
                          Інтеграція зі списком тренерів буде реалізована в наступних версіях
                        </p>
                      </div>
                    </div>

                    {/* Результати змагань */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
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
