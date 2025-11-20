export const LOAN_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_aaveV3Pool",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_aaveAddressesProvider",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_bitmorPool",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_oracle",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_collateralAsset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_debtAsset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_swapAdapter",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_zQuoter",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_premiumCollector",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_preClosureFeeBps",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "CallerIsNotAAVEPool",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "CollateralWithdrawFailed",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "GreaterThanMaxCollateralAllowed",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "IndexOutOfBounds",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InsufficientCollateral",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InsufficientDeposit",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidAssetPrice",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "LessThanMinimumAmtReceived",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "LoanDoesNotExists",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "LoanIsNotActive",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            }
        ],
        "name": "SafeERC20FailedOperation",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "WrongFLInitiator",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ZeroAmount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            }
        ],
        "name": "Loan__ClosedLoan",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "newEscrow",
                "type": "address"
            }
        ],
        "name": "Loan__EscrowUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "newGracePeriod",
                "type": "uint256"
            }
        ],
        "name": "Loan__GracePeriodUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "borrower",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "loanAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "collateralAmount",
                "type": "uint256"
            }
        ],
        "name": "Loan__LoanCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "Loan__LoanDataUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "amountRepaid",
                "type": "uint256"
            }
        ],
        "name": "Loan__LoanRepaid",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "enum DataTypes.LoanStatus",
                "name": "oldStatus",
                "type": "uint8"
            },
            {
                "indexed": true,
                "internalType": "enum DataTypes.LoanStatus",
                "name": "newStatus",
                "type": "uint8"
            }
        ],
        "name": "Loan__LoanStatusUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "newFactory",
                "type": "address"
            }
        ],
        "name": "Loan__LoanVaultFactoryUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "newAmount",
                "type": "uint256"
            }
        ],
        "name": "Loan__MaxLoanAmountUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "newPreClosureFee",
                "type": "uint256"
            }
        ],
        "name": "Loan__PreClosureFeeUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "newPremiumCollector",
                "type": "address"
            }
        ],
        "name": "Loan__PremiumCollectorUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "newSwapAdapter",
                "type": "address"
            }
        ],
        "name": "Loan__SwapAdapterUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "newZQuoter",
                "type": "address"
            }
        ],
        "name": "Loan__ZQuoterUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "ADDRESSES_PROVIDER",
        "outputs": [
            {
                "internalType": "contract IPoolAddressesProvider",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_COLLATERAL_AMOUNT",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_SLIPPAGE_BPS",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "POOL",
        "outputs": [
            {
                "internalType": "contract IPool",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "loanAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deposit",
                "type": "uint256"
            }
        ],
        "name": "calculateStrikePrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "strikePrice",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "withdrawInCollateralAsset",
                "type": "bool"
            }
        ],
        "name": "closeLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "premium",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "initiator",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "params",
                "type": "bytes"
            }
        ],
        "name": "executeOperation",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCollateralAsset",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDebtAsset",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getGracePeriod",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            }
        ],
        "name": "getLoanByLSA",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "depositAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "loanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collateralAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "estimatedMonthlyPayment",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "duration",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "insuranceID",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lastPaymentTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum DataTypes.LoanStatus",
                        "name": "status",
                        "type": "uint8"
                    }
                ],
                "internalType": "struct DataTypes.LoanData",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "collateralAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "duration",
                "type": "uint256"
            }
        ],
        "name": "getLoanDetails",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "loanAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "monthlyPayment",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minDepositRequired",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPreClosureFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPremiumCollector",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getRepaymentInterval",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserAllLoans",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "borrower",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "depositAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "loanAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collateralAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "estimatedMonthlyPayment",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "duration",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "insuranceID",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lastPaymentTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum DataTypes.LoanStatus",
                        "name": "status",
                        "type": "uint8"
                    }
                ],
                "internalType": "struct DataTypes.LoanData[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getUserLoanAtIndex",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserLoanCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "i_AAVE_ADDRESSES_PROVIDER",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "i_AAVE_V3_POOL",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "i_BITMOR_POOL",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "i_ORACLE",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "depositAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "premiumAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "collateralAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "duration",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "insuranceID",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "onBehalfOf",
                "type": "address"
            }
        ],
        "name": "initializeLoan",
        "outputs": [
            {
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "repay",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "finalAmountRepaid",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "s_loanVaultFactory",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "s_swapAdapter",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "s_userLoanAtIndex",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "s_userLoanCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "s_zQuoter",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "gracePeriod",
                "type": "uint256"
            }
        ],
        "name": "setGracePeriod",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newFactory",
                "type": "address"
            }
        ],
        "name": "setLoanVaultFactory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newFee",
                "type": "uint256"
            }
        ],
        "name": "setPreClosureFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newPremiumCollector",
                "type": "address"
            }
        ],
        "name": "setPremiumCollector",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newSwapAdapter",
                "type": "address"
            }
        ],
        "name": "setSwapAdapter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newZQuoter",
                "type": "address"
            }
        ],
        "name": "setZQuoter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_data",
                "type": "bytes"
            },
            {
                "internalType": "address",
                "name": "_lsa",
                "type": "address"
            }
        ],
        "name": "updateLoanData",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "lsa",
                "type": "address"
            },
            {
                "internalType": "enum DataTypes.LoanStatus",
                "name": "newStatus",
                "type": "uint8"
            }
        ],
        "name": "updateLoanStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
