import { CronJob } from "cron";

const AVERAGE_BLOCK_TIME = 14;
const WAIT_BLOCKS = 2;

export function newJob(func: () => void): CronJob {
    return new CronJob(
        `*/${AVERAGE_BLOCK_TIME * WAIT_BLOCKS} * * * * *`,
        func, undefined, false);
}
