import { Web3Ethereum, gasLessCall } from '../ethereum';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import aggregatorAbi from './aggregator.abi.json';

export class AggregatorContract {

    private readonly instance: Contract;

    constructor(contractAddress: string, rpc: string) {
        // todo: check if it works for gasLessCall
        // new Web3Ethereum(rpc);
        this.instance = Web3Ethereum.createInstance(aggregatorAbi as AbiItem[], contractAddress);
    }

    getPriceByBlock(blockNumber: string): string {
        return gasLessCall(
            this.instance,
            'latestAnswer',
            [],
            '0x0000000000000000000000000000000000000000',
            blockNumber
        );
    }

}

