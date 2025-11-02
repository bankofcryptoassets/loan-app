import { CoinGeckoConfig } from '../types/config.js';
import { combinedLogger } from '../utils/logger.js';
import { AxiosService } from './axios';

class CoinGecko {
    constructor(
        private coingeckoCoinfig: CoinGeckoConfig,
        private axiosService: AxiosService
    ) {}

    async getBtcPrice() {
        try {
            const res = await this.axiosService.get(
                `${this.coingeckoCoinfig.baseUrl}/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`,
                {
                    'x-cg-pro-api-key': this.coingeckoCoinfig.apiKey,
                }
            );

            if (!res.data?.bitcoin?.usd) {
                combinedLogger.debug(
                    'Failed to get BTC price from coingecko: ' +
                        JSON.stringify(res.data)
                );
                throw new Error('Price fetch failed');
            }

            return res.data.bitcoin.usd as number;
        } catch (error) {
            combinedLogger.error(
                'Error fetching BTC price: ' +
                    JSON.stringify(Object.getOwnPropertyNames(error))
            );
            throw error;
        }
    }
}

export default CoinGecko;
