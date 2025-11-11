import { Address } from 'viem';
import { Loan } from '../models/Loan.js';

export async function getUserByLsa(lsaAddress: string) {
    return Loan.findOne({
        lsaAddress,
    });
}

export async function getUserByWallet(wallet: string, lsaAddress?: string) {
    return lsaAddress
        ? Loan.find({
              wallet,
              lsaAddress,
          })
        : Loan.find({
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
    salt,
}: {
    wallet: Address;
    lsaAddress: Address;
    collateral: string;
    deposit: string;
    loan: string;
    salt: string;
}) {
    const newLoan = new Loan({
        wallet,
        lsaAddress,
        collateral,
        deposit,
        loan,
        salt,
    });
    return newLoan.save();
}
