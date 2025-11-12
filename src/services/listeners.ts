import { Address, getAddress, Log } from 'viem';
import { LOAN_ABI } from '../abis/loan.js';
import { RpcConfig } from '../types/config.js';
import { Rpc } from './rpc';
import { addRepayment, createLoan, getUserByLsa } from '../repository/loan.js';
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
            indexed: false;
            internalType: 'address';
            name: 'lsa';
            type: 'address';
        },
        {
            indexed: false;
            internalType: 'uint256';
            name: 'amountRepaid';
            type: 'uint256';
        },
        {
            indexed: false;
            internalType: 'uint256';
            name: 'nextDueTimestamp';
            type: 'uint256';
        }
    ];
    name: 'Loan__LoanRepaid';
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
        if (!ev.args.lsa) {
            // todo setup alerts if lsa is not defined in event data
            return;
        }

        const lsaDetails = await getUserByLsa(ev.args.lsa);

        if (!lsaDetails) {
            // todo setup alerts if lsa is not found in db
            // todo implement fallbacks to process all loans with index=${lsa}
            return;
        }
        await addRepayment(ev.transactionHash, ev.args.lsa!);
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
