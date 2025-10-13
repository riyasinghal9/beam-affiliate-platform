#!/bin/bash

# Beam Affiliate Platform - Cloud Deployment Script
# This script deploys the application to various cloud platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if git is initialized
check_git() {
    if [ ! -d ".git" ]; then
        log "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit - Beam Affiliate Platform"
    fi
}

# Deploy to Render.com
deploy_render() {
    log "Deploying to Render.com..."
    
    # Check if render.yaml exists
    if [ ! -f "backend/render.yaml" ]; then
        error "render.yaml not found in backend directory"
    fi
    
    info "Backend deployment configuration ready"
    info "Frontend deployment configuration ready"
    
    log "To deploy to Render.com:"
    echo "1. Go to https://render.com"
    echo "2. Sign up/Login with GitHub"
    echo "3. Connect your GitHub repository"
    echo "4. Create a new Web Service for backend"
    echo "5. Create a new Static Site for frontend"
    echo "6. Use the render.yaml configurations provided"
    
    log "Render.com deployment configuration created successfully!"
}

# Deploy to Railway
deploy_railway() {
    log "Deploying to Railway..."
    
    # Check if railway.json exists
    if [ ! -f "railway.json" ]; then
        error "railway.json not found"
    fi
    
    info "Railway deployment configuration ready"
    
    log "To deploy to Railway:"
    echo "1. Go to https://railway.app"
    echo "2. Sign up/Login with GitHub"
    echo "3. Create a new project"
    echo "4. Connect your GitHub repository"
    echo "5. Deploy using the railway.json configuration"
    
    log "Railway deployment configuration created successfully!"
}

# Deploy to Heroku
deploy_heroku() {
    log "Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        warn "Heroku CLI not installed. Installing..."
        npm install -g heroku
    fi
    
    # Create Heroku apps
    info "Creating Heroku applications..."
    
    # Backend deployment
    cd backend
    heroku create beam-affiliate-backend-$(date +%s) --region us
    heroku config:set NODE_ENV=production
    heroku config:set JWT_SECRET=beam-affiliate-super-secure-jwt-secret-key-2024-production-32-chars
    heroku config:set MONGODB_URI=mongodb+srv://beamaffiliate:beam123456@cluster0.mongodb.net/beam_affiliate_prod?retryWrites=true&w=majority
    heroku config:set FRONTEND_URL=https://beam-affiliate-frontend.herokuapp.com
    heroku config:set BACKEND_URL=https://beam-affiliate-backend.herokuapp.com
    
    git add .
    git commit -m "Deploy backend to Heroku"
    git push heroku main
    
    cd ../frontend
    
    # Frontend deployment
    heroku create beam-affiliate-frontend-$(date +%s) --region us
    heroku config:set REACT_APP_API_URL=https://beam-affiliate-backend.herokuapp.com
    heroku config:set REACT_APP_ENVIRONMENT=production
    
    git add .
    git commit -m "Deploy frontend to Heroku"
    git push heroku main
    
    cd ..
    
    log "Heroku deployment completed!"
}

# Deploy to Vercel
deploy_vercel() {
    log "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        warn "Vercel CLI not installed. Installing..."
        npm install -g vercel
    fi
    
    # Deploy frontend to Vercel
    cd frontend
    vercel --prod
    
    # Deploy backend to Vercel
    cd ../backend
    vercel --prod
    
    cd ..
    
    log "Vercel deployment completed!"
}

# Create deployment package
create_package() {
    log "Creating deployment package..."
    
    # Create a deployment directory
    DEPLOY_DIR="deployment-package-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$DEPLOY_DIR"
    
    # Copy necessary files
    cp -r backend "$DEPLOY_DIR/"
    cp -r frontend "$DEPLOY_DIR/"
    cp -r docs "$DEPLOY_DIR/" 2>/dev/null || true
    cp README.md "$DEPLOY_DIR/"
    cp DEPLOYMENT_GUIDE.md "$DEPLOY_DIR/"
    cp deploy.sh "$DEPLOY_DIR/"
    
    # Create deployment instructions
    cat > "$DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# Beam Affiliate Platform - Deployment Instructions

## Quick Deployment Options

### Option 1: Render.com (Recommended)
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your repository
4. Create two services:
   - Web Service (backend) using backend/render.yaml
   - Static Site (frontend) using frontend/render.yaml

### Option 2: Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Connect repository
5. Deploy using railway.json configurations

### Option 3: Heroku
1. Install Heroku CLI
2. Run: ./deploy-to-cloud.sh heroku
3. Follow the prompts

### Option 4: Vercel
1. Install Vercel CLI
2. Run: ./deploy-to-cloud.sh vercel
3. Follow the prompts

## Environment Variables

Make sure to set these environment variables in your cloud platform:

### Backend
- NODE_ENV=production
- PORT=5000
- MONGODB_URI=your_mongodb_connection_string
- JWT_SECRET=your_secure_jwt_secret
- FRONTEND_URL=your_frontend_url
- BACKEND_URL=your_backend_url

### Frontend
- REACT_APP_API_URL=your_backend_url
- REACT_APP_ENVIRONMENT=production

## Database Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Update MONGODB_URI in your environment variables

## Testing

After deployment, test these endpoints:
- Frontend: https://your-frontend-url.com
- Backend Health: https://your-backend-url.com/health
- API Docs: https://your-backend-url.com/api-docs

## Support

For issues or questions, refer to the DEPLOYMENT_GUIDE.md file.
EOF

    # Create a zip file
    zip -r "$DEPLOY_DIR.zip" "$DEPLOY_DIR"
    
    log "Deployment package created: $DEPLOY_DIR.zip"
    log "Upload this package to your preferred cloud platform"
}

# Main function
main() {
    log "Beam Affiliate Platform - Cloud Deployment"
    echo
    
    case "${1:-help}" in
        "render")
            check_git
            deploy_render
            ;;
        "railway")
            check_git
            deploy_railway
            ;;
        "heroku")
            check_git
            deploy_heroku
            ;;
        "vercel")
            check_git
            deploy_vercel
            ;;
        "package")
            create_package
            ;;
        "help"|*)
            echo "Usage: $0 [render|railway|heroku|vercel|package]"
            echo
            echo "Options:"
            echo "  render   - Deploy to Render.com"
            echo "  railway  - Deploy to Railway"
            echo "  heroku   - Deploy to Heroku"
            echo "  vercel   - Deploy to Vercel"
            echo "  package  - Create deployment package"
            echo "  help     - Show this help message"
            echo
            echo "Examples:"
            echo "  $0 render    # Deploy to Render.com"
            echo "  $0 package   # Create deployment package"
            ;;
    esac
}

# Run main function
main "$@"
