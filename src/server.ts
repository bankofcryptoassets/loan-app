import Fastify, {
    FastifyInstance,
    FastifyRequest,
    FastifyReply,
} from 'fastify';
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import { ErrorResponse } from './types/index.js';
import Config from './config/index.js';
import { InsuranceController, LendController } from './controller/index.js';
import { combinedLogger } from './utils/logger.js';
import { AxiosService } from './services/axios.js';
import { DeribitService } from './services/deribit.js';
import CoinGecko from './services/coingecko.js';
import { Rpc } from './services/rpc.js';
import { Listeners } from './services/listeners.js';

const fastify: FastifyInstance = Fastify({
    logger: true,
});

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
const initializeRoutes = (
    insuranceController: InsuranceController,
    lendController: LendController
) => {
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

    // metadata
    fastify.get(
        '/api/metadata',
        insuranceController.metadata.bind(insuranceController)
    );

    // get by wallet address, or optionally by lsa address also
    fastify.get(
        '/api/wallet',
        insuranceController.getWallet.bind(insuranceController)
    );

    // get only by lsa address
    fastify.get(
        '/api/lsa',
        insuranceController.getLsa.bind(insuranceController)
    );

    // lend pool stats
    fastify.get(
        '/api/lend',
        lendController.getUSDCPoolStats.bind(lendController)
    );

    // user aUSDC balance
    fastify.get(
        '/api/lend/balance/:address',
        lendController.getUserAUsdcBalance.bind(lendController)
    );
};

const initializeListeners = async (listenersService: Listeners) => {
    await listenersService.init();
};

// Start server
const start = async (): Promise<void> => {
    try {
        await fastify.register(cors, {
            preflightContinue: true,
        });

        // Initialize and validate configuration
        const config = Config.getInstance();
        config.validate();

        const {
            database: databaseConfig,
            deribit: deribitConfig,
            coingecko: coingeckoConfig,
            rpc: rpcConfig,
            protocol: protocolConfig,
        } = config.getConfig();

        // connect to MongoDB (if configuration provided)
        // try {
        //     await connectToMongo(databaseConfig);
        //     combinedLogger.info('Connected to MongoDB (native driver)');
        // } catch (dbErr) {
        //     combinedLogger.warn(
        //         `Could not connect to MongoDB at startup: ${String(dbErr)}`
        //     );
        // }

        // connect Mongoose (required for User model)
        try {
            if (databaseConfig.uri && databaseConfig.name) {
                await mongoose.connect(databaseConfig.uri, {
                    dbName: databaseConfig.name,
                });
                combinedLogger.info('Connected to MongoDB (Mongoose)');
            }
        } catch (mongooseErr) {
            combinedLogger.error(
                `Could not connect Mongoose at startup: ${String(mongooseErr)}`
            );
        }

        // services
        const axiosService = new AxiosService();
        const deribitService = new DeribitService(deribitConfig, axiosService);
        const _coingeckoService = new CoinGecko(coingeckoConfig, axiosService);
        const rpcService = new Rpc(rpcConfig, protocolConfig);
        const listenersService = new Listeners(rpcService, rpcConfig);

        // controllers
        const insuranceController = new InsuranceController(
            deribitService,
            rpcService,
            protocolConfig
        );
        const lendController = new LendController(rpcService);

        //initialize routes
        initializeRoutes(insuranceController, lendController);
        combinedLogger.info(`Initialized Routes`);

        //initialize listeners
        await initializeListeners(listenersService);
        combinedLogger.info(`Initialized Listeners`);

        const { port, host } = config.server;

        await fastify.listen({ port, host });
        combinedLogger.info(`🚀 Server is running on http://${host}:${port}`);
        combinedLogger.info(
            `📊 Health check available at http://${host}:${port}/health`
        );
        combinedLogger.info(`🌍 Environment: ${config.server.nodeEnv}`);
        // combinedLogger.info(`📝 Log level: ${config.server.logLevel}`);
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
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            combinedLogger.info('MongoDB connection closed (Mongoose)');
        }
    } catch (e) {
        combinedLogger.error(`Error closing Mongoose connection: ${String(e)}`);
    }

    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
