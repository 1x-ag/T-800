import { TransactionQueue, TransactionQueueContract } from "./transactionQueue";
import tradingPairs from './traidingPairs.json';
import config from './config';
import { ClosePositionFor, OneXContract } from "./ethereum/1x/1x-contract";
import { getOpenPositions, getPositionPrices, isReadyToClosePosition } from "./positionScanner";

const holderOneAddress = "0xb818e074b6a91d8eabf1001343dd49b2b103ddf4";
const transactionQueue = new TransactionQueue();

export type LeverageToken = {
    collateralToken: string,
    debtToken: string,
    leverage: string
};

export async function liquidatePositionsFor(leverageToken: LeverageToken) {
    // @ts-ignore // todo: add interface for tradingPairs
    const contractAddress = tradingPairs
        [leverageToken.collateralToken]
        [leverageToken.debtToken]
        .leverage[leverageToken.leverage];

    const OneX = new OneXContract(contractAddress, config.PRIVATE_KEY, config.RPC);

    const openPositionEvents = await getOpenPositions(OneX);
    for (const position of openPositionEvents) {

        if (
            position.params.takeProfit === '0' &&
            position.params.stopLoss === '0'
        ) {
            continue;
        }

        const [
            openPositionPrice,
            currentPrice
        ] = await getPositionPrices(
            position.blockNumber,
            leverageToken.collateralToken,
            leverageToken.debtToken
        );

        const ready = isReadyToClosePosition(
            openPositionPrice,
            currentPrice,
            position.params.takeProfit,
            position.params.stopLoss
        );

        if (
            ready &&
            !transactionQueue.processedTransactions.some(x => x.user === position.params.owner)
        ) {

            const queryParams: ClosePositionFor = {
                user: position.params.owner,
                newDelegate: holderOneAddress
            };
            const contract: TransactionQueueContract = {
                queryParams,
                executeTransaction: OneX.closePositionFor
            };
            transactionQueue.publish(contract, position.blockNumber);
        }
    }
}
