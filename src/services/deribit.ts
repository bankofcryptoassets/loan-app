import { DeribitConfig } from '../interfaces/deribit';
import { combinedLogger } from '../utils/logger';
import { AxiosService } from './axios';

export class DeribitService {
    readonly axiosService: AxiosService;
    readonly refreshInterval: number = 300 * 1000; // 5 minutes
    private authToken: string | null = null;
    private lastFetchedTime: number = Date.now();

    constructor(private config: DeribitConfig) {
        this.axiosService = new AxiosService();
    }

    private async getAuthToken(): Promise<string> {
        if (
            this.authToken &&
            this.lastFetchedTime + this.refreshInterval > Date.now()
        ) {
            return this.authToken;
        }
        const { baseUrl, clientId, clientSecret } = this.config;
        const url = `${baseUrl}/api/v2/public/auth?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
        const response = await this.axiosService.get(url, {});
        if (!response.data?.result?.access_token) {
            combinedLogger.debug(
                `Failed to get auth token from Deribit, response: ${JSON.stringify(
                    response?.data
                )}`
            );
            throw new Error('Failed to get auth token from Deribit');
        }
        this.authToken = response.data.result.access_token as string;
        this.lastFetchedTime = Date.now();
        return this.authToken;
    }

    async buyOption(
        instrumentName: string,
        amount: string,
        price: string,
        type: string
    ) {
        const authToken = await this.getAuthToken();
        const response = await this.axiosService.get(
            `${this.config.baseUrl}/api/v2/private/buy?amount=${amount}&instrument_name=${instrumentName}&price=${price}&type=${type}`,
            {
                Authorization: `Bearer ${authToken}`,
            }
        );

        return response.data;
    }

    async fetchOptions(optionType?: string) {
        const { baseUrl } = this.config;
        const response = await this.axiosService.get(
            `${baseUrl}/api/v2/public/get_instruments?currency=BTC&kind=option`,
            {}
        );

        if (!response.data?.result) {
            combinedLogger.debug(
                `Failed to get options from deribit, response: ${JSON.stringify(
                    response.data
                )}`
            );
            throw new Error('Failed to get options from Deribit');
        }

        return (response.data.response as { option_type: string }[]).filter(
            (option) => option.option_type === optionType
        );
    }
}
