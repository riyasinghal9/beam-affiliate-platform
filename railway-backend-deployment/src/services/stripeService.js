const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  constructor() {
    this.stripe = stripe;
    this.mockMode = false; // Disable mock mode to use real Stripe
  }

  // Create a payment intent for credit card payment
  async createPaymentIntent(amount, currency = 'usd', metadata = {}, paymentMethodId = null) {
    try {
      // Mock mode for development
      if (this.mockMode) {
        console.log('Using mock Stripe payment intent creation');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockPaymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockClientSecret = `pi_mock_${mockPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          success: true,
          clientSecret: mockClientSecret,
          paymentIntentId: mockPaymentIntentId,
          amount: amount,
          currency: currency
        };
      }

      // Real Stripe API call
      const paymentIntentData = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        metadata: metadata,
      };

      // If payment method is provided, attach it but don't confirm yet
      if (paymentMethodId) {
        paymentIntentData.payment_method = paymentMethodId;
        // Don't confirm immediately - let frontend handle confirmation
        // paymentIntentData.confirm = true;
        // paymentIntentData.return_url = 'http://localhost:3000/payment/success';
      } else {
        paymentIntentData.automatic_payment_methods = {
          enabled: true,
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentData);

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId, paymentMethodId = null) {
    try {
      // Mock mode for development
      if (this.mockMode) {
        console.log('Using mock Stripe payment confirmation');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          status: 'succeeded',
          amount: 75, // Mock amount
          currency: 'usd',
          paymentMethod: 'pm_mock_card',
          customer: 'cus_mock_customer'
        };
      }

      // Real Stripe API call
      let paymentIntent;
      
      if (paymentMethodId) {
        // Confirm the payment intent with the payment method
        paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethodId
        });
      } else {
        // Just retrieve the payment intent
        paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      }
      
      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
        customer: paymentIntent.customer
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process payment with payment method
  async processPayment(paymentMethodId, amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        payment_method: paymentMethodId,
        confirm: true,
        return_url: 'http://localhost:3000/payment/success',
        metadata: metadata
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: amount,
        currency: currency
      };
    } catch (error) {
      console.error('Stripe payment processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a customer
  async createCustomer(email, name, phone = null) {
    try {
      const customer = await this.stripe.customers.create({
        email: email,
        name: name,
        phone: phone
      });

      return {
        success: true,
        customerId: customer.id,
        customer: customer
      };
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get payment method details
  async getPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
      
      return {
        success: true,
        paymentMethod: paymentMethod
      };
    } catch (error) {
      console.error('Stripe payment method retrieval error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Refund payment
  async refundPayment(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId
      };
      
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundData);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100, // Convert from cents
        status: refund.status
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new StripeService(); 