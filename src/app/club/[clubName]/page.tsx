"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building,
  Phone,
  Trophy,
  Users,
  GraduationCap,
  UserPlus,
  Camera,
  Upload,
  Trash2,
  ExternalLink,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Award,
  Star,
  Play,
  Image as ImageIcon,
  Edit,
  Save,
  X
} from 'lucide-react';

interface ClubInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  founded: string;
  ownerId: string;
  ownerName: string;
  membersCount: number;
  achievements: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

interface Coach {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  specialization: string;
  experience: string;
  sportCategory: string;
  profileUrl: string;
  joinedAt: string;
}

interface Athlete {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  sportCategory: string;
  experience: string;
  specialization: string;
  achievements: string;
  coach: string;
  profileUrl: string;
  joinedAt: string;
}

interface MediaFile {
  id: string;
  type: 'photo' | 'video';
  title: string;
  description: string;
  fileName: string;
  fileData: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'training' | 'competition' | 'events' | 'general';
}

export default function ClubPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useSimpleAuth();

  const [club, setClub] = useState<ClubInfo | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('information');

  // Loading states for each tab
  const [coachesLoading, setCoachesLoading] = useState(false);
  const [athletesLoading, setAthletesLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Media upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    type: 'photo' as 'photo' | 'video',
    title: '',
    description: '',
    category: 'general' as 'training' | 'competition' | 'events' | 'general',
    file: null as File | null
  });

  // Club editing state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    achievements: '',
    founded: '', // Дата заснування
    avatar: '' // Аватар клубу
  });
  const [saving, setSaving] = useState(false);

  const clubName = decodeURIComponent(params.clubName as string);
  const isOwner = user?.email === club?.ownerId;

  // Debug access control
  useEffect(() => {
    console.log('🔐 Access Control Debug:', {
      userEmail: user?.email,
      clubOwnerId: club?.ownerId,
      isOwner,
      editMode,
      canAccessMedia: isOwner && editMode
    });
  }, [user, club, isOwner, editMode]);

  useEffect(() => {
    if (!loading) {
      loadClubInfo();

      // Load media immediately if we're on the media tab
      if (activeTab === 'media') {
        loadMedia();
      }
    }
  }, [clubName, loading]);

  // Fill edit form when club data loads
  useEffect(() => {
    if (club) {
      setEditForm({
        name: club.name || '',
        description: club.description || '',
        address: club.address || '',
        phone: club.phone || '',
        email: club.email || '',
        website: club.website || '',
        achievements: club.achievements || '',
        founded: club.founded ? new Date(club.founded).toISOString().split('T')[0] : '', // Format for date input
        avatar: club.avatar || ''
      });
    }
  }, [club]);

  // Close upload dialog when edit mode is disabled
  useEffect(() => {
    if (!editMode) {
      setUploadDialogOpen(false);
    }
  }, [editMode]);

  const loadClubInfo = async () => {
    try {
      setPageLoading(true);
      console.log(`🏢 Завантаження інформації про клуб: ${clubName}`);

      const response = await fetch(`/api/club/info?name=${encodeURIComponent(clubName)}`);
      const result = await response.json();

      if (result.success && result.club) {
        setClub(result.club);
        console.log('✅ Клуб завантажено:', result.club.name);
      } else {
        console.error('❌ Клуб не знайдено:', result.error);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження клубу:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const loadCoaches = async () => {
    if (coachesLoading) return;

    try {
      setCoachesLoading(true);
      console.log(`👨‍🏫 Завантаження тренерів клубу: ${clubName}`);

      const response = await fetch(`/api/club/${encodeURIComponent(clubName)}/coaches`);
      const result = await response.json();

      if (result.success) {
        setCoaches(result.coaches || []);
        console.log(`✅ Завантажено ${result.total} тренерів`);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження тренерів:', error);
    } finally {
      setCoachesLoading(false);
    }
  };

  const loadAthletes = async () => {
    if (athletesLoading) return;

    try {
      setAthletesLoading(true);
      console.log(`🏃‍♂️ Завантаження спортсменів клубу: ${clubName}`);

      const response = await fetch(`/api/club/${encodeURIComponent(clubName)}/athletes`);
      const result = await response.json();

      if (result.success) {
        setAthletes(result.athletes || []);
        console.log(`✅ Завантажено ${result.total} спортсменів`);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження спортсменів:', error);
    } finally {
      setAthletesLoading(false);
    }
  };

  const loadMedia = async () => {
    if (mediaLoading) return;

    try {
      setMediaLoading(true);
      console.log(`📸 Завантаження медіа-галереї клубу: ${clubName}`);

      const response = await fetch(`/api/club/${encodeURIComponent(clubName)}/media`);
      const result = await response.json();

      if (result.success) {
        setMedia(result.media || []);
        console.log(`✅ Завантажено ${result.total} медіа-файлів`);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження медіа:', error);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Progressive loading - load data when tab is opened
    if (value === 'coaches' && coaches.length === 0) {
      loadCoaches();
    } else if (value === 'athletes' && athletes.length === 0) {
      loadAthletes();
    } else if (value === 'media') {
      // Always reload media to ensure fresh data
      loadMedia();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const uploadMedia = async () => {
    if (!uploadForm.file || !user?.email) return;

    try {
      setUploading(true);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        const mediaData = {
          type: uploadForm.type,
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          fileName: uploadForm.file!.name,
          fileData: base64Data
        };

        const response = await fetch(`/api/club/${encodeURIComponent(clubName)}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaData,
            uploaderEmail: user.email
          })
        });

        const result = await response.json();

        if (result.success) {
          console.log('✅ Медіа-файл завантажено');
          setUploadDialogOpen(false);
          setUploadForm({ type: 'photo', title: '', description: '', category: 'general', file: null });
          loadMedia(); // Reload media
        }
      };

      reader.readAsDataURL(uploadForm.file);
    } catch (error) {
      console.error('❌ Помилка завантаження медіа:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (mediaId: string) => {
    if (!user?.email) return;

    try {
      const response = await fetch(
        `/api/club/${encodeURIComponent(clubName)}/media?mediaId=${mediaId}&userEmail=${user.email}`,
        { method: 'DELETE' }
      );

      const result = await response.json();
      if (result.success) {
        console.log('✅ Медіа-файл видалено');
        loadMedia(); // Reload media
      }
    } catch (error) {
      console.error('❌ Помилка видалення медіа:', error);
    }
  };

  // Club editing functions
  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!user?.email || !club) return;

    try {
      setSaving(true);
      console.log('💾 Збереження змін клубу:', editForm);

      const response = await fetch('/api/club/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: club.id,
          updatedBy: user.email,
          clubData: editForm
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Клуб оновлено');
        setEditMode(false);
        loadClubInfo(); // Reload club info
        alert('Інформацію про клуб успішно оновлено!');
      } else {
        alert(`Помилка: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Помилка збереження:', error);
      alert('Помилка при збереженні змін');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    // Reset form to original club data
    if (club) {
      setEditForm({
        name: club.name || '',
        description: club.description || '',
        address: club.address || '',
        phone: club.phone || '',
        email: club.email || '',
        website: club.website || '',
        achievements: club.achievements || '',
        founded: club.founded ? new Date(club.founded).toISOString().split('T')[0] : '',
        avatar: club.avatar || ''
      });
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        handleEditChange('avatar', base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Завантаження інформації про клуб...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Клуб не знайдено</h1>
            <Button onClick={() => router.back()}>
              Повернутися назад
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-white/20">
                <Building className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{club.name}</h1>
                <p className="text-blue-100">
                  {club.ownerName} • Засновано {new Date(club.founded).toLocaleDateString('uk-UA')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{club.membersCount}</div>
                <div className="text-sm text-blue-100">Членів</div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {club.isActive ? "Активний" : "Неактивний"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="information" className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Інформація
            </TabsTrigger>
            <TabsTrigger value="coaches" className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Тренери ({coaches.length})
            </TabsTrigger>
            <TabsTrigger value="athletes" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Спортсмени ({athletes.length})
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Галерея ({media.length})
            </TabsTrigger>
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="information" className="mt-6">
            {/* Edit/Save Controls for Club Owner */}
            {isOwner && (
              <div className="flex justify-end mb-6">
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)} variant="outline">
                    <Building className="h-4 w-4 mr-2" />
                    Редагувати профіль клубу
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? 'Збереження...' : 'Зберегти зміни'}
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline">
                      Скасувати
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Основна інформація
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Club Avatar */}
                  <div>
                    <Label>Аватар клубу</Label>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={editMode ? editForm.avatar : club.avatar} />
                        <AvatarFallback className="text-lg">
                          {club.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {editMode && (
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="w-48"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG до 2MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Назва клубу</Label>
                    {editMode ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => handleEditChange('name', e.target.value)}
                        placeholder="Назва клубу"
                      />
                    ) : (
                      <Input value={club.name} disabled />
                    )}
                  </div>

                  <div>
                    <Label>Дата заснування</Label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {editMode ? (
                        <Input
                          type="date"
                          value={editForm.founded}
                          onChange={(e) => handleEditChange('founded', e.target.value)}
                          className="flex-1"
                        />
                      ) : (
                        <Input
                          value={club.founded ? new Date(club.founded).toLocaleDateString('uk-UA') : 'Не вказано'}
                          disabled
                          className="flex-1"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Опис</Label>
                    {editMode ? (
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => handleEditChange('description', e.target.value)}
                        placeholder="Опис клубу..."
                        rows={3}
                      />
                    ) : (
                      <Textarea value={club.description} disabled rows={3} />
                    )}
                  </div>
                  <div>
                    <Label>Адреса</Label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {editMode ? (
                        <Input
                          value={editForm.address}
                          onChange={(e) => handleEditChange('address', e.target.value)}
                          placeholder="Адреса клубу"
                          className="flex-1"
                        />
                      ) : (
                        <Input value={club.address} disabled className="flex-1" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Контактна інформація
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Телефон</Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {editMode ? (
                        <Input
                          value={editForm.phone}
                          onChange={(e) => handleEditChange('phone', e.target.value)}
                          placeholder="+380XXXXXXXXX"
                          className="flex-1"
                        />
                      ) : (
                        <Input value={club.phone || 'Не вказано'} disabled className="flex-1" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {editMode ? (
                        <Input
                          value={editForm.email}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                          placeholder="email@example.com"
                          type="email"
                          className="flex-1"
                        />
                      ) : (
                        <Input value={club.email} disabled className="flex-1" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Веб-сайт</Label>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      {editMode ? (
                        <Input
                          value={editForm.website}
                          onChange={(e) => handleEditChange('website', e.target.value)}
                          placeholder="https://yourclub.com"
                          type="url"
                          className="flex-1"
                        />
                      ) : club.website ? (
                        <a href={club.website} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:underline flex items-center flex-1">
                          {club.website} <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <Input value="Не вказано" disabled className="flex-1" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Досягнення клубу
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <Textarea
                      value={editForm.achievements}
                      onChange={(e) => handleEditChange('achievements', e.target.value)}
                      placeholder="Опишіть досягнення вашого клубу: нагороди, перемоги в змаганнях, визнання..."
                      rows={5}
                    />
                  ) : (
                    <Textarea
                      value={club.achievements || 'Інформація про досягнення ще не додана'}
                      disabled
                      rows={5}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Coaches Tab */}
          <TabsContent value="coaches" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Тренери клубу</h2>
              <Button onClick={loadCoaches} variant="outline">
                Оновити
              </Button>
            </div>

            {coachesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Завантаження тренерів...</p>
              </div>
            ) : coaches.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Тренери ще не додані</h3>
                <p className="text-gray-600 mb-6">У цьому клубі поки немає зареєстрованих тренерів</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coaches.map((coach) => (
                  <Card key={coach.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-4">
                        <AvatarImage src={coach.avatar} />
                        <AvatarFallback>
                          {coach.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-lg">{coach.name}</CardTitle>
                      {coach.specialization && (
                        <p className="text-sm text-gray-600">{coach.specialization}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {coach.experience && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Досвід: {coach.experience}</span>
                          </div>
                        )}
                        {coach.sportCategory && (
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Категорія: {coach.sportCategory}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Link href={coach.profileUrl} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Профіль
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Athletes Tab */}
          <TabsContent value="athletes" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Спортсмени клубу</h2>
              <Button onClick={loadAthletes} variant="outline">
                Оновити
              </Button>
            </div>

            {athletesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Завантаження спортсменів...</p>
              </div>
            ) : athletes.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Спортсмени ще не додані</h3>
                <p className="text-gray-600 mb-6">У цьому клубі поки немає зареєстрованих спортсменів</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {athletes.map((athlete) => (
                  <Card key={athlete.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-4">
                        <AvatarImage src={athlete.avatar} />
                        <AvatarFallback>
                          {athlete.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-lg">{athlete.name}</CardTitle>
                      {athlete.sportCategory && (
                        <Badge variant="outline">{athlete.sportCategory}</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {athlete.coach && (
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Тренер: {athlete.coach}</span>
                          </div>
                        )}
                        {athlete.achievements && (
                          <div className="flex items-start">
                            <Star className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                            <span className="line-clamp-2">{athlete.achievements}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Link href={athlete.profileUrl} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Профіль
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Media Gallery Tab */}
          <TabsContent value="media" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Медіа-галерея</h2>
              <div className="flex space-x-2">
                <Button onClick={loadMedia} variant="outline">
                  Оновити
                </Button>
                {isOwner && editMode && (
                  <Dialog open={uploadDialogOpen && isOwner && editMode} onOpenChange={(open) => {
                    // Only allow opening if user is owner and in edit mode
                    if (open && (!isOwner || !editMode)) {
                      return;
                    }
                    setUploadDialogOpen(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Додати медіа
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Завантажити медіа-файл</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Тип файлу</Label>
                          <Select value={uploadForm.type} onValueChange={(value: 'photo' | 'video') =>
                            setUploadForm(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="photo">Фото</SelectItem>
                              <SelectItem value="video">Відео</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Заголовок</Label>
                          <Input
                            value={uploadForm.title}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Назва медіа-файлу"
                          />
                        </div>
                        <div>
                          <Label>Опис</Label>
                          <Textarea
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Опис медіа-файлу"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Категорія</Label>
                          <Select value={uploadForm.category} onValueChange={(value: any) =>
                            setUploadForm(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="training">Тренування</SelectItem>
                              <SelectItem value="competition">Змагання</SelectItem>
                              <SelectItem value="events">Події</SelectItem>
                              <SelectItem value="general">Загальне</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Файл</Label>
                          <Input
                            type="file"
                            accept={uploadForm.type === 'photo' ? 'image/*' : 'video/*'}
                            onChange={handleFileUpload}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={uploadMedia}
                            disabled={!uploadForm.file || uploading}
                            className="flex-1"
                          >
                            {uploading ? 'Завантаження...' : 'Завантажити'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setUploadDialogOpen(false)}
                          >
                            Скасувати
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {mediaLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Завантаження медіа-галереї...</p>
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-16">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Медіа-галерея порожня</h3>
                <p className="text-gray-600 mb-6">
                  {isOwner
                    ? editMode
                      ? 'Додайте перші фото або відео вашого клубу'
                      : 'Увімкніть режим редагування для додавання медіа'
                    : 'Власник клубу ще не додав медіа-файли'
                  }
                </p>
                {isOwner && editMode && (
                  <Button onClick={() => {
                    // Double-check access before opening dialog
                    if (isOwner && editMode) {
                      setUploadDialogOpen(true);
                    }
                  }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Додати медіа
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative">
                      {item.type === 'photo' ? (
                        <img
                          src={item.fileData}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center relative">
                          <Play className="h-12 w-12 text-gray-400" />
                          <video
                            src={item.fileData}
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                          />
                        </div>
                      )}
                      {isOwner && editMode && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => deleteMedia(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Badge
                        variant="secondary"
                        className="absolute bottom-2 left-2"
                      >
                        {item.category === 'training' && 'Тренування'}
                        {item.category === 'competition' && 'Змагання'}
                        {item.category === 'events' && 'Події'}
                        {item.category === 'general' && 'Загальне'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">{item.title || item.fileName}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(item.uploadedAt).toLocaleDateString('uk-UA')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
