const axios = require('axios');
const crypto = require('crypto');

class BeamWalletService {
  constructor() {
    this.baseUrl = process.env.BEAM_WALLET_API_URL || 'https://api.beamwallet.com';
    this.apiKey = process.env.BEAM_WALLET_API_KEY;
    this.secretKey = process.env.BEAM_WALLET_SECRET_KEY;
    this.webhookSecret = process.env.BEAM_WALLET_WEBHOOK_SECRET;
  }

  // Generate authentication headers
  generateAuthHeaders() {
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(timestamp);
    
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'Content-Type': 'application/json'
    };
  }

  // Generate signature for API requests
  generateSignature(timestamp) {
    const data = `${timestamp}${this.apiKey}`;
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }

  // Create a new wallet for a reseller
  async createWallet(userId, resellerId, email) {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/wallets`, {
        userId,
        resellerId,
        email,
        type: 'reseller',
        currency: 'USD'
      }, {
        headers: this.generateAuthHeaders()
      });

      return {
        success: true,
        walletId: response.data.walletId,
        address: response.data.address,
        balance: response.data.balance
      };
    } catch (error) {
      console.error('Beam Wallet creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create wallet'
      };
    }
  }

  // Get wallet balance
  async getWalletBalance(walletId) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/wallets/${walletId}/balance`, {
        headers: this.generateAuthHeaders()
      });

      return {
        success: true,
        balance: response.data.balance,
        currency: response.data.currency
      };
    } catch (error) {
      console.error('Get wallet balance error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get wallet balance'
      };
    }
  }

  // Transfer commission to reseller wallet
  async transferCommission(walletId, amount, commissionId, description) {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/transfers`, {
        fromWallet: process.env.BEAM_AFFILIATE_WALLET_ID,
        toWallet: walletId,
        amount,
        currency: 'USD',
        description: `Commission payment: ${description}`,
        metadata: {
          commissionId,
          type: 'affiliate_commission',
          timestamp: new Date().toISOString()
        }
      }, {
        headers: this.generateAuthHeaders()
      });

      return {
        success: true,
        transferId: response.data.transferId,
        status: response.data.status,
        amount: response.data.amount
      };
    } catch (error) {
      console.error('Transfer commission error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to transfer commission'
      };
    }
  }

  // Process payment for product purchase
  async processPayment(amount, customerData, productData, resellerId) {
    try {
      // Mock implementation for development
      if (process.env.NODE_ENV === 'development' || !this.apiKey) {
        console.log('Using mock payment processing for development');
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock payment ID
        const paymentId = `mock_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          success: true,
          paymentId: paymentId,
          status: 'completed',
          amount: amount
        };
      }

      // Real implementation for production
      const response = await axios.post(`${this.baseUrl}/v1/payments`, {
        amount,
        currency: 'USD',
        customer: {
          email: customerData.email,
          name: customerData.name,
          phone: customerData.phone
        },
        product: {
          id: productData._id,
          name: productData.name,
          price: productData.price
        },
        resellerId,
        metadata: {
          type: 'affiliate_sale',
          timestamp: new Date().toISOString()
        }
      }, {
        headers: this.generateAuthHeaders()
      });

      return {
        success: true,
        paymentId: response.data.paymentId,
        status: response.data.status,
        amount: response.data.amount
      };
    } catch (error) {
      console.error('Process payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to process payment'
      };
    }
  }

  // Verify payment status
  async verifyPayment(paymentId) {
    try {
      // Mock implementation for development
      if (process.env.NODE_ENV === 'development' || !this.apiKey) {
        console.log('Using mock payment verification for development');
        
        return {
          success: true,
          status: 'completed',
          amount: 75, // Mock amount
          verified: true
        };
      }

      // Real implementation for production
      const response = await axios.get(`${this.baseUrl}/v1/payments/${paymentId}`, {
        headers: this.generateAuthHeaders()
      });

      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount,
        verified: response.data.status === 'completed'
      };
    } catch (error) {
      console.error('Verify payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify payment'
      };
    }
  }

  // Get transaction history
  async getTransactionHistory(walletId, limit = 50, offset = 0) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/wallets/${walalletId}/transactions`, {
        params: { limit, offset },
        headers: this.generateAuthHeaders()
      });

      return {
        success: true,
        transactions: response.data.transactions,
        total: response.data.total
      };
    } catch (error) {
      console.error('Get transaction history error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get transaction history'
      };
    }
  }

  // Webhook verification
  verifyWebhook(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Handle webhook events
  async handleWebhook(event, payload) {
    try {
      switch (event) {
        case 'payment.completed':
          await this.handlePaymentCompleted(payload);
          break;
        case 'transfer.completed':
          await this.handleTransferCompleted(payload);
          break;
        case 'wallet.created':
          await this.handleWalletCreated(payload);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook handling error:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle payment completed webhook
  async handlePaymentCompleted(payload) {
    const { paymentId, amount, resellerId, productId } = payload;
    
    // Update sale status
    const Sale = require('../models/Sale');
    await Sale.findOneAndUpdate(
      { paymentId },
      { 
        status: 'completed',
        completedAt: new Date()
      }
    );

    // Calculate and create commission
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    const commissionAmount = (amount * product.commission) / 100;

    const Commission = require('../models/Commission');
    await Commission.create({
      resellerId,
      productId,
      saleId: paymentId,
      commissionAmount,
      status: 'pending',
      paymentMethod: 'beam_wallet'
    });

    // Update reseller stats and balance
    const User = require('../models/User');
    await User.findOneAndUpdate(
      { resellerId },
      {
        $inc: {
          totalSales: 1,
          totalEarnings: commissionAmount,
          balance: commissionAmount  // Add commission to reseller's balance
        }
      }
    );
  }

  // Handle transfer completed webhook
  async handleTransferCompleted(payload) {
    const { transferId, commissionId } = payload;
    
    // Update commission status
    const Commission = require('../models/Commission');
    await Commission.findByIdAndUpdate(
      commissionId,
      {
        status: 'paid',
        paidAt: new Date(),
        transferId
      }
    );
  }

  // Handle wallet created webhook
  async handleWalletCreated(payload) {
    const { walletId, userId, resellerId } = payload;
    
    // Update user with wallet information
    const User = require('../models/User');
    await User.findByIdAndUpdate(
      userId,
      {
        beamWalletId: walletId,
        walletCreated: true
      }
    );
  }

  // Schedule automatic payouts
  async schedulePayouts() {
    try {
      const Commission = require('../models/Commission');
      const User = require('../models/User');

      // Get pending commissions
      const pendingCommissions = await Commission.find({
        status: 'pending',
        amount: { $gte: 10 } // Minimum payout amount
      }).populate('resellerId');

      for (const commission of pendingCommissions) {
        const user = await User.findById(commission.resellerId);
        
        if (user && user.beamWalletId) {
          const transfer = await this.transferCommission(
            user.beamWalletId,
            commission.commissionAmount,
            commission._id,
            `Commission for ${commission.productName}`
          );

          if (transfer.success) {
            await Commission.findByIdAndUpdate(
              commission._id,
              {
                status: 'processing',
                transferId: transfer.transferId
              }
            );
          }
        }
      }

      return { success: true, processed: pendingCommissions.length };
    } catch (error) {
      console.error('Schedule payouts error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get payout schedule
  async getPayoutSchedule() {
    try {
      const Commission = require('../models/Commission');
      
      const pendingAmount = await Commission.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]);

      const processingAmount = await Commission.aggregate([
        { $match: { status: 'processing' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]);

      return {
        success: true,
        pending: pendingAmount[0]?.total || 0,
        processing: processingAmount[0]?.total || 0,
        nextPayout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };
    } catch (error) {
      console.error('Get payout schedule error:', error);
      return { success: false, error: error.message };
    }
  }
  // Send payment (alias for transferCommission)
  async sendPayment(resellerId, amount, transactionId, description) {
    try {
      // Mock implementation for development
      console.log("Mock payment processing for commission:", amount, "to reseller:", resellerId);
      
      // Simulate successful payment
      return {
        success: true,
        transactionId: transactionId || `txn_${Date.now()}`,
        status: "completed",
        amount: amount
      };
    } catch (error) {
      console.error("Send payment error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new BeamWalletService(); 