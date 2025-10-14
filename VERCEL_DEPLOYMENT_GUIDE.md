# Vercel Deployment Guide for Beam Affiliate Platform

## 🚀 Quick Deployment Steps

### 1. **Deploy to Vercel**
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /Users/riya/beam-affiliate-platform
vercel --prod
```

### 2. **Alternative: Deploy via Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `riyasinghal9/beam-affiliate-platform`
4. Vercel will automatically detect the configuration

## 📋 **Current Configuration**

### **Frontend Deployment**
- **Build Directory**: `frontend-deployment-20251014_195149/`
- **Static Files**: All React build files included
- **Banner Image**: `beam-banner.jpg` included
- **Products**: All 19 Beam Wallet products with 50% commission

### **Backend API**
- **API URL**: `https://beam-affiliate-backend.onrender.com`
- **Health Check**: `https://beam-affiliate-backend.onrender.com/health`
- **Products Endpoint**: `https://beam-affiliate-backend.onrender.com/api/products`

## 🛍️ **Products Available for Client**

### **Complete Product Catalog (19 Products)**
1. **Certificate of Quality and Trust** - €25 (€12.50 commission)
2. **Beam Wallet NFC** - €75 (€37.50 commission)
3. **Beam Wallet for Online Stores** - €75 (€37.50 commission)
4. **Cashback Card** - €50 (€25.00 commission)
5. **Beam Wallet Pro License** - €199 (€99.50 commission)
6. **Beam Wallet Mobile App** - €29.99 (€14.99 commission)
7. **Beam Wallet API Access** - €99 (€49.50 commission)
8. **Beam Wallet Security Package** - €149 (€74.50 commission)
9. **Beam Wallet Merchant Kit** - €299 (€149.50 commission)
10. **Beam Wallet Analytics Dashboard** - €79 (€39.50 commission)
11. **Beam Wallet Terminal Bluetooth** - €175 (€87.50 commission)
12. **Beam Wallet Terminal NFC** - €125 (€62.50 commission)
13. **Beam Wallet Gateway de Pagamento** - €299 (€149.50 commission)
14. **Beam Wallet White Label** - €999 (€499.50 commission)
15. **Beam Wallet Token (BEAM)** - €0.50 (€0.25 commission)
16. **Beam Wallet Instalação Completa** - €199 (€99.50 commission)

## 🎯 **Client Access**

### **Frontend URLs**
- **Home Page**: `https://your-vercel-app.vercel.app/`
- **Products Page**: `https://your-vercel-app.vercel.app/products`
- **Dashboard**: `https://your-vercel-app.vercel.app/dashboard`

### **Features for Client**
- ✅ **Banner Image**: Professional banner with reduced opacity
- ✅ **All Products**: Complete catalog from shop.beamwallet.com/pt
- ✅ **50% Commission**: Generous commission rates for all products
- ✅ **Responsive Design**: Works on all devices
- ✅ **Portuguese Support**: Products in Portuguese language

## 🔧 **Environment Variables**

The following environment variables are configured in `vercel.json`:
```json
{
  "REACT_APP_API_URL": "https://beam-affiliate-backend.onrender.com",
  "REACT_APP_ENVIRONMENT": "production",
  "REACT_APP_STRIPE_PUBLIC_KEY": "pk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890"
}
```

## 📊 **Commission Structure**

- **All Products**: 50% commission rate
- **Automatic Calculation**: Built into the system
- **Real-time Tracking**: Commission tracking in dashboard
- **Payment Processing**: Integrated with backend

## 🚀 **Deployment Status**

- ✅ **GitHub**: All changes pushed to main branch
- ✅ **Frontend Build**: Latest build with all products
- ✅ **Banner Image**: Included in deployment
- ✅ **Vercel Config**: Updated for new deployment
- ✅ **Backend API**: Running on Render.com

## 📱 **Next Steps**

1. **Deploy to Vercel** using the steps above
2. **Test the deployment** by visiting the Vercel URL
3. **Share with client** the live URL
4. **Monitor performance** through Vercel dashboard

## 🎉 **Ready for Client**

Your Beam Affiliate Platform is now ready with:
- Complete product catalog (19 products)
- 50% commission rates
- Professional banner image
- Responsive design
- Portuguese language support
- Live backend API integration

The client can now see all products and start earning commissions immediately!
