#!/bin/bash

# FUSAF Production Deployment Script
# This script automates the deployment process for FUSAF system

set -e  # Exit on any error

echo "🚀 Starting FUSAF Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="fusaf"
DOMAIN="fusaf.org.ua"
BACKUP_DIR="./database/backups"
LOG_FILE="deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi

    # Check if .env.production exists
    if [[ ! -f .env.production ]]; then
        warning ".env.production file not found."
        echo "Please create .env.production file with your production configuration."
        echo "You can use env.production.example as a template."
        exit 1
    fi

    success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."

    mkdir -p database/backups
    mkdir -p logs
    mkdir -p ssl
    mkdir -p nginx/conf.d
    mkdir -p uploads

    success "Directories created"
}

# Generate SSL certificates (Let's Encrypt)
setup_ssl() {
    log "Setting up SSL certificates..."

    if [[ ! -f ssl/fusaf.org.ua.crt ]]; then
        warning "SSL certificates not found. Please set up SSL certificates manually or use Let's Encrypt."
        echo "For Let's Encrypt, run: certbot certonly --webroot -w /var/www/certbot -d $DOMAIN"
    else
        success "SSL certificates found"
    fi
}

# Backup existing database (if any)
backup_database() {
    log "Creating database backup..."

    if docker ps | grep -q fusaf-db; then
        BACKUP_FILE="$BACKUP_DIR/fusaf_backup_$(date +%Y%m%d_%H%M%S).sql"

        docker exec fusaf-db mysqldump -u root -p\$MYSQL_ROOT_PASSWORD fusaf_production > $BACKUP_FILE

        if [[ -f $BACKUP_FILE ]]; then
            success "Database backup created: $BACKUP_FILE"
        else
            warning "Database backup failed"
        fi
    else
        log "No existing database found, skipping backup"
    fi
}

# Build and deploy
deploy() {
    log "Building and deploying FUSAF..."

    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down

    # Pull latest images
    docker-compose -f docker-compose.prod.yml pull

    # Build application
    docker-compose -f docker-compose.prod.yml build --no-cache

    # Start services
    docker-compose -f docker-compose.prod.yml up -d

    success "Deployment completed"
}

# Health check
health_check() {
    log "Performing health check..."

    # Wait for services to start
    sleep 30

    # Check if containers are running
    if docker ps | grep -q fusaf-app && docker ps | grep -q fusaf-db; then
        success "All containers are running"
    else
        error "Some containers failed to start"
    fi

    # Check database connection
    if docker exec fusaf-db mysqladmin ping -h localhost --silent; then
        success "Database is accessible"
    else
        warning "Database connection failed"
    fi

    # Check application endpoint
    if curl -f -s http://localhost:3000/health > /dev/null; then
        success "Application is responding"
    else
        warning "Application health check failed"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring and logging..."

    # Create log rotation
    cat > /etc/logrotate.d/fusaf << EOF
/var/log/fusaf/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

    success "Monitoring setup completed"
}

# Clean up old images and containers
cleanup() {
    log "Cleaning up..."

    # Remove unused Docker images
    docker image prune -f

    # Remove old backups (keep last 30 days)
    find $BACKUP_DIR -name "*.sql" -type f -mtime +30 -delete

    success "Cleanup completed"
}

# Main deployment process
main() {
    log "🏆 FUSAF Production Deployment Started"

    check_prerequisites
    create_directories
    setup_ssl
    backup_database
    deploy
    health_check
    setup_monitoring
    cleanup

    success "🎉 FUSAF deployment completed successfully!"

    echo ""
    echo "🌟 Your FUSAF system is now running in production mode!"
    echo "🔗 Application: https://$DOMAIN"
    echo "📊 Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "🛠️  Manage: docker-compose -f docker-compose.prod.yml [command]"
    echo ""

    log "Deployment finished at $(date)"
}

# Run with error handling
trap 'error "Deployment failed at line $LINENO"' ERR

# Execute main function
main "$@"
