import { CronJob } from "cron";
import assert from "assert";

const AVERAGE_BLOCK_TIME = 14;
const WAIT_BLOCKS = 2;

function buildShedulerSecondsExpression(period: number): string {
    assert(period < 60, "Period should fill in one minute");
    const seconds = [];
    let secondPoint = 59;
    while (secondPoint > 0) {
        seconds.push(secondPoint);
        secondPoint -= period;
    }
    return seconds.join(",");
}

export function newJob(func: () => void): CronJob {
    return new CronJob(
        `${buildShedulerSecondsExpression(AVERAGE_BLOCK_TIME * WAIT_BLOCKS)} * * * * *`,
        func, () => {}, true);
}
