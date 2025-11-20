import { Address, getAddress, Log } from 'viem';
import { LOAN_ABI } from '../abis/loan.js';
import { LENDING_POOL } from '../abis/lendingPool.js';
import { RpcConfig } from '../types/config.js';
import { Rpc } from './rpc';
import {
    addRepayment,
    createLoan,
    getUserByLsa,
    updateEarlyCloseDate,
    updateLiquidationDate,
} from '../repository/loan.js';
import { combinedLogger } from '../utils/logger.js';
import { saveLoanInitTx } from '../repository/loanInitTx.js';

type LoanCreatedEventAbi = {
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
        },
        {
            indexed: false;
            internalType: 'uint256';
            name: 'createdAt';
            type: 'uint256';
        }
    ];
    name: 'Loan__LoanCreated';
    type: 'event';
};

type LoanRepaidEventAbi = {
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

type MicroLiquidationCallEventAbi = {
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

type LoanClosedEventAbi = {
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

type LiquidationCallEventAbi = {
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

export class Listeners {
    constructor(private rpcService: Rpc, private rpcConfig: RpcConfig) {}

    async init() {
        const _unwatch = this.rpcService.publicClient.watchContractEvent({
            address: this.rpcConfig.contractAddresses.loan as Address,
            abi: LOAN_ABI,
            eventName: 'Loan__LoanCreated',
            onLogs: async (args) => {
                const ev = args[args.length - 1];
                this.handleLoanCreatedEvent(ev);
            },
        });

        const _unwatch2 = this.rpcService.publicClient.watchContractEvent({
            address: this.rpcConfig.contractAddresses.loan as Address,
            abi: LOAN_ABI,
            eventName: 'Loan__LoanRepaid',
            onLogs: async (args) => {
                const ev = args[args.length - 1];
                this.handleLoanRepaidEvent(ev);
            },
        });

        const _unwatch3 = this.rpcService.publicClient.watchContractEvent({
            address: this.rpcConfig.contractAddresses.lendingPool as Address,
            abi: LENDING_POOL,
            eventName: 'MicroLiquidationCall',
            onLogs: async (args) => {
                const ev = args[args.length - 1];
                this.handleMicroLiquidationEvent(ev);
            },
        });

        const _unwatch4 = this.rpcService.publicClient.watchContractEvent({
            address: this.rpcConfig.contractAddresses.loan as Address,
            abi: LOAN_ABI,
            eventName: 'Loan__ClosedLoan',
            onLogs: async (args) => {
                const ev = args[args.length - 1];
                this.handleLoanClosedEvent(ev);
            },
        });

        const _unwatch5 = this.rpcService.publicClient.watchContractEvent({
            address: this.rpcConfig.contractAddresses.lendingPool as Address,
            abi: LENDING_POOL,
            eventName: 'LiquidationCall',
            onLogs: async (args) => {
                const ev = args[args.length - 1];
                this.handleFullLiquidationEvent(ev);
            },
        });
    }

    private async handleLoanCreatedEvent(
        ev: Log<bigint, number, false, LoanCreatedEventAbi>
    ) {
        try {
            combinedLogger.info('Incoming event');
            combinedLogger.info(
                `${JSON.stringify(ev, (_key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                )}`
            );
            const tx = await this.rpcService.getTxReceipt(ev.transactionHash);
            const btcPrice = await this.rpcService.getBtcPrice();
            // console.log('tx:: ', tx);
            const { lsa, borrower, collateralAmount, loanAmount, createdAt } =
                ev.args;
            const deposit = BigInt(tx.logs[0].data).toString();
            console.log('deposit:: ', deposit);
            if (
                !borrower ||
                !lsa ||
                !collateralAmount ||
                !loanAmount ||
                !createdAt
            ) {
                throw new Error(
                    'Invalid arguments received from events: ' +
                        JSON.stringify(ev)
                );
            }
            await createLoan({
                wallet: getAddress(borrower),
                lsaAddress: getAddress(lsa),
                collateral: collateralAmount.toString(),
                deposit,
                loan: loanAmount.toString(),
                salt: createdAt.toString(),
                btcPrice,
            });
            await saveLoanInitTx({
                lsaAddress: getAddress(lsa),
                loanInitTx: JSON.stringify(tx, (_key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                ),
            });

            combinedLogger.info(`Created Loan: ${lsa} for wallet: ${borrower}`);
        } catch (error) {
            console.log('Error processing event::: ', error);
            combinedLogger.error(
                `Error processing event: ${JSON.stringify(
                    ev
                )}, error: ${JSON.stringify(
                    error,
                    Object.getOwnPropertyNames(error)
                )}`
            );
        }
    }

    private async handleLoanRepaidEvent(
        ev: Log<bigint, number, false, LoanRepaidEventAbi>
    ) {
        if (!ev.args.lsa || !ev.args.amountRepaid) {
            // todo setup alerts if lsa or amountRepaid is not defined in event data
            return;
        }

        const lsaDetails = await getUserByLsa(ev.args.lsa);

        if (!lsaDetails) {
            // todo setup alerts if lsa is not found in db
            // todo implement fallbacks to process all loans with index=${lsa}
            return;
        }

        await addRepayment({
            txHash: ev.transactionHash,
            lsaAddress: ev.args.lsa,
            amount: ev.args.amountRepaid.toString(),
            paymentDate: Number(ev.blockNumber), // Block number as timestamp proxy
            paymentType: 'regular',
        });

        combinedLogger.info(
            `Loan repayment recorded: LSA=${ev.args.lsa}, Amount=${ev.args.amountRepaid.toString()}`
        );
    }

    private async handleMicroLiquidationEvent(
        ev: Log<bigint, number, false, MicroLiquidationCallEventAbi>
    ) {
        if (!ev.args.user || !ev.args.debtToCover) {
            // todo setup alerts if user or debtToCover is not defined in event data
            return;
        }

        const lsa = ev.args.user; // In micro liquidation, 'user' is the LSA address
        const lsaDetails = await getUserByLsa(lsa);

        if (!lsaDetails) {
            // todo setup alerts if lsa is not found in db
            return;
        }

        await addRepayment({
            txHash: ev.transactionHash,
            lsaAddress: lsa,
            amount: ev.args.debtToCover.toString(),
            paymentDate: Number(ev.blockNumber), // Block number as timestamp proxy
            paymentType: 'microLiquidation',
        });

        combinedLogger.info(
            `Micro liquidation recorded: LSA=${lsa}, DebtCovered=${ev.args.debtToCover.toString()}, Liquidator=${ev.args.liquidator}`
        );
    }

    private async handleLoanClosedEvent(
        ev: Log<bigint, number, false, LoanClosedEventAbi>
    ) {
        try {
            if (!ev.args.lsa) {
                combinedLogger.error('Loan__ClosedLoan event missing LSA address');
                return;
            }

            const lsa = ev.args.lsa;
            const lsaDetails = await getUserByLsa(lsa);

            if (!lsaDetails) {
                combinedLogger.error(
                    `Loan__ClosedLoan: LSA ${lsa} not found in database`
                );
                return;
            }

            // Get block details to extract timestamp
            const block = await this.rpcService.publicClient.getBlock({
                blockNumber: ev.blockNumber,
            });

            const closeDate = new Date(Number(block.timestamp) * 1000);

            await updateEarlyCloseDate({
                lsaAddress: lsa,
                closeDate,
            });

            combinedLogger.info(
                `Early loan closure recorded: LSA=${lsa}, CloseDate=${closeDate.toISOString()}`
            );
        } catch (error) {
            combinedLogger.error(
                `Error processing Loan__ClosedLoan event: ${JSON.stringify(
                    error,
                    Object.getOwnPropertyNames(error)
                )}`
            );
        }
    }

    private async handleFullLiquidationEvent(
        ev: Log<bigint, number, false, LiquidationCallEventAbi>
    ) {
        try {
            if (!ev.args.user || !ev.args.debtToCover) {
                combinedLogger.error(
                    'LiquidationCall event missing required fields'
                );
                return;
            }

            const lsa = ev.args.user; // LSA address
            const lsaDetails = await getUserByLsa(lsa);

            if (!lsaDetails) {
                combinedLogger.error(
                    `LiquidationCall: LSA ${lsa} not found in database`
                );
                return;
            }

            // Get block details to extract timestamp
            const block = await this.rpcService.publicClient.getBlock({
                blockNumber: ev.blockNumber,
            });

            const liquidationDate = new Date(Number(block.timestamp) * 1000);

            await updateLiquidationDate({
                lsaAddress: lsa,
                liquidationDate,
            });

            combinedLogger.info(
                `Full liquidation recorded: LSA=${lsa}, LiquidationDate=${liquidationDate.toISOString()}, DebtCovered=${ev.args.debtToCover.toString()}, Liquidator=${ev.args.liquidator}`
            );
        } catch (error) {
            combinedLogger.error(
                `Error processing LiquidationCall event: ${JSON.stringify(
                    error,
                    Object.getOwnPropertyNames(error)
                )}`
            );
        }
    }

    private handleEvent(
        ev:
            | Log<bigint, number, false, LoanCreatedEventAbi>
            | Log<bigint, number, false, LoanRepaidEventAbi>
    ) {
        switch (ev.eventName) {
            case 'Loan__LoanCreated':
                this.handleLoanCreatedEvent(ev);
                break;
            case 'Loan__LoanRepaid':
                this.handleLoanRepaidEvent(ev);
        }
    }
}
