import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PWAService from './components/PWAService';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Training from './pages/Training';
import Analytics from './pages/Analytics';
import Withdraw from './pages/Withdraw';
import Gamification from './pages/Gamification';
import MarketingMaterials from './pages/MarketingMaterials';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminPayments from './pages/AdminPayments';
import ResellerOnboarding from './pages/ResellerOnboarding';
import ResellerDashboard from './pages/ResellerDashboard';
import PaymentProof from './pages/PaymentProof';
import PaymentProcessor from './pages/PaymentProcessor';
import PaymentSuccess from './pages/PaymentSuccess';
import EmailTemplateBuilder from './pages/EmailTemplateBuilder';
import CreateCampaign from './pages/CreateCampaign';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!user.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const ResellerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!user.isReseller) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <RealtimeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <PWAService />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
              <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
              <Route path="/reset-password" element={user ? <Navigate to="/" /> : <ResetPassword />} />
              <Route path="/pay" element={<PaymentPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/process-payment" element={<PaymentProcessor />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/reseller-onboarding" element={<ResellerOnboarding />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/products" element={<Products />} />
              <Route path="/transactions" element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/training" element={
                <PrivateRoute>
                  <Training />
                </PrivateRoute>
              } />
              <Route path="/analytics" element={
                <PrivateRoute>
                  <Analytics />
                </PrivateRoute>
              } />
              <Route path="/withdraw" element={
                <PrivateRoute>
                  <Withdraw />
                </PrivateRoute>
              } />
              <Route path="/gamification" element={
                <PrivateRoute>
                  <Gamification />
                </PrivateRoute>
              } />
              <Route path="/marketing" element={
                <PrivateRoute>
                  <MarketingMaterials />
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/payments" element={
                <AdminRoute>
                  <AdminPayments />
                </AdminRoute>
              } />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              {/* Reseller Routes */}
              <Route path="/reseller-dashboard" element={
                <ResellerRoute>
                  <ResellerDashboard />
                </ResellerRoute>
              } />
              <Route path="/payment-proof" element={
                <ResellerRoute>
                  <PaymentProof />
                </ResellerRoute>
              } />
              
              {/* Email Marketing Routes */}
              <Route path="/email-template-builder" element={
                <PrivateRoute>
                  <EmailTemplateBuilder />
                </PrivateRoute>
              } />
              <Route path="/create-campaign" element={
                <PrivateRoute>
                  <CreateCampaign />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </RealtimeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
