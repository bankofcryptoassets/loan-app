export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  service: string;
}

export interface ApiResponse {
  message: string;
  version: string;
  endpoints: {
    health: string;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
}
