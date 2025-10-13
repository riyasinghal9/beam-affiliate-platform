#!/bin/bash

# Quick Deployment Script for Beam Affiliate Platform
# This script helps you deploy to various cloud platforms quickly

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

# Check if git is initialized
check_git() {
    if [ ! -d ".git" ]; then
        log "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit - Beam Affiliate Platform"
    else
        log "Git repository already initialized"
    fi
}

# Create deployment package
create_package() {
    log "Creating deployment package..."
    
    # Create deployment directory
    DEPLOY_DIR="beam-affiliate-deployment-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$DEPLOY_DIR"
    
    # Copy backend files
    cp -r backend "$DEPLOY_DIR/"
    rm -rf "$DEPLOY_DIR/backend/node_modules" 2>/dev/null || true
    rm -rf "$DEPLOY_DIR/backend/.env*" 2>/dev/null || true
    
    # Copy frontend files
    cp -r frontend "$DEPLOY_DIR/"
    rm -rf "$DEPLOY_DIR/frontend/node_modules" 2>/dev/null || true
    rm -rf "$DEPLOY_DIR/frontend/.env*" 2>/dev/null || true
    
    # Copy deployment files
    cp DEPLOYMENT_INSTRUCTIONS.md "$DEPLOY_DIR/"
    cp README.md "$DEPLOY_DIR/"
    cp netlify.toml "$DEPLOY_DIR/" 2>/dev/null || true
    cp backend/render.yaml "$DEPLOY_DIR/backend/" 2>/dev/null || true
    cp frontend/render.yaml "$DEPLOY_DIR/frontend/" 2>/dev/null || true
    
    # Create environment files
    cat > "$DEPLOY_DIR/backend/.env.example" << 'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-32-characters-minimum
FRONTEND_URL=https://your-frontend-url.com
BACKEND_URL=https://your-backend-url.com
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF

    cat > "$DEPLOY_DIR/frontend/.env.example" << 'EOF'
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ENVIRONMENT=production
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
EOF

    # Create deployment instructions
    cat > "$DEPLOY_DIR/QUICK_START.md" << 'EOF'
# 🚀 Quick Start - Beam Affiliate Platform

## Deploy to Render.com (Recommended)

### 1. Backend Deployment
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables from `.env.example`
7. Deploy!

### 2. Frontend Deployment
1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Add environment variables from `.env.example`
5. Deploy!

### 3. Database Setup
1. Go to https://mongodb.com/atlas
2. Create free account
3. Create new cluster
4. Get connection string
5. Update MONGODB_URI in environment variables

## Test the System

1. Register as reseller
2. Get affiliate links
3. Test click tracking
4. Create test sales
5. View dashboard analytics

## Support

Check DEPLOYMENT_INSTRUCTIONS.md for detailed instructions.
EOF

    # Create zip file
    zip -r "$DEPLOY_DIR.zip" "$DEPLOY_DIR"
    
    log "Deployment package created: $DEPLOY_DIR.zip"
    log "Upload this to your preferred cloud platform"
    
    # Display next steps
    echo
    info "Next Steps:"
    echo "1. Upload $DEPLOY_DIR.zip to your cloud platform"
    echo "2. Follow QUICK_START.md instructions"
    echo "3. Set up MongoDB Atlas database"
    echo "4. Configure environment variables"
    echo "5. Deploy and test!"
    echo
    info "Your client will have live URLs to test the reseller sales tracking functionality!"
}

# Deploy to specific platform
deploy_platform() {
    local platform=$1
    
    case $platform in
        "render")
            log "Preparing for Render.com deployment..."
            check_git
            create_package
            info "Go to https://render.com and follow the instructions in QUICK_START.md"
            ;;
        "netlify")
            log "Preparing for Netlify deployment..."
            check_git
            create_package
            info "Go to https://netlify.com and follow the instructions in QUICK_START.md"
            ;;
        "vercel")
            log "Preparing for Vercel deployment..."
            check_git
            create_package
            info "Go to https://vercel.com and follow the instructions in QUICK_START.md"
            ;;
        "package")
            create_package
            ;;
        *)
            error "Unknown platform: $platform"
            ;;
    esac
}

# Main function
main() {
    echo "🚀 Beam Affiliate Platform - Quick Deployment"
    echo "=============================================="
    echo
    
    case "${1:-help}" in
        "render")
            deploy_platform "render"
            ;;
        "netlify")
            deploy_platform "netlify"
            ;;
        "vercel")
            deploy_platform "vercel"
            ;;
        "package")
            deploy_platform "package"
            ;;
        "help"|*)
            echo "Usage: $0 [render|netlify|vercel|package]"
            echo
            echo "Options:"
            echo "  render   - Prepare for Render.com deployment"
            echo "  netlify  - Prepare for Netlify deployment"
            echo "  vercel   - Prepare for Vercel deployment"
            echo "  package  - Create deployment package"
            echo "  help     - Show this help message"
            echo
            echo "Examples:"
            echo "  $0 render    # Prepare for Render.com"
            echo "  $0 package   # Create deployment package"
            echo
            echo "Recommended: $0 render"
            ;;
    esac
}

# Run main function
main "$@"
