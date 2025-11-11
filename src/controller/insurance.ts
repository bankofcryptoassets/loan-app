import { FastifyRequest, FastifyReply } from 'fastify';
import { DeribitService } from '../services/deribit.js';
import { Rpc } from '../services/rpc.js';
import { ProtocolConfig } from '../types/config.js';
import {
    getAllLoans,
    getUserByLsa,
    getUserByWallet,
} from '../repository/loan.js';
import { formatUnits, isAddress } from 'viem';
import { serializeBigInt } from '../utils/bigint.js';

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

export class InsuranceController {
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
        const deposit = Number((qty * Number(query.deposit)) / 100);
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
        const downPayment = qty * btcPrice * deposit;
        const emiAmount =
            (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const interestAmount = emiAmount * n - principal;
        const flashLoanFee = (flashLoanFeePercent * principal) / 100;
        const protocolLoanInitFee =
            (protocolLoanInitFeePercent * qty * btcPrice) / 100;
        const totalFee = flashLoanFee + protocolLoanInitFee;

        return reply.code(200).send({
            success: true,
            data: {
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
                this.rpcService.getATokenTotalSupply(),
                this.rpcService.getVdtTokenTotalSupply(),
                this.rpcService.getAvailableBtcFromReserve(),
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

    public async getWallet(request: FastifyRequest, reply: FastifyReply) {
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

        const result = await getUserByWallet(wallet, lsa);

        return reply.code(200).send({
            result,
        });
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
