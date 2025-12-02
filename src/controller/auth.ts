import { FastifyReply, FastifyRequest } from 'fastify';
import { Rpc } from '../services/rpc.js';
import { combinedLogger } from '../utils/logger.js';
import { Address, Hex, isAddress } from 'viem';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthConfig } from '../types/config.js';

type CreateTokenParams = {
    message: any;
    signature: Hex;
    address: Address;
};

class AuthController {
    constructor(private rpc: Rpc, private config: AuthConfig) {}

    async createToken(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { message, signature, address } =
                (request.body as CreateTokenParams) || {};

            if (!message || !signature || !address) {
                return reply.code(400).send({
                    success: false,
                    message: 'Message, signature and address are required',
                });
            }

            if (!isAddress(address)) {
                return reply.code(400).send({
                    success: false,
                    message: 'Invalid address',
                });
            }

            const valid = await this.rpc.publicClient.verifySiweMessage({
                address,
                message,
                signature,
            });

            if (!valid) {
                return reply.code(401).send({
                    success: false,
                    message: 'Invalid signature',
                });
            }

            const token = jwt.sign(
                { address, iat: Date.now() },
                this.config.jwtSecret,
                { expiresIn: '1h' }
            );
            return reply.code(200).send({ success: true, token });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            combinedLogger.error(
                'Error creating suth token: ' +
                    JSON.stringify(error, Object.getOwnPropertyNames(error))
            );
            reply.code(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    authenticateJwt(request: FastifyRequest, reply: FastifyReply) {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }

        try {
            const decoded = jwt.verify(token, this.config.jwtSecret);
            (request as any).user = decoded;
        } catch (error) {
            combinedLogger.error(
                `Error verifying token: ${JSON.stringify(
                    error,
                    Object.getOwnPropertyNames(error)
                )}`
            );
            return reply.code(401).send({ message: 'Unauthorized' });
        }
    }

    async refreshToken(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Get token from Authorization header or request body
            let token = (request.body as { token: string } | undefined)?.token;
            if (!token) {
                const authHeader = request.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.split(' ')[1];
                }
            }
            if (!token) {
                return reply.code(400).send({
                    success: false,
                    message: 'Token is required',
                });
            }
            // Decode token (allow expired tokens to be refreshed)
            let decoded;
            try {
                decoded = jwt.verify(token, this.config.jwtSecret, {
                    ignoreExpiration: true,
                });
            } catch (verifyError) {
                combinedLogger.error(
                    `Error verifying token for refresh: ${JSON.stringify(
                        verifyError,
                        Object.getOwnPropertyNames(verifyError)
                    )}`
                );
                return reply.code(401).send({
                    success: false,
                    message: 'Invalid token',
                });
            }
            // Extract address from decoded token
            const address = (decoded as JwtPayload).address;
            if (!address) {
                return reply.code(400).send({
                    success: false,
                    message: 'Invalid token: address not found',
                });
            }
            // Create new token with the same address
            const newToken = jwt.sign(
                { address, iat: Date.now() },
                this.config.jwtSecret,
                { expiresIn: '1h' }
            );
            return reply.code(200).send({ success: true, token: newToken });
        } catch (error) {
            combinedLogger.error(
                `Error refreshing token: ${JSON.stringify(
                    error,
                    Object.getOwnPropertyNames(error)
                )}`
            );
            return reply
                .code(500)
                .send({ success: false, message: 'Internal server error' });
        }
    }
}

export default AuthController;
