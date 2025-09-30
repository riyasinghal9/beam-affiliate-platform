import axios from 'axios';

export interface ClickData {
  resellerId: string;
  productId: string;
  linkUrl: string;
  userAgent: string;
  ipAddress: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  timestamp: Date;
}

export interface SaleData {
  resellerId: string;
  productId: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  commission: number;
  clickId: string;
  paymentMethod: string;
  timestamp: Date;
  // Additional fields for backend compatibility
  productName?: string;
  commissionRate?: number;
  paymentId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface TrackingStats {
  totalClicks: number;
  totalSales: number;
  conversionRate: number;
  totalEarnings: number;
  uniqueVisitors: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    clicks: number;
    sales: number;
    earnings: number;
  }>;
}

class TrackingService {
  private baseURL = 'http://localhost:5001/api';

  // Track click on affiliate link
  async trackClick(clickData: ClickData) {
    try {
      const response = await axios.post(`${this.baseURL}/tracking/click`, clickData);
      return response.data;
    } catch (error) {
      console.error('Error tracking click:', error);
      throw error;
    }
  }

  // Track sale conversion
  async trackSale(saleData: SaleData) {
    try {
      const response = await axios.post(`${this.baseURL}/tracking/sale`, saleData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking sale:', error);
      throw error;
    }
  }

  // Get tracking statistics for reseller
  async getResellerStats(resellerId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const response = await axios.get(`${this.baseURL}/tracking/stats/${resellerId}?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting tracking stats:', error);
      throw error;
    }
  }

  // Get click history for reseller
  async getClickHistory(resellerId: string, limit: number = 50) {
    try {
      const response = await axios.get(`${this.baseURL}/tracking/clicks/${resellerId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting click history:', error);
      throw error;
    }
  }

  // Get conversion history for reseller
  async getConversionHistory(resellerId: string, limit: number = 50) {
    try {
      const response = await axios.get(`${this.baseURL}/tracking/conversions/${resellerId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting conversion history:', error);
      throw error;
    }
  }

  // Validate reseller ID from URL
  async validateResellerId(resellerId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/tracking/validate/${resellerId}`);
      return response.data;
    } catch (error) {
      console.error('Error validating reseller ID:', error);
      throw error;
    }
  }

  // Get fraud detection data
  async getFraudData(resellerId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/tracking/fraud/${resellerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting fraud data:', error);
      throw error;
    }
  }

  // Generate UTM parameters
  generateUTMParams(resellerId: string, productId: string, source: string = 'direct') {
    const baseUrl = `${window.location.origin}/payment`;
    const params = new URLSearchParams({
      v: productId,
      id: resellerId,
      utm_source: source,
      utm_medium: 'affiliate',
      utm_campaign: 'beam_wallet'
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Extract tracking data from URL
  extractTrackingData(url: string) {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return {
        resellerId: urlParams.get('id'),
        productId: urlParams.get('v'),
        utmSource: urlParams.get('utm_source'),
        utmMedium: urlParams.get('utm_medium'),
        utmCampaign: urlParams.get('utm_campaign')
      };
    } catch (error) {
      console.error('Error extracting tracking data:', error);
      return null;
    }
  }
}

export default new TrackingService(); 