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
import {
    descale,
    scale,
    serializeBigInt,
    fixedScale,
    fixedScaleExponent,
    pow,
} from '../utils/bigint.js';
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

        const qtyExponent = 8;
        const depositPercentExponent = 4;
        const btcPriceExponent = 2;

        const qty = scale(Number(query.qty), qtyExponent);
        const depositPercent = scale(
            Number(query.deposit) / 100,
            depositPercentExponent
        );
        // NOTE: both deposit and loan consists of qtyExponent and depositPercentExponent factors.
        const deposit = qty * depositPercent;
        const loan = scale(qty, depositPercentExponent) - deposit;
        const n = BigInt(query.n ?? 12);

        if (loan < deposit) {
            return reply.code(400).send({
                message: 'loan cannot be less than deposit',
            });
        }

        if (loan < 0) {
            return reply.code(400).send({
                message: 'deposit cannot be greater than qty',
            });
        }

        // get btc price
        const btcPrice = await this.rpcService.getBtcPrice();

        // scaledBtcPrice is in bigint with btcPriceExponent factor
        const scaledBtcPrice = scale(btcPrice, btcPriceExponent);

        // get strike price, interest rate and btc price from contract.
        const strikePrice = await this.rpcService.getStrikePrice(
            descale(
                deposit * scaledBtcPrice,
                qtyExponent + depositPercentExponent + btcPriceExponent
            ),
            descale(
                loan * scaledBtcPrice,
                qtyExponent + depositPercentExponent + btcPriceExponent
            )
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
        if (n <= 0n) {
            return reply.code(400).send({
                message: 'n should be a positive integer',
            });
        }

        const principal = scaledBtcPrice * loan;
        const principalDecimals =
            qtyExponent + depositPercentExponent + btcPriceExponent;
        const downPayment = descale(
            deposit * scaledBtcPrice,
            qtyExponent + btcPriceExponent + depositPercentExponent
        );

        const periodicRate =
            this.protocolConfig.maxInterestRate / 100 / Number(n);
        const rateDecimals = fixedScaleExponent;
        const rScaled = scale(periodicRate, rateDecimals);

        let emi: bigint;
        if (rScaled === 0n) {
            emi = principal / n;
        } else {
            const onePlusR = fixedScale + rScaled;
            const powResult = pow(onePlusR, n);
            const powValue = powResult.value;
            const denominator = fixedScale * (powValue - fixedScale);

            if (denominator === 0n) {
                emi = principal / n;
            } else {
                const numerator = principal * rScaled * powValue;
                emi = numerator / denominator;
            }
        }

        const emiAmount = descale(emi, principalDecimals);
        const interestAmount = descale(emi * n - principal, principalDecimals);
        const flashLoanFee = (scale(flashLoanFeePercent, 2) * principal) / 100n;
        const protocolLoanInitFee =
            (scale(protocolLoanInitFeePercent, 2) * qty * scaledBtcPrice) /
            100n;
        const totalFee =
            descale(flashLoanFee, principalDecimals + 2) +
            descale(protocolLoanInitFee, 12);
        const insuranceAmount =
            descale(qty, qtyExponent) *
            descale(scaledBtcPrice, btcPriceExponent) *
            0.0335;
        const total =
            descale(principal, principalDecimals) +
            interestAmount +
            totalFee +
            insuranceAmount;
        const downPaymentTotal = downPayment + insuranceAmount + totalFee;
        const approvalTotal = downPayment + insuranceAmount + totalFee;
        return reply.code(200).send({
            success: true,
            data: {
                insuranceAmount,
                principal: descale(principal, principalDecimals),
                downPayment,
                interestAmount, // (EMI * n) - p
                emiAmount, // EMI = P*r(1+r)n/((1+r)n-1), where r = 12% from pool mas of slope, n = 12 from FE
                strikePrice,
                maxInterestRate: this.protocolConfig.maxInterestRate,
                btcPrice,
                fee: {
                    flashLoanFee: descale(flashLoanFee, principalDecimals + 2),
                    protocolLoanInitFee: descale(protocolLoanInitFee, 12),
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
                const { createdAt, ...contractData } = data[0];

                return {
                    ...loanItem,
                    ...contractData, // Contract data overrides DB data
                    contractCreatedAt: createdAt,
                    acbbtcBalance: data[1] as bigint,
                    vdtTokenBalance: data[2] as bigint,
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
        const nextDueTimestamp =
            lastPayment > 0
                ? lastPayment + REPAYMENT_INTERVAL_SECONDS
                : Number(lsaDetail.contractCreatedAt) +
                  REPAYMENT_INTERVAL_SECONDS;

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
                    usd: Number(formatUnits(vdtTokenBalanceSum, 8)) * btcPrice,
                    btc: Number(formatUnits(vdtTokenBalanceSum, 8)),
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
}

export default InsuranceController;
