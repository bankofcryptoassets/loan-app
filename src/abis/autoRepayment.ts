export const AUTO_REPAYMENT_ABI = [
    {
        type: 'constructor',
        inputs: [
            {
                name: '_loan',
                type: 'address',
                internalType: 'address',
            },
            {
                name: '_debtAsset',
                type: 'address',
                internalType: 'address',
            },
            {
                name: '_executorAddress',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'cancelAutoRepayment',
        inputs: [
            {
                name: 'lsa',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'createAutoRepayment',
        inputs: [
            {
                name: 'lsa',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'executeAutoRepayment',
        inputs: [
            {
                name: 'lsa',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'user',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'i_DEBT_ASSET',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'i_LOAN',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'isAuthorized',
        inputs: [
            {
                name: 'user',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'lsa',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
                internalType: 'bool',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'owner',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'renounceOwnership',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 's_executorAddress',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'setExecutorAddress',
        inputs: [
            {
                name: 'executorAddress',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'transferOwnership',
        inputs: [
            {
                name: 'newOwner',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        name: 'AutoRepayment__ExecutorAddressUpdated',
        inputs: [
            {
                name: 'executorAddress',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'AutoRepayment__RepaymentExecuted',
        inputs: [
            {
                name: 'lsa',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'user',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
                indexed: false,
                internalType: 'uint256',
            },
            {
                name: 'amountRepaid',
                type: 'uint256',
                indexed: false,
                internalType: 'uint256',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'AutoRepayment__RepaymentCancelled',
        inputs: [
            {
                name: 'lsa',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'user',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'AutoRepayment__RepaymentCreated',
        inputs: [
            {
                name: 'lsa',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'user',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'OwnershipTransferred',
        inputs: [
            {
                name: 'previousOwner',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'newOwner',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'error',
        name: 'InvalidExecutor',
        inputs: [],
    },
    {
        type: 'error',
        name: 'InvalidRepaymentHash',
        inputs: [],
    },
    {
        type: 'error',
        name: 'OwnableInvalidOwner',
        inputs: [
            {
                name: 'owner',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'OwnableUnauthorizedAccount',
        inputs: [
            {
                name: 'account',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'SafeERC20FailedOperation',
        inputs: [
            {
                name: 'token',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'ZeroAddress',
        inputs: [],
    },
] as const;
