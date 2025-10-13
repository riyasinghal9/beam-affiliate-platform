# 🚀 Railway Backend Deployment Instructions

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
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://beamaffiliate:beam123456@cluster0.mongodb.net/beam_affiliate_prod?retryWrites=true&w=majority
JWT_SECRET=beam-affiliate-super-secure-jwt-secret-key-2024-production-32-chars
FRONTEND_URL=https://beam-affiliate-platform-7bha.vercel.app
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=beamaffiliate.test@gmail.com
SMTP_PASS=beamaffiliate123456
```

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

## What's Ready
✅ Backend code is ready
✅ Package.json configured
✅ Railway configuration ready
✅ Environment variables template ready
✅ MongoDB connection string ready
✅ All dependencies included

## Next Steps
1. Deploy to Railway or Render
2. Get your backend URL
3. Update Vercel environment variables
4. Test your products page!
