# 🚀 Beam Affiliate Platform - Live Deployment Instructions

## 🎯 **QUICK DEPLOYMENT FOR CLIENT DEMO**

Your client wants to see the reseller sales tracking functionality live. Here are the **EASIEST** ways to deploy:

---

## 🌟 **Option 1: Render.com (RECOMMENDED - 5 minutes)**

### **Step 1: Deploy Backend**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `beam-affiliate-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

6. **Environment Variables**:
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

7. Click "Create Web Service"

### **Step 2: Deploy Frontend**
1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `beam-affiliate-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://beam-affiliate-backend.onrender.com
   REACT_APP_ENVIRONMENT=production
   REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
   ```

5. Click "Create Static Site"

### **Step 3: Get Live URLs**
- **Frontend**: `https://beam-affiliate-frontend.onrender.com`
- **Backend**: `https://beam-affiliate-backend.onrender.com`
- **API Docs**: `https://beam-affiliate-backend.onrender.com/api-docs`

---

## 🌟 **Option 2: Netlify + Railway (Alternative)**

### **Frontend (Netlify)**
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Connect repository
5. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

### **Backend (Railway)**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Connect repository
5. Deploy using `railway.json` configuration

---

## 🌟 **Option 3: Vercel (Fastest)**

### **Deploy Both Services**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import repository
4. Configure:
   - **Frontend**: Auto-detected as React app
   - **Backend**: Add as separate project

---

## 🗄️ **Database Setup (MongoDB Atlas)**

### **Free MongoDB Database**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (free tier)
4. Get connection string
5. Update `MONGODB_URI` in your environment variables

**Example Connection String**:
```
mongodb+srv://username:password@cluster0.mongodb.net/beam_affiliate_prod?retryWrites=true&w=majority
```

---

## 🧪 **Testing the Live System**

### **1. Test Reseller Registration**
- Go to your live frontend URL
- Register as a new reseller
- Verify you get a unique reseller ID

### **2. Test Affiliate Link Generation**
- Login to reseller dashboard
- Check "Products" section
- Verify affiliate links are generated with your reseller ID

### **3. Test Click Tracking**
- Click on an affiliate link
- Check reseller stats to see click count increase

### **4. Test Sale Attribution**
- Use the tracking API to simulate a sale
- Verify sale appears in reseller dashboard
- Check commission calculation

### **5. Test Dashboard Analytics**
- View reseller dashboard
- Check all metrics are updating correctly
- Verify charts and graphs display data

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

## 🔧 **Quick Fixes for Common Issues**

### **CORS Issues**
Add to backend environment:
```
CORS_ORIGIN=https://your-frontend-url.com
```

### **Database Connection Issues**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has proper permissions

### **Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check for TypeScript errors

---

## 📞 **Support**

If you encounter issues:
1. Check the deployment logs in your hosting platform
2. Verify environment variables are set correctly
3. Test API endpoints directly using curl or Postman
4. Check browser console for frontend errors

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
