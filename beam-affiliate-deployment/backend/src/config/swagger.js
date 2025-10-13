const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Beam Affiliate Platform API',
      version: '1.0.0',
      description: 'Complete API documentation for the Beam Affiliate Platform',
      contact: {
        name: 'Beam Affiliate Support',
        email: 'support@beamaffiliate.com',
        url: 'https://beamaffiliate.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.beamaffiliate.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        adminAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Admin authentication token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            resellerId: { type: 'string', example: 'RES123456' },
            level: { type: 'string', enum: ['Beginner', 'Active', 'Ambassador'], example: 'Active' },
            balance: { type: 'number', example: 1250.50 },
            totalSales: { type: 'number', example: 45 },
            totalEarnings: { type: 'number', example: 2250.75 },
            isActive: { type: 'boolean', example: true },
            isAdmin: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Sale: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            resellerId: { type: 'string', example: 'RES123456' },
            productName: { type: 'string', example: 'Beam Wallet Installation' },
            saleAmount: { type: 'number', example: 75.00 },
            commissionAmount: { type: 'number', example: 37.50 },
            status: { type: 'string', enum: ['pending', 'verified', 'rejected'], example: 'verified' },
            timestamp: { type: 'string', format: 'date-time' },
            customerEmail: { type: 'string', example: 'customer@example.com' }
          }
        },
        Commission: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            resellerId: { type: 'string', example: 'RES123456' },
            commissionAmount: { type: 'number', example: 37.50 },
            status: { type: 'string', enum: ['pending', 'approved', 'paid', 'rejected'], example: 'pending' },
            createdAt: { type: 'string', format: 'date-time' },
            paidAt: { type: 'string', format: 'date-time' }
          }
        },
        Click: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            resellerId: { type: 'string', example: 'RES123456' },
            productId: { type: 'string', example: 'PROD001' },
            timestamp: { type: 'string', format: 'date-time' },
            ipAddress: { type: 'string', example: '192.168.1.1' },
            userAgent: { type: 'string', example: 'Mozilla/5.0...' },
            referrer: { type: 'string', example: 'https://facebook.com' }
          }
        },
        Achievement: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            resellerId: { type: 'string', example: 'RES123456' },
            name: { type: 'string', example: 'First Sale' },
            points: { type: 'number', example: 100 },
            category: { type: 'string', example: 'sales' },
            awardedAt: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            resellerId: { type: 'string', example: 'RES123456' },
            amount: { type: 'number', example: 500.00 },
            method: { type: 'string', enum: ['beam_wallet', 'bank_transfer'], example: 'beam_wallet' },
            status: { type: 'string', enum: ['pending', 'completed', 'failed'], example: 'completed' },
            transactionId: { type: 'string', example: 'TXN123456' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error information' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management and profile operations'
      },
      {
        name: 'Sales',
        description: 'Sales tracking and management'
      },
      {
        name: 'Commissions',
        description: 'Commission calculation and management'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting endpoints'
      },
      {
        name: 'Payments',
        description: 'Payment processing and management'
      },
      {
        name: 'Gamification',
        description: 'Achievements, levels, and gamification features'
      },
      {
        name: 'Marketing',
        description: 'Marketing materials and automation'
      },
      {
        name: 'Admin',
        description: 'Admin-only operations and management'
      },
      {
        name: 'Security',
        description: 'Security and compliance endpoints'
      },
      {
        name: 'Webhooks',
        description: 'Webhook endpoints for external integrations'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 