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
            email: { type: 'string' },
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
            store: { type: 'object' }
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
