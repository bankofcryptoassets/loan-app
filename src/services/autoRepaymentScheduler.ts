import { Address } from 'viem';
import * as cron from 'node-cron';
import { Rpc } from './rpc.js';
import { getLoansWithAutoRepaymentEnabled } from '../repository/loan.js';
import { combinedLogger } from '../utils/logger.js';

/**
 * Auto-Repayment Scheduler Service
 *
 * Uses cron to schedule auto-repayment checks.
 * Default: Runs every 6 hours (cron: "0 *\/6 * * *")
 *
 * Logic:
 * 1. Fetch all loans with auto-repayment enabled from database
 * 2. For each loan, check if next payment is due in the next 24 hours
 * 3. If yes, execute the repayment transaction
 *
 */
export class AutoRepaymentScheduler {
    private cronJob?: cron.ScheduledTask;

    constructor(private rpcService: Rpc, private cronSchedule: string) {}

    /**
     * Starts the auto-repayment scheduler with cron
     */
    start() {
        combinedLogger.info(
            `Auto-repayment scheduler started with cron: ${this.cronSchedule}`
        );

        // Schedule cron job
        this.cronJob = cron.schedule(this.cronSchedule, () => {
            this.checkAndExecuteRepayments();
        });
    }

    /**
     * Stops the auto-repayment scheduler
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = undefined;
            combinedLogger.info('Auto-repayment scheduler stopped');
        }
    }

    /**
     * Main execution logic - checks all loans and executes repayments if due
     */
    private async checkAndExecuteRepayments() {
        try {
            combinedLogger.info('Starting auto-repayment check cycle');

            // Get all loans with auto-repayment enabled from database
            const loansWithAutoRepayment =
                await getLoansWithAutoRepaymentEnabled();

            if (loansWithAutoRepayment.length === 0) {
                combinedLogger.info('No loans with auto-repayment enabled');
                return;
            }

            combinedLogger.info(
                `Found ${loansWithAutoRepayment.length} loans with auto-repayment enabled`
            );

            // Process each loan
            for (const loan of loansWithAutoRepayment) {
                const now = Math.floor(Date.now() / 1000);
                try {
                    await this.processLoan(loan, now);
                } catch (error) {
                    combinedLogger.error(
                        `Error processing loan ${loan.lsaAddress}: ${error}`
                    );
                }
            }

            combinedLogger.info('Completed auto-repayment check cycle');
        } catch (error) {
            combinedLogger.error(
                `Error in check cycle: ${JSON.stringify(
                    error,
                    Object.getOwnPropertyNames(error)
                )}`
            );
        }
    }

    /**
     * Process a single loan - check if repayment is due and execute if needed
     */
    private async processLoan(
        loan: Awaited<ReturnType<typeof getLoansWithAutoRepaymentEnabled>>[0],
        currentTime: number
    ) {
        const {
            lsaAddress,
            wallet,
            repayments,
            createdAt,
            estimatedMonthlyPayment,
            earlyCloseDate,
            fullyLiquidatedDate,
        } = loan;

        try {
            // Skip if loan is closed or liquidated
            if (earlyCloseDate || fullyLiquidatedDate) {
                combinedLogger.info(
                    `Skipping loan ${lsaAddress} - already closed or liquidated`
                );
                return;
            }

            // Calculate next due date from database
            const DAYS_30_IN_SECONDS = 30 * 24 * 60 * 60;
            let nextDueDate: number;

            if (repayments && repayments.length > 0) {
                // Use last repayment date + 30 days
                const lastRepayment = repayments[repayments.length - 1];
                nextDueDate = lastRepayment.paymentDate + DAYS_30_IN_SECONDS;
            } else {
                // No repayments yet, use loan creation date + 30 days
                nextDueDate =
                    Math.floor(new Date(createdAt).getTime() / 1000) +
                    DAYS_30_IN_SECONDS;
            }

            // How much time until due? (negative = overdue)
            const secondsUntilDue = nextDueDate - currentTime;
            const hoursUntilDue = Math.floor(secondsUntilDue / 60 / 60);

            // Only execute if due in next 24 hours or already overdue
            const HOURS_24_IN_SECONDS = 24 * 60 * 60;
            if (secondsUntilDue > HOURS_24_IN_SECONDS) {
                combinedLogger.info(
                    `Loan ${lsaAddress} not due yet. Due in ${hoursUntilDue} hours`
                );
                return;
            }

            // Log if overdue
            if (secondsUntilDue < 0) {
                combinedLogger.warn(
                    `Loan ${lsaAddress} is overdue by ${Math.abs(
                        hoursUntilDue
                    )} hours`
                );
            }

            // Execute repayment
            combinedLogger.info(
                `Executing repayment for loan ${lsaAddress} - Amount: ${estimatedMonthlyPayment}`
            );

            const txHash = await this.rpcService.executeAutoRepayment(
                lsaAddress as Address,
                wallet as Address,
                BigInt(estimatedMonthlyPayment)
            );

            combinedLogger.info(
                `Repayment transaction submitted for ${lsaAddress} - TxHash: ${txHash}`
            );

            // Wait for transaction to be mined
            const receipt =
                await this.rpcService.publicClient.waitForTransactionReceipt({
                    hash: txHash,
                });

            if (receipt.status === 'success') {
                combinedLogger.info(
                    `Repayment successful for ${lsaAddress} - Block: ${receipt.blockNumber}`
                );
            } else {
                combinedLogger.error(
                    `Repayment transaction failed for ${lsaAddress} - TxHash: ${txHash}`
                );
            }
        } catch (error) {
            combinedLogger.error(
                `Error executing repayment for ${lsaAddress}: ${error}`
            );
        }
    }
}
