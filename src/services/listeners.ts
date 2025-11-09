import { Address, getAddress, Log } from 'viem';
import { LOAN_ABI } from '../abis/loan.js';
import { RpcConfig } from '../types/config.js';
import { Rpc } from './rpc';
import { createLoan } from 'repository/loan.js';
import { combinedLogger } from 'utils/logger.js';
import { saveLoanInitTx } from 'repository/loanInitTx.js';

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
    }

    private async handleLoanCreatedEvent(
        ev: Log<bigint, number, false, LoanCreatedEventAbi>
    ) {
        try {
            const tx = await this.rpcService.getTxReceipt(ev.transactionHash);
            const { lsa, borrower, collateralAmount, loanAmount, createdAt } =
                ev.args;
            const deposit = BigInt(tx.logs[0].data).toString();
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
            });
            await saveLoanInitTx({
                lsaAddress: getAddress(lsa),
                loanInitTx: JSON.stringify(tx, (_key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                ),
            });
        } catch (error) {
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

    private handleEvent(ev: Log<bigint, number, false, LoanCreatedEventAbi>) {
        switch (ev.eventName) {
            case 'Loan__LoanCreated':
                this.handleLoanCreatedEvent(ev);
        }
    }
}
