export type Loan = {
    wallet: string;
    lsaAddress: string;
    deposit: string;
    loan: string;
    collateral: string;
    priceAtBuy: number;
    repayments?: string[] | null | undefined;
    salt: string;
};

export type LsaDetail = {
    wallet: string;
    lsaAddress: string;
    deposit: string;
    loan: string;
    collateral: string;
    priceAtBuy: number;
    repayments?: string[] | null | undefined;
    salt: string;
    aTokenBalance: bigint;
    vdtTokenBalance: bigint;
    borrower: `0x${string}`;
    depositAmount: bigint;
    loanAmount: bigint;
    collateralAmount: bigint;
    estimatedMonthlyPayment: bigint;
    duration: bigint;
    createdAt: bigint;
    insuranceID: bigint;
    nextDueTimestamp: bigint;
    lastDueTimestamp: bigint;
    status: number;
};
