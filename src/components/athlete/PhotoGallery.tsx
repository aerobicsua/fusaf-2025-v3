"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Video,
  Star,
  Trophy,
  Trash2,
  Edit,
  Eye,
  Plus,
  X
} from 'lucide-react';
import type { MediaItem, Athlete } from '@/lib/athletes-storage';

interface PhotoGalleryProps {
  athlete: Athlete;
  canEdit?: boolean;
  onPhotoUpdate?: () => void;
}

export function PhotoGallery({ athlete, canEdit = false, onPhotoUpdate }: PhotoGalleryProps) {
  const { user } = useSimpleAuth();
  const [media, setMedia] = useState<MediaItem[]>(athlete.media || []);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');

  // Форма для додавання медіа
  const [newMedia, setNewMedia] = useState({
    type: 'photo' as 'photo' | 'video',
    url: '',
    title: '',
    description: '',
    isProfileImage: false,
    competitionId: '',
    tags: ''
  });

  useEffect(() => {
    loadMedia();
  }, [athlete.id]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/athletes/${athlete.id}/photos`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error('Помилка завантаження медіа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async () => {
    if (!newMedia.url || !newMedia.type) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/athletes/${athlete.id}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMedia,
          tags: newMedia.tags ? newMedia.tags.split(',').map(tag => tag.trim()) : []
        }),
      });

      if (response.ok) {
        setNewMedia({
          type: 'photo',
          url: '',
          title: '',
          description: '',
          isProfileImage: false,
          competitionId: '',
          tags: ''
        });
        setShowAddDialog(false);
        await loadMedia();
        onPhotoUpdate?.();
      } else {
        const error = await response.json();
        alert(`Помилка: ${error.error}`);
      }
    } catch (error) {
      console.error('Помилка додавання медіа:', error);
      alert('Помилка додавання медіа');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/athletes/${athlete.id}/photos?mediaId=${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadMedia();
        onPhotoUpdate?.();
      } else {
        const error = await response.json();
        alert(`Помилка: ${error.error}`);
      }
    } catch (error) {
      console.error('Помилка видалення медіа:', error);
      alert('Помилка видалення медіа');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const profileImage = media.find(item => item.isProfileImage);
  const photos = filteredMedia.filter(item => item.type === 'photo');
  const videos = filteredMedia.filter(item => item.type === 'video');

  return (
    <div className="space-y-6">
      {/* Заголовок та статистика */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Медіа галерея</h3>
          <div className="flex space-x-4 text-sm text-gray-600 mt-1">
            <span>📸 {photos.length} фото</span>
            <span>🎥 {videos.length} відео</span>
            <span>📱 Всього: {media.length}</span>
          </div>
        </div>

        {canEdit && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Додати медіа
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Додати нове медіа</DialogTitle>
                <DialogDescription>
                  Додайте фото або відео до профілю спортсмена
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Тип медіа</Label>
                  <select
                    id="type"
                    value={newMedia.type}
                    onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value as 'photo' | 'video' })}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="photo">📸 Фото</option>
                    <option value="video">🎥 Відео</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="url">URL посилання *</Label>
                  <Input
                    id="url"
                    value={newMedia.url}
                    onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">Назва</Label>
                  <Input
                    id="title"
                    value={newMedia.title}
                    onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                    placeholder="Назва фото/відео"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Опис</Label>
                  <Textarea
                    id="description"
                    value={newMedia.description}
                    onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })}
                    placeholder="Опис медіа"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Теги (через кому)</Label>
                  <Input
                    id="tags"
                    value={newMedia.tags}
                    onChange={(e) => setNewMedia({ ...newMedia, tags: e.target.value })}
                    placeholder="змагання, тренування, медаль"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isProfileImage"
                    checked={newMedia.isProfileImage}
                    onChange={(e) => setNewMedia({ ...newMedia, isProfileImage: e.target.checked })}
                  />
                  <Label htmlFor="isProfileImage">Використовувати як фото профілю</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Скасувати
                </Button>
                <Button onClick={handleAddMedia} disabled={loading || !newMedia.url}>
                  {loading ? 'Додавання...' : 'Додати'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Фільтри */}
      <div className="flex space-x-2">
        {[
          { value: 'all', label: 'Всі', icon: ImageIcon },
          { value: 'photo', label: 'Фото', icon: Camera },
          { value: 'video', label: 'Відео', icon: Video }
        ].map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={filter === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(value as any)}
            className="flex items-center space-x-1"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Фото профілю */}
      {profileImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              Фото профілю
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={profileImage.url}
                  alt={profileImage.title || 'Фото профілю'}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <Badge className="absolute -top-2 -right-2 bg-yellow-500">
                  <Star className="h-3 w-3" />
                </Badge>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{profileImage.title || 'Основне фото'}</h4>
                <p className="text-sm text-gray-600">{profileImage.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline">Профіль</Badge>
                  {profileImage.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
              {canEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити фото профілю?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Це фото буде видалено з профілю. Дію неможливо скасувати.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteMedia(profileImage.id)}>
                        Видалити
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Галерея медіа */}
      {filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Немає медіа файлів
            </h3>
            <p className="text-gray-600 mb-4">
              {canEdit ? 'Додайте фото або відео до профілю спортсмена' : 'Медіа файли ще не додані'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                {item.type === 'photo' ? (
                  <img
                    src={item.url}
                    alt={item.title || 'Фото спортсмена'}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => setSelectedMedia(item)}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-900 flex items-center justify-center cursor-pointer"
                       onClick={() => setSelectedMedia(item)}>
                    <Video className="h-12 w-12 text-white" />
                  </div>
                )}

                {item.isProfileImage && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500">
                    <Star className="h-3 w-3" />
                  </Badge>
                )}

                {item.competitionId && (
                  <Badge className="absolute top-2 right-2 bg-blue-500">
                    <Trophy className="h-3 w-3" />
                  </Badge>
                )}

                {canEdit && (
                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedMedia(item)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Видалити медіа?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Цей файл буде видалено з профілю. Дію неможливо скасувати.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Скасувати</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMedia(item.id)}>
                            Видалити
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h4 className="font-medium mb-1">{item.title || `${item.type === 'photo' ? 'Фото' : 'Відео'} спортсмена`}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{item.type === 'photo' ? '📸' : '🎥'}</Badge>
                  {item.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(item.uploadDate).toLocaleDateString('uk-UA')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Діалог перегляду медіа */}
      {selectedMedia && (
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia.title || `${selectedMedia.type === 'photo' ? 'Фото' : 'Відео'} спортсмена`}</DialogTitle>
              <DialogDescription>
                Завантажено {new Date(selectedMedia.uploadDate).toLocaleDateString('uk-UA')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedMedia.type === 'photo' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title || 'Фото спортсмена'}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="w-full bg-gray-900 rounded-lg p-8 text-center">
                  <Video className="h-16 w-16 mx-auto text-white mb-4" />
                  <p className="text-white mb-4">Відео файл</p>
                  <Button
                    onClick={() => window.open(selectedMedia.url, '_blank')}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    Відкрити відео
                  </Button>
                </div>
              )}

              {selectedMedia.description && (
                <p className="text-gray-700">{selectedMedia.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedMedia.isProfileImage && (
                  <Badge className="bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    Фото профілю
                  </Badge>
                )}
                {selectedMedia.competitionId && (
                  <Badge className="bg-blue-500">
                    <Trophy className="h-3 w-3 mr-1" />
                    Змагання
                  </Badge>
                )}
                {selectedMedia.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedMedia(null)}>
                Закрити
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
