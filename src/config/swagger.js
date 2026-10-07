const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PageTurner Online Bookstore REST API',
      version: '1.0.0',
      description:
        'Complete REST API documentation for PageTurner Bookstore. Supports Authentication, Books Catalog, Shopping Cart, Wishlist, Orders with Razorpay, and Book Reviews.',
      contact: {
        name: 'PageTurner Engineering',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current Server (Local or Render Cloud)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check endpoint',
          responses: {
            200: { description: 'API server is healthy and operational' },
          },
        },
      },
      '/api/books': {
        get: {
          summary: 'List all books with pagination and genre filters',
          parameters: [
            { name: 'genre', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'List of books retrieved successfully' } },
        },
        post: {
          summary: 'Create a new book (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Book created successfully' } },
        },
      },
      '/api/books/{id}': {
        get: {
          summary: 'Get single book details by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book details' }, 404: { description: 'Book not found' } },
        },
        put: {
          summary: 'Update existing book (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book updated' } },
        },
        delete: {
          summary: 'Delete book (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book deleted' } },
        },
      },
      '/api/books/search': {
        get: {
          summary: 'Search books by keyword across title, author, and description',
          parameters: [{ name: 'keyword', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Search results' } },
        },
      },
      '/api/auth/register': {
        post: {
          summary: 'Register a new customer account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'User registered and JWT token returned' } },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Authenticate user and obtain JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Login successful' } },
        },
      },
      '/api/cart': {
        get: {
          summary: 'Get current user shopping cart',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Cart retrieved' } },
        },
        post: {
          summary: 'Add book to cart or adjust quantity',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Cart updated' } },
        },
      },
      '/api/cart/{bookId}': {
        delete: {
          summary: 'Remove book from cart',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'bookId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Item removed from cart' } },
        },
      },
      '/api/wishlist': {
        get: {
          summary: 'Get user saved favourites / wishlist',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Wishlist items' } },
        },
        post: {
          summary: 'Add book to user favourites',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Book added to wishlist' } },
        },
      },
      '/api/wishlist/{bookId}': {
        delete: {
          summary: 'Remove book from favourites',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'bookId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book removed' } },
        },
      },
      '/api/orders': {
        get: {
          summary: 'List user order library and purchase history',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of orders' } },
        },
        post: {
          summary: 'Create new checkout order (generates Razorpay order)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Order created with Razorpay payment details' } },
        },
      },
      '/api/orders/verify': {
        post: {
          summary: 'Verify Razorpay HMAC-SHA256 signature and mark order paid',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Payment verified and order finalized' } },
        },
      },
      '/api/reviews/book/{bookId}': {
        get: {
          summary: 'Get verified reader reviews for a book',
          parameters: [{ name: 'bookId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'List of reviews' } },
        },
      },
      '/api/reviews': {
        post: {
          summary: 'Submit a new book review',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Review posted successfully' } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
