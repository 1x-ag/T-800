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

                // tslint:disable-next-line:no-console

                try {
                    const txHash = await contract.executeTransaction(contract.queryParams);
                    // tslint:disable-next-line:no-console
                    console.log(`Success for ${contract.queryParams.user}: `, txHash);
                } catch (e) {
                    // this.deleteUser(contract.queryParams.user)
                    // tslint:disable-next-line:no-console
                    console.log(`Failed to close position for ${contract.queryParams.user}: `, e);
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
