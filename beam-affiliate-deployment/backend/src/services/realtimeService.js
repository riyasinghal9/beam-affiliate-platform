const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class RealtimeService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket
    this.userRooms = new Map(); // userId -> room
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      
      // Store connected user
      this.connectedUsers.set(socket.userId, socket);
      
      // Join user's personal room
      const userRoom = `user_${socket.userId}`;
      socket.join(userRoom);
      this.userRooms.set(socket.userId, userRoom);

      // Join admin room if user is admin
      if (socket.user.isAdmin) {
        socket.join('admin_room');
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
        this.userRooms.delete(socket.userId);
      });

      // Handle custom events
      socket.on('join_campaign', (campaignId) => {
        socket.join(`campaign_${campaignId}`);
      });

      socket.on('leave_campaign', (campaignId) => {
        socket.leave(`campaign_${campaignId}`);
      });

      socket.on('typing_start', (data) => {
        socket.to(data.room).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.firstName
        });
      });

      socket.on('typing_stop', (data) => {
        socket.to(data.room).emit('user_stop_typing', {
          userId: socket.userId
        });
      });
    });

    console.log('Realtime service initialized');
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  // Send notification to multiple users
  sendToUsers(userIds, event, data) {
    const sentTo = [];
    userIds.forEach(userId => {
      if (this.sendToUser(userId, event, data)) {
        sentTo.push(userId);
      }
    });
    return sentTo;
  }

  // Send notification to all users in a room
  sendToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  // Send notification to all connected users
  sendToAll(event, data) {
    this.io.emit(event, data);
  }

  // Send notification to all admins
  sendToAdmins(event, data) {
    this.io.to('admin_room').emit(event, data);
  }

  // Commission payment notification
  sendCommissionPaymentNotification(userId, amount, transactionId) {
    const notification = {
      type: 'commission_payment',
      title: '💰 Commission Payment Received!',
      message: `$${amount.toFixed(2)} has been added to your balance`,
      data: {
        amount,
        transactionId,
        timestamp: new Date()
      },
      priority: 'high'
    };

    this.sendToUser(userId, 'notification', notification);
  }

  // Level up notification
  sendLevelUpNotification(userId, newLevel) {
    const notification = {
      type: 'level_up',
      title: '🎉 Level Up!',
      message: `Congratulations! You've reached ${newLevel} level!`,
      data: {
        newLevel,
        timestamp: new Date()
      },
      priority: 'high'
    };

    this.sendToUser(userId, 'notification', notification);
  }

  // Achievement unlocked notification
  sendAchievementNotification(userId, achievement) {
    const notification = {
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      message: `${achievement.name} - ${achievement.points} points earned!`,
      data: {
        achievement,
        timestamp: new Date()
      },
      priority: 'medium'
    };

    this.sendToUser(userId, 'notification', notification);
  }

  // New sale notification
  sendSaleNotification(userId, saleData) {
    const notification = {
      type: 'new_sale',
      title: '🛒 New Sale!',
      message: `Commission earned: $${saleData.commissionAmount.toFixed(2)}`,
      data: {
        saleData,
        timestamp: new Date()
      },
      priority: 'high'
    };

    this.sendToUser(userId, 'notification', notification);
  }

  // Campaign notification
  sendCampaignNotification(userIds, campaign) {
    const notification = {
      type: 'campaign',
      title: '🎯 New Campaign!',
      message: `${campaign.name} - Limited time opportunity!`,
      data: {
        campaign,
        timestamp: new Date()
      },
      priority: 'medium'
    };

    this.sendToUsers(userIds, 'notification', notification);
  }

  // System announcement
  sendSystemAnnouncement(message, priority = 'low') {
    const notification = {
      type: 'system_announcement',
      title: '📢 System Announcement',
      message,
      data: {
        timestamp: new Date()
      },
      priority
    };

    this.sendToAll('notification', notification);
  }

  // Admin notification
  sendAdminNotification(message, data = {}) {
    const notification = {
      type: 'admin_notification',
      title: '🔔 Admin Alert',
      message,
      data: {
        ...data,
        timestamp: new Date()
      },
      priority: 'high'
    };

    this.sendToAdmins('notification', notification);
  }

  // Real-time analytics update
  sendAnalyticsUpdate(userId, analyticsData) {
    this.sendToUser(userId, 'analytics_update', {
      data: analyticsData,
      timestamp: new Date()
    });
  }

  // Live chat message
  sendChatMessage(room, message) {
    this.sendToRoom(room, 'chat_message', {
      message,
      timestamp: new Date()
    });
  }

  // User online/offline status
  updateUserStatus(userId, status) {
    this.sendToAll('user_status_update', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  // Commission approval notification
  sendCommissionApprovalNotification(userId, commissionData) {
    const notification = {
      type: 'commission_approval',
      title: '✅ Commission Approved!',
      message: `Your commission of $${commissionData.amount.toFixed(2)} has been approved`,
      data: {
        commissionData,
        timestamp: new Date()
      },
      priority: 'high'
    };

    this.sendToUser(userId, 'notification', notification);
  }

  // Commission rejection notification
  sendCommissionRejectionNotification(userId, commissionData, reason) {
    const notification = {
      type: 'commission_rejection',
      title: '❌ Commission Rejected',
      message: `Commission rejected: ${reason}`,
      data: {
        commissionData,
        reason,
        timestamp: new Date()
      },
      priority: 'high'
    };

    this.sendToUser(userId, 'notification', notification);
  }

  // Fraud alert notification (admin only)
  sendFraudAlertNotification(fraudData) {
    const notification = {
      type: 'fraud_alert',
      title: '🚨 Fraud Alert',
      message: `Suspicious activity detected: ${fraudData.type}`,
      data: {
        fraudData,
        timestamp: new Date()
      },
      priority: 'critical'
    };

    this.sendToAdmins('notification', notification);
  }

  // Payment failure notification (admin only)
  sendPaymentFailureNotification(failureData) {
    const notification = {
      type: 'payment_failure',
      title: '💳 Payment Failure',
      message: `Payment failed for user ${failureData.resellerId}`,
      data: {
        failureData,
        timestamp: new Date()
      },
      priority: 'high'
    };

    this.sendToAdmins('notification', notification);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users list
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Broadcast to specific user type
  broadcastToUserType(userType, event, data) {
    const targetUsers = Array.from(this.connectedUsers.entries())
      .filter(([userId, socket]) => socket.user[userType])
      .map(([userId]) => userId);

    return this.sendToUsers(targetUsers, event, data);
  }

  // Send notification with retry
  async sendNotificationWithRetry(userId, event, data, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      if (this.sendToUser(userId, event, data)) {
        return true;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
    return false;
  }
}

module.exports = new RealtimeService(); 