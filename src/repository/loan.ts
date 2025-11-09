import { Address } from 'viem';
import { Loan } from '../models/Loan.js';

export async function getUserByLsa(lsaAddress: string) {
    return Loan.findOne({
        lsaAddress,
    });
}

export async function getUserByWallet(wallet: string) {
    return Loan.find({
        wallet,
    });
}

export async function getAllLoans() {
    return Loan.find();
}

export async function createLoan({
    wallet,
    loan,
    lsaAddress,
    deposit,
    collateral,
}: {
    wallet: Address;
    lsaAddress: Address;
    collateral: string;
    deposit: string;
    loan: string;
}) {
    const newLoan = new Loan({
        wallet,
        lsaAddress,
        collateral,
        deposit,
        loan,
    });
    return newLoan.save();
}
