#!/bin/bash

# 🚀 Deploy Updated Frontend to Vercel
# This script helps deploy the fixed frontend to Vercel

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

echo "🚀 Beam Affiliate Platform - Vercel Deployment"
echo "============================================="
echo ""

# Check if we have the deployment package
DEPLOY_DIR="frontend-deployment-20251013_192528"
if [ ! -d "$DEPLOY_DIR" ]; then
    error "Deployment package not found. Please run the build process first."
fi

log "✅ Found deployment package: $DEPLOY_DIR"

# Create vercel.json for the deployment
cat > "$DEPLOY_DIR/vercel.json" << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://beam-affiliate-backend.herokuapp.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://beam-affiliate-backend.herokuapp.com",
    "REACT_APP_ENVIRONMENT": "production",
    "REACT_APP_STRIPE_PUBLIC_KEY": "pk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890"
  }
}
EOF

log "✅ Created vercel.json configuration"

# Create deployment instructions
cat > "$DEPLOY_DIR/VERCEL_DEPLOYMENT.md" << 'EOF'
# 🚀 Vercel Deployment Instructions

## Quick Deploy to Vercel

### Method 1: Vercel CLI (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod` in this directory
3. Follow the prompts
4. Your app will be deployed!

### Method 2: Vercel Dashboard
1. Go to https://vercel.com
2. Click "New Project"
3. Upload this entire folder
4. Deploy!

### Method 3: Drag & Drop
1. Go to https://vercel.com
2. Drag this entire folder to the deploy area
3. Get your live URL instantly!

## What's Fixed
✅ API URLs now use environment variables
✅ Products will load from backend
✅ All API calls use correct backend URL
✅ Environment variables configured

## Backend URL
The frontend is configured to use: https://beam-affiliate-backend.herokuapp.com

## Testing
After deployment, test:
1. Products page loads correctly
2. No more "Failed to fetch" errors
3. All API calls work properly
EOF

log "✅ Created Vercel deployment instructions"

echo ""
info "🎯 DEPLOYMENT READY!"
echo ""
info "📁 Package: $DEPLOY_DIR/"
info "📋 Instructions: $DEPLOY_DIR/VERCEL_DEPLOYMENT.md"
echo ""
info "🚀 DEPLOYMENT OPTIONS:"
echo ""
echo "🌟 Option 1: Vercel CLI (Fastest)"
echo "   1. Install: npm i -g vercel"
echo "   2. Run: cd $DEPLOY_DIR && vercel --prod"
echo "   3. Get live URL instantly!"
echo ""
echo "🌟 Option 2: Vercel Dashboard"
echo "   1. Go to https://vercel.com"
echo "   2. Upload the '$DEPLOY_DIR' folder"
echo "   3. Deploy with one click!"
echo ""
echo "🌟 Option 3: Drag & Drop"
echo "   1. Go to https://vercel.com"
echo "   2. Drag the '$DEPLOY_DIR' folder to deploy area"
echo "   3. Get live URL instantly!"
echo ""
info "✅ Products should now load correctly!"
info "🔧 API calls fixed to use backend URL"
info "🌐 Environment variables configured"
echo ""
log "🚀 Ready to deploy to Vercel!"
