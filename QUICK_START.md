# ⚡ Beam Affiliate Platform - Quick Start Guide

## 🚀 Deploy in 5 Minutes

### **Prerequisites**
- Docker and Docker Compose installed
- Domain name configured
- Basic server knowledge

---

## 📋 **Step 1: Clone & Setup**

```bash
# Clone the repository
git clone https://github.com/your-username/beam-affiliate-platform.git
cd beam-affiliate-platform

# Make deployment script executable
chmod +x deploy.sh
```

---

## ⚙️ **Step 2: Configure Environment**

Create `.env.production` file:

```bash
# Database
MONGODB_URI=mongodb://mongo:27017/beam_affiliate
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-super-secure-32-character-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Payment (Get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_keyyour_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Gmail recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com

# Passwords
REDIS_PASSWORD=your-redis-password
MONGO_ROOT_PASSWORD=your-mongo-password
GRAFANA_PASSWORD=your-grafana-password
```

---

## 🚀 **Step 3: Deploy**

```bash
# Deploy everything
./deploy.sh production
```

**That's it!** Your platform is now running.

---

## 🌐 **Step 4: Access Your Platform**

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | https://your-domain.com | Register new account |
| **Backend API** | https://api.your-domain.com | - |
| **API Docs** | https://api.your-domain.com/api-docs | - |
| **Admin Dashboard** | https://your-domain.com/admin/dashboard | admin@your-domain.com / SecurePassword123! |
| **Grafana** | https://your-domain.com:3001 | admin / your-grafana-password |
| **Prometheus** | https://your-domain.com:9090 | - |

---

## ⚡ **Step 5: Quick Configuration**

### **1. Create Admin User**
```bash
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

### **2. Add Your First Product**
```bash
curl -X POST https://api.your-domain.com/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Beam Wallet Installation",
    "description": "Professional Beam Wallet installation service",
    "price": 75.00,
    "commissionRate": 50,
    "category": "Services"
  }'
```

### **3. Configure Payment Gateway**
- Go to Stripe Dashboard
- Get your API keys
- Update environment variables
- Test a payment

---

## 📊 **Step 6: Monitor & Optimize**

### **Check Health**
```bash
# Application health
curl https://api.your-domain.com/health

# View logs
docker-compose -f backend/docker-compose.yml logs -f
```

### **Performance Monitoring**
- **Grafana**: Real-time dashboards
- **Prometheus**: Metrics collection
- **Kibana**: Log analysis

---

## 🎯 **Next Steps**

1. **Customize Branding**
   - Update logos and colors
   - Modify content and copy
   - Configure email templates

2. **Add Products**
   - Upload product images
   - Set commission rates
   - Create affiliate links

3. **Train ML Models**
   - Feed historical data
   - Improve fraud detection
   - Enhance recommendations

4. **Launch Marketing**
   - Create landing pages
   - Set up email campaigns
   - Begin user acquisition

---

## 🔧 **Troubleshooting**

### **Common Issues**

**Port Already in Use**
```bash
# Stop existing services
docker-compose -f backend/docker-compose.yml down

# Check what's using the port
sudo lsof -i :80
sudo lsof -i :443
```

**Database Connection Issues**
```bash
# Check MongoDB
docker exec beam-affiliate-mongo mongosh --eval "db.adminCommand('ping')"

# Check Redis
docker exec beam-affiliate-redis redis-cli ping
```

**SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew
```

---

## 📞 **Support**

- **Documentation**: `/docs` directory
- **API Docs**: https://api.your-domain.com/api-docs
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Project Completion**: `PROJECT_COMPLETION.md`

---

## 🎉 **Success!**

Your **Beam Affiliate Platform** is now live and ready to generate revenue!

**Key Features Available:**
- ✅ User registration and management
- ✅ Product catalog and affiliate links
- ✅ Commission tracking and payments
- ✅ Real-time analytics and reporting
- ✅ Admin panel with full control
- ✅ Machine learning and AI
- ✅ Multi-language support
- ✅ Advanced security features
- ✅ Marketing automation
- ✅ Real-time notifications

**Ready to start earning!** 🚀 