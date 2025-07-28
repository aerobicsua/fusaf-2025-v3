"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  onSave?: () => void;
}

export function AutoSaveIndicator({ status, lastSaved, onSave }: AutoSaveIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-3 w-3" />,
        text: 'Офлайн',
        variant: 'secondary' as const,
        bgColor: 'bg-gray-100 text-gray-700'
      };
    }

    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Збереження...',
          variant: 'secondary' as const,
          bgColor: 'bg-blue-100 text-blue-700'
        };
      case 'saved':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Збережено',
          variant: 'secondary' as const,
          bgColor: 'bg-green-100 text-green-700'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Помилка',
          variant: 'destructive' as const,
          bgColor: 'bg-red-100 text-red-700'
        };
      default:
        return {
          icon: <Save className="h-3 w-3" />,
          text: 'Не збережено',
          variant: 'outline' as const,
          bgColor: 'bg-yellow-100 text-yellow-700'
        };
    }
  };

  const config = getStatusConfig();

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'щойно';
    if (minutes < 60) return `${minutes} хв тому`;
    if (hours < 24) return `${hours} год тому`;
    return date.toLocaleDateString('uk-UA');
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={config.variant} className={`${config.bgColor} flex items-center space-x-1`}>
        {config.icon}
        <span className="text-xs">{config.text}</span>
      </Badge>

      {lastSaved && status === 'saved' && (
        <span className="text-xs text-gray-500">
          {formatLastSaved(lastSaved)}
        </span>
      )}

      {status === 'error' && onSave && (
        <button
          onClick={onSave}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Спробувати ще раз
        </button>
      )}

      {!isOnline && (
        <span className="text-xs text-gray-500">
          Зміни збережуться коли з'явиться інтернет
        </span>
      )}
    </div>
  );
}

// Хук для автозбереження
export function useAutoSave(
  data: any,
  saveFunction: (data: any) => Promise<boolean>,
  delay: number = 1000
) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const save = async () => {
    setStatus('saving');
    try {
      const success = await saveFunction(data);
      if (success) {
        setStatus('saved');
        setLastSaved(new Date());
        // Через 3 секунди змінюємо статус на idle
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  useEffect(() => {
    // Очищаємо попередній таймер при кожній зміні
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Встановлюємо новий таймер для автозбереження (навіть якщо статус 'saved')
    const newTimeoutId = setTimeout(() => {
      save();
    }, delay);

    setTimeoutId(newTimeoutId);

    return () => {
      if (newTimeoutId) {
        clearTimeout(newTimeoutId);
      }
    };
  }, [data, delay]);

  return {
    status,
    lastSaved,
    manualSave: save
  };
}
