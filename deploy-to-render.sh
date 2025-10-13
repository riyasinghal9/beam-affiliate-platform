#!/bin/bash

# 🚀 Deploy to Render.com Script
# This script prepares your app for Render.com deployment

echo "🚀 Preparing Beam Affiliate Platform for Render.com deployment..."

# Create deployment directory
mkdir -p render-deployment
cd render-deployment

# Copy backend files
echo "📦 Copying backend files..."
cp -r ../backend .
cp -r ../frontend .

# Create render.yaml for backend
echo "⚙️ Creating Render configuration..."
cat > backend/render.yaml << EOF
services:
  - type: web
    name: beam-affiliate-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        fromDatabase:
          name: beam-affiliate-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://your-frontend-url.netlify.app

databases:
  - name: beam-affiliate-db
    databaseName: beam-affiliate
    user: beam-user
EOF

# Create netlify.toml for frontend
echo "🌐 Creating Netlify configuration..."
cat > frontend/netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  REACT_APP_API_URL = "https://your-backend-url.onrender.com"
  REACT_APP_ENVIRONMENT = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

# Create environment template
echo "🔐 Creating environment template..."
cat > .env.template << EOF
# Backend Environment Variables (for Render.com)
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beam-affiliate
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-frontend-url.netlify.app

# Frontend Environment Variables (for Netlify)
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_ENVIRONMENT=production
EOF

# Create deployment instructions
echo "📋 Creating deployment instructions..."
cat > DEPLOYMENT_STEPS.md << EOF
# 🚀 Render.com Deployment Steps

## 1. Deploy Backend to Render.com
1. Go to [render.com](https://render.com)
2. Sign up (free)
3. Click "New +" → "Web Service"
4. Upload the \`backend\` folder
5. Use these settings:
   - Build Command: \`npm install\`
   - Start Command: \`npm start\`
   - Environment: Node
6. Add environment variables from \`.env.template\`

## 2. Deploy Frontend to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)
3. Drag & drop the \`frontend\` folder
4. Add environment variables from \`.env.template\`

## 3. Set Up MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Add to Render environment variables

## 4. Update URLs
1. Update \`FRONTEND_URL\` in Render with your Netlify URL
2. Update \`REACT_APP_API_URL\` in Netlify with your Render URL

## 5. Test
1. Visit your Netlify URL
2. Register as reseller
3. Test affiliate links
4. Verify sales tracking

Your app will be live at:
- Frontend: https://your-app.netlify.app
- Backend: https://your-app.onrender.com
EOF

echo "✅ Deployment package ready!"
echo "📁 Files created in: render-deployment/"
echo "📋 Follow instructions in: render-deployment/DEPLOYMENT_STEPS.md"
echo ""
echo "🎯 Next steps:"
echo "1. Go to render.com and deploy the backend folder"
echo "2. Go to netlify.com and deploy the frontend folder"
echo "3. Set up MongoDB Atlas"
echo "4. Update environment variables"
echo ""
echo "🚀 Your app will be live in ~15 minutes!"
