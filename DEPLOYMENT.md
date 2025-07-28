# 🚀 FUSAF Production Deployment Guide

Цей документ містить повну інструкцію для розгортання системи ФУСАФ в production середовищі.

## 📋 Передумови

### Системні вимоги
- **ОС**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Мінімум 4GB (рекомендовано 8GB+)
- **CPU**: Мінімум 2 cores (рекомендовано 4+)
- **Диск**: Мінімум 50GB SSD
- **Мережа**: Статична IP адреса та домен

### Програмне забезпечення
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Certbot (для SSL сертифікатів)

## 🛠️ Підготовка сервера

### 1. Оновлення системи
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip
```

### 2. Встановлення Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 3. Встановлення Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Налаштування фаєрволу
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📦 Розгортання проекту

### 1. Клонування репозиторію
```bash
git clone https://github.com/your-organization/fusaf-system.git
cd fusaf-system
```

### 2. Налаштування environment змінних
```bash
# Створити файл з production налаштуваннями
cp env.production.example .env.production

# Редагувати файл з вашими даними
nano .env.production
```

#### Обов'язкові змінні для заповнення:
```env
# База даних
MYSQL_ROOT_PASSWORD=ваш_супер_безпечний_пароль
MYSQL_PASSWORD=ваш_пароль_бази_даних

# Безпека
NEXTAUTH_SECRET=ваш_секретний_ключ_32_символи
JWT_SECRET=ваш_jwt_ключ_32_символи

# Email
SMTP_HOST=smtp.вашдомен.com
SMTP_USER=noreply@вашдомен.com
SMTP_PASSWORD=ваш_smtp_пароль

# Домен
DOMAIN_NAME=fusaf.org.ua
ACME_EMAIL=admin@fusaf.org.ua
```

### 3. Налаштування SSL сертифікатів

#### Варіант А: Let's Encrypt (рекомендовано)
```bash
# Встановлення Certbot
sudo apt install certbot

# Отримання сертифіката
sudo certbot certonly --standalone -d fusaf.org.ua -d www.fusaf.org.ua

# Копіювання сертифікатів
sudo cp /etc/letsencrypt/live/fusaf.org.ua/fullchain.pem ./ssl/fusaf.org.ua.crt
sudo cp /etc/letsencrypt/live/fusaf.org.ua/privkey.pem ./ssl/fusaf.org.ua.key
sudo chown $USER:$USER ./ssl/*
```

#### Варіант Б: Власні сертифікати
```bash
# Розмістіть ваші сертифікати в папці ssl/
cp your_certificate.crt ./ssl/fusaf.org.ua.crt
cp your_private_key.key ./ssl/fusaf.org.ua.key
```

### 4. Запуск deployment
```bash
# Надання дозволу на виконання скрипта
chmod +x scripts/deploy.sh

# Запуск deployment
./scripts/deploy.sh
```

## 🔧 Конфігурація та налаштування

### База даних
Система автоматично створить необхідні таблиці при першому запуску. Для ініціалізації з тестовими даними:

```bash
# Вхід в контейнер бази даних
docker exec -it fusaf-db mysql -u root -p

# Створення початкового адміністратора
USE fusaf_production;
INSERT INTO users (id, email, password, roles, status) VALUES
('admin-001', 'admin@fusaf.org.ua', '$2b$12$хешований_пароль', '["admin"]', 'active');
```

### Nginx конфігурація
Основна конфігурація знаходиться в `nginx/conf.d/fusaf.conf`. Для кастомізації:

```bash
# Редагування конфігурації
nano nginx/conf.d/fusaf.conf

# Перезапуск Nginx
docker-compose -f docker-compose.prod.yml restart fusaf-nginx
```

## 📊 Моніторинг та логи

### Перегляд логів
```bash
# Логи всіх сервісів
docker-compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервісу
docker-compose -f docker-compose.prod.yml logs -f fusaf-app
docker-compose -f docker-compose.prod.yml logs -f fusaf-db
```

### Статус сервісів
```bash
# Статус контейнерів
docker-compose -f docker-compose.prod.yml ps

# Системні ресурси
docker stats
```

### Health check
```bash
# Автоматична перевірка здоров'я
docker exec fusaf-app node healthcheck.js

# Ручна перевірка
curl http://localhost:3000/health
```

## 🗄️ Резервне копіювання

### Автоматичне резервне копіювання
Система налаштована на автоматичне створення backup кожен день о 2:00 ранку.

### Ручне створення backup
```bash
# Запуск скрипта backup
docker exec fusaf-backup /backup.sh

# Або виконання вручну
docker exec fusaf-db mysqldump -u root -p fusaf_production > backup_$(date +%Y%m%d).sql
```

### Відновлення з backup
```bash
# Зупинка додатку
docker-compose -f docker-compose.prod.yml stop fusaf-app

# Відновлення бази даних
docker exec -i fusaf-db mysql -u root -p fusaf_production < backup_file.sql

# Запуск додатку
docker-compose -f docker-compose.prod.yml start fusaf-app
```

## 🔒 Безпека

### Фаєрвол
```bash
# Базові правила
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Обмеження доступу до адмінки за IP (опціонально)
sudo ufw allow from YOUR_ADMIN_IP to any port 443
```

### Оновлення системи
```bash
# Регулярне оновлення
sudo apt update && sudo apt upgrade -y

# Оновлення Docker образів
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### SSL налаштування
Сертифікати Let's Encrypt потребують оновлення кожні 90 днів:

```bash
# Додати в crontab
sudo crontab -e

# Додати рядок для автоматичного оновлення
0 3 * * * certbot renew --quiet && docker-compose -f /path/to/project/docker-compose.prod.yml restart fusaf-nginx
```

## 📈 Оптимізація продуктивності

### Налаштування MySQL
У файлі `docker-compose.prod.yml` можна додати додаткові параметри:

```yaml
command: >
  --default-authentication-plugin=mysql_native_password
  --innodb-buffer-pool-size=1G
  --max-connections=200
  --slow-query-log=1
  --long-query-time=2
```

### Nginx кешування
Кешування статичних файлів налаштовано автоматично. Для додаткової оптимізації:

```nginx
# Додати в nginx/conf.d/fusaf.conf
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🆘 Усунення проблем

### Перевірка з'єднання з базою даних
```bash
docker exec fusaf-db mysqladmin ping -h localhost
```

### Перезапуск сервісів
```bash
# Перезапуск всіх сервісів
docker-compose -f docker-compose.prod.yml restart

# Перезапуск конкретного сервісу
docker-compose -f docker-compose.prod.yml restart fusaf-app
```

### Очищення системи
```bash
# Очищення невикористаних образів
docker system prune -f

# Очищення volumes (УВАГА: видалить дані!)
docker volume prune -f
```

### Логи помилок
```bash
# Перегляд помилок додатку
docker-compose -f docker-compose.prod.yml logs fusaf-app | grep ERROR

# Перегляд помилок Nginx
docker-compose -f docker-compose.prod.yml logs fusaf-nginx | grep error
```

## 📞 Підтримка

Для технічної підтримки:
- Email: tech@fusaf.org.ua
- Документація: https://docs.fusaf.org.ua
- Issues: https://github.com/your-org/fusaf-system/issues

## 🎯 Чеклист після deployment

- [ ] ✅ Всі контейнери запущені
- [ ] ✅ Сайт доступний по HTTPS
- [ ] ✅ SSL сертифікат валідний
- [ ] ✅ База даних підключена
- [ ] ✅ Email відправка працює
- [ ] ✅ Backup налаштовано
- [ ] ✅ Моніторинг активний
- [ ] ✅ Логи пишуться
- [ ] ✅ Адмін панель доступна
- [ ] ✅ Health check проходить

🎉 **Вітаємо! FUSAF система успішно розгорнута в production!**
