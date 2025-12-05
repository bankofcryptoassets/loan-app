export type RepaymentDetail = {
    txHash: string;
    amount: string;
    paymentDate: number;
    paymentType: 'regular' | 'custom' | 'micro-liquidation' | 'auto-repayment';
    btcPrice: number;
    vdtTokenBalance: string;
    acbbtcBalance: string;
};

export type Loan = {
    wallet: string;
    lsaAddress: string;
    deposit: string;
    loan: string;
    collateral: string;
    estimatedMonthlyPayment: string;
    duration: string;
    acbbtcBalance: string;
    vdtTokenBalance: string;
    priceAtBuy: number;
    repayments: RepaymentDetail[];
    salt: string;
    earlyCloseDate?: Date | null;
    fullyLiquidatedDate?: Date | null;
};

export type LsaDetail = {
    wallet: string;
    lsaAddress: string;
    deposit: string;
    loan: string;
    collateral: string;
    priceAtBuy: number;
    repayments?: RepaymentDetail[] | null | undefined;
    salt: string;
    earlyCloseDate?: Date | null;
    fullyLiquidatedDate?: Date | null;
    acbbtcBalance: bigint;
    vdtTokenBalance: bigint;
    borrower: `0x${string}`;
    depositAmount: bigint;
    loanAmount: bigint;
    collateralAmount: bigint;
    estimatedMonthlyPayment: string;
    duration: string;
    createdAt: bigint;
    insuranceID: bigint;
    lastPaymentTimestamp: bigint;
    status: number;
};

export type LoanDataFromContract = {
    borrower: `0x${string}`;
    depositAmount: bigint;
    loanAmount: bigint;
    collateralAmount: bigint;
    estimatedMonthlyPayment: bigint;
    duration: bigint;
    createdAt: bigint;
    insuranceID: bigint;
    lastPaymentTimestamp: bigint;
    status: number;
};
