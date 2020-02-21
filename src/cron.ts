const AVERAGE_BLOCK_TIME = 14;
const WAIT_BLOCKS = 5;

export function newJob(func: () => void): { start: () => void } {
    return {
        start: () => {
            setInterval(func, AVERAGE_BLOCK_TIME * WAIT_BLOCKS * 1000);
        }
    }
}
