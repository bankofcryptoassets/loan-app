import { Instrument, ParsedInstrument } from '../types/insurance.js';
import { DeribitConfig } from '../types/config.js';
import { combinedLogger } from '../utils/logger.js';
import { AxiosService } from './axios.js';

export class DeribitService {
    readonly refreshInterval: number = 300 * 1000; // 5 minutes

    // auth tokens
    private mainAuthToken: string | null = null;
    private subAuthToken: string | null = null;

    // last fetched times
    private mainAccountLastFetchedTime: number = Date.now();
    private subAccountLastFetchedTime: number = Date.now();

    constructor(
        private config: DeribitConfig,
        private axiosService: AxiosService
    ) {}

    private async getAuthToken(subAccount: boolean = false): Promise<string> {
        const lastFetchedTime = subAccount
            ? this.subAccountLastFetchedTime
            : this.mainAccountLastFetchedTime;
        const authToken = subAccount ? this.subAuthToken : this.mainAuthToken;
        if (authToken && lastFetchedTime + this.refreshInterval > Date.now()) {
            return authToken;
        }
        const account = subAccount ? this.config.sub : this.config.main;
        const { baseUrl, clientId, clientSecret } = account;
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

        if (subAccount) {
            this.subAuthToken = response.data.result.access_token as string;
            this.subAccountLastFetchedTime = Date.now();
        } else {
            this.mainAuthToken = response.data.result.access_token as string;
            this.mainAccountLastFetchedTime = Date.now();
        }
        return response.data.result.access_token;
    }

    async buyOption(
        instrumentName: string,
        amount: string,
        price: string,
        type: string
    ) {
        const authToken = await this.getAuthToken();
        const response = await this.axiosService.get(
            `${this.config.main.baseUrl}/api/v2/private/buy?amount=${amount}&instrument_name=${instrumentName}&price=${price}&type=${type}`,
            {
                Authorization: `Bearer ${authToken}`,
            }
        );

        return response.data;
    }

    async sellOption(
        instrumentName: string,
        amount: string,
        price: string,
        type: string
    ) {
        const authToken = await this.getAuthToken(true);
        const response = await this.axiosService.get(
            `${this.config.sub.baseUrl}/api/v2/private/sell?amount=${amount}&instrument_name=${instrumentName}&price=${price}&type=${type}`,
            {
                Authorization: `Bearer ${authToken}`,
            }
        );

        return response.data;
    }

    async fetchOptions(optionType: string = 'put') {
        const { baseUrl } = this.config.main;
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

        return (response.data.result as Instrument[]).filter(
            (option) => option.option_type === optionType
        );
    }

    parseInstrumentName(instrumentName: string): ParsedInstrument {
        // Example: BTC-31OCT25-40000-P
        const [token, dateStr, strikeStr] = instrumentName.split('-');
        // Parse date (e.g., 31OCT25 -> 2025-10-31)
        const day = parseInt(dateStr.slice(0, 2));
        const monthStr = dateStr.slice(2, 5).toUpperCase();
        const year = 2000 + parseInt(dateStr.slice(5)); // assumes year after 2000
        const monthMap: Record<string, number> = {
            JAN: 0,
            FEB: 1,
            MAR: 2,
            APR: 3,
            MAY: 4,
            JUN: 5,
            JUL: 6,
            AUG: 7,
            SEP: 8,
            OCT: 9,
            NOV: 10,
            DEC: 11,
        };
        const expiry = new Date(year, monthMap[monthStr], day);
        return {
            parsed: {
                token,
                expiry,
                strike: Number(strikeStr),
            },
        };
    }

    async getOptimalInstrument(
        strikePrice: number
    ): Promise<(ParsedInstrument & Instrument)[]> {
        const instruments = await this.fetchOptions();
        return instruments
            .filter((inst) => inst.option_type === 'put')
            .map((inst) => {
                return {
                    ...inst,
                    ...this.parseInstrumentName(inst.instrument_name),
                };
            })
            .filter((inst) => inst.parsed.strike < strikePrice)
            .sort((a, b) => a.parsed.strike - b.parsed.strike);
    }
}
