import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configuración de OpenAPI 3.0.0 para Swagger
 * Define la información general de la API, servidores, esquemas de seguridad y referencias
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Brasa 33 Restaurant Manager API',
      version: '1.0.0',
      description: 'API REST completa para gestión integral de restaurantes\n\n**Características:**\n- Gestión de restaurantes\n- Catálogo de menú\n- Sistema de órdenes\n- Procesamiento de pagos\n- Reservaciones\n- Reportes y análisis\n\n**Seguridad:** Autenticación con JWT Bearer Token',
      contact: {
        name: 'API Support',
        email: 'support@brasa33.com',
        url: 'https://brasa33.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Restaurant Manager API Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el JWT token obtenido desde el auth-service.\n\nEjemplo:\nBearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      schemas: {
        /**
         * Restaurante
         */
        Restaurant: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Brasa 33 Principal',
            },
            address: {
              type: 'string',
              example: 'Calle 33, Apto 101, Bogotá',
            },
            phone: {
              type: 'string',
              example: '+57 1 123 4567',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
          },
        },

        /**
         * Plato de Menú
         */
        Dish: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Brasas a la Parrilla',
            },
            description: {
              type: 'string',
              example: 'Carnes premium asadas a fuego lento',
            },
            price: {
              type: 'number',
              format: 'decimal',
              example: 45.99,
            },
            stock: {
              type: 'integer',
              example: 50,
            },
            restaurant_id: {
              type: 'integer',
              example: 1,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        /**
         * Orden
         */
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 101,
            },
            user_id: {
              type: 'integer',
              example: 5,
            },
            total: {
              type: 'number',
              format: 'decimal',
              example: 150.50,
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
              example: 'pending',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  menu_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  restaurant_id: { type: 'integer' },
                },
              },
            },
          },
        },

        /**
         * Pago
         */
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 201,
            },
            user_id: {
              type: 'integer',
              example: 5,
            },
            order_id: {
              type: 'integer',
              example: 101,
            },
            amount: {
              type: 'number',
              format: 'decimal',
              example: 150.50,
            },
            method: {
              type: 'string',
              enum: ['credit_card', 'debit_card', 'cash', 'digital_wallet'],
              example: 'credit_card',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              example: 'completed',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        /**
         * Reservación
         */
        Reservation: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 301,
            },
            user_id: {
              type: 'integer',
              example: 5,
            },
            restaurant_id: {
              type: 'integer',
              example: 1,
            },
            guest_count: {
              type: 'integer',
              example: 4,
            },
            reservation_date: {
              type: 'string',
              format: 'date-time',
              example: '2024-02-20T19:00:00Z',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled'],
              example: 'confirmed',
            },
            special_requests: {
              type: 'string',
              example: 'Aniversario, decoración especial por favor',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        /**
         * Respuesta de Éxito Genérica
         */
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },

        /**
         * Respuesta de Error Genérica
         */
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Descripción del error',
            },
            error: {
              type: 'string',
              example: 'Error details',
            },
          },
        },
      },
    },
    security: [],
  },
  apis: [
    './src/restaurant/restaurant.routes.js',
    './src/menu/menu.routes.js',
    './src/orders/order.routes.js',
    './src/payments/payment.routes.js',
    './src/reservations/reservation.routes.js',
    './src/reports/report.routes.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;