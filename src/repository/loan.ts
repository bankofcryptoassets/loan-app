import { Address, Hex } from 'viem';
import { Loan as LoanModel } from '../models/Loan.js';
import { Loan as LoanType } from '../types/loan.js';

export async function getUserByLsa(
    lsaAddress: string
): Promise<LoanType | null> {
    return LoanModel.findOne({
        lsaAddress,
    }).lean() as Promise<LoanType | null>;
}

export async function getUserByWallet(
    wallet: string,
    lsaAddress?: string
): Promise<LoanType[]> {
    return lsaAddress
        ? (LoanModel.find(
              {
                  wallet,
                  lsaAddress,
              },
              { _id: 0, __v: 0, repayments: { _id: 0, _v: 0 } }
          ).lean() as Promise<LoanType[]>)
        : (LoanModel.find(
              {
                  wallet,
              },
              { _id: 0, __v: 0, repayments: { _id: 0, _v: 0 } }
          ).lean() as Promise<LoanType[]>);
}

export async function getAllLoans(): Promise<LoanType[]> {
    return LoanModel.find().lean() as Promise<LoanType[]>;
}

export async function createLoan({
    wallet,
    loan,
    lsaAddress,
    deposit,
    collateral,
    btcPrice,
    salt,
    acbbtcBalance,
    duration,
    estimatedMonthlyPayment,
    vdtTokenBalance,
}: {
    wallet: Address;
    lsaAddress: Address;
    collateral: string;
    acbbtcBalance: string;
    duration: string;
    deposit: string;
    estimatedMonthlyPayment: string;
    vdtTokenBalance: string;
    loan: string;
    salt: string;
    btcPrice: number;
}) {
    const newLoan = new LoanModel({
        wallet,
        lsaAddress,
        collateral,
        acbbtcBalance,
        duration,
        estimatedMonthlyPayment,
        vdtTokenBalance,
        repayments: [],
        deposit,
        loan,
        salt,
        priceAtBuy: btcPrice,
    });
    return newLoan.save();
}

export async function addRepayment({
    txHash,
    lsaAddress,
    amount,
    paymentDate,
    paymentType,
    btcPrice,
    acbbtcBalance,
    vdtTokenBalance,
}: {
    txHash: Hex;
    lsaAddress: Address;
    amount: string;
    paymentDate: number;
    paymentType: 'regular' | 'custom' | 'micro-liquidation' | 'auto-repayment';
    btcPrice: number;
    acbbtcBalance: string;
    vdtTokenBalance: string;
}) {
    return LoanModel.updateOne(
        { lsaAddress },
        {
            $push: {
                repayments: {
                    txHash,
                    amount,
                    paymentDate,
                    paymentType,
                    btcPrice,
                    acbbtcBalance,
                    vdtTokenBalance,
                },
            },
        }
    );
}

export async function updateEarlyCloseDate({
    lsaAddress,
    closeDate,
}: {
    lsaAddress: Address;
    closeDate: Date;
}) {
    return LoanModel.updateOne(
        { lsaAddress },
        {
            $set: {
                earlyCloseDate: closeDate,
            },
        }
    );
}

export async function updateLiquidationDate({
    lsaAddress,
    liquidationDate,
}: {
    lsaAddress: Address;
    liquidationDate: Date;
}) {
    return LoanModel.updateOne(
        { lsaAddress },
        {
            $set: {
                fullyLiquidatedDate: liquidationDate,
            },
        }
    );
}
