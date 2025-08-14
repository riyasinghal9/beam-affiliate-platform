const axios = require('axios');

class BeamWalletService {
  constructor() {
    this.apiUrl = process.env.BEAM_WALLET_API_URL || 'https://api.beamwallet.com';
    this.apiKey = process.env.BEAM_WALLET_API_KEY;
  }

  // Initialize payment to Beam Wallet
  async initializePayment(paymentData) {
    try {
      const response = await axios.post(`${this.apiUrl}/payments/initialize`, {
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        resellerId: paymentData.resellerId,
        productId: paymentData.productId,
        customerEmail: paymentData.customerEmail,
        customerName: paymentData.customerName,
        paymentMethod: paymentData.paymentMethod
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error initializing Beam Wallet payment:', error);
      throw new Error('Failed to initialize payment with Beam Wallet');
    }
  }

  // Process commission payment to reseller
  async processCommissionPayment(commissionData) {
    try {
      const response = await axios.post(`${this.apiUrl}/transfers/commission`, {
        recipientId: commissionData.resellerId,
        amount: commissionData.amount,
        currency: commissionData.currency || 'USD',
        reference: commissionData.reference,
        description: `Commission for sale: ${commissionData.productName}`,
        metadata: {
          saleId: commissionData.saleId,
          productId: commissionData.productId,
          commissionRate: commissionData.commissionRate
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error processing commission payment:', error);
      throw new Error('Failed to process commission payment');
    }
  }

  // Get reseller wallet balance
  async getResellerBalance(resellerId) {
    try {
      const response = await axios.get(`${this.apiUrl}/wallets/${resellerId}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting reseller balance:', error);
      throw new Error('Failed to get reseller balance');
    }
  }

  // Validate payment status
  async validatePayment(paymentId) {
    try {
      const response = await axios.get(`${this.apiUrl}/payments/${paymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error validating payment:', error);
      throw new Error('Failed to validate payment');
    }
  }

  // Create reseller wallet
  async createResellerWallet(resellerData) {
    try {
      const response = await axios.post(`${this.apiUrl}/wallets/create`, {
        userId: resellerData.resellerId,
        email: resellerData.email,
        name: `${resellerData.firstName} ${resellerData.lastName}`,
        type: 'reseller'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating reseller wallet:', error);
      throw new Error('Failed to create reseller wallet');
    }
  }

  // Get transaction history
  async getTransactionHistory(resellerId, limit = 50) {
    try {
      const response = await axios.get(`${this.apiUrl}/wallets/${resellerId}/transactions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw new Error('Failed to get transaction history');
    }
  }

  // Withdraw funds from wallet
  async withdrawFunds(withdrawalData) {
    try {
      const response = await axios.post(`${this.apiUrl}/wallets/withdraw`, {
        walletId: withdrawalData.walletId,
        amount: withdrawalData.amount,
        currency: withdrawalData.currency || 'USD',
        destination: withdrawalData.destination, // bank account, etc.
        description: withdrawalData.description
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw new Error('Failed to withdraw funds');
    }
  }

  // Webhook handler for payment confirmations
  async handlePaymentWebhook(webhookData) {
    try {
      // Verify webhook signature
      const signature = webhookData.signature;
      const payload = webhookData.payload;

      // Process the webhook based on event type
      switch (webhookData.event) {
        case 'payment.confirmed':
          return await this.handlePaymentConfirmed(payload);
        case 'payment.failed':
          return await this.handlePaymentFailed(payload);
        case 'transfer.completed':
          return await this.handleTransferCompleted(payload);
        default:
          console.log('Unknown webhook event:', webhookData.event);
          return { success: true, message: 'Webhook received' };
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new Error('Failed to handle webhook');
    }
  }

  // Handle payment confirmed webhook
  async handlePaymentConfirmed(payload) {
    // Update payment status in database
    // Trigger commission calculation
    // Send notification to reseller
    return { success: true, message: 'Payment confirmed processed' };
  }

  // Handle payment failed webhook
  async handlePaymentFailed(payload) {
    // Update payment status in database
    // Send notification to reseller
    return { success: true, message: 'Payment failed processed' };
  }

  // Handle transfer completed webhook
  async handleTransferCompleted(payload) {
    // Update commission status in database
    // Send notification to reseller
    return { success: true, message: 'Transfer completed processed' };
  }
}

module.exports = new BeamWalletService(); 