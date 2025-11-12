import { Address, Hex } from 'viem';
import { Loan } from '../models/Loan.js';

export async function getUserByLsa(lsaAddress: string) {
    return Loan.findOne({
        lsaAddress,
    }).lean();
}

export async function getUserByWallet(wallet: string, lsaAddress?: string) {
    return lsaAddress
        ? Loan.find(
              {
                  wallet,
                  lsaAddress,
              },
              { _id: 0, __v: 0 }
          ).lean()
        : Loan.find(
              {
                  wallet,
              },
              { _id: 0, __v: 0 }
          ).lean();
}

export async function getAllLoans() {
    return Loan.find().lean();
}

export async function createLoan({
    wallet,
    loan,
    lsaAddress,
    deposit,
    collateral,
    btcPrice,
    salt,
}: {
    wallet: Address;
    lsaAddress: Address;
    collateral: string;
    deposit: string;
    loan: string;
    salt: string;
    btcPrice: number;
}) {
    const newLoan = new Loan({
        wallet,
        lsaAddress,
        collateral,
        deposit,
        loan,
        salt,
        priceAtBuy: btcPrice,
    });
    return newLoan.save();
}

export async function addRepayment(txHash: Hex, lsaAddress: Address) {
    return Loan.updateOne({ lsaAddress }, { $push: { repayments: txHash } });
}
