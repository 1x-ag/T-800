import { Event, OpenPosition } from "../ethereum/1x/1x-contract";


export interface IStorage {
    lastBlockNumber: number;
    getOpenPositionEvents(): Event<OpenPosition>[];
    setOpenPositionEvents(newOpenPositionEvents: Event<OpenPosition>[]): void;
}
