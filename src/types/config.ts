export interface ServerConfig {
    port: number;
    host: string;
    nodeEnv: string;
    logLevel: string;
}

export interface DatabaseConfig {
    uri: string;
    name: string;
}

export interface DeribitConfig {
    main: {
        baseUrl: string;
        clientId: string;
        clientSecret: string;
    };
    sub: {
        baseUrl: string;
        clientId: string;
        clientSecret: string;
    };
}

export interface CoinGeckoConfig {
    baseUrl: string;
    apiKey: string;
}

export interface RpcConfig {
    url: string;
    chainId: number;
    contractAddresses: { [key: string]: string };
}

export interface ProtocolConfig {
    maxInterestRate: number;
}

export interface AppConfig {
    server: ServerConfig;
    database: DatabaseConfig;
    deribit: DeribitConfig;
    coingecko: CoinGeckoConfig;
    rpc: RpcConfig;
    protocol: ProtocolConfig;
    jwt?: {
        secret: string;
        expiresIn: string;
    };
    cors?: {
        origin: string[];
        credentials: boolean;
    };
}
