import { gasLessCall, Web3Ethereum } from '../ethereum';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import holderOneAbi from './holderOne.abi.json';
import BigNumber from "bignumber.js";

// use with a proxy contract
export class HolderOneContract {

    private readonly instance: Contract;

    constructor(contractAddress: string, rpc: string) {
        const web3Ethereum = new Web3Ethereum(rpc);
        this.instance = web3Ethereum.createInstance(holderOneAbi as AbiItem[], contractAddress);
    }

    // profit and loss. current position percentage value
    getPnl(
        collateralTokenAddress: string,
        debtTokenAddress: string,
        leverage: string | BigNumber
    ): Promise<string> {

        return gasLessCall(
            this.instance,
            'pnl',
            [collateralTokenAddress, debtTokenAddress, leverage]
        );
    }

}

