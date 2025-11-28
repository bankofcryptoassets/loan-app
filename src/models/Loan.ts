import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema(
    {
        wallet: {
            type: String,
            required: true,
        },
        lsaAddress: {
            type: String,
            required: true,
        },
        // in usdc
        deposit: {
            type: String,
            required: true,
        },
        // in usdc
        loan: {
            type: String,
            required: true,
        },
        // in cbbtc
        collateral: {
            type: String,
            required: true,
        },
        // in usdc - estimated monthly payment (EMI)
        estimatedMonthlyPayment: {
            type: String,
            required: true,
        },
        priceAtBuy: {
            type: Number,
            required: true,
        },
        repayments: [
            {
                txHash: { type: String, required: true },
                amount: { type: String, required: true }, // Store as string (BigInt)
                paymentDate: { type: Number, required: true }, // Unix timestamp
                paymentType: {
                    type: String,
                    enum: ['regular', 'microLiquidation', 'autoRepayment'],
                    required: true,
                },
            },
        ],
        salt: {
            type: String,
            required: true,
        },
        earlyCloseDate: {
            type: Date,
            required: false,
            default: null,
        },
        fullyLiquidatedDate: {
            type: Date,
            required: false,
            default: null,
        },
        autoRepayment: {
            enabled: {
                type: Boolean,
                required: false,
                default: false,
            },
            enabledAt: {
                type: Date,
                required: false,
            },
        },
    },
    { timestamps: true }
);

export const Loan = mongoose.model('Loan', loanSchema);
