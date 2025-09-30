#!/bin/bash

# Beam Affiliate Platform - Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="beam-affiliate-platform"
DEPLOYMENT_ENV=${1:-production}
DOCKER_COMPOSE_FILE="backend/docker-compose.yml"
ENV_FILE=".env.${DEPLOYMENT_ENV}"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        error "Git is not installed. Please install Git first."
    fi
    
    # Check available disk space (at least 5GB)
    DISK_SPACE=$(df . | awk 'NR==2 {print $4}')
    if [ "$DISK_SPACE" -lt 5242880 ]; then
        error "Insufficient disk space. Need at least 5GB free space."
    fi
    
    # Check available memory (at least 4GB)
    MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [ "$MEMORY" -lt 4096 ]; then
        warn "Low memory detected. Recommended: 4GB+ RAM"
    fi
    
    log "System requirements check passed"
}

# Load environment variables
load_environment() {
    log "Loading environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file $ENV_FILE not found"
    fi
    
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
    
    # Validate required environment variables
    required_vars=(
        "JWT_SECRET"
        "MONGODB_URI"
        "REDIS_URL"
        "STRIPE_SECRET_KEY"
        "SMTP_HOST"
        "SMTP_USER"
        "SMTP_PASS"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    log "Environment configuration loaded successfully"
}

# Security checks
security_checks() {
    log "Performing security checks..."
    
    # Check for weak passwords
    if [[ "$JWT_SECRET" == "your-secret-key" ]] || [[ ${#JWT_SECRET} -lt 32 ]]; then
        error "JWT_SECRET is too weak. Use a strong secret key (32+ characters)"
    fi
    
    # Check for default database credentials
    if [[ "$MONGO_ROOT_PASSWORD" == "password" ]]; then
        error "Please change the default MongoDB password"
    fi
    
    # Check for default Redis password
    if [[ "$REDIS_PASSWORD" == "password" ]]; then
        error "Please change the default Redis password"
    fi
    
    # Check SSL configuration for production
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        if [[ "$FRONTEND_URL" != "https://"* ]]; then
            warn "Production environment should use HTTPS"
        fi
    fi
    
    log "Security checks passed"
}

# Backup existing data
backup_data() {
    log "Creating backup of existing data..."
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if exists
    if docker ps | grep -q "beam-affiliate-mongo"; then
        docker exec beam-affiliate-mongo mongodump --out /data/backup
        docker cp beam-affiliate-mongo:/data/backup "$BACKUP_DIR/database"
        log "Database backup created: $BACKUP_DIR/database"
    fi
    
    # Backup environment files
    cp .env* "$BACKUP_DIR/" 2>/dev/null || true
    log "Environment files backed up"
    
    log "Backup completed: $BACKUP_DIR"
}

# Stop existing services
stop_services() {
    log "Stopping existing services..."
    
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
        log "Existing services stopped"
    else
        warn "No existing docker-compose file found"
    fi
}

# Build and deploy services
deploy_services() {
    log "Building and deploying services..."
    
    # Build images
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    # Deploy services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    log "Services deployed successfully"
}

# Wait for services to be ready
wait_for_services() {
    log "Waiting for services to be ready..."
    
    # Wait for MongoDB
    info "Waiting for MongoDB..."
    timeout=60
    while ! docker exec beam-affiliate-mongo mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            error "MongoDB failed to start within 60 seconds"
        fi
    done
    
    # Wait for Redis
    info "Waiting for Redis..."
    timeout=30
    while ! docker exec beam-affiliate-redis redis-cli ping >/dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            error "Redis failed to start within 30 seconds"
        fi
    done
    
    # Wait for Backend API
    info "Waiting for Backend API..."
    timeout=60
    while ! curl -f http://localhost:5000/health >/dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            error "Backend API failed to start within 60 seconds"
        fi
    done
    
    # Wait for Frontend
    info "Waiting for Frontend..."
    timeout=60
    while ! curl -f http://localhost:3000 >/dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            error "Frontend failed to start within 60 seconds"
        fi
    done
    
    log "All services are ready"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait a bit for database to be fully ready
    sleep 5
    
    # Run seeder script
    docker exec beam-affiliate-backend node src/utils/seeder.js
    
    log "Database migrations completed"
}

# Health checks
health_checks() {
    log "Performing health checks..."
    
    # Check backend health
    if ! curl -f http://localhost:5000/health >/dev/null 2>&1; then
        error "Backend health check failed"
    fi
    
    # Check frontend health
    if ! curl -f http://localhost:3000 >/dev/null 2>&1; then
        error "Frontend health check failed"
    fi
    
    # Check database connection
    if ! docker exec beam-affiliate-mongo mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        error "Database health check failed"
    fi
    
    # Check Redis connection
    if ! docker exec beam-affiliate-redis redis-cli ping >/dev/null 2>&1; then
        error "Redis health check failed"
    fi
    
    log "All health checks passed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Wait for Prometheus
    info "Waiting for Prometheus..."
    timeout=30
    while ! curl -f http://localhost:9090/-/healthy >/dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            warn "Prometheus failed to start within 30 seconds"
            break
        fi
    done
    
    # Wait for Grafana
    info "Waiting for Grafana..."
    timeout=30
    while ! curl -f http://localhost:3001/api/health >/dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            warn "Grafana failed to start within 30 seconds"
            break
        fi
    done
    
    log "Monitoring setup completed"
}

# Display deployment information
display_info() {
    log "Deployment completed successfully!"
    echo
    echo "=== Beam Affiliate Platform - Deployment Information ==="
    echo
    echo "Frontend:     http://localhost:3000"
    echo "Backend API:  http://localhost:5000"
    echo "API Docs:     http://localhost:5000/api-docs"
    echo "Grafana:      http://localhost:3001 (admin/admin)"
    echo "Prometheus:   http://localhost:9090"
    echo "Kibana:       http://localhost:5601"
    echo
    echo "=== Useful Commands ==="
    echo "View logs:           docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
    echo "Stop services:       docker-compose -f $DOCKER_COMPOSE_FILE down"
    echo "Restart services:    docker-compose -f $DOCKER_COMPOSE_FILE restart"
    echo "Update services:     ./deploy.sh $DEPLOYMENT_ENV"
    echo
    echo "=== Security Notes ==="
    echo "- Change default passwords in production"
    echo "- Configure SSL certificates"
    echo "- Set up firewall rules"
    echo "- Enable automated backups"
    echo
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused Docker volumes
    docker volume prune -f
    
    log "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting deployment for environment: $DEPLOYMENT_ENV"
    
    check_root
    check_requirements
    load_environment
    security_checks
    backup_data
    stop_services
    deploy_services
    wait_for_services
    run_migrations
    health_checks
    setup_monitoring
    cleanup
    display_info
    
    log "Deployment completed successfully!"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@" 