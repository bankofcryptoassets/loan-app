import { EAC_AGG_PROXY_ABI } from '../abis/eacAggregatorProxy.js';
import { ProtocolConfig, RpcConfig } from '../types/config.js';
import { LoanDataFromContract } from '../types/loan.js';
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
    private cachedBtcPrice: { price: number; time: number } | undefined;

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
        if (
            this.cachedBtcPrice &&
            Date.now() - this.cachedBtcPrice.time < 10000
        ) {
            return this.cachedBtcPrice.price;
        }

        const ans = await this.publicClientMainnet.readContract({
            abi: EAC_AGG_PROXY_ABI,
            functionName: 'latestAnswer',
            address: this.CBBTC_EAC_AGG,
        });

        const parsedAns = Number((Number(ans) / 10 ** 8).toFixed(2));

        this.cachedBtcPrice = {
            price: parsedAns,
            time: Date.now(),
        };
        return parsedAns;
    }

    async getLoanByLsa(lsa: Address) {
        const [res, aTokenBalance, vdtTokenBalance] = await Promise.all([
            this.publicClient.readContract({
                abi: LOAN_ABI,
                address: this.config.contractAddresses.loan as Address,
                functionName: 'getLoanByLSA',
                args: [lsa],
            }),
            this.publicClient.readContract({
                abi: erc20Abi,
                address: this.config.contractAddresses.aTokenCbbtc as Address,
                functionName: 'balanceOf',
                args: [lsa],
            }),
            this.publicClient.readContract({
                abi: erc20Abi,
                address: this.config.contractAddresses.vdtTokenUsdc as Address,
                functionName: 'balanceOf',
                args: [lsa],
            }),
        ]);

        const loanData = res as LoanDataFromContract;
        return [loanData, aTokenBalance, vdtTokenBalance] as const;
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

    // USDC Token Functions
    async getATokenUsdcTotalSupply() {
        return this.publicClient.readContract({
            address: this.config.contractAddresses.aTokenUsdc as Address,
            abi: erc20Abi,
            functionName: 'totalSupply',
        });
    }

    async getVdtUsdcTokenTotalSupply() {
        return this.publicClient.readContract({
            address: this.config.contractAddresses.vdtTokenUsdc as Address,
            abi: erc20Abi,
            functionName: 'totalSupply',
            args: [],
        });
    }

    async getUsdcBalanceOfUsdcAToken() {
        return this.publicClient.readContract({
            address: this.config.contractAddresses.usdc as Address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [this.config.contractAddresses.aTokenUsdc as Address],
        });
    }

    // cbBTC Token Functions
    async getATokenCbbtcTotalSupply() {
        return this.publicClient.readContract({
            address: this.config.contractAddresses.aTokenCbbtc as Address,
            abi: erc20Abi,
            functionName: 'totalSupply',
        });
    }

    async getVdtCbbtcTokenTotalSupply() {
        return this.publicClient.readContract({
            address: this.config.contractAddresses.vdtTokenCbbtc as Address,
            abi: erc20Abi,
            functionName: 'totalSupply',
            args: [],
        });
    }

    async getCbbtcBalanceOfCbbtcAToken() {
        return this.publicClient.readContract({
            address: this.config.contractAddresses.cbbtc as Address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [this.config.contractAddresses.aTokenCbbtc as Address],
        });
    }

    // Reserve Data Functions
    async getCbbtcReserveData() {
        return this.publicClient.readContract({
            abi: LENDING_POOL,
            address: this.config.contractAddresses.lendingPool as Address,
            functionName: 'getReserveData',
            args: [this.config.contractAddresses.cbbtc as Address],
        });
    }

    async getUsdcReserveData() {
        return this.publicClient.readContract({
            abi: LENDING_POOL,
            address: this.config.contractAddresses.lendingPool as Address,
            functionName: 'getReserveData',
            args: [this.config.contractAddresses.usdc as Address],
        });
    }

    async getUserAUsdcBalance(userAddress: Address) {
        return this.publicClient.readContract({
            address: this.config.contractAddresses.aTokenUsdc as Address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [userAddress],
        });
    }

    async getTxReceipt(hash: Hex) {
        return this.publicClient.getTransactionReceipt({
            hash,
        });
    }
}
