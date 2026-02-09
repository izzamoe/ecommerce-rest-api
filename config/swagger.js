import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce REST API',
      version: '1.0.0',
      description: 'API untuk mengelola pesanan customer dengan JWT Authentication',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Validation error' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            role: { type: 'string', enum: ['ADMIN', 'STAFF'], example: 'ADMIN' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440003' },
            customer_name: { type: 'string', example: 'John Doe' },
            product_name: { type: 'string', example: 'Laptop Gaming' },
            quantity: { type: 'integer', example: 2 },
            status: { type: 'string', enum: ['PENDING', 'PAID', 'CANCELLED'], example: 'PENDING' },
            created_at: { type: 'string', format: 'date-time', example: '2024-02-10T10:30:00Z' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', format: 'password', example: 'admin123' }
          }
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['customer_name', 'product_name', 'quantity'],
          properties: {
            customer_name: { type: 'string', example: 'John Doe' },
            product_name: { type: 'string', example: 'Laptop Gaming' },
            quantity: { type: 'integer', minimum: 1, example: 2 }
          }
        },
        UpdateStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['PENDING', 'PAID', 'CANCELLED'], example: 'PAID' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Authentication', description: 'User login endpoints' },
      { name: 'Orders', description: 'Order management endpoints' }
    ]
  },
  apis: ['./routes/*.js']
};

export const specs = swaggerJsdoc(options);
