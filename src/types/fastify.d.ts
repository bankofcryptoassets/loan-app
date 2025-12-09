import 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            address: string;
        }; // or a specific type for your decoded JWT payload
    }
}
