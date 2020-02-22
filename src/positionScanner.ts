import { ClosePosition, Event, OneXContract, OpenPosition } from "./ethereum/1x/1x-contract";
import { SupportedCurrencies, tokenAddresses, tradingPairs } from "./tradingPairs"
import { tbn } from "./ethereum/ethereum";
import config from "./config";
import { HolderOneContract } from "./ethereum/holderOne/holderOne-contract";

export async function getOpenPositions(contract: OneXContract): Promise<Event<OpenPosition>[]> {
    const [
        openPositionEvents,
        closePositionEvents
    ] = await Promise.all([contract.getOpenPositionEvents(), contract.getClosePositionEvents()]);
    return findOpenPositions(openPositionEvents, closePositionEvents);
}

export async function getPositionPnl(
    collateralToken: SupportedCurrencies,
    debtToken: SupportedCurrencies,
    leverage: number,
    holderAddress: string
): Promise<string> {

    // @ts-ignore
    const contractsParams = tradingPairs[collateralToken][debtToken];
    const oneX = new OneXContract(
        // @ts-ignore
        contractsParams.leverage[leverage],
        config.PRIVATE_KEY,
        config.RPC
    );

    const proxyAddress = await oneX.getHolderProxyAddress(holderAddress);

    const holderOne = new HolderOneContract(
        proxyAddress, config.RPC
    );

    return holderOne.getPnl(
        tokenAddresses[collateralToken],
        tokenAddresses[debtToken],
        tbn(leverage)
    );
}

export function isReadyToClosePosition(
    pnl: string,
    stopLoss: string,
    takeProfit: string
): boolean {

    return (
        tbn(pnl).gte(takeProfit) ||
        tbn(pnl).lte(stopLoss)
    );
}

function findOpenPositions(
    openPositionEvents: Event<OpenPosition>[],
    closePositionEvents: Event<ClosePosition>[]
): Event<OpenPosition>[] {

    const closePositionOwners = closePositionEvents.map(x => x.params.owner);
    const openPositionOwners = openPositionEvents.map(x => x.params.owner);

    const notClosedPositions = [];
    for (const position of openPositionEvents) {

        const owner = position.params.owner;

        const numOfOpenPositionsByUser = openPositionOwners.filter(x => x === owner).length;
        const numOfClosePositionsByUser = closePositionOwners.filter(x => x === owner).length;

        const isLiquidationBotActivated = !(
            position.params.stopLoss === '0' &&
            position.params.takeProfit === '0'
        );

        if (
            numOfOpenPositionsByUser !== numOfClosePositionsByUser &&
            isLiquidationBotActivated
        ) {
            notClosedPositions.push(position);
        }
    }

    return notClosedPositions;
}
