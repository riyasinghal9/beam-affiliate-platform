#!/bin/bash

# 🚀 Quick Backend Deployment Script
# This script deploys the backend to Railway for immediate use

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] $1${NC}"
    exit 1
}

echo "🚀 Quick Backend Deployment to Railway"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    error "Please run this script from the beam-affiliate-platform root directory"
fi

log "✅ Project structure verified"

# Create Railway deployment package
echo ""
log "📦 Creating Railway deployment package..."
RAILWAY_DIR="railway-backend-deployment-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RAILWAY_DIR"

# Copy backend files
cp -r backend/* "$RAILWAY_DIR/"

# Create railway.json
cat > "$RAILWAY_DIR/railway.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/products",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Create environment template
cat > "$RAILWAY_DIR/.env.template" << 'EOF'
# Railway Environment Variables
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://beamaffiliate:beam123456@cluster0.mongodb.net/beam_affiliate_prod?retryWrites=true&w=majority
JWT_SECRET=beam-affiliate-super-secure-jwt-secret-key-2024-production-32-chars
FRONTEND_URL=https://beam-affiliate-platform-7bha.vercel.app
BACKEND_URL=https://your-app.railway.app
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=beamaffiliate.test@gmail.com
SMTP_PASS=beamaffiliate123456
EOF

# Create deployment instructions
cat > "$RAILWAY_DIR/RAILWAY_DEPLOYMENT.md" << 'EOF'
# 🚀 Railway Backend Deployment

## Quick Deploy to Railway (5 minutes)

### Step 1: Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub (free)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the backend folder
6. Railway will auto-detect Node.js and deploy!

### Step 2: Set Environment Variables
In Railway dashboard, go to your project → Variables tab:
- NODE_ENV=production
- PORT=10000
- MONGODB_URI=mongodb+srv://beamaffiliate:beam123456@cluster0.mongodb.net/beam_affiliate_prod?retryWrites=true&w=majority
- JWT_SECRET=beam-affiliate-super-secure-jwt-secret-key-2024-production-32-chars
- FRONTEND_URL=https://beam-affiliate-platform-7bha.vercel.app
- STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890

### Step 3: Get Your Backend URL
1. Railway will give you a URL like: https://your-app.railway.app
2. Test: https://your-app.railway.app/api/products
3. Copy this URL for frontend configuration

### Step 4: Update Frontend
Update your Vercel environment variables:
- REACT_APP_API_URL=https://your-app.railway.app

## Alternative: Use Render.com
If Railway doesn't work, use Render.com:
1. Go to https://render.com
2. Sign up (free)
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Select backend folder
6. Use these settings:
   - Build Command: npm install
   - Start Command: npm start
   - Environment: Node

## Testing
After deployment, test:
1. https://your-backend-url/api/products
2. Should return JSON with products
3. Update frontend with new backend URL
EOF

log "✅ Railway deployment package ready!"

echo ""
info "🎯 DEPLOYMENT PACKAGE READY!"
echo ""
info "📁 Package: $RAILWAY_DIR/"
info "📋 Instructions: $RAILWAY_DIR/RAILWAY_DEPLOYMENT.md"
echo ""
info "🚀 DEPLOYMENT OPTIONS:"
echo ""
echo "🌟 Option 1: Railway (Fastest - 5 minutes)"
echo "   1. Go to https://railway.app"
echo "   2. Sign up with GitHub"
echo "   3. Deploy from GitHub repo"
echo "   4. Select backend folder"
echo "   5. Set environment variables"
echo "   6. Get your backend URL!"
echo ""
echo "🌟 Option 2: Render.com (Alternative)"
echo "   1. Go to https://render.com"
echo "   2. Sign up (free)"
echo "   3. Deploy from GitHub"
echo "   4. Select backend folder"
echo "   5. Configure environment variables"
echo ""
info "✅ Backend will be live in 5-10 minutes!"
info "🔧 Then update frontend with new backend URL"
echo ""
log "🚀 Ready to deploy backend!"
