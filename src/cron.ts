const AVERAGE_BLOCK_TIME = 14;
const WAIT_BLOCKS = 3;

const defaultDelay = AVERAGE_BLOCK_TIME * WAIT_BLOCKS * 1000;
let delay = defaultDelay;

export function newJob(func: () => void): { start: () => void } {
    return {
        start: () => {
            let timerId = setTimeout(async function job() {
                try {
                    await func();
                    delay = defaultDelay;
                } catch (e) {
                    delay *= 2;
                }
                timerId = setTimeout(job, delay);
            }, delay);
        }
    }
}
