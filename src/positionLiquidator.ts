import { TransactionQueue, TransactionQueueContract } from "./transactionQueue";
import { SupportedCurrencies, tradingPairs } from './tradingPairs';
import config from './config';
import { ClosePositionFor, OneXContract } from "./ethereum/1x/1x-contract";
import { getOpenPositions, getPositionPnl, isReadyToClosePosition } from "./positionScanner";
import { IStorage } from "./storage/IStorage";

const holderOneAddress = "0x0938555ba79AFb0a45689F8429580F9618451827";
const transactionQueue = new TransactionQueue();

export type LeverageToken = {
    collateralToken: SupportedCurrencies,
    debtToken: SupportedCurrencies,
    leverage: number
};

export async function liquidatePositionsFor(leverageToken: LeverageToken, storage: IStorage) {
    // @ts-ignore
    const contractAddress = tradingPairs
        [leverageToken.collateralToken]
        [leverageToken.debtToken]
        .leverage[leverageToken.leverage];

    const OneX = new OneXContract(contractAddress, config.PRIVATE_KEY, config.RPC);

    const openPositionEvents = await getOpenPositions(OneX, storage);

    // tslint:disable-next-line:no-console
    console.log(`Find ${ openPositionEvents.length } open positions for ` +
        `${ leverageToken.leverage }x${ leverageToken.collateralToken }${ leverageToken.debtToken }`);

    for (const position of openPositionEvents) {

        if (
            transactionQueue.processedTransactions.some(
                (x) => (
                    x.user === position.params.owner &&
                    x.blockNumber === position.blockNumber
                )
            )
        ) {
            continue;
        }

        const pnl = await getPositionPnl(
            leverageToken.collateralToken,
            leverageToken.debtToken,
            leverageToken.leverage,
            position.params.owner
        );

        const ready = isReadyToClosePosition(
            pnl,
            position.params.stopLoss,
            position.params.takeProfit
        );

        if (ready) {
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

        // fix for Invalid JSON RPC response: "
        await delay(2000);
    }
}

function delay(time: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    });
}
