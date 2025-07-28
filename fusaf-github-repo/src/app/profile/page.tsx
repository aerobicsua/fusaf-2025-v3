"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  Bell,
  Lock,
  Trophy,
  Award,
  Users,
  Settings,
  Camera,
  Star
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  city?: string;
  bio?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  lastActive: string;
}

interface UserStats {
  competitions: number;
  certificates: number;
  clubs: number;
  achievements: string[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      // Mock profile data
      const mockProfile: UserProfile = {
        id: session.user.id || "1",
        name: session.user.name || "Користувач",
        email: session.user.email || "",
        phone: "+38 (050) 123-45-67",
        dateOfBirth: "1990-05-15",
        city: "Київ",
        bio: "Професійний спортсмен з спортивної аеробіки. Багаторічний досвід участі у змаганнях різного рівня.",
        avatar: session.user.image || "",
        role: session.user.role || "athlete",
        createdAt: "2022-01-15",
        lastActive: new Date().toISOString()
      };

      // Mock stats data
      const mockStats: UserStats = {
        competitions: 15,
        certificates: 8,
        clubs: 2,
        achievements: [
          "Чемпіон України 2023",
          "Призер Кубка Європи",
          "Кращий спортсмен року",
          "Майстер спорту"
        ]
      };

      setProfile(mockProfile);
      setStats(mockStats);
      setFormData(mockProfile);
      setLoading(false);
    }
  }, [session, status, router]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    // Симуляція збереження
    setTimeout(() => {
      if (profile) {
        setProfile({ ...profile, ...formData });
      }
      setIsEditing(false);
      setSaving(false);
    }, 1000);
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "athlete": return "Спортсмен";
      case "club_owner": return "Власник клубу";
      case "coach_judge": return "Тренер/Суддя";
      case "admin": return "Адміністратор";
      default: return "Користувач";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "athlete": return "bg-blue-100 text-blue-800";
      case "club_owner": return "bg-green-100 text-green-800";
      case "coach_judge": return "bg-purple-100 text-purple-800";
      case "admin": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto" />
            <p className="mt-4 text-gray-600">Завантаження профілю...</p>
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
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Профіль не знайдено
              </h3>
              <p className="text-gray-600">
                Спробуйте оновити сторінку або увійдіть знову
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок профілю */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-2xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600 mb-2">{profile.email}</p>
                  <div className="flex items-center space-x-3">
                    <Badge className={getRoleColor(profile.role)}>
                      {getRoleLabel(profile.role)}
                    </Badge>
                    <Badge variant="outline">
                      Учасник з {formatDate(profile.createdAt)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Редагувати
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-aerobics-primary"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Збереження...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Зберегти
                        </>
                      )}
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Скасувати
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Змагання</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.competitions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Сертифікати</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.certificates}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Клуби</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.clubs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Досягнення</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.achievements.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Таби з інформацією */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full lg:w-[400px] grid-cols-3">
            <TabsTrigger value="personal">Особисті дані</TabsTrigger>
            <TabsTrigger value="achievements">Досягнення</TabsTrigger>
            <TabsTrigger value="settings">Налаштування</TabsTrigger>
          </TabsList>

          {/* Особисті дані */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Особиста інформація</CardTitle>
                <CardDescription>
                  Ваші основні дані та контактна інформація
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Повне ім'я</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Дата народження</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth || ""}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Місто</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <Select value={formData.role} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="athlete">Спортсмен</SelectItem>
                        <SelectItem value="club_owner">Власник клубу</SelectItem>
                        <SelectItem value="coach_judge">Тренер/Суддя</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Про себе</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={formData.bio || ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Розкажіть про себе, свої досягнення та цілі..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Досягнення */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Досягнення та нагороди</CardTitle>
                <CardDescription>
                  Ваші спортивні досягнення та отримані нагороди
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.achievements && stats.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {stats.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{achievement}</h3>
                          <p className="text-sm text-gray-600">
                            Отримано {formatDate(new Date(2023 - index, 5, 15).toISOString())}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Поки немає досягнень
                    </h3>
                    <p className="text-gray-600">
                      Продовжуйте тренуватися та брати участь у змаганнях!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Налаштування */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Сповіщення */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Сповіщення
                  </CardTitle>
                  <CardDescription>
                    Налаштуйте, які сповіщення ви хочете отримувати
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email сповіщення</h4>
                      <p className="text-sm text-gray-600">Отримувати сповіщення на email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Нові змагання</h4>
                      <p className="text-sm text-gray-600">Повідомлення про нові змагання</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Результати</h4>
                      <p className="text-sm text-gray-600">Сповіщення про результати змагань</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </CardContent>
              </Card>

              {/* Безпека */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Безпека
                  </CardTitle>
                  <CardDescription>
                    Налаштування безпеки вашого аккаунту
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Змінити пароль
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Двофакторна автентифікація
                  </Button>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Останній вхід: {formatDate(profile.lastActive)}
                    </p>
                    <Button variant="destructive" size="sm">
                      Вийти з усіх пристроїв
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
