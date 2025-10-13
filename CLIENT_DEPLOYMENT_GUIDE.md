# 🚀 CLIENT DEPLOYMENT GUIDE - Beam Affiliate Platform

## ⚡ **QUICK DEPLOYMENT (15 minutes)**

Your Beam Affiliate Platform is ready to deploy! Follow these steps to get live URLs for your client.

---

## 📋 **Step 1: Deploy Backend to Render.com**

### 1.1 Create Render Account
1. Go to **[render.com](https://render.com)**
2. Sign up with email (free)
3. Verify your email

### 1.2 Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Choose **"Build and deploy from a Git repository"** (if you have GitHub) OR **"Deploy an existing project"**
3. If using Git: Connect your repository
4. If not using Git: Upload the `backend` folder

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
```

### 1.5 Deploy
Click **"Create Web Service"** and wait for deployment (5-10 minutes)

---

## 📋 **Step 2: Deploy Frontend to Render.com**

### 2.1 Deploy Frontend
1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your repository or upload the `frontend` folder
3. Configure:
   - **Name**: `beam-affiliate-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### 2.2 Environment Variables (Frontend)
Add these in Render dashboard:
```
REACT_APP_API_URL=https://beam-affiliate-backend.onrender.com
REACT_APP_ENVIRONMENT=production
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
```

### 2.3 Deploy
Click **"Create Static Site"** and wait for deployment (5-10 minutes)

---

## 📋 **Step 3: Set Up MongoDB Atlas (Free Database)**

### 3.1 Create MongoDB Atlas Account
1. Go to **[mongodb.com/atlas](https://mongodb.com/atlas)**
2. Sign up (free)
3. Create a free cluster

### 3.2 Database Configuration
1. Create database: `beam_affiliate_prod`
2. Create user with read/write permissions
3. Get connection string
4. Update `MONGODB_URI` in Render backend environment variables

### 3.3 Example Connection String
```
mongodb+srv://username:password@cluster0.mongodb.net/beam_affiliate_prod?retryWrites=true&w=majority
```

---

## 📋 **Step 4: Update URLs**

### 4.1 Get Your Actual URLs
After deployment, you'll get URLs like:
- **Backend**: `https://beam-affiliate-backend-xyz.onrender.com`
- **Frontend**: `https://beam-affiliate-frontend-abc.onrender.com`

### 4.2 Update Environment Variables
1. **Backend**: Update `FRONTEND_URL` with your actual frontend URL
2. **Frontend**: Update `REACT_APP_API_URL` with your actual backend URL
3. **Redeploy both services**

---

## 🧪 **Step 5: Test Your Live System**

### 5.1 Test Reseller Registration
1. Visit your frontend URL
2. Register as a new reseller
3. Verify you get a unique reseller ID

### 5.2 Test Affiliate Link Generation
1. Login to reseller dashboard
2. Check "Products" section
3. Verify affiliate links are generated with your reseller ID

### 5.3 Test Click Tracking
1. Click on an affiliate link
2. Check reseller stats to see click count increase

### 5.4 Test Sale Attribution
1. Use the tracking API to simulate a sale
2. Verify sale appears in reseller dashboard
3. Check commission calculation

### 5.5 Test Dashboard Analytics
1. View reseller dashboard
2. Check all metrics are updating correctly
3. Verify charts and graphs display data

---

## 📱 **Client Demo Flow**

### **For Your Client to Test:**

1. **Register as Reseller**
   - Go to live URL
   - Sign up with test email
   - Get reseller ID (e.g., `C15D4A`)

2. **Get Affiliate Links**
   - Login to dashboard
   - Go to Products section
   - Copy affiliate links

3. **Test Click Tracking**
   - Click affiliate links
   - See click count increase in dashboard

4. **Test Sales**
   - Use API to create test sales
   - See sales appear in dashboard
   - Verify commission calculations

5. **View Analytics**
   - Check dashboard metrics
   - View recent sales
   - See performance charts

---

## 🎯 **Your Live URLs Will Be:**
- **Frontend**: `https://beam-affiliate-frontend-abc.onrender.com`
- **Backend**: `https://beam-affiliate-backend-xyz.onrender.com`
- **API Docs**: `https://beam-affiliate-backend-xyz.onrender.com/api-docs`

---

## 🔧 **Troubleshooting**

### Common Issues:
1. **Backend not starting**: Check environment variables
2. **Frontend not connecting**: Verify `REACT_APP_API_URL`
3. **Database connection**: Check MongoDB Atlas connection string
4. **CORS errors**: Ensure `FRONTEND_URL` is set correctly

### Support:
- Render docs: [render.com/docs](https://render.com/docs)
- MongoDB Atlas docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

## 🎉 **Success!**

Once deployed, your client will have:
- ✅ Live reseller registration
- ✅ Real-time affiliate link generation
- ✅ Click tracking functionality
- ✅ Sale attribution system
- ✅ Commission calculation
- ✅ Dashboard analytics
- ✅ Complete sales tracking workflow

**Your reseller sales tracking system will be fully functional and accessible via live URLs!** 🚀

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check the deployment logs in Render dashboard
2. Verify environment variables are set correctly
3. Test API endpoints directly using curl or Postman
4. Check browser console for frontend errors

**Total Deployment Time: ~15-20 minutes**
**Cost: $0 (using free tiers)**

