# 🚀 Beam Affiliate Platform - Complete Deployment Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Requirements](#system-requirements)
3. [Environment Setup](#environment-setup)
4. [Database Configuration](#database-configuration)
5. [Security Configuration](#security-configuration)
6. [Deployment Options](#deployment-options)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [API Documentation](#api-documentation)

## 🎯 Project Overview

The **Beam Affiliate Platform** is a complete, enterprise-grade affiliate marketing platform with the following features:

### ✅ **Core Features**
- User authentication and management
- Product catalog and affiliate links
- Commission tracking and payments
- Real-time analytics and reporting
- Admin panel and user management

### ✅ **Advanced Features**
- Machine learning and AI capabilities
- Predictive analytics and business intelligence
- Multi-language internationalization (12 languages)
- Advanced security and compliance
- Real-time notifications and webhooks

### ✅ **Production Features**
- Comprehensive API documentation
- Performance optimization and caching
- Automated deployment pipeline
- Monitoring and observability
- Security and compliance features

## 💻 System Requirements

### **Minimum Requirements**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+

### **Recommended Requirements**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS / CentOS 9 / macOS 12+

### **Software Requirements**
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18.x+
- **MongoDB**: 6.0+
- **Redis**: 7.0+
- **Nginx**: 1.20+

## 🔧 Environment Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/beam-affiliate-platform.git
cd beam-affiliate-platform
```

### **2. Create Environment Files**

**Backend Environment (.env.production)**
```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/beam_affiliate
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-32-characters-minimum
JWT_EXPIRY=24h

# Payment Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_hereyour_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
BEAM_WALLET_API_KEY=your_beam_wallet_api_key
BEAM_WALLET_SECRET=your_beam_wallet_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com

# Security Configuration
ENCRYPTION_KEY=your-32-character-encryption-key
REDIS_PASSWORD=your-redis-password
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-mongo-password

# Monitoring Configuration
GRAFANA_PASSWORD=your-grafana-password
PROMETHEUS_ENABLED=true
ELASTICSEARCH_ENABLED=true

# Third-party APIs (Optional)
FACEBOOK_API_KEY=your_facebook_api_key
TWITTER_API_KEY=your_twitter_api_key
INSTAGRAM_API_KEY=your_instagram_api_key
LINKEDIN_API_KEY=your_linkedin_api_key
```

**Frontend Environment (.env.production)**
```bash
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_publishable_key_hereyour_stripe_public_key
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

### **3. Install Dependencies**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

## 🗄️ Database Configuration

### **1. MongoDB Setup**
```bash
# Start MongoDB
docker run -d \
  --name beam-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your-mongo-password \
  -v mongo_data:/data/db \
  mongo:6.0
```

### **2. Redis Setup**
```bash
# Start Redis
docker run -d \
  --name beam-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine redis-server --requirepass your-redis-password
```

### **3. Database Initialization**
```bash
# Run database seeder
cd backend
node src/utils/seeder.js

# Create admin users
node create-admin.js
```

## 🔒 Security Configuration

### **1. SSL/TLS Certificates**
```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com -d api.your-domain.com
```

### **2. Firewall Configuration**
```bash
# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### **3. Security Headers**
The application includes comprehensive security headers via Helmet.js:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

## 🚀 Deployment Options

### **Option 1: Docker Compose (Recommended)**

**1. Build and Deploy**
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production
```

**2. Verify Deployment**
```bash
# Check service status
docker-compose -f backend/docker-compose.yml ps

# View logs
docker-compose -f backend/docker-compose.yml logs -f
```

### **Option 2: Manual Deployment**

**1. Build Frontend**
```bash
cd frontend
npm run build
```

**2. Start Backend**
```bash
cd backend
npm start
```

**3. Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/beam-affiliate-frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🏭 Production Deployment

### **1. Pre-deployment Checklist**
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Monitoring tools set up
- [ ] Security audit completed

### **2. Deploy Application**
```bash
# Run automated deployment
./deploy.sh production

# Or deploy manually
docker-compose -f backend/docker-compose.yml up -d
```

### **3. Post-deployment Verification**
```bash
# Health checks
curl https://your-domain.com/health
curl https://api.your-domain.com/health

# Check services
docker-compose -f backend/docker-compose.yml ps

# Monitor logs
docker-compose -f backend/docker-compose.yml logs -f
```

### **4. Initial Setup**
```bash
# Create admin users
curl -X POST https://api.your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@your-domain.com",
    "password": "SecurePassword123!",
    "isAdmin": true
  }'
```

## 📊 Monitoring & Maintenance

### **1. Monitoring Dashboard**
- **Grafana**: http://your-domain.com:3001 (admin/admin)
- **Prometheus**: http://your-domain.com:9090
- **Kibana**: http://your-domain.com:5601

### **2. Health Monitoring**
```bash
# Check application health
curl https://api.your-domain.com/health

# Check database health
docker exec beam-mongo mongosh --eval "db.adminCommand('ping')"

# Check Redis health
docker exec beam-redis redis-cli ping
```

### **3. Backup Strategy**
```bash
# Database backup
docker exec beam-mongo mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# Application backup
tar -czf backup-$(date +%Y%m%d_%H%M%S).tar.gz /var/www/beam-affiliate-platform
```

### **4. Log Management**
```bash
# View application logs
docker-compose -f backend/docker-compose.yml logs -f backend

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔧 Troubleshooting

### **Common Issues**

**1. Database Connection Issues**
```bash
# Check MongoDB status
docker exec beam-mongo mongosh --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGODB_URI
```

**2. Redis Connection Issues**
```bash
# Check Redis status
docker exec beam-redis redis-cli ping

# Check Redis configuration
docker exec beam-redis redis-cli config get requirepass
```

**3. SSL Certificate Issues**
```bash
# Check certificate validity
sudo certbot certificates

# Renew certificates
sudo certbot renew
```

**4. Performance Issues**
```bash
# Check resource usage
docker stats

# Check application performance
curl -w "@curl-format.txt" -o /dev/null -s https://api.your-domain.com/health
```

### **Debug Mode**
```bash
# Enable debug logging
export DEBUG=*
npm start
```

## 📚 API Documentation

### **Interactive API Documentation**
- **Swagger UI**: https://api.your-domain.com/api-docs
- **OpenAPI Spec**: https://api.your-domain.com/api-docs/swagger.json

### **Key API Endpoints**

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Dashboard**
- `GET /api/dashboard` - User dashboard data
- `GET /api/dashboard/analytics` - Analytics data

**Products**
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details

**Commissions**
- `GET /api/commissions` - User commissions
- `POST /api/commissions/withdraw` - Withdraw funds

**Admin**
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - User management
- `POST /api/admin/users/:id/approve` - Approve user

**Advanced Features**
- `POST /api/advanced/ml/fraud-detection/predict` - Fraud detection
- `POST /api/advanced/analytics/predictive-insights` - Predictive analytics
- `GET /api/advanced/i18n/languages` - Supported languages
- `POST /api/advanced/security/2fa/setup` - Setup 2FA

## 🎉 Deployment Complete!

Your **Beam Affiliate Platform** is now fully deployed and ready for production use!

### **Access URLs**
- **Frontend**: https://your-domain.com
- **Backend API**: https://api.your-domain.com
- **API Documentation**: https://api.your-domain.com/api-docs
- **Admin Dashboard**: https://your-domain.com/admin/dashboard

### **Default Admin Credentials**
- **Email**: admin@your-domain.com
- **Password**: SecurePassword123!

### **Next Steps**
1. Change default admin password
2. Configure payment gateways
3. Add your products
4. Set up email notifications
5. Configure monitoring alerts
6. Train machine learning models
7. Customize branding and content

### **Support**
For technical support or questions, please refer to:
- **Documentation**: `/docs` directory
- **API Docs**: https://api.your-domain.com/api-docs
- **GitHub Issues**: Project repository issues

---

**🎯 Congratulations! Your enterprise-grade affiliate platform is now live!** 