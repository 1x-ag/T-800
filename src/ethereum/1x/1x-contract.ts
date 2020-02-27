import { gasLessCall, getCallData, getEvents, Web3Ethereum } from '../ethereum';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import oneXAbi from './1x.abi.json';

export type Event<T> = {
    params: T,
    blockNumber: number,
    transactionHash: string
}

export type OpenPosition = {
    owner: string,
    amount: string,
    stopLoss: string,
    takeProfit: string
};

export type ClosePosition = {
    owner: string,
    pnl: string
};

export type ClosePositionFor = {
    user: string,
    newDelegate: string
}

export class OneXContract {

    private readonly privateKey: string;
    private readonly instance: Contract;
    public readonly web3Ethereum: Web3Ethereum;

    constructor(
        contractAddress: string,
        privateKey: string,
        connectionString = 'http://127.0.0.1:8545'
    ) {
        this.privateKey = privateKey;
        this.web3Ethereum = new Web3Ethereum(connectionString);
        this.instance = this.web3Ethereum.createInstance(oneXAbi as AbiItem[], contractAddress);
    }

    getHolderProxyAddress(address: string): Promise<string> {
        return gasLessCall(
            this.instance,
            'holders',
            [address]
        );
    }

    async getOpenPositionEvents(fromBlockNumber: number | string = 0): Promise<Event<OpenPosition>[]> {
        const events = await getEvents(this.instance, 'OpenPosition', fromBlockNumber);
        return events.map(x => {
            const params = x.returnValues;
            const openPosition: OpenPosition = {
                owner: params['0'],
                amount: params['1'],
                stopLoss: params['2'],
                takeProfit: params['3']
            };
            return {
                params: openPosition,
                blockNumber: x.blockNumber,
                transactionHash: x.transactionHash,
            };
        });
    }

    async getClosePositionEvents(fromBlockNumber: number | string = 0): Promise<Event<ClosePosition>[]> {
        const events = await getEvents(this.instance, 'ClosePosition', fromBlockNumber);
        return events.map(x => {
            const params = x.returnValues;
            return {
                params: {
                    owner: params['0'],
                    pnl: params['1']
                },
                blockNumber: x.blockNumber,
                transactionHash: x.transactionHash,
            }
        });
    }

    closePositionFor = async (params: ClosePositionFor): Promise<string> => {
        const data = getCallData(
            this.instance,
            'closePositionFor',
            [params.user, params.newDelegate]
        );
        const signedTransaction = await this.web3Ethereum.signTransaction(
            // @ts-ignore
            this.privateKey, this.instance._address, 0, data
        );
        return this.web3Ethereum.sendTransaction(signedTransaction);
    };

}
