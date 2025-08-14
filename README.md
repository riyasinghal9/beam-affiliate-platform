# Beam Affiliate Platform

## 🎯 **Project Vision**

Create an **accessible and intuitive platform** for anyone to start making money online, with:
- ✅ **No initial investment** required
- ✅ **No physical products** to manage  
- ✅ **No technical experience** needed
- ✅ **Just share links** and recommend Beam Wallet services

**Target Audience:**
- People looking to make money online legitimately
- Those who want to work from home or with their phone
- Users seeking platforms that pay real commissions
- Anyone wanting automatic digital income sources
- People with social networks, WhatsApp, groups or communities to monetize

## 🚀 **How It Works**

1. **User enters the platform** → Clicks "I Want to Start Winning"
2. **Creates free account** → Receives unique Reseller ID
3. **Dashboard shows products** → Beam Wallet services to resell
4. **System generates links** → With embedded reseller ID
5. **Reseller shares links** → Social media, groups, email, etc.
6. **Customer purchases** → System validates payment
7. **Commission released** → Direct to Beam Wallet automatically

## 💰 **Payment & Validation System**

### **Commission Rules:**
- ✅ **Only paid on real, confirmed payments**
- ✅ **Validation via payment APIs** (Stripe, Beam Pay, IBAN)
- ✅ **Manual proof upload** with team validation
- ✅ **Sale only assigned** if link contains valid reseller ID
- ✅ **Full transaction trail** with original ID tracking
- ✅ **Fraud prevention** via IP, device, and origin logging

### **Automatic Payments:**
- **Direct to Beam Wallet** from reseller's account
- **Weekly/monthly payment orders** to Beam Wallet
- **Instant payments** via bank account integration
- **Email/push notifications** for payment confirmations

---

A complete, professional affiliate marketing platform for Beam Wallet services. This platform allows resellers to earn commissions by promoting Beam Wallet products and services.

## 🚀 Features

### For Resellers
- **Easy Registration**: Quick signup with email or Beam number
- **Unique Reseller ID**: Automatic generation of unique affiliate identifiers
- **Personal Dashboard**: Real-time statistics and earnings overview
- **Affiliate Links**: Automatic generation of tracking links for each product
- **Commission Tracking**: Transparent commission calculation and payment tracking
- **Transaction History**: Complete sales and payment history
- **Profile Management**: Account settings and preferences

### For Customers
- **Secure Payment Processing**: Multiple payment methods (Beam Wallet, Stripe)
- **Product Catalog**: Clear product descriptions and pricing
- **Affiliate Link Tracking**: Automatic attribution to referring reseller
- **Payment Validation**: Secure payment verification system

### Platform Features
- **Real-time Analytics**: Sales tracking, click monitoring, conversion rates
- **Anti-fraud System**: IP tracking, device fingerprinting, duplicate detection
- **Automatic Payments**: Direct integration with Beam Wallet for instant payouts
- **Gamification**: Reseller levels and achievement system
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Heroicons** for icons
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Stripe** for payment processing
- **Nodemailer** for email notifications
- **Helmet** for security headers
- **Rate limiting** for API protection

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/beam-affiliate
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
BEAM_WALLET_API_KEY=your_beam_wallet_api_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm start
```

## 🏗️ Project Structure

```
beam-affiliate-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   └── Transaction.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── dashboard.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx
│   │   │       └── Footer.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── PaymentPage.tsx
│   │   ├── services/
│   │   │   └── authService.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `BEAM_WALLET_API_KEY`: Beam Wallet API key
- `EMAIL_USER`: Email service username
- `EMAIL_PASS`: Email service password
- `FRONTEND_URL`: Frontend application URL

### Database Models

#### User Model
- Basic info (name, email, phone)
- Reseller ID (unique identifier)
- Beam number (optional)
- Account level (Beginner, Active, Ambassador)
- Financial data (balance, earnings, sales)
- Statistics (clicks, conversions)

#### Product Model
- Product details (name, description, price)
- Commission rates
- Category classification
- Features and requirements

#### Transaction Model
- Sale tracking with reseller attribution
- Payment status and validation
- Commission calculation
- Fraud prevention data

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, DigitalOcean, AWS)
4. Set up SSL certificate

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, AWS S3)
3. Configure environment variables
4. Set up custom domain

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Cross-origin request security
- **Helmet Security**: HTTP headers protection
- **Input Validation**: Server-side validation
- **SQL Injection Protection**: MongoDB with Mongoose
- **XSS Protection**: Content Security Policy

## 📊 Analytics & Tracking

- **Click Tracking**: Monitor affiliate link clicks
- **Conversion Tracking**: Track sales from affiliate links
- **Fraud Detection**: IP tracking and device fingerprinting
- **Performance Metrics**: Conversion rates, earnings analysis
- **Real-time Dashboard**: Live statistics and updates

## 💰 Commission System

- **Configurable Rates**: Different commission rates per product
- **Automatic Calculation**: Real-time commission computation
- **Payment Validation**: Only pay on confirmed sales
- **Instant Payouts**: Direct Beam Wallet integration
- **Transparent Tracking**: Complete payment history

## 🎯 Business Logic

### Reseller Flow
1. User registers for free account
2. System generates unique reseller ID
3. Reseller accesses product catalog
4. System generates affiliate links with embedded ID
5. Reseller shares links on social media, email, etc.
6. Customer clicks link and makes purchase
7. System validates payment and records sale
8. Commission is calculated and credited to reseller
9. Payment is sent to reseller's Beam Wallet

### Payment Validation
- Real payment confirmation required
- Multiple validation methods (API, manual upload)
- Fraud prevention measures
- Duplicate transaction detection
- IP and device tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@beamaffiliate.com
- Documentation: [docs.beamaffiliate.com](https://docs.beamaffiliate.com)
- Community: [community.beamaffiliate.com](https://community.beamaffiliate.com)

## 🎉 Getting Started

1. Clone the repository
2. Follow the installation instructions
3. Configure your environment variables
4. Start both backend and frontend servers
5. Register your first reseller account
6. Start earning commissions!

---

**Built with ❤️ for the Beam Wallet ecosystem** 