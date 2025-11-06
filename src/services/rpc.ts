import { EAC_AGG_PROXY_ABI } from '../abis/eacAggregatorProxy.js';
import { ProtocolConfig, RpcConfig } from '../types/config.js';
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { combinedLogger } from '../utils/logger.js';

export class Rpc {
    readonly publicClient;
    readonly publicClientMainnet;
    readonly CBBTC_EAC_AGG = '0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D';
    constructor(
        private config: RpcConfig,
        private protocolConfig: ProtocolConfig
    ) {
        if (
            this.config.chainId !== base.id &&
            this.config.chainId !== baseSepolia.id
        ) {
            throw new Error('Unsupported chain');
        }

        this.publicClient = createPublicClient({
            transport: http(this.config.url),
            chain: this.config.chainId === base.id ? base : baseSepolia,
        });

        this.publicClientMainnet = createPublicClient({
            transport: http(this.config.mainnetUrl),
            chain: base,
        });
    }

    async getStrikePrice(_deposit: number, _loan: number) {
        // TODO: fetch from contract
        return 105_000;
    }

    async getBtcPrice() {
        const ans = await this.publicClientMainnet.readContract({
            abi: EAC_AGG_PROXY_ABI,
            functionName: 'latestAnswer',
            address: this.CBBTC_EAC_AGG,
        });
        return Number((Number(ans) / 10 ** 8).toFixed(2));
    }

    async fetchEstimationParams(deposit: number, loan: number) {
        return Promise.allSettled([
            this.getStrikePrice(deposit, loan),
            this.getBtcPrice(),
        ]).then((res) => {
            if (res[0].status !== 'fulfilled') {
                combinedLogger.error(
                    `Error fetching strike price: ${res[0].reason}`
                );
                throw new Error('Failed to fetch strike price');
            }

            if (res[1].status !== 'fulfilled') {
                combinedLogger.error(
                    `Error fetching strike price: ${res[1].reason}`
                );
                throw new Error('Failed to fetch strike price');
            }

            return {
                strikePrice: res[0].value,
                btcPrice: res[1].value,
                maxInterestRate: this.protocolConfig.maxInterestRate,
            };
        });
    }
}
