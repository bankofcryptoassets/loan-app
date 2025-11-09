import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
    wallet: {
        type: String,
        required: true,
        unique: true,
    },
    lsaAddress: {
        type: String,
        required: true,
    },
    // in cbbtc
    deposit: {
        type: String,
        required: true,
        default: '0',
    },
    // in usdc
    loan: {
        type: String,
        required: true,
        default: '0',
    },
    // in usdc
    collateral: {
        type: String,
        required: true,
        default: '0',
    },
});

export const Loan = mongoose.model('Loan', loanSchema);
