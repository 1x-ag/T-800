import { newJob } from "./cron";
import { LeverageToken, liquidatePositionsFor } from "./positionLiquidator";

const jobs = [
    newJob(prepareJobFunction({
        collateralToken: 'ETH',
        debtToken: 'DAI',
        leverage: '2'
    }))
];

function prepareJobFunction(token: LeverageToken) {
    return () => {
        liquidatePositionsFor(token);
    }
}

jobs.forEach(x => x.start());
