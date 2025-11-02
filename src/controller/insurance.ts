import { FastifyRequest, FastifyReply } from 'fastify';
import { DeribitService } from '../services/deribit.js';
import { Rpc } from '../services/rpc.js';

type EstimateReqParams = {
    qty: string;
    deposit: string;
};

export class InsuranceController {
    constructor(
        private readonly deribitService: DeribitService,
        private readonly rpcService: Rpc
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
        const deposit = Number(query.deposit);
        const loan = qty - deposit;

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

        // get strike price, interest rate and btc price from contract.
        const { strikePrice, maxInterestRate, btcPrice } =
            await this.rpcService.fetchEstimationParams(deposit, loan);

        const inst = await this.deribitService.getOptimalInstrument(
            strikePrice
        );

        reply.code(200).send({
            success: true,
            data: {
                principal: qty * btcPrice * (1 - deposit),
                downPayment: qty * btcPrice * deposit,
                strikePrice,
                maxInterestRate,
                btcPrice,
                inst: inst[inst.length - 1],
            },
        });
    }
}

export default InsuranceController;
