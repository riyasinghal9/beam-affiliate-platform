const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Beam Affiliate Backend is running!',
    timestamp: new Date().toISOString() 
  });
});

// Test auth route
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    token: 'test-jwt-token',
    user: {
      id: '123',
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      resellerId: 'test123',
      level: 'Beginner',
      balance: 0,
      totalEarnings: 0,
      totalSales: 0
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    token: 'test-jwt-token',
    user: {
      id: '123',
      email: req.body.email,
      firstName: 'Test',
      lastName: 'User',
      resellerId: 'test123',
      level: 'Active',
      balance: 1250.75,
      totalEarnings: 8750.50,
      totalSales: 45
    }
  });
});

// Payment routes
app.post('/api/payments/create-intent', (req, res) => {
  const { productId, resellerId, customerEmail, customerName } = req.body;
  
  // Validate reseller ID
  if (!resellerId || resellerId === 'YOUR_ID') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reseller ID. Please use a valid affiliate link.'
    });
  }
  
  // Mock Stripe payment intent with enhanced tracking
  res.json({
    success: true,
    clientSecret: 'pi_test_client_secret_' + Date.now(),
    paymentId: 'PAY-' + Date.now() + '-TEST',
    tracking: {
      resellerId,
      productId,
      customerEmail,
      customerName,
      timestamp: new Date().toISOString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });
});

app.post('/api/payments/confirm', (req, res) => {
  res.json({
    success: true,
    message: 'Payment confirmed successfully',
    payment: {
      paymentId: req.body.paymentId,
      status: 'paid',
      adminApproval: 'pending'
    }
  });
});

// Admin payment routes
app.get('/api/payments/admin/all', (req, res) => {
  res.json({
    success: true,
    payments: [
      {
        paymentId: 'PAY-123456789-TEST',
        resellerId: 'test123',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        amount: 75,
        status: 'paid',
        adminApproval: 'pending',
        commissionAmount: 7.5,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/payments/admin/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalPayments: 15,
      pendingApprovals: 3,
      totalRevenue: 1250.75,
      totalCommissions: 125.08
    }
  });
});

app.put('/api/payments/admin/:paymentId/approve', (req, res) => {
  const { action, notes } = req.body;
  res.json({
    success: true,
    message: `Payment ${action}d successfully`,
    payment: {
      paymentId: req.params.paymentId,
      adminApproval: action === 'approve' ? 'approved' : 'rejected',
      status: action === 'approve' ? 'approved' : 'rejected',
      adminNotes: notes
    }
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
}); 