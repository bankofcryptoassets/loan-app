import { FastifyRequest, FastifyReply } from 'fastify';
import { Rpc } from '../services/rpc.js';
import { formatUnits, isAddress } from 'viem';

class LendController {
    constructor(private readonly rpcService: Rpc) {}

    /**
     * GET /lend
     * Returns global pool statistics for USDC reserve
     */
    public async getUSDCPoolStats(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        try {
            // Get USDC reserve data from Aave pool
            const reserveData = (await this.rpcService.getUsdcReserveData()) as {
                configuration: { data: bigint };
                liquidityIndex: bigint;
                variableBorrowIndex: bigint;
                currentLiquidityRate: bigint;
                currentVariableBorrowRate: bigint;
                currentStableBorrowRate: bigint;
                lastUpdateTimestamp: number;
                aTokenAddress: `0x${string}`;
                stableDebtTokenAddress: `0x${string}`;
                variableDebtTokenAddress: `0x${string}`;
                interestRateStrategyAddress: `0x${string}`;
                id: number;
            };

            // Get actual USDC balance in the pool (USDC held by aToken contract)
            const totalDeposits =
                await this.rpcService.getUsdcBalanceOfUsdcAToken(); // USDC.balanceOf(aTokenUSDC)

            // Get total supply of variable debt token (total borrowed)
            const totalBorrowed =
                await this.rpcService.getVdtUsdcTokenTotalSupply();

            // Convert liquidity rate from ray (27 decimals) to APY percentage
            // liquidityRate is per-second rate that compounds continuously
            // APY = (1 + ratePerSecond)^SECONDS_PER_YEAR - 1
            const RAY = 10n ** 27n;
            const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

            const ratePerSecond = Number(reserveData.currentLiquidityRate) / Number(RAY);
            const supplyAPY = (Math.pow(1 + ratePerSecond, SECONDS_PER_YEAR) - 1) * 100;

            reply.send({
                totalDeposits: formatUnits(totalDeposits, 6),
                totalBorrowed: formatUnits(totalBorrowed, 6),
                interestRate: supplyAPY.toFixed(4) + '%',
            });
        } catch (error) {
            console.error('Error fetching pool stats:', error);
            reply.status(500).send({
                error: 'Failed to fetch pool statistics',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * GET /lend/balance/:address
     * Returns user's aUSDC balance
     */
    public async getUserAUsdcBalance(
        request: FastifyRequest<{ Params: { address: string } }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const { address } = request.params;

            // Validate address
            if (!isAddress(address)) {
                return reply.status(400).send({
                    error: 'Invalid address',
                    message: 'Please provide a valid Ethereum address',
                });
            }

            // Get user's aUSDC balance
            const balance = await this.rpcService.getUserAUsdcBalance(address);

            reply.send({
                address,
                aUsdcBalance: formatUnits(balance, 6),
            });
        } catch (error) {
            console.error('Error fetching user aUSDC balance:', error);
            reply.status(500).send({
                error: 'Failed to fetch user balance',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

export default LendController;
