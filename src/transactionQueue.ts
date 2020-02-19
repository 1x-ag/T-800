import { Subject } from 'rxjs';
import { ClosePositionFor } from "./ethereum/1x/1x-contract";

export type TransactionQueueContract = {
    queryParams: ClosePositionFor,
    executeTransaction: (params: ClosePositionFor) => Promise<string>
};

export class TransactionQueue {

    private transactions = new Subject<TransactionQueueContract>();
    public pendingUsers: string[] = [];

    constructor() {
        this.transactions.subscribe(
            async (contract: TransactionQueueContract) => {

                try {
                    const txHash = await contract.executeTransaction(contract.queryParams);
                    console.log("closePositionFor: ", txHash);
                } catch (e) {
                    console.log("Failed to close position: ", e);
                }

                this.deleteUser(contract.queryParams.user);
            }
        );
    }

    publish(contract: TransactionQueueContract) {
        this.pendingUsers.push(contract.queryParams.user);
        this.transactions.next(contract);
    }

    private deleteUser(user: string): void {
        this.pendingUsers = this.pendingUsers.filter(x => x !== user);
    }
}
