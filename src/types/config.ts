export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
  logLevel: string;
}

export interface DatabaseConfig {
  url?: string;
  host?: string;
  port?: number;
  name?: string;
  username?: string;
  password?: string;
}

export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  jwt?: {
    secret: string;
    expiresIn: string;
  };
  cors?: {
    origin: string[];
    credentials: boolean;
  };
}
