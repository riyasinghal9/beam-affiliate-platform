import axios from 'axios';

export interface ResellerLevel {
  id: string;
  name: string;
  minSales: number;
  minEarnings: number;
  commissionBonus: number;
  benefits: string[];
  icon: string;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'sales' | 'earnings' | 'clicks' | 'conversions';
    value: number;
  };
  reward: {
    type: 'bonus' | 'badge' | 'feature';
    value: number | string;
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  requirements: {
    sales: number;
    earnings: number;
  };
  rewards: {
    bonusAmount: number;
    bonusPercentage: number;
  };
  isActive: boolean;
}

export interface LeaderboardEntry {
  resellerId: string;
  resellerName: string;
  sales: number;
  earnings: number;
  level: string;
  rank: number;
}

class GamificationService {
  private baseURL = 'http://localhost:5001/api';

  // Get reseller level information
  async getResellerLevel(resellerId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/gamification/level/${resellerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting reseller level:', error);
      throw error;
    }
  }

  // Get all available levels
  async getLevels(): Promise<ResellerLevel[]> {
    try {
      const response = await axios.get(`${this.baseURL}/gamification/levels`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting levels:', error);
      // Return default levels if API fails
      return [
        {
          id: '1',
          name: 'Beginner',
          minSales: 0,
          minEarnings: 0,
          commissionBonus: 0,
          benefits: ['Access to basic products', 'Standard commission rates'],
          icon: '🌱',
          color: 'text-green-600'
        },
        {
          id: '2',
          name: 'Active',
          minSales: 10,
          minEarnings: 500,
          commissionBonus: 25,
          benefits: ['Priority support', 'Higher commission rates', 'Access to premium products'],
          icon: '🚀',
          color: 'text-blue-600'
        },
        {
          id: '3',
          name: 'Ambassador',
          minSales: 50,
          minEarnings: 2500,
          commissionBonus: 50,
          benefits: ['VIP support', 'Maximum commission rates', 'Exclusive products', 'Mentorship program'],
          icon: '👑',
          color: 'text-purple-600'
        }
      ];
    }
  }

  // Get achievements for reseller
  async getAchievements(resellerId: string): Promise<Achievement[]> {
    try {
      const response = await axios.get(`${this.baseURL}/gamification/achievements/${resellerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting achievements:', error);
      // Return default achievements if API fails
      return [
        {
          id: '1',
          name: 'First Sale',
          description: 'Complete your first sale',
          icon: '🎯',
          requirement: { type: 'sales', value: 1 },
          reward: { type: 'bonus', value: 10 },
          isUnlocked: false
        },
        {
          id: '2',
          name: 'Sales Champion',
          description: 'Reach 10 sales',
          icon: '🏆',
          requirement: { type: 'sales', value: 10 },
          reward: { type: 'bonus', value: 50 },
          isUnlocked: false
        },
        {
          id: '3',
          name: 'Earnings Master',
          description: 'Earn $1000 in commissions',
          icon: '💰',
          requirement: { type: 'earnings', value: 1000 },
          reward: { type: 'bonus', value: 100 },
          isUnlocked: false
        },
        {
          id: '4',
          name: 'Conversion Expert',
          description: 'Achieve 20% conversion rate',
          icon: '📈',
          requirement: { type: 'conversions', value: 20 },
          reward: { type: 'badge', value: 'Conversion Expert' },
          isUnlocked: false
        }
      ];
    }
  }

  // Get active campaigns
  async getActiveCampaigns(): Promise<Campaign[]> {
    try {
      const response = await axios.get(`${this.baseURL}/gamification/campaigns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting campaigns:', error);
      // Return default campaigns if API fails
      return [
        {
          id: '1',
          name: 'Summer Sales Blitz',
          description: 'Earn extra bonuses for high performance this summer',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          requirements: { sales: 20, earnings: 1000 },
          rewards: { bonusAmount: 200, bonusPercentage: 10 },
          isActive: true
        },
        {
          id: '2',
          name: 'Newcomer Challenge',
          description: 'Special rewards for new resellers',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          requirements: { sales: 5, earnings: 250 },
          rewards: { bonusAmount: 50, bonusPercentage: 5 },
          isActive: true
        }
      ];
    }
  }

  // Get leaderboard
  async getLeaderboard(period: 'week' | 'month' | 'year' = 'month'): Promise<LeaderboardEntry[]> {
    try {
      const response = await axios.get(`${this.baseURL}/gamification/leaderboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      // Return mock leaderboard if API fails
      return [
        {
          resellerId: 'user1',
          resellerName: 'John Doe',
          sales: 45,
          earnings: 2250,
          level: 'Ambassador',
          rank: 1
        },
        {
          resellerId: 'user2',
          resellerName: 'Jane Smith',
          sales: 32,
          earnings: 1600,
          level: 'Active',
          rank: 2
        },
        {
          resellerId: 'user3',
          resellerName: 'Mike Johnson',
          sales: 28,
          earnings: 1400,
          level: 'Active',
          rank: 3
        }
      ];
    }
  }

  // Check and unlock achievements
  async checkAchievements(resellerId: string, stats: {
    sales: number;
    earnings: number;
    clicks: number;
    conversions: number;
  }) {
    try {
      const response = await axios.post(`${this.baseURL}/gamification/check-achievements`, {
        resellerId,
        stats
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Claim campaign reward
  async claimCampaignReward(resellerId: string, campaignId: string) {
    try {
      const response = await axios.post(`${this.baseURL}/gamification/campaigns/${campaignId}/claim`, {
        resellerId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error claiming campaign reward:', error);
      throw error;
    }
  }

  // Get progress towards next level
  calculateLevelProgress(currentStats: { sales: number; earnings: number }, nextLevel: ResellerLevel) {
    const salesProgress = Math.min((currentStats.sales / nextLevel.minSales) * 100, 100);
    const earningsProgress = Math.min((currentStats.earnings / nextLevel.minEarnings) * 100, 100);
    
    return {
      salesProgress,
      earningsProgress,
      overallProgress: Math.min(salesProgress, earningsProgress),
      salesRemaining: Math.max(0, nextLevel.minSales - currentStats.sales),
      earningsRemaining: Math.max(0, nextLevel.minEarnings - currentStats.earnings)
    };
  }

  // Calculate bonus based on level and performance
  calculateLevelBonus(baseCommission: number, level: ResellerLevel, salesCount: number) {
    let bonusMultiplier = 1 + (level.commissionBonus / 100);
    
    // Additional volume bonuses
    if (salesCount >= 100) {
      bonusMultiplier += 0.2; // 20% bonus for 100+ sales
    } else if (salesCount >= 50) {
      bonusMultiplier += 0.1; // 10% bonus for 50+ sales
    }
    
    return baseCommission * bonusMultiplier;
  }
}

export default new GamificationService(); 