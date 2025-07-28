#!/bin/bash

# FUSAF Database Backup Script
# Automated backup script for FUSAF MySQL database

set -e

# Configuration
MYSQL_HOST=${MYSQL_HOST:-fusaf-db}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_USER=${MYSQL_USER:-fusaf_user}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE:-fusaf_production}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fusaf_backup_$DATE.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}" | tee -a $LOG_FILE
}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

log "🔄 Starting database backup for FUSAF..."

# Check if MySQL is accessible
if ! mysqladmin ping -h $MYSQL_HOST -P $MYSQL_PORT --silent; then
    error "Cannot connect to MySQL server at $MYSQL_HOST:$MYSQL_PORT"
fi

success "MySQL server is accessible"

# Create database backup
log "Creating backup of database: $MYSQL_DATABASE"

mysqldump \
    --host=$MYSQL_HOST \
    --port=$MYSQL_PORT \
    --user=$MYSQL_USER \
    --password=$MYSQL_PASSWORD \
    --single-transaction \
    --routines \
    --triggers \
    --lock-tables=false \
    --add-drop-table \
    --extended-insert \
    --set-charset \
    --default-character-set=utf8mb4 \
    $MYSQL_DATABASE > $BACKUP_FILE

# Check if backup was successful
if [[ -f $BACKUP_FILE && -s $BACKUP_FILE ]]; then
    BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    success "Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
    error "Backup failed: $BACKUP_FILE not created or is empty"
fi

# Compress backup
log "Compressing backup..."
gzip $BACKUP_FILE

if [[ -f "$BACKUP_FILE.gz" ]]; then
    COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    success "Backup compressed: $BACKUP_FILE.gz ($COMPRESSED_SIZE)"
else
    warning "Backup compression failed"
fi

# Clean up old backups
log "Cleaning up old backups (keeping last $BACKUP_RETENTION_DAYS days)..."

find $BACKUP_DIR -name "fusaf_backup_*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete

REMAINING_BACKUPS=$(find $BACKUP_DIR -name "fusaf_backup_*.sql.gz" -type f | wc -l)
success "Cleanup completed. $REMAINING_BACKUPS backup files remaining"

# Generate backup report
BACKUP_REPORT="$BACKUP_DIR/backup_report_$(date +%Y%m).txt"

cat > $BACKUP_REPORT << EOF
FUSAF Database Backup Report
============================
Date: $(date '+%Y-%m-%d %H:%M:%S')
Database: $MYSQL_DATABASE
Host: $MYSQL_HOST:$MYSQL_PORT
User: $MYSQL_USER

Backup File: $BACKUP_FILE.gz
Backup Size: $COMPRESSED_SIZE
Status: SUCCESS

Retention Policy: $BACKUP_RETENTION_DAYS days
Active Backups: $REMAINING_BACKUPS files

Tables Backed Up:
EOF

# List tables in the backup
mysql \
    --host=$MYSQL_HOST \
    --port=$MYSQL_PORT \
    --user=$MYSQL_USER \
    --password=$MYSQL_PASSWORD \
    --database=$MYSQL_DATABASE \
    --execute="SHOW TABLES;" | tail -n +2 >> $BACKUP_REPORT

success "Backup report generated: $BACKUP_REPORT"

log "✅ Database backup completed successfully at $(date)"

# Send notification (if email is configured)
if [[ -n "${BACKUP_NOTIFICATION_EMAIL}" ]]; then
    log "Sending backup notification email..."

    echo "FUSAF database backup completed successfully on $(date)" | \
    mail -s "FUSAF Backup Success - $(date +%Y-%m-%d)" $BACKUP_NOTIFICATION_EMAIL || \
    warning "Failed to send notification email"
fi

exit 0
