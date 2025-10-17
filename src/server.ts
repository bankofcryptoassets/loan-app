import Fastify, {
    FastifyInstance,
    FastifyRequest,
    FastifyReply,
} from 'fastify';
import { HealthCheckResponse, ErrorResponse } from './types';
import Config from './config';

const fastify: FastifyInstance = Fastify({
    logger: true,
});

// Health check endpoint
fastify.get<{ Reply: HealthCheckResponse }>(
    '/health',
    async (
        _request: FastifyRequest,
        _reply: FastifyReply
    ): Promise<HealthCheckResponse> => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            service: 'loan-app',
        };
    }
);

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

// Start server
const start = async (): Promise<void> => {
    try {
        // Initialize and validate configuration
        const config = Config.getInstance();
        config.validate();

        const { port, host } = config.server;

        await fastify.listen({ port, host });
        console.log(`🚀 Server is running on http://${host}:${port}`);
        console.log(
            `📊 Health check available at http://${host}:${port}/health`
        );
        console.log(`🌍 Environment: ${config.server.nodeEnv}`);
        console.log(`📝 Log level: ${config.server.logLevel}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
