import { IStorage } from "./IStorage";
import { Event, OpenPosition } from "../ethereum/1x/1x-contract";

export class MemoryStorage implements IStorage {

    public lastBlockNumber = 0;

    private openPositionEventList: Event<OpenPosition>[] = [];

    getOpenPositionEvents(): Event<OpenPosition>[] {
        return this.openPositionEventList;
    }

    setOpenPositionEvents(openPositionEvents: Event<OpenPosition>[]) {
        this.lastBlockNumber = openPositionEvents[openPositionEvents.length - 1].blockNumber;
        this.openPositionEventList = openPositionEvents;
    }

}
