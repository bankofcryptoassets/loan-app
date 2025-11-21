import { FastifyRequest, FastifyReply } from 'fastify';
import { DeribitService } from '../services/deribit.js';
import { Rpc } from '../services/rpc.js';
import { ProtocolConfig } from '../types/config.js';
import {
    getAllLoans,
    getUserByLsa,
    getUserByWallet,
} from '../repository/loan.js';
import { Address, formatUnits, isAddress } from 'viem';
import { serializeBigInt } from '../utils/bigint.js';
import { monthsToSeconds, unixToDateString } from '../utils/date.js';
import { Loan, LsaDetail, RepaymentDetail } from '../types/loan.js';

type EstimateReqParams = {
    qty: string;
    deposit: string;
    n: string;
};

type MetadataParams = {
    wallet: string;
};

type GetWalletParams = {
    wallet: string;
    lsa?: string;
};

type GetLsaParams = {
    lsa: string;
};

class InsuranceController {
    constructor(
        private readonly deribitService: DeribitService,
        private readonly rpcService: Rpc,
        private readonly protocolConfig: ProtocolConfig
    ) {}
    /**
     * estimate handler
     * Currently returns a placeholder estimate. Accepts query params in the request
     * and responds with JSON. Keep implementation minimal so it's easy to extend.
     */
    public async estimate(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        const query = request.query as EstimateReqParams;

        if (!query || isNaN(+query.qty) || isNaN(+query.deposit)) {
            return reply.code(400).send({
                message: 'qty & deposit should be a floating point number',
            });
        }

        const qty = Number(query.qty);
        const depositPercent = Number(query.deposit) / 100;
        const deposit = qty * depositPercent;
        const loan = qty - deposit;
        const n = Number(query.n ?? 12);

        if (deposit > 1) {
            return reply.code(400).send({
                message: 'deposit cannot be greater than 1',
            });
        }

        if (loan < 0) {
            return reply.code(400).send({
                message: 'deposit cannot be greater than amount',
            });
        }

        // get btc price
        const btcPrice = await this.rpcService.getBtcPrice();

        // get strike price, interest rate and btc price from contract.
        const strikePrice = await this.rpcService.getStrikePrice(
            deposit * btcPrice,
            loan * btcPrice
        );

        const inst = await this.deribitService.getOptimalInstrument(
            strikePrice
        );

        const flashLoanFeePercent = parseFloat(
            this.protocolConfig.flashLoanFee
        );
        const protocolLoanInitFeePercent = parseFloat(
            this.protocolConfig.protocolLoanInitFee
        );
        const r = this.protocolConfig.maxInterestRate / 100 / n;
        const principal = qty * btcPrice * loan;
        const downPayment = deposit * btcPrice;
        const emiAmount =
            (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const interestAmount = emiAmount * n - principal;
        const flashLoanFee = (flashLoanFeePercent * principal) / 100;
        const protocolLoanInitFee =
            (protocolLoanInitFeePercent * qty * btcPrice) / 100;
        const totalFee = flashLoanFee + protocolLoanInitFee;
        const insuranceAmount = qty * 0.0335 * btcPrice;
        const total = principal + interestAmount + totalFee + insuranceAmount;
        const downPaymentTotal = downPayment + insuranceAmount + totalFee;
        const approvalTotal = downPayment + insuranceAmount + totalFee;
        return reply.code(200).send({
            success: true,
            data: {
                insuranceAmount,
                principal,
                downPayment,
                interestAmount, // (EMI * n) - p
                emiAmount, // EMI = P*r(1+r)n/((1+r)n-1), where r = 12% from pool mas of slope, n = 12 from FE
                strikePrice,
                maxInterestRate: this.protocolConfig.maxInterestRate,
                btcPrice,
                fee: {
                    flashLoanFee,
                    protocolLoanInitFee,
                    totalFee,
                },
                inst: inst[0],
                total,
                downPaymentTotal,
                approvalTotal,
            },
        });
    }

    public async metadata(request: FastifyRequest, reply: FastifyReply) {
        const { wallet } = request.query as MetadataParams;

        if (!wallet || !isAddress(wallet)) {
            return reply.code(400).send({
                message: 'Invalid wallet address',
            });
        }

        const [ats, vdtts, reserveData, loans, userSpecificLoans] =
            await Promise.all([
                this.rpcService.getATokenUsdcTotalSupply(),
                this.rpcService.getVdtUsdcTokenTotalSupply(),
                this.rpcService.getCbbtcReserveData(),
                getAllLoans(),
                getUserByWallet(wallet),
            ]);

        const totalCollateral = loans.reduce(
            (acc, obj) => acc + BigInt(obj.collateral),
            BigInt(0)
        );

        const balance = userSpecificLoans.reduce(
            (acc, obj) => acc + BigInt(obj.collateral),
            BigInt(0)
        );

        return reply.code(200).send({
            totalDeposited: formatUnits(ats, 8),
            totalBorrowed: formatUnits(vdtts, 6),
            rate: (
                reserveData.currentVariableBorrowRate / BigInt(10 ** 27)
            ).toString(),
            reserveData: serializeBigInt(reserveData),
            numberOfBorrowers: loans.length,
            totalCollateral: formatUnits(totalCollateral, 6),
            balance: balance.toString(),
        });
    }

    private async getContractData(loanItem: Loan) {
        return this.rpcService
            .getLoanByLsa(loanItem.lsaAddress as Address)
            .then((data) => {
                return {
                    ...(data[0] as Exclude<typeof data[0], bigint>),
                    acbbtcBalance: data[1] as bigint,
                    vdtTokenBalance: data[2] as bigint,
                    ...loanItem,
                };
            });
    }

    private parseLsaDetails(lsaDetail: LsaDetail, btcPrice: number) {
        const partialLoanDetail = { ...lsaDetail } as Partial<LsaDetail>;
        delete partialLoanDetail.wallet;
        delete partialLoanDetail.deposit;
        delete partialLoanDetail.loan;
        delete partialLoanDetail.collateral;
        delete partialLoanDetail.lastPaymentTimestamp;
        delete partialLoanDetail.duration;

        const emi = Number(formatUnits(lsaDetail.estimatedMonthlyPayment, 6));
        const duration = Number(lsaDetail.duration);
        const principal = Number(formatUnits(lsaDetail.loanAmount, 6));

        // Interest Estimated = (EMI × duration) - Principal
        const interestEstimated = emi * duration - principal;

        // Total Loan = Principal + Interest Estimated
        const totalLoan = principal + interestEstimated;

        // Total Paid = Sum of all repayment amounts
        const totalPaid = (lsaDetail.repayments ?? []).reduce(
            (sum: number, repayment: RepaymentDetail): number => {
                // repayment.amount is stored as string (BigInt from contract, 6 decimals for USDC)
                const amountInUsdc = Number(repayment.amount) / 1e6;
                return sum + amountInUsdc;
            },
            0
        );

        // Calculate next due based on lastPaymentTimestamp + 30 days
        const REPAYMENT_INTERVAL_SECONDS = 30 * 24 * 60 * 60; // 30 days
        const lastPayment = Number(lsaDetail.lastPaymentTimestamp);
        const nextDueTimestamp = lastPayment > 0
            ? lastPayment + REPAYMENT_INTERVAL_SECONDS
            : Number(lsaDetail.createdAt) + REPAYMENT_INTERVAL_SECONDS;

        return {
            ...partialLoanDetail,
            principal: principal.toFixed(6),
            interestEstimated: interestEstimated.toFixed(6),
            totalLoan: totalLoan.toFixed(6),
            totalPaid: totalPaid.toFixed(6),
            loanStart: unixToDateString(+lsaDetail.salt),
            loanEnd: unixToDateString(
                +lsaDetail.salt + monthsToSeconds(Number(lsaDetail.duration))
            ),
            nextDue: unixToDateString(nextDueTimestamp),
            lastPayment: lastPayment > 0 ? unixToDateString(lastPayment) : null,
            estimatedMonthlyPayment: formatUnits(
                lsaDetail.estimatedMonthlyPayment,
                6
            ),
            totalInstallments: 12,
            pnl:
                (btcPrice - lsaDetail.priceAtBuy) *
                Number(formatUnits(lsaDetail.acbbtcBalance, 8)),
            btcPrice,
            repayments: lsaDetail.repayments ?? [],
            earlyCloseDate: lsaDetail.earlyCloseDate
                ? lsaDetail.earlyCloseDate.toISOString()
                : null,
            fullyLiquidatedDate: lsaDetail.fullyLiquidatedDate
                ? lsaDetail.fullyLiquidatedDate.toISOString()
                : null,
        };
    }

    public async getWallet(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { wallet, lsa } = request.query as GetWalletParams;

            if (!wallet || !isAddress(wallet)) {
                return reply.code(400).send({
                    message: `Invalid wallet address`,
                });
            }

            if (lsa && !isAddress(lsa)) {
                return reply.code(400).send({
                    message: `Invalid lsa address`,
                });
            }

            const result: Loan[] = await getUserByWallet(wallet, lsa);

            const [btcPrice, ...lsaDetails] = await Promise.all([
                this.rpcService.getBtcPrice(),
                ...result.map((loanItem) => this.getContractData(loanItem)),
            ]);

            const {
                acbbtcBalance: aTokenBalanceSum,
                vdtTokenBalance: vdtTokenBalanceSum,
            } = lsaDetails.reduce(
                (acc, obj) => {
                    return {
                        acbbtcBalance: acc.acbbtcBalance + obj.acbbtcBalance,
                        vdtTokenBalance:
                            acc.vdtTokenBalance + obj.vdtTokenBalance,
                    };
                },
                { acbbtcBalance: 0n, vdtTokenBalance: 0n }
            );

            return reply.code(200).send({
                totalAssetValue: {
                    usd: Number(formatUnits(aTokenBalanceSum, 8)) * btcPrice,
                    btc: Number(formatUnits(aTokenBalanceSum, 8)),
                },
                totalBorrowedAssets: {
                    usd: Number(formatUnits(aTokenBalanceSum, 8)) * btcPrice,
                    btc: Number(formatUnits(aTokenBalanceSum, 8)),
                },
                loans: serializeBigInt(
                    lsaDetails.map((lsaDetail) =>
                        this.parseLsaDetails(lsaDetail, btcPrice)
                    )
                ),
            });
        } catch (error) {
            console.log('error:: ', error);
            throw error;
        }
    }

    public async getLsa(request: FastifyRequest, reply: FastifyReply) {
        const { lsa } = request.query as GetLsaParams;

        if (!lsa || !isAddress(lsa)) {
            return reply.code(400).send({
                message: `Invalid lsa address`,
            });
        }

        const result = await getUserByLsa(lsa);

        return reply.code(200).send({
            result,
        });
    }

    public async getLend(request: FastifyRequest, reply: FastifyReply) {

    }
}

export default InsuranceController;
