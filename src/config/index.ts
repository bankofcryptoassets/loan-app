import dotenv from 'dotenv';
import { AppConfig, ServerConfig, DatabaseConfig } from '../types/config';
dotenv.config();

class Config {
    private static instance: Config;
    private config: AppConfig;

    private constructor() {
        this.config = this.loadConfig();
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    public getConfig(): AppConfig {
        return this.config;
    }

    public get server(): ServerConfig {
        return this.config.server;
    }

    public get database(): DatabaseConfig {
        return this.config.database;
    }

    private loadConfig(): AppConfig {
        const serverConfig: ServerConfig = {
            port: this.getEnvNumber('PORT', 3000),
            host: this.getEnvString('HOST', '0.0.0.0'),
            nodeEnv: this.getEnvString('NODE_ENV', 'development'),
            // logLevel: this.getEnvString('LOG_LEVEL', 'error'),
        };

        const databaseConfig: DatabaseConfig = {
            uri: this.getEnvString('DATABASE_URI'),
            name: this.getEnvString('DATABASE_NAME'),
        };

        const deribitConfig = {
            main: {
                baseUrl: this.getEnvString('DERIBIT_MAIN_BASE_URL'),
                clientId: this.getEnvString('DERIBIT_MAIN_CLIENT_ID'),
                clientSecret: this.getEnvString('DERIBIT_MAIN_CLIENT_SECRET'),
            },
            sub: {
                baseUrl: this.getEnvString('DERIBIT_SUB_BASE_URL'),
                clientId: this.getEnvString('DERIBIT_SUB_CLIENT_ID'),
                clientSecret: this.getEnvString('DERIBIT_SUB_CLIENT_SECRET'),
            },
        };

        const coingeckoConfig = {
            baseUrl: this.getEnvString('COINGECKO_URL', ''),
            apiKey: this.getEnvString('COINGECKO_APIKEY', ''),
        };

        const rpcConfig = {
            mainnetUrl: this.getEnvString('RPC_URL_MAINNET'),
            url: this.getEnvString('RPC_URL'),
            chainId: this.getEnvNumber('CHAIN_ID'),
            contractAddresses: {
                loan: this.getEnvString('ADDR_LOAN'),
                aToken: this.getEnvString('ADDR_A_TOKEN'),
                vdtToken: this.getEnvString('ADDR_VDT_TOKEN'),
                lendingPool: this.getEnvString('ADDR_LENDING_POOL'),
            },
        };

        const protocolConfig = {
            maxInterestRate: this.getEnvNumber('MAX_INTEREST_RATE'),
            flashLoanFee: this.getEnvString('FLASH_LOAN_FEE'),
            protocolLoanInitFee: this.getEnvString('PROTOCOL_LOAN_INIT_FEE'),
        };

        return {
            server: serverConfig,
            database: databaseConfig,
            deribit: deribitConfig,
            coingecko: coingeckoConfig,
            rpc: rpcConfig,
            protocol: protocolConfig,
        };
    }

    private getEnvString(key: string, defaultValue?: string): string {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new Error(
                `Environment variable ${key} is required but not set`
            );
        }
        return value;
    }

    private getEnvNumber(key: string, defaultValue?: number): number {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new Error(
                `Environment variable ${key} is required but not set`
            );
        }
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            throw new Error(
                `Environment variable ${key} must be a valid number, got: ${value}`
            );
        }
        return parsed;
    }

    private getEnvBoolean(key: string, defaultValue?: boolean): boolean {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new Error(
                `Environment variable ${key} is required but not set`
            );
        }
        return value.toLowerCase() === 'true';
    }

    private getEnvArray(key: string, defaultValue?: string[]): string[] {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new Error(
                `Environment variable ${key} is required but not set`
            );
        }
        return value.split(',').map((item) => item.trim());
    }

    public validate(): void {
        // Validate port range
        if (this.config.server.port < 1 || this.config.server.port > 65535) {
            throw new Error(
                `Invalid port number: ${this.config.server.port}. Must be between 1 and 65535`
            );
        }

        // Validate NODE_ENV
        const validEnvs = ['development', 'production', 'test'];
        if (!validEnvs.includes(this.config.server.nodeEnv)) {
            throw new Error(
                `Invalid NODE_ENV: ${
                    this.config.server.nodeEnv
                }. Must be one of: ${validEnvs.join(', ')}`
            );
        }
    }
}

export default Config;
