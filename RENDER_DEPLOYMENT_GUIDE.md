# 🚀 Render.com Deployment Guide

## Quick Deploy to Render.com (No GitHub Required)

### Prerequisites
- Render.com account (free)
- Netlify account (free)
- MongoDB Atlas account (free)

---

## Step 1: Deploy Backend to Render.com

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with email (free tier available)
3. Verify your email

### 1.2 Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Choose **"Build and deploy from a Git repository"** OR **"Deploy an existing project"**
3. If using Git: Connect your repository
4. If not using Git: Upload the `backend` folder from the deployment package

### 1.3 Backend Configuration
```
Name: beam-affiliate-backend
Environment: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### 1.4 Environment Variables (Backend)
Add these in Render dashboard:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beam-affiliate
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-frontend-url.netlify.app
```

---

## Step 2: Deploy Frontend to Netlify

### 2.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)
3. Verify your email

### 2.2 Deploy Frontend
1. Go to **"Sites"** → **"Add new site"** → **"Deploy manually"**
2. Drag and drop the `frontend` folder from the deployment package
3. Wait for deployment to complete

### 2.3 Frontend Configuration
```
Build command: npm run build
Publish directory: build
```

### 2.4 Environment Variables (Frontend)
Add these in Netlify dashboard:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_ENVIRONMENT=production
```

---

## Step 3: Set Up MongoDB Atlas

### 3.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up (free)
3. Create a free cluster

### 3.2 Database Configuration
1. Create database: `beam-affiliate`
2. Create user with read/write permissions
3. Get connection string
4. Add to Render environment variables

---

## Step 4: Update URLs

### 4.1 Update Frontend URL in Backend
1. Go to Render dashboard
2. Update `FRONTEND_URL` environment variable
3. Redeploy backend

### 4.2 Update Backend URL in Frontend
1. Go to Netlify dashboard
2. Update `REACT_APP_API_URL` environment variable
3. Redeploy frontend

---

## Step 5: Test Your Deployment

### 5.1 Test Backend
```bash
curl https://your-backend-url.onrender.com/api/health
```

### 5.2 Test Frontend
1. Visit your Netlify URL
2. Try to register a new reseller
3. Check if affiliate links work

---

## 🎯 Your Live URLs Will Be:
- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-app-name.onrender.com`
- **API Docs**: `https://your-app-name.onrender.com/api-docs`

---

## 🔧 Troubleshooting

### Common Issues:
1. **Backend not starting**: Check environment variables
2. **Frontend not connecting**: Verify `REACT_APP_API_URL`
3. **Database connection**: Check MongoDB Atlas connection string
4. **CORS errors**: Ensure `FRONTEND_URL` is set correctly

### Support:
- Render docs: [render.com/docs](https://render.com/docs)
- Netlify docs: [docs.netlify.com](https://docs.netlify.com)
- MongoDB Atlas docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

## 🚀 Quick Start Commands

### For Backend (Render):
```bash
# Build command
npm install

# Start command  
npm start
```

### For Frontend (Netlify):
```bash
# Build command
npm run build

# Publish directory
build
```

---

## 📱 Client Testing Flow

1. **Register**: Visit frontend URL → Register as reseller
2. **Get Links**: Go to dashboard → Copy affiliate links
3. **Test Sales**: Use affiliate links → Make test purchases
4. **Verify**: Check dashboard for sales and earnings

---

**Total Deployment Time: ~15-20 minutes**
**Cost: $0 (using free tiers)**
