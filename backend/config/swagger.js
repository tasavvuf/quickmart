const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'Complete E-Commerce API with authentication, products, and cart management',
      contact: {
        name: 'E-Commerce Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userName: { type: 'string' },
            name: { type: 'string' },
            phoneNumber: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin', 'vendor'] },
            profilePhoto: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                fileId: { type: 'string' },
                name: { type: 'string' },
                thumbnailUrl: { type: 'string' }
              }
            },
            location: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' }
              }
            },
            address: { type: 'string' }
          }
        },
        Store: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            owner: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                userName: { type: 'string' },
                name: { type: 'string' },
                phoneNumber: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            },
            name: { type: 'string' },
            description: { type: 'string' },
            logo: { type: 'string' },
            banner: { type: 'string' },
            storePhoto: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                fileId: { type: 'string' },
                name: { type: 'string' },
                thumbnailUrl: { type: 'string' }
              }
            },
            category: { type: 'string' },
            location: { type: 'object' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                area: { type: 'string' },
                pincode: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                landmark: { type: 'string' }
              }
            },
            gstNumber: { type: 'string' },
            emergencyContact: { type: 'string' },
            isVerifiedByAdmin: { type: 'boolean' },
            rating: { type: 'number' },
            isOpen: { type: 'boolean' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'number' },
            images: { type: 'array', items: { type: 'string' } },
            category: { type: 'string' },
            featured: { type: 'boolean' },
            status: { type: 'string' },
            store: { $ref: '#/components/schemas/Store' }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            activeStore: { type: 'object' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'object' },
                  quantity: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [
    path.join(__dirname, '../routes/auth.js'),
    path.join(__dirname, '../routes/product.js'),
    path.join(__dirname, '../routes/cart.js')
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
