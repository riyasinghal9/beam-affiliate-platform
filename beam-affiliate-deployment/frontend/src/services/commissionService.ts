import axios from 'axios';

export interface CommissionRule {
  productId: string;
  productName: string;
  baseCommission: number; // percentage
  bonusCommission?: number; // additional percentage for high performers
  minimumSales?: number; // minimum sales for bonus
  maxCommission?: number; // maximum commission cap
}

export interface CommissionTransaction {
  id: string;
  resellerId: string;
  productId: string;
  productName: string;
  saleAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  saleDate: Date;
  commissionDate?: Date;
  paymentDate?: Date;
  notes?: string;
}

export interface CommissionStats {
  totalEarnings: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalSales: number;
  averageCommission: number;
  commissionHistory: CommissionTransaction[];
}

class CommissionService {
  private baseURL = 'http://localhost:5001/api';

  // Calculate commission for a sale
  async calculateCommission(saleData: {
    resellerId: string;
    productId: string;
    saleAmount: number;
    resellerLevel: string;
  }) {
    try {
      const response = await axios.post(`${this.baseURL}/commissions/calculate`, saleData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw error;
    }
  }

  // Get commission rules for products
  async getCommissionRules() {
    try {
      const response = await axios.get(`${this.baseURL}/commissions/rules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting commission rules:', error);
      throw error;
    }
  }

  // Update commission rules
  async updateCommissionRules(rules: CommissionRule[]) {
    try {
      const response = await axios.put(`${this.baseURL}/commissions/rules`, rules, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating commission rules:', error);
      throw error;
    }
  }

  // Get commission statistics for reseller
  async getResellerCommissionStats(resellerId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const response = await axios.get(`${this.baseURL}/commissions/stats/${resellerId}?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting commission stats:', error);
      throw error;
    }
  }

  // Get commission history for reseller
  async getCommissionHistory(resellerId: string, limit: number = 50) {
    try {
      const response = await axios.get(`${this.baseURL}/commissions/history/${resellerId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting commission history:', error);
      throw error;
    }
  }

  // Approve commission for payment
  async approveCommission(commissionId: string, adminNotes?: string) {
    try {
      const response = await axios.post(`${this.baseURL}/commissions/${commissionId}/approve`, {
        adminNotes
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error approving commission:', error);
      throw error;
    }
  }

  // Reject commission
  async rejectCommission(commissionId: string, reason: string) {
    try {
      const response = await axios.post(`${this.baseURL}/commissions/${commissionId}/reject`, {
        reason
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting commission:', error);
      throw error;
    }
  }

  // Process commission payment
  async processCommissionPayment(commissionId: string) {
    try {
      const response = await axios.post(`${this.baseURL}/commissions/${commissionId}/pay`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error processing commission payment:', error);
      throw error;
    }
  }

  // Get pending commissions for admin
  async getPendingCommissions(limit: number = 50) {
    try {
      const response = await axios.get(`${this.baseURL}/commissions/pending?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting pending commissions:', error);
      throw error;
    }
  }

  // Calculate bonus commission based on performance
  calculateBonusCommission(baseCommission: number, salesCount: number, resellerLevel: string) {
    let bonusMultiplier = 1;

    // Level-based bonuses
    switch (resellerLevel) {
      case 'Ambassador':
        bonusMultiplier = 1.5;
        break;
      case 'Active':
        bonusMultiplier = 1.25;
        break;
      case 'Beginner':
        bonusMultiplier = 1.0;
        break;
    }

    // Volume-based bonuses
    if (salesCount >= 50) {
      bonusMultiplier += 0.5; // 50% bonus for 50+ sales
    } else if (salesCount >= 20) {
      bonusMultiplier += 0.25; // 25% bonus for 20+ sales
    } else if (salesCount >= 10) {
      bonusMultiplier += 0.1; // 10% bonus for 10+ sales
    }

    return baseCommission * bonusMultiplier;
  }

  // Get commission summary for dashboard
  async getCommissionSummary(resellerId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/commissions/summary/${resellerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting commission summary:', error);
      throw error;
    }
  }
}

export default new CommissionService(); 