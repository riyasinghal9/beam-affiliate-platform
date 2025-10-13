#!/bin/bash

# 🚀 AWS Deployment Script for Beam Affiliate Platform
# This script prepares your application for AWS deployment

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

echo "🚀 Beam Affiliate Platform - AWS Deployment Preparation"
echo "======================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    error "Please run this script from the beam-affiliate-platform root directory"
fi

log "Project structure verified"

# Create AWS deployment package
echo ""
log "Creating AWS deployment package..."
DEPLOY_DIR="aws-deployment-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy backend files
log "📦 Preparing backend for AWS deployment..."
cp -r backend "$DEPLOY_DIR/"
rm -rf "$DEPLOY_DIR/backend/node_modules" 2>/dev/null || true
rm -rf "$DEPLOY_DIR/backend/.env*" 2>/dev/null || true

# Copy frontend files
log "📦 Preparing frontend for AWS deployment..."
cp -r frontend "$DEPLOY_DIR/"
rm -rf "$DEPLOY_DIR/frontend/node_modules" 2>/dev/null || true
rm -rf "$DEPLOY_DIR/frontend/.env*" 2>/dev/null || true

# Create AWS-specific configurations
log "⚙️ Creating AWS deployment configurations..."

# Backend environment for AWS
cat > "$DEPLOY_DIR/backend/.env.aws" << 'EOF'
# AWS Production Environment Variables
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:YourSecurePassword123!@beam-affiliate-db.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017/beam_affiliate?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
JWT_SECRET=beam-affiliate-super-secure-jwt-secret-key-2024-production-32-chars
JWT_EXPIRE=7d
FRONTEND_URL=https://affiliate.beamwallet.com
BACKEND_URL=https://api.affiliate.beamwallet.com
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=beam-affiliate@yourdomain.com
EMAIL_PASS=your-email-password
BEAM_WALLET_API_URL=https://api.beamwallet.com
BEAM_WALLET_API_KEY=your-beam-wallet-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

# Frontend environment for AWS
cat > "$DEPLOY_DIR/frontend/.env.aws" << 'EOF'
# AWS Production Environment Variables
REACT_APP_API_URL=https://api.affiliate.beamwallet.com
REACT_APP_ENVIRONMENT=production
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_publishable_key_here
EOF

# Create Elastic Beanstalk configuration
cat > "$DEPLOY_DIR/backend/.ebextensions/01-environment.config" << 'EOF'
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 5000
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: 18.x
  aws:elasticbeanstalk:container:nodejs:staticfiles:
    /public: public
  aws:autoscaling:launchconfiguration:
    InstanceType: t3.medium
  aws:autoscaling:asg:
    MinSize: 1
    MaxSize: 10
  aws:elasticbeanstalk:healthreporting:system:
    SystemType: enhanced
EOF

# Create Dockerfile for backend
cat > "$DEPLOY_DIR/backend/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start application
CMD ["npm", "start"]
EOF

# Create buildspec.yml for CodeBuild
cat > "$DEPLOY_DIR/buildspec.yml" << 'EOF'
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t beam-affiliate-backend .
      - docker tag beam-affiliate-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/beam-affiliate-backend:latest
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker image...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/beam-affiliate-backend:latest
artifacts:
  files:
    - '**/*'
EOF

# Create AWS deployment instructions
cat > "$DEPLOY_DIR/AWS_DEPLOYMENT_STEPS.md" << 'EOF'
# 🚀 AWS Deployment Steps - Beam Affiliate Platform

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Domain name (optional, can use AWS-provided URLs)

## Step 1: Database Setup (Amazon DocumentDB)

### 1.1 Create DocumentDB Cluster
```bash
aws docdb create-db-cluster \
    --db-cluster-identifier beam-affiliate-db \
    --engine docdb \
    --master-username admin \
    --master-user-password YourSecurePassword123! \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-subnet-group-name default \
    --backup-retention-period 7 \
    --preferred-backup-window 03:00-04:00 \
    --preferred-maintenance-window sun:04:00-sun:05:00
```

### 1.2 Update Environment Variables
Update the MONGODB_URI in backend/.env.aws with your actual DocumentDB endpoint.

## Step 2: Backend Deployment (AWS Elastic Beanstalk)

### 2.1 Create Application
```bash
aws elasticbeanstalk create-application \
    --application-name beam-affiliate-backend \
    --description "Beam Affiliate Platform Backend API"
```

### 2.2 Create Environment
```bash
aws elasticbeanstalk create-environment \
    --application-name beam-affiliate-backend \
    --environment-name beam-affiliate-prod \
    --solution-stack-name "64bit Amazon Linux 2 v5.6.0 running Node.js 18" \
    --option-settings Namespace=aws:autoscaling:launchconfiguration,OptionName=InstanceType,Value=t3.medium \
    --option-settings Namespace=aws:autoscaling:asg,OptionName=MinSize,Value=1 \
    --option-settings Namespace=aws:autoscaling:asg,OptionName=MaxSize,Value=10
```

### 2.3 Deploy Backend
```bash
cd backend
zip -r ../beam-affiliate-backend.zip . -x "node_modules/*" "*.log"

aws elasticbeanstalk create-application-version \
    --application-name beam-affiliate-backend \
    --version-label v1.0.0 \
    --source-bundle S3Bucket=your-deployment-bucket,S3Key=beam-affiliate-backend.zip

aws elasticbeanstalk update-environment \
    --environment-name beam-affiliate-prod \
    --version-label v1.0.0
```

## Step 3: Frontend Deployment (S3 + CloudFront)

### 3.1 Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 3.2 Create S3 Bucket
```bash
aws s3 mb s3://beam-affiliate-frontend --region us-east-1

aws s3 website s3://beam-affiliate-frontend \
    --index-document index.html \
    --error-document index.html
```

### 3.3 Upload Frontend
```bash
aws s3 sync build/ s3://beam-affiliate-frontend --delete

aws s3api put-bucket-policy --bucket beam-affiliate-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::beam-affiliate-frontend/*"
    }
  ]
}'
```

### 3.4 Create CloudFront Distribution
```bash
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "beam-affiliate-frontend-'$(date +%s)'",
  "Comment": "Beam Affiliate Platform Frontend",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-beam-affiliate-frontend",
        "DomainName": "beam-affiliate-frontend.s3-website-us-east-1.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-beam-affiliate-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}'
```

## Step 4: Domain Setup (Route 53)

### 4.1 Create Hosted Zone
```bash
aws route53 create-hosted-zone \
    --name your-domain.com \
    --caller-reference beam-affiliate-'$(date +%s)'
```

### 4.2 Create SSL Certificate
```bash
aws acm request-certificate \
    --domain-name your-domain.com \
    --subject-alternative-names www.your-domain.com \
    --validation-method DNS \
    --region us-east-1
```

## Step 5: Environment Variables

Update these environment variables in your Elastic Beanstalk environment:

### Backend Environment Variables
- NODE_ENV=production
- PORT=5000
- MONGODB_URI=your-documentdb-connection-string
- JWT_SECRET=your-super-secret-jwt-key
- FRONTEND_URL=https://your-domain.com
- BACKEND_URL=https://api.your-domain.com
- STRIPE_SECRET_KEY=your-stripe-secret-key
- BEAM_WALLET_API_KEY=your-beam-wallet-api-key

### Frontend Environment Variables
- REACT_APP_API_URL=https://api.your-domain.com
- REACT_APP_ENVIRONMENT=production
- REACT_APP_STRIPE_PUBLIC_KEY=your-stripe-public-key

## Step 6: Testing

### 6.1 Test Backend
```bash
curl https://your-backend-url.elasticbeanstalk.com/health
```

### 6.2 Test Frontend
Visit your CloudFront distribution URL or custom domain.

### 6.3 Test Full System
1. Register as reseller
2. Get affiliate links
3. Test click tracking
4. Create test sales
5. Verify commission calculations

## Your AWS URLs
- Frontend: https://your-domain.com
- Backend: https://api.your-domain.com
- API Docs: https://api.your-domain.com/api-docs

## Cost Estimation
- Small Scale (0-100 users): $150-200/month
- Medium Scale (100-1000 users): $400-800/month
- Large Scale (1000+ users): $1500-4000/month

## Support
For issues or questions, refer to the AWS_DEPLOYMENT_GUIDE.md file.
EOF

# Create zip file
log "📦 Creating deployment package..."
zip -r "$DEPLOY_DIR.zip" "$DEPLOY_DIR" > /dev/null 2>&1

echo ""
log "✅ AWS deployment package ready!"
echo ""
info "📁 Package: $DEPLOY_DIR.zip"
info "📋 Instructions: $DEPLOY_DIR/AWS_DEPLOYMENT_STEPS.md"
echo ""
info "🎯 NEXT STEPS:"
echo "1. Review AWS_DEPLOYMENT_GUIDE.md"
echo "2. Set up AWS account and credentials"
echo "3. Follow AWS_DEPLOYMENT_STEPS.md"
echo "4. Deploy database (DocumentDB)"
echo "5. Deploy backend (Elastic Beanstalk)"
echo "6. Deploy frontend (S3 + CloudFront)"
echo "7. Configure domain and SSL"
echo "8. Test your live system!"
echo ""
info "📱 Your client will have professional AWS-hosted URLs!"
echo ""
info "⏱️  Total deployment time: 2-3 days"
info "💰 Cost: $150-200/month (small scale)"
echo ""
log "🚀 Ready for AWS deployment!"
