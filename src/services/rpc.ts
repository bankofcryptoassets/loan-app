import { EAC_AGG_PROXY_ABI } from '../abis/eacAggregatorProxy.js';
import { ProtocolConfig, RpcConfig } from '../types/config.js';
import {
    Address,
    createPublicClient,
    erc20Abi,
    Hex,
    http,
    parseUnits,
} from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { combinedLogger } from '../utils/logger.js';
import { LOAN_ABI } from '../abis/loan.js';
import { LENDING_POOL } from '../abis/lendingPool.js';

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

    async getStrikePrice(deposit: number, loan: number) {
        const depositInUsdc = parseUnits(deposit.toFixed(6), 6);
        const loanInUsdc = parseUnits(loan.toFixed(6), 6);
        return Number(
            (await this.publicClient.readContract({
                address: this.config.contractAddresses.loan as Address,
                abi: LOAN_ABI,
                functionName: 'calculateStrikePrice',
                args: [depositInUsdc, loanInUsdc],
            })) / BigInt(10 ** 8)
        );
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

    async getATokenTotalSupply() {
        return this.publicClient.readContract({
            address: this.config.contractAddresses.aToken as Address,
            abi: erc20Abi,
            functionName: 'totalSupply',
        });
    }

    async getVdtTokenTotalSupply() {
        return this.publicClient.readContract({
            address: this.config.contractAddresses.vdtToken as Address,
            abi: erc20Abi,
            functionName: 'totalSupply',
            args: [],
        });
    }

    async getAvailableBtcFromReserve() {
        return this.publicClient.readContract({
            abi: LENDING_POOL,
            address: '0x64688EAa8cBC3029D303b61D7e77f986E34742b3',
            functionName: 'getReserveData',
            args: ['0x562937072309F8c929206a58e72732dFCA5b67D6'],
        });
    }

    async getTxReceipt(hash: Hex) {
        return this.publicClient.getTransactionReceipt({
            hash,
        });
    }
}
