export type RepaymentDetail = {
    txHash: string;
    amount: string;
    paymentDate: number;
    paymentType: 'regular' | 'microLiquidation' | 'autoRepayment';
};

export type Loan = {
    wallet: string;
    lsaAddress: string;
    deposit: string;
    loan: string;
    collateral: string;
    estimatedMonthlyPayment: string;
    priceAtBuy: number;
    repayments?: RepaymentDetail[] | null | undefined;
    salt: string;
    createdAt: Date;
    updatedAt: Date;
    earlyCloseDate?: Date | null;
    fullyLiquidatedDate?: Date | null;
    autoRepayment?: {
        enabled: boolean;
        enabledAt?: Date;
    };
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
    createdAt: Date; // From MongoDB timestamps
    updatedAt: Date;
    earlyCloseDate?: Date | null;
    fullyLiquidatedDate?: Date | null;
    autoRepayment?: {
        enabled: boolean;
        enabledAt?: Date;
    };
    acbbtcBalance: bigint;
    vdtTokenBalance: bigint;
    borrower: `0x${string}`;
    depositAmount: bigint;
    loanAmount: bigint;
    collateralAmount: bigint;
    estimatedMonthlyPayment: bigint;
    duration: bigint;
    contractCreatedAt: bigint; // From contract to avoid conflict
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
