const fs = require('fs');
const path = require('path');

class APIDocumentationService {
  constructor() {
    this.specification = {
      openapi: '3.0.0',
      info: {
        title: 'Beam Affiliate Platform API',
        description: 'Comprehensive API for the Beam Affiliate Platform with advanced features for resellers, payments, training, and analytics.',
        version: '1.0.0',
        contact: {
          name: 'Beam Affiliate Support',
          email: 'support@beamaffiliate.com',
          url: 'https://beamaffiliate.com/support'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: 'http://localhost:5000/api',
          description: 'Development server'
        },
        {
          url: 'https://api.beamaffiliate.com/api',
          description: 'Production server'
        }
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        parameters: {},
        responses: {}
      },
      tags: []
    };

    this.initializeSpecification();
  }

  // Initialize API specification
  initializeSpecification() {
    this.addTags();
    this.addSchemas();
    this.addPaths();
    this.addResponses();
  }

  // Add API tags
  addTags() {
    this.specification.tags = [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management and profile operations'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard data and analytics'
      },
      {
        name: 'Payments',
        description: 'Payment processing and management'
      },
      {
        name: 'Commissions',
        description: 'Commission tracking and calculations'
      },
      {
        name: 'Training',
        description: 'Training courses and progress tracking'
      },
      {
        name: 'Analytics',
        description: 'Advanced analytics and reporting'
      },
      {
        name: 'Marketing',
        description: 'Marketing automation and campaigns'
      },
      {
        name: 'Security',
        description: 'Security and compliance endpoints'
      },
      {
        name: 'Admin',
        description: 'Administrative operations'
      }
    ];
  }

  // Add schemas
  addSchemas() {
    this.specification.components.schemas = {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          resellerId: { type: 'string', example: 'RS001' },
          level: { type: 'string', enum: ['Beginner', 'Active', 'Ambassador'], example: 'Active' },
          balance: { type: 'number', example: 1250.50 },
          totalSales: { type: 'number', example: 45 },
          totalEarnings: { type: 'number', example: 2500.00 },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Payment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          amount: { type: 'number', example: 100.00 },
          currency: { type: 'string', example: 'USD' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed'], example: 'completed' },
          method: { type: 'string', example: 'stripe' },
          transactionId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Commission: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          resellerId: { type: 'string' },
          productId: { type: 'string' },
          commissionAmount: { type: 'number', example: 25.00 },
          commissionRate: { type: 'number', example: 10 },
          status: { type: 'string', enum: ['pending', 'approved', 'paid'], example: 'pending' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Course: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Advanced Affiliate Marketing' },
          description: { type: 'string' },
          category: { type: 'string', example: 'affiliate-marketing' },
          level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          duration: { type: 'number', example: 120 },
          lessons: { type: 'array', items: { type: 'string' } },
          progress: { type: 'number', example: 75 },
          isCompleted: { type: 'boolean', example: false }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Invalid request' },
          code: { type: 'string', example: 'VALIDATION_ERROR' }
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
    };
  }

  // Add API paths
  addPaths() {
    // Authentication endpoints
    this.addPath('/auth/register', {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'password'],
                properties: {
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' },
                  phone: { type: 'string', example: '+1234567890' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    });

    this.addPath('/auth/login', {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', example: 'jwt_token_here' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    });

    // Dashboard endpoints
    this.addPath('/dashboard', {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard data',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Dashboard data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalEarnings: { type: 'number', example: 2500.00 },
                        totalSales: { type: 'number', example: 45 },
                        monthlyEarnings: { type: 'number', example: 500.00 },
                        pendingCommissions: { type: 'number', example: 150.00 },
                        recentActivity: { type: 'array', items: { type: 'object' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Payments endpoints
    this.addPath('/payments', {
      get: {
        tags: ['Payments'],
        summary: 'Get user payments',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: { type: 'integer', default: 10 }
          }
        ],
        responses: {
          '200': {
            description: 'Payments retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    payments: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Payment' }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 25 },
                        pages: { type: 'integer', example: 3 }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Training endpoints
    this.addPath('/training/courses', {
      get: {
        tags: ['Training'],
        summary: 'Get training courses',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Courses retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    courses: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Course' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Analytics endpoints
    this.addPath('/analytics', {
      get: {
        tags: ['Analytics'],
        summary: 'Get analytics data',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'period',
            in: 'query',
            description: 'Time period for analytics',
            schema: {
              type: 'string',
              enum: ['7d', '30d', '90d', '1y'],
              default: '30d'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Analytics data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        sales: { type: 'array', items: { type: 'object' } },
                        earnings: { type: 'array', items: { type: 'object' } },
                        conversions: { type: 'array', items: { type: 'object' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Admin endpoints
    this.addPath('/admin/users', {
      get: {
        tags: ['Admin'],
        summary: 'Get all users (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            }
          },
          '403': {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    });
  }

  // Add path to specification
  addPath(path, methods) {
    this.specification.paths[path] = methods;
  }

  // Add responses
  addResponses() {
    this.specification.components.responses = {
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Authentication required' },
                code: { type: 'string', example: 'UNAUTHORIZED' }
              }
            }
          }
        }
      },
      Forbidden: {
        description: 'Access denied',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Access denied' },
                code: { type: 'string', example: 'FORBIDDEN' }
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Resource not found' },
                code: { type: 'string', example: 'NOT_FOUND' }
              }
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Validation failed' },
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', example: 'email' },
                      message: { type: 'string', example: 'Invalid email format' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  // Get API specification
  getSpecification() {
    return this.specification;
  }

  // Generate documentation
  generateDocumentation() {
    try {
      const docsPath = path.join(__dirname, '../docs');
      
      // Create docs directory if it doesn't exist
      if (!fs.existsSync(docsPath)) {
        fs.mkdirSync(docsPath, { recursive: true });
      }

      // Write OpenAPI specification
      const specPath = path.join(docsPath, 'openapi.json');
      fs.writeFileSync(specPath, JSON.stringify(this.specification, null, 2));

      // Generate HTML documentation
      this.generateHTMLDocs();

      // Generate Postman collection
      this.generatePostmanCollection();

      console.log('✅ API documentation generated successfully');
      return {
        success: true,
        files: ['openapi.json', 'api-docs.html', 'postman-collection.json']
      };
    } catch (error) {
      console.error('Generate documentation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate HTML documentation
  generateHTMLDocs() {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beam Affiliate Platform API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
    <style>
        body { margin: 0; padding: 0; }
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #2563eb; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
    <script>
        window.onload = function() {
            SwaggerUIBundle({
                url: './openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;

    const htmlPath = path.join(__dirname, '../docs/api-docs.html');
    fs.writeFileSync(htmlPath, htmlTemplate);
  }

  // Generate Postman collection
  generatePostmanCollection() {
    const collection = {
      info: {
        name: 'Beam Affiliate Platform API',
        description: 'Complete API collection for Beam Affiliate Platform',
        version: '1.0.0'
      },
      item: []
    };

    // Add authentication requests
    collection.item.push({
      name: 'Authentication',
      item: [
        {
          name: 'Register User',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123'
              }, null, 2)
            },
            url: {
              raw: '{{baseUrl}}/auth/register',
              host: ['{{baseUrl}}'],
              path: ['auth', 'register']
            }
          }
        },
        {
          name: 'Login User',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                email: 'john@example.com',
                password: 'password123'
              }, null, 2)
            },
            url: {
              raw: '{{baseUrl}}/auth/login',
              host: ['{{baseUrl}}'],
              path: ['auth', 'login']
            }
          }
        }
      ]
    });

    // Add dashboard requests
    collection.item.push({
      name: 'Dashboard',
      item: [
        {
          name: 'Get Dashboard Data',
          request: {
            method: 'GET',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}' }
            ],
            url: {
              raw: '{{baseUrl}}/dashboard',
              host: ['{{baseUrl}}'],
              path: ['dashboard']
            }
          }
        }
      ]
    });

    const collectionPath = path.join(__dirname, '../docs/postman-collection.json');
    fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  }

  // Add endpoint documentation
  addEndpointDocumentation(path, method, documentation) {
    if (!this.specification.paths[path]) {
      this.specification.paths[path] = {};
    }

    this.specification.paths[path][method.toLowerCase()] = documentation;
  }

  // Get endpoint documentation
  getEndpointDocumentation(path, method) {
    return this.specification.paths[path]?.[method.toLowerCase()];
  }
}

module.exports = new APIDocumentationService(); 