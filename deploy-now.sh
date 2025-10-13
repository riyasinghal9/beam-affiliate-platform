#!/bin/bash

# 🚀 INSTANT DEPLOYMENT SCRIPT
# This script helps you deploy to Render.com quickly

echo "🚀 Beam Affiliate Platform - Instant Deployment"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Make sure you're in the beam-affiliate-platform folder"
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Create a simple deployment package
echo "📦 Creating deployment package..."
DEPLOY_DIR="deploy-now-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy backend (excluding node_modules)
echo "📁 Copying backend files..."
cp -r backend "$DEPLOY_DIR/"
rm -rf "$DEPLOY_DIR/backend/node_modules" 2>/dev/null || true

# Copy frontend (excluding node_modules)
echo "📁 Copying frontend files..."
cp -r frontend "$DEPLOY_DIR/"
rm -rf "$DEPLOY_DIR/frontend/node_modules" 2>/dev/null || true

# Create environment files
echo "⚙️ Creating environment files..."

# Backend environment
cat > "$DEPLOY_DIR/backend/.env.example" << 'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://beamaffiliate:beam123456@cluster0.mongodb.net/beam_affiliate_prod?retryWrites=true&w=majority
JWT_SECRET=beam-affiliate-super-secure-jwt-secret-key-2024-production-32-chars
FRONTEND_URL=https://beam-affiliate-frontend.onrender.com
BACKEND_URL=https://beam-affiliate-backend.onrender.com
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=beamaffiliate.test@gmail.com
SMTP_PASS=beamaffiliate123456
EOF

# Frontend environment
cat > "$DEPLOY_DIR/frontend/.env.example" << 'EOF'
REACT_APP_API_URL=https://beam-affiliate-backend.onrender.com
REACT_APP_ENVIRONMENT=production
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
EOF

# Create deployment instructions
cat > "$DEPLOY_DIR/DEPLOY_NOW.md" << 'EOF'
# 🚀 DEPLOY NOW - Beam Affiliate Platform

## Quick Steps:

### 1. Backend Deployment (Render.com)
1. Go to https://render.com
2. Sign up (free)
3. Click "New +" → "Web Service"
4. Upload the `backend` folder
5. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
6. Add environment variables from `.env.example`
7. Deploy!

### 2. Frontend Deployment (Render.com)
1. In Render dashboard, click "New +" → "Static Site"
2. Upload the `frontend` folder
3. Use these settings:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Add environment variables from `.env.example`
5. Deploy!

### 3. Database Setup (MongoDB Atlas)
1. Go to https://mongodb.com/atlas
2. Create free account
3. Create new cluster
4. Get connection string
5. Update MONGODB_URI in backend environment variables

### 4. Update URLs
1. Get your actual Render URLs
2. Update FRONTEND_URL in backend
3. Update REACT_APP_API_URL in frontend
4. Redeploy both services

## Test Your System:
1. Register as reseller
2. Get affiliate links
3. Test click tracking
4. Create test sales
5. View dashboard analytics

Your app will be live in ~15 minutes!
EOF

# Create zip file
echo "📦 Creating zip file..."
zip -r "$DEPLOY_DIR.zip" "$DEPLOY_DIR" > /dev/null 2>&1

echo ""
echo "✅ Deployment package ready!"
echo "📁 Package: $DEPLOY_DIR.zip"
echo "📋 Instructions: $DEPLOY_DIR/DEPLOY_NOW.md"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Go to https://render.com"
echo "2. Sign up (free)"
echo "3. Deploy backend first, then frontend"
echo "4. Set up MongoDB Atlas"
echo "5. Update environment variables"
echo "6. Test your live system!"
echo ""
echo "📱 Your client will have live URLs to test the reseller sales tracking functionality!"
echo ""
echo "⏱️  Total deployment time: ~15-20 minutes"
echo "💰 Cost: $0 (using free tiers)"
echo ""
echo "🚀 Ready to deploy!"

