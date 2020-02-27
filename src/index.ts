import { newJob } from "./cron";
import { LeverageToken, liquidatePositionsFor } from "./positionLiquidator";
import { MemoryStorage } from "./storage/memoryStorage";

const jobs = [
    newJob(prepareJobFunction({
        collateralToken: 'ETH',
        debtToken: 'DAI',
        leverage: 2
    }))
];

const storage = new MemoryStorage();

function prepareJobFunction(token: LeverageToken) {
    return async () => {
        const tokenName = `${ token.leverage }x${ token.collateralToken }${ token.debtToken }`;
        // tslint:disable-next-line:no-console
        console.debug(`Start ${tokenName} positions fetching ${(new Date()).toString()}\n`);
        await liquidatePositionsFor(token, storage);
        // tslint:disable-next-line:no-console
        console.debug(`End ${tokenName} positions fetching ${(new Date()).toString()}\n`);
    }
}

jobs.forEach(x => x.start());
