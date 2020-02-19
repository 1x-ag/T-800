import { gasLessCall, Web3Ethereum } from '../ethereum';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import aggregatorAbi from './aggregator.abi.json';

export class AggregatorContract {

    private readonly instance: Contract;

    constructor(contractAddress: string, rpc: string) {
        const web3Ethereum = new Web3Ethereum(rpc);
        this.instance = web3Ethereum.createInstance(aggregatorAbi as AbiItem[], contractAddress);
    }

    getPriceByBlock(blockNumber: string): Promise<string> {
        return gasLessCall(
            this.instance,
            'latestAnswer',
            [],
            '0x0000000000000000000000000000000000000000',
            blockNumber
        );
    }

}

