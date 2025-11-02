import Fastify, {
    FastifyInstance,
    FastifyRequest,
    FastifyReply,
} from 'fastify';
import { ErrorResponse } from './types/index.js';
import Config from './config/index.js';
import { connectToMongo, closeMongo } from './services/mongodb.js';
import InsuranceController from './controller/insurance.js';
import { combinedLogger } from './utils/logger.js';
import { AxiosService } from './services/axios.js';
import { DeribitService } from './services/deribit.js';
import CoinGecko from './services/coingecko.js';
import { Rpc } from './services/rpc.js';

const fastify: FastifyInstance = Fastify({
    logger: true,
});

// Health check endpoint
// fastify.get<{ Reply: HealthCheckResponse }>(
//     '/health',
//     async (
//         _request: FastifyRequest,
//         _reply: FastifyReply
//     ): Promise<HealthCheckResponse> => {
//         return {
//             status: 'ok',
//             timestamp: new Date().toISOString(),
//             uptime: process.uptime(),
//             service: 'loan-app',
//         };
//     }
// );

// Error handler
fastify.setErrorHandler(
    (error: Error, _request: FastifyRequest, reply: FastifyReply): void => {
        fastify.log.error(error);
        const errorResponse: ErrorResponse = {
            error: 'Internal Server Error',
            message: 'Something went wrong',
        };
        reply.status(500).send(errorResponse);
    }
);

// initialize routes
const initializeRoutes = (insuranceController: InsuranceController) => {
    // health check
    fastify.get('/health', (_req: FastifyRequest, res: FastifyReply) => {
        return res.send({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            service: 'loan-app',
        });
    });
    // insurance
    fastify.get(
        '/api/insurance/estimate',
        insuranceController.estimate.bind(insuranceController)
    );
};

// Start server
const start = async (): Promise<void> => {
    try {
        // Initialize and validate configuration
        const config = Config.getInstance();
        config.validate();

        const {
            database: databaseConfig,
            deribit: deribitConfig,
            coingecko: coingeckoConfig,
            rpc: rpcConfig,
        } = config.getConfig();

        // connect to MongoDB (if configuration provided)
        try {
            await connectToMongo(databaseConfig);
            combinedLogger.info('Connected to MongoDB');
        } catch (dbErr) {
            combinedLogger.warn(
                `Could not connect to MongoDB at startup: ${String(dbErr)}`
            );
        }

        // services
        const axiosService = new AxiosService();
        const deribitService = new DeribitService(deribitConfig, axiosService);
        const _coingeckoService = new CoinGecko(coingeckoConfig, axiosService);
        const rpcService = new Rpc(rpcConfig);

        // controllers
        const insuranceController = new InsuranceController(
            deribitService,
            rpcService
        );

        //initialize routes
        initializeRoutes(insuranceController);

        const { port, host } = config.server;

        await fastify.listen({ port, host });
        combinedLogger.info(`🚀 Server is running on http://${host}:${port}`);
        combinedLogger.info(
            `📊 Health check available at http://${host}:${port}/health`
        );
        combinedLogger.info(`🌍 Environment: ${config.server.nodeEnv}`);
        combinedLogger.info(`📝 Log level: ${config.server.logLevel}`);
    } catch (err) {
        combinedLogger.error(
            JSON.stringify(err, Object.getOwnPropertyNames(err))
        );
        process.exit(1);
    }
};

// Graceful shutdown: close Fastify and MongoDB client
const shutdown = async (signal?: string) => {
    try {
        combinedLogger.info(
            `Received ${signal ?? 'shutdown'} signal, closing...`
        );
        await fastify.close();
    } catch (e) {
        fastify.log.error(`Error closing Fastify: ${String(e)}`);
    }

    try {
        await closeMongo();
        fastify.log.info('MongoDB connection closed');
    } catch (e) {
        fastify.log.error(`Error closing MongoDB connection: ${String(e)}`);
    }

    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
