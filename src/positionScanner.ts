import { OneXContract, OpenPosition, Event, ClosePosition } from "./ethereum/1x/1x-contract";
import tradePairs from "./traidingPairs.json"
import { AggregatorContract } from "./ethereum/chainlink/aggregator";
import { tbn } from "./ethereum/ethereum";
import config from "./config";

export async function getOpenPositions(contract: OneXContract) {
    const [
        openPositionEvents,
        closePositionEvents
    ] = await Promise.all([contract.getOpenPositionEvents(), contract.getClosePositionEvents()]);
    return findOpenPositions(openPositionEvents, closePositionEvents);
}

export async function getPositionPrices(
    openPositionBlockNumber: string,
    collateralToken: string,
    debtToken: string
): Promise<string[]> {

    // @ts-ignore todo: make interface
    const aggregatorParams = tradePairs[debtToken][collateralToken];
    const aggregator = new AggregatorContract(
        aggregatorParams.aggregator, config.RPC
    );

    const prices: string[] = await Promise.all([
        aggregator.getPriceByBlock(openPositionBlockNumber),
        aggregator.getPriceByBlock('latest')
    ]);

    if (aggregatorParams.flipPrice) {
        return prices.map(price =>
            tbn(
                Math.pow(aggregatorParams.decimals, 2)
            )
                .div(price)
                .toString()
        );
    }
    return prices;
}

export async function isReadyToClosePosition(
    openPositionPrice: string,
    currentPrice: string,
    stopLoss: string,
    takeProfit: string
) {

    const stopLossPrice = tbn(openPositionPrice)
        .times(stopLoss)
        .div(1e18);

    const takeProfitPrice = tbn(openPositionPrice)
        .times(takeProfit)
        .div(1e18);

    return !!(
        tbn(currentPrice).gte(takeProfitPrice) ||
        tbn(currentPrice).lte(stopLossPrice)
    );
}

function findOpenPositions(
    openPositionEvents: Event<OpenPosition>[],
    closePositionEvents: Event<ClosePosition>[]
) {

    const closePositionOwners = closePositionEvents.map(x => x.params.owner);
    const openPositionOwners = openPositionEvents.map(x => x.params.owner);

    const notClosedPositions = [];
    for (let i = 0; i < openPositionEvents.length; i++) {

        const owner = openPositionEvents[i].params.owner;

        const numOfOpenPositionsByUser = openPositionOwners.filter(x => x === owner).length;
        const numOfClosePositionsByUser = closePositionOwners.filter(x => x === owner).length;

        if (
            numOfOpenPositionsByUser !== numOfClosePositionsByUser
        // transactionQueue.pendingAddress !== owner
        ) {
            notClosedPositions.push(openPositionEvents[i]);
        }
    }

    return notClosedPositions;
}
