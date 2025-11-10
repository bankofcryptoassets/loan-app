import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
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
    salt: {
        type: String,
        required: true,
    },
});

export const Loan = mongoose.model('Loan', loanSchema);
