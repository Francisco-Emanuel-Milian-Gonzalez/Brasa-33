'use strict'

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { dbConnection } from './config/db.js';
import { corsOptions } from './config/cors.configuration.js';
import { helmetOptions } from './config/helmet.configuration.js';
import { requestLimit } from './config/rateLimit.configuration.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Swagger configuration
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger.js';

// Route imports
import restaurantRouter from './restaurant/restaurant.routes.js';
import menuRouter from './menu/menu.routes.js';
import orderRouter from './orders/order.routes.js';
import paymentRouter from './payments/payment.routes.js';
import reservationRouter from './reservations/reservation.routes.js';
import reportRouter from './reports/report.routes.js';
import tableRouter from './tables/table.routes.js';
import reviewRouter from './reviews/review.routes.js';
import promotionRouter from './promotions/promotion.routes.js';
import invoiceRouter from './invoices/invoice.routes.js';
import adminRouter from './admin/admin.routes.js';
import managerRouter from './manager/manager.routes.js';
import inventoryRouter from './inventory/inventory.routes.js';
import notificationRouter from './notifications/notification.routes.js';

const BASE_PATH = '/brasa33/v1';

/**
 * Configuración de middlewares globales
 * @param {Express.Application} app - Instancia de Express
 */
const middlewares = (app) => {
    // Body parsers
    app.use(express.urlencoded({extended: false, limit: '10mb'}));
    app.use(express.json({limit: '10mb'}));
    
    // Seguridad
    app.use(cors(corsOptions));
    app.use(helmet(helmetOptions));
    app.use(requestLimit);
    
    // Logging
    app.use(morgan('dev'));
    app.use(requestLogger);
};

/**
 * Configuración de rutas de la aplicación
 * @param {Express.Application} app - Instancia de Express
 */
const routes = (app) => {
    // ========================================
    // SWAGGER DOCUMENTATION
    // ========================================
    app.use(
        `${BASE_PATH}/docs`,
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            swaggerOptions: {
                persistAuthorization: true,
                tryItOutEnabled: true,
            },
        })
    );

    // ========================================
    // HEALTH CHECK
    // ========================================
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            success: true,
            status: 'healthy',
            service: 'Brasa 33 Restaurant Manager',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        });
    });

    // ========================================
    // SERVICE ROUTES
    // ========================================
    app.use(`${BASE_PATH}/restaurants`, restaurantRouter);
    app.use(`${BASE_PATH}/menu`, menuRouter);
    app.use(`${BASE_PATH}/orders`, orderRouter);
    app.use(`${BASE_PATH}/payments`, paymentRouter);
    app.use(`${BASE_PATH}/reservations`, reservationRouter);
    app.use(`${BASE_PATH}/reports`, reportRouter);
    app.use(`${BASE_PATH}/tables`, tableRouter);
    app.use(`${BASE_PATH}/reviews`, reviewRouter);
    app.use(`${BASE_PATH}/promotions`, promotionRouter);
    app.use(`${BASE_PATH}/invoices`, invoiceRouter);
    app.use(`${BASE_PATH}/admin`, adminRouter);
    app.use(`${BASE_PATH}/manager`, managerRouter);
    app.use(`${BASE_PATH}/inventory`, inventoryRouter);
    app.use(`${BASE_PATH}/notifications`, notificationRouter);

    // ========================================
    // 404 HANDLER
    // ========================================
    app.use(notFound);
}

/**
 * Inicializa el servidor Express
 * Establece conexión con BD y configura todos los middlewares y rutas
 */
export const initServer = async() => {
    const app = express();
    const PORT = process.env.PORT || 3000;
    
    app.set('trust proxy', 1);

    try {
        // Conectar a base de datos
        await dbConnection();
        
        // Aplicar middlewares globales
        middlewares(app);
        
        // Configurar rutas
        routes(app);
        
        // Global error handler (debe estar al final)
        app.use(errorHandler);
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n🚀 ==========================================');
            console.log('   Brasa 33 Restaurant Manager API');
            console.log('   ✅ Servidor iniciado exitosamente');
            console.log('==========================================');
            console.log(`📍 API: http://localhost:${PORT}${BASE_PATH}`);
            console.log(`🏥 Health: http://localhost:${PORT}${BASE_PATH}/health`);
            console.log(`📚 Swagger: http://localhost:${PORT}${BASE_PATH}/docs`);
            console.log('==========================================\n');
        });
    } catch(err) {
        console.error(`\n❌ Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }
};