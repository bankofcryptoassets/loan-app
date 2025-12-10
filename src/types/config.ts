export interface ServerConfig {
    port: number;
    host: string;
    nodeEnv: string;
    // logLevel: string;
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
    mainnetUrl: string;
    url: string;
    chainId: number;
    contractAddresses: {
        loan: string;
        aTokenUsdc: string;
        aTokenCbbtc: string;
        vdtTokenUsdc: string;
        vdtTokenCbbtc: string;
        lendingPool: string;
        usdc: string;
        cbbtc: string;
    };
}

export interface ProtocolConfig {
    maxInterestRate: number;
    flashLoanFee: string;
    protocolLoanInitFee: string;
}

export interface AuthConfig {
    jwtSecret: string;
}

export interface AppConfig {
    server: ServerConfig;
    database: DatabaseConfig;
    deribit: DeribitConfig;
    coingecko: CoinGeckoConfig;
    rpc: RpcConfig;
    protocol: ProtocolConfig;
    auth: AuthConfig;
    jwt?: {
        secret: string;
        expiresIn: string;
    };
    cors?: {
        origin: string[];
        credentials: boolean;
    };
}
