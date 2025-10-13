import axios from 'axios';

export interface PaymentData {
  amount: number;
  currency: string;
  resellerId: string;
  productId: string;
  customerEmail: string;
  customerName: string;
  paymentMethod: string;
}

export interface PaymentValidation {
  paymentId: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  amount: number;
  commission: number;
  resellerId: string;
  productId: string;
  customerEmail: string;
  customerName: string;
  paymentProof?: string;
  validatedAt?: Date;
  createdAt: Date;
}

class PaymentService {
  private baseURL = 'http://localhost:5001/api';

  // Create payment intent with Stripe
  async createPaymentIntent(paymentData: PaymentData) {
    try {
      const response = await axios.post(`${this.baseURL}/payments/create-intent`, paymentData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(paymentData: PaymentData) {
    try {
      const response = await axios.post(`${this.baseURL}/payments/process`, paymentData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Upload payment proof
  async uploadPaymentProof(paymentId: string, proofFile: File) {
    try {
      const formData = new FormData();
      formData.append('paymentProof', proofFile);
      
      const response = await axios.post(`${this.baseURL}/payments/${paymentId}/proof`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      throw error;
    }
  }

  // Validate payment
  async validatePayment(paymentId: string, validationData: any) {
    try {
      const response = await axios.post(`${this.baseURL}/payments/${paymentId}/validate`, validationData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating payment:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/payments/${paymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Get all payments for reseller
  async getResellerPayments(resellerId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/payments/reseller/${resellerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting reseller payments:', error);
      throw error;
    }
  }
}

export default new PaymentService(); 