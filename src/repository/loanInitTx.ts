import { LoanInitTx } from '../models/LoanInitTx.js';
import { Address } from 'viem';

export async function saveLoanInitTx({
    lsaAddress,
    loanInitTx,
}: {
    lsaAddress: Address;
    loanInitTx: string;
}) {
    const loanInit = new LoanInitTx({
        loanInitTx,
        lsaAddress,
    });

    return loanInit.save();
}
