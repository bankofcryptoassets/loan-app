export type LoanCreatedEventAbi = {
    anonymous: false;
    inputs: [
        {
            indexed: true;
            internalType: 'address';
            name: 'borrower';
            type: 'address';
        },
        {
            indexed: true;
            internalType: 'address';
            name: 'lsa';
            type: 'address';
        },
        {
            indexed: false;
            internalType: 'uint256';
            name: 'loanAmount';
            type: 'uint256';
        },
        {
            indexed: false;
            internalType: 'uint256';
            name: 'collateralAmount';
            type: 'uint256';
        }
    ];
    name: 'Loan__LoanCreated';
    type: 'event';
};

export type LoanRepaidEventAbi = {
    anonymous: false;
    inputs: [
        {
            indexed: true;
            internalType: 'address';
            name: 'lsa';
            type: 'address';
        },
        {
            indexed: true;
            internalType: 'uint256';
            name: 'amountRepaid';
            type: 'uint256';
        }
    ];
    name: 'Loan__LoanRepaid';
    type: 'event';
};

export type MicroLiquidationCallEventAbi = {
    anonymous: false;
    inputs: [
        {
            indexed: true;
            internalType: 'address';
            name: 'collateral';
            type: 'address';
        },
        {
            indexed: true;
            internalType: 'address';
            name: 'principal';
            type: 'address';
        },
        {
            indexed: true;
            internalType: 'address';
            name: 'user';
            type: 'address';
        },
        {
            indexed: false;
            internalType: 'uint256';
            name: 'debtToCover';
            type: 'uint256';
        },
        {
            indexed: false;
            internalType: 'uint256';
            name: 'liquidatedCollateralAmount';
            type: 'uint256';
        },
        {
            indexed: false;
            internalType: 'address';
            name: 'liquidator';
            type: 'address';
        },
        {
            indexed: false;
            internalType: 'bool';
            name: 'receiveAToken';
            type: 'bool';
        }
    ];
    name: 'MicroLiquidationCall';
    type: 'event';
};

export type LoanClosedEventAbi = {
    anonymous: false;
    inputs: [
        {
            indexed: true;
            internalType: 'address';
            name: 'lsa';
            type: 'address';
        }
    ];
    name: 'Loan__ClosedLoan';
    type: 'event';
};

export type LiquidationCallEventAbi = {
    anonymous: false;
    inputs: [
        {
            indexed: true;
            internalType: 'address';
            name: 'collateralAsset';
            type: 'address';
        },
        {
            indexed: true;
            internalType: 'address';
            name: 'debtAsset';
            type: 'address';
        },
        {
            indexed: true;
            internalType: 'address';
            name: 'user';
            type: 'address';
        },
        {
            indexed: false;
            internalType: 'uint256';
            name: 'debtToCover';
            type: 'uint256';
        },
        {
            indexed: false;
            internalType: 'uint256';
            name: 'liquidatedCollateralAmount';
            type: 'uint256';
        },
        {
            indexed: false;
            internalType: 'address';
            name: 'liquidator';
            type: 'address';
        },
        {
            indexed: false;
            internalType: 'bool';
            name: 'receiveAToken';
            type: 'bool';
        }
    ];
    name: 'LiquidationCall';
    type: 'event';
};
