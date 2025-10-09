import { AppConfig, ServerConfig, DatabaseConfig } from '../types/config';

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
      logLevel: this.getEnvString('LOG_LEVEL', 'info')
    };

    const databaseConfig: DatabaseConfig = {
      url: this.getEnvString('DATABASE_URL'),
      host: this.getEnvString('DATABASE_HOST'),
      port: this.getEnvNumber('DATABASE_PORT'),
      name: this.getEnvString('DATABASE_NAME'),
      username: this.getEnvString('DATABASE_USERNAME'),
      password: this.getEnvString('DATABASE_PASSWORD')
    };

    return {
      server: serverConfig,
      database: databaseConfig,
      jwt: {
        secret: this.getEnvString('JWT_SECRET', 'your-secret-key'),
        expiresIn: this.getEnvString('JWT_EXPIRES_IN', '24h')
      },
      cors: {
        origin: this.getEnvArray('CORS_ORIGIN', ['http://localhost:3000']),
        credentials: this.getEnvBoolean('CORS_CREDENTIALS', true)
      }
    };
  }

  private getEnvString(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value;
  }

  private getEnvNumber(key: string, defaultValue?: number): number {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is required but not set`);
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} must be a valid number, got: ${value}`);
    }
    return parsed;
  }

  private getEnvBoolean(key: string, defaultValue?: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value.toLowerCase() === 'true';
  }

  private getEnvArray(key: string, defaultValue?: string[]): string[] {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value.split(',').map(item => item.trim());
  }

  public validate(): void {
    // Validate required environment variables
    const requiredVars = ['NODE_ENV'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate port range
    if (this.config.server.port < 1 || this.config.server.port > 65535) {
      throw new Error(`Invalid port number: ${this.config.server.port}. Must be between 1 and 65535`);
    }

    // Validate NODE_ENV
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(this.config.server.nodeEnv)) {
      throw new Error(`Invalid NODE_ENV: ${this.config.server.nodeEnv}. Must be one of: ${validEnvs.join(', ')}`);
    }
  }
}

export default Config;
