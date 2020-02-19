import { Subject } from 'rxjs';
import { ClosePositionFor } from "./ethereum/1x/1x-contract";

export type TransactionQueueContract = {
    queryParams: ClosePositionFor,
    executeTransaction: (params: ClosePositionFor) => Promise<string>
};

export type ProcessedTransaction = {
    user: string,
    blockNumber: number
};

export class TransactionQueue {

    private transactions = new Subject<TransactionQueueContract>();
    public processedTransactions: ProcessedTransaction[] = [];

    constructor() {
        this.transactions.subscribe(
            async (contract: TransactionQueueContract) => {

                try {
                    const txHash = await contract.executeTransaction(contract.queryParams);
                    console.log("closePositionFor: ", txHash);
                } catch (e) {
                    // this.deleteUser(contract.queryParams.user)
                    console.log("Failed to close position: ", e);
                }
            }
        );
    }

    publish(contract: TransactionQueueContract, blockNumber: number) {
        this.processedTransactions.push({
            user: contract.queryParams.user,
            blockNumber
        });
        this.transactions.next(contract);
    }

    private deleteUser(user: string): void {
        this.processedTransactions = this.processedTransactions.filter(x => x.user !== user);
    }
}
