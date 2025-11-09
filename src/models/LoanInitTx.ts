import mongoose from 'mongoose';

const loanInitTxSchema = new mongoose.Schema({
    lsaAddress: {
        type: String,
        required: true,
    },
    loanInitTx: {
        type: String,
        required: true,
    },
});

export const LoanInitTx = mongoose.model('LoanInitTx', loanInitTxSchema);
