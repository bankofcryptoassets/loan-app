export const LOAN_ABI = [
    {
        inputs: [
            { internalType: 'address', name: '_aaveV3Pool', type: 'address' },
            { internalType: 'address', name: '_aaveV2Pool', type: 'address' },
            {
                internalType: 'address',
                name: '_aaveAddressesProvider',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'collateralAsset_',
                type: 'address',
            },
            { internalType: 'address', name: 'debtAsset_', type: 'address' },
            { internalType: 'address', name: '_swapAdapter', type: 'address' },
            { internalType: 'address', name: '_zQuoter', type: 'address' },
            {
                internalType: 'uint256',
                name: '_maxLoanAmount',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'lsa',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'borrower',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
            },
        ],
        name: 'CollateralWithdrawn',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'oldEscrow',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newEscrow',
                type: 'address',
            },
        ],
        name: 'EscrowUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'borrower',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'lsa',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'loanAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'collateralAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'createdAt',
                type: 'uint256',
            },
        ],
        name: 'LoanCreated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'lsa',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'enum LoanStorage.LoanStatus',
                name: 'oldStatus',
                type: 'uint8',
            },
            {
                indexed: false,
                internalType: 'enum LoanStorage.LoanStatus',
                name: 'newStatus',
                type: 'uint8',
            },
        ],
        name: 'LoanStatusUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'oldFactory',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newFactory',
                type: 'address',
            },
        ],
        name: 'LoanVaultFactoryUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'oldAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newAmount',
                type: 'uint256',
            },
        ],
        name: 'MaxLoanAmountUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'oldSwapAdapter',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newSwapAdapter',
                type: 'address',
            },
        ],
        name: 'SwapAdapterUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'oldZQuoter',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newZQuoter',
                type: 'address',
            },
        ],
        name: 'ZQuoterUpdated',
        type: 'event',
    },
    {
        inputs: [],
        name: 'AAVE_ADDRESSES_PROVIDER',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'AAVE_V2_POOL',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'AAVE_V3_POOL',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'MAX_SLIPPAGE_BPS',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'loanAmount', type: 'uint256' },
            { internalType: 'uint256', name: 'deposit', type: 'uint256' },
        ],
        name: 'calculateStrikePrice',
        outputs: [
            { internalType: 'uint256', name: 'strikePrice', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'escrow',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address[]', name: 'assets', type: 'address[]' },
            { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
            { internalType: 'uint256[]', name: 'premiums', type: 'uint256[]' },
            { internalType: 'address', name: 'initiator', type: 'address' },
            { internalType: 'bytes', name: 'params', type: 'bytes' },
        ],
        name: 'executeOperation',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getCollateralAsset',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getDebtAsset',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'lsa', type: 'address' }],
        name: 'getLoanByLSA',
        outputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'borrower',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'depositAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'loanAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'collateralAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'estimatedMonthlyPayment',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'duration',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'createdAt',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'insuranceID',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'nextDueTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastDueTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'enum LoanStorage.LoanStatus',
                        name: 'status',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct LoanStorage.LoanData',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
        name: 'getUserAllLoans',
        outputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'borrower',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'depositAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'loanAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'collateralAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'estimatedMonthlyPayment',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'duration',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'createdAt',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'insuranceID',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'nextDueTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastDueTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'enum LoanStorage.LoanStatus',
                        name: 'status',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct LoanStorage.LoanData[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'user', type: 'address' },
            { internalType: 'uint256', name: 'index', type: 'uint256' },
        ],
        name: 'getUserLoanAtIndex',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
        name: 'getUserLoanCount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'depositAmount', type: 'uint256' },
            {
                internalType: 'uint256',
                name: 'collateralAmount',
                type: 'uint256',
            },
            { internalType: 'uint256', name: 'duration', type: 'uint256' },
            { internalType: 'uint256', name: 'insuranceID', type: 'uint256' },
        ],
        name: 'initializeLoan',
        outputs: [{ internalType: 'address', name: 'lsa', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'loanVaultFactory',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'maxLoanAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'newEscrow', type: 'address' },
        ],
        name: 'setEscrow',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'newFactory', type: 'address' },
        ],
        name: 'setLoanVaultFactory',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'newMaxLoanAmount',
                type: 'uint256',
            },
        ],
        name: 'setMaxLoanAmount',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newSwapAdapter',
                type: 'address',
            },
        ],
        name: 'setSwapAdapter',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'newZQuoter', type: 'address' },
        ],
        name: 'setZQuoter',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'swapAdapter',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'newOwner', type: 'address' },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'lsa', type: 'address' },
            {
                internalType: 'enum LoanStorage.LoanStatus',
                name: 'newStatus',
                type: 'uint8',
            },
        ],
        name: 'updateLoanStatus',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint256', name: '', type: 'uint256' },
        ],
        name: 'userLoanAtIndex',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'userLoanCount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'lsa', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'withdrawCollateral',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountWithdrawn',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'zQuoter',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;
