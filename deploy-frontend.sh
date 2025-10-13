#!/bin/bash

# 🚀 Frontend-Only Deployment Script
# This script prepares your frontend for deployment

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

echo "🚀 Beam Affiliate Platform - Frontend Deployment"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    error "Please run this script from the beam-affiliate-platform root directory"
fi

log "Project structure verified"

# Build frontend
echo ""
log "Building frontend for production..."
cd frontend
npm run build
cd ..

# Check if build was successful
if [ ! -d "frontend/build" ]; then
    error "Frontend build failed. Check the build output above."
fi

log "✅ Frontend built successfully!"

# Create deployment package
echo ""
log "Creating deployment package..."
DEPLOY_DIR="frontend-deployment-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy build files
cp -r frontend/build/* "$DEPLOY_DIR/"

# Create deployment instructions
cat > "$DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# 🚀 Frontend Deployment Instructions

## Quick Deployment Options

### Option 1: Netlify (Recommended - 2 minutes)
1. Go to https://netlify.com
2. Sign up (free)
3. Drag this entire folder to the deploy area
4. Get your live URL instantly!

### Option 2: Vercel (Fastest - 1 minute)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Upload this folder
4. Deploy with one click

### Option 3: Any Static Hosting
1. Upload this folder to any static hosting
2. Configure domain (optional)
3. Your frontend is live!

## What Your Client Will See

✅ Professional Beam Wallet interface
✅ Real product catalog with pricing
✅ User registration and login
✅ Reseller dashboard (demo mode)
✅ Mobile responsive design
✅ Affiliate link generation (demo)

## Features Available

- Homepage with Beam Wallet branding
- Product catalog with 4 real products
- User registration system
- Reseller dashboard interface
- Commission tracking (demo)
- Mobile responsive design

## Next Steps

1. Deploy this folder to your chosen platform
2. Get your live URL
3. Test all features
4. Share URL with client
5. Deploy backend later for full functionality

## Support

For issues or questions, refer to the main project documentation.
EOF

# Create zip file
echo ""
log "Creating deployment package..."
zip -r "$DEPLOY_DIR.zip" "$DEPLOY_DIR" > /dev/null 2>&1

echo ""
log "✅ Frontend deployment package ready!"
echo ""
info "📁 Package: $DEPLOY_DIR.zip"
info "📋 Instructions: $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md"
echo ""
info "🎯 DEPLOYMENT OPTIONS:"
echo ""
echo "🌟 Option 1: Netlify (Recommended)"
echo "   1. Go to https://netlify.com"
echo "   2. Sign up (free)"
echo "   3. Drag the '$DEPLOY_DIR' folder to deploy area"
echo "   4. Get live URL instantly!"
echo ""
echo "🌟 Option 2: Vercel (Fastest)"
echo "   1. Go to https://vercel.com"
echo "   2. Sign up with GitHub"
echo "   3. Upload the '$DEPLOY_DIR' folder"
echo "   4. Deploy with one click!"
echo ""
echo "🌟 Option 3: Any Static Hosting"
echo "   1. Upload the '$DEPLOY_DIR' folder"
echo "   2. Configure domain (optional)"
echo "   3. Your frontend is live!"
echo ""
info "📱 Your client will have a live URL to test the platform!"
echo ""
info "⏱️  Total deployment time: 2-5 minutes"
info "💰 Cost: $0 (using free tiers)"
echo ""
log "🚀 Ready to deploy frontend!"
