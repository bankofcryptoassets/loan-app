import { FastifyRequest, FastifyReply } from 'fastify';
import { DeribitService } from '../services/deribit.js';
import { Rpc } from '../services/rpc.js';
import { ProtocolConfig } from '../types/config.js';

type EstimateReqParams = {
    qty: string;
    deposit: string;
    n: string;
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
        // 8
        // 30% 0f 8 = 2.4
        const qty = Number(query.qty);
        const deposit = Number((qty * Number(query.deposit)) / 100);
        const loan = qty - deposit;
        const n = Number(query.n ?? 12);

        // console.log({ qty, deposit, loan });

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
        const { strikePrice, maxInterestRate } =
            await this.rpcService.fetchEstimationParams(
                deposit * btcPrice,
                loan * btcPrice
            );

        const inst = await this.deribitService.getOptimalInstrument(
            strikePrice
        );

        // console.log(inst.length);
        // console.log(inst[0], inst[1], inst[2], inst[3], inst[4]);

        const r = maxInterestRate / 100 / n;
        const principal = qty * btcPrice * loan;
        const downPayment = qty * btcPrice * deposit;
        const emiAmount =
            (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const interestAmount = emiAmount * n - principal;

        return reply.code(200).send({
            success: true,
            data: {
                principal,
                downPayment,
                interestAmount, // (EMI * n) - p
                emiAmount, // EMI = P*r(1+r)n/((1+r)n-1), where r = 12% from pool mas of slope, n = 12 from FE
                strikePrice,
                maxInterestRate,
                btcPrice,
                inst0: inst[0],
            },
        });
    }
    //protocol fee = 0.5%
    //
}

export default InsuranceController;
