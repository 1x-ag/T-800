import Web3 from 'web3';
import { AbiItem, keccak256 } from 'web3-utils';
import { Contract, EventData } from 'web3-eth-contract';
import { Transaction } from 'web3-core';
import { privateToAddress, addHexPrefix, toChecksumAddress } from 'ethereumjs-util';
import { Transaction as Tx, TxData } from 'ethereumjs-tx';
import { BigNumber } from 'bignumber.js'

export class Web3Ethereum {

    web3: Web3;

    constructor(rpc: string) {
        this.web3 = new Web3(rpc);
    }

    static createInstance(abi: AbiItem[], address?: string, ): Contract {
        return new Contract(abi, address);
    }

    getTransaction(txHash: string): Promise<Transaction> {
        return this.web3.eth.getTransaction(txHash);
    }

    getBalance(address: string): Promise<string> {
        return this.web3.eth.getBalance(address);
    }

    encodeParameter(param: any, value: any): string {
        return this.web3.eth.abi.encodeParameter(param, value)
    }

    encodeParameters(types: Array<any>, value: any): string {
        return this.web3.eth.abi.encodeParameters(types, value)
    }

    decodeParameter(types: any, hex: string): { [key: string]: any } {
        return this.web3.eth.abi.decodeParameter(types, hex)
    }

    decodeParameters(types: Array<any>, hex: string): { [key: string]: any } {
        return this.web3.eth.abi.decodeParameters(types, hex)
    }

    sendTransaction(rawTx: string, confirmations: number = 1): Promise<string> {
        if (rawTx.indexOf('0x') !== 0) {
            rawTx = '0x' + rawTx;
        }

        return new Promise((resolve) => {
            this.web3.eth.sendSignedTransaction(rawTx)
                .on('transactionHash', (transactionHash: string) => {
                    if (confirmations === 0) {
                        resolve(transactionHash);
                    }
                })
                .on('confirmation', (num: any, hash: any) => {
                    if (num === confirmations) {
                        resolve(hash);
                    }
                });
        })
    }

    async signTransaction(
        privateKey: string,
        to: string,
        value: number | string,
        data: string = ""
    ) {
        const from = getEthereumAddress(privateKey);

        const nonce = await this.web3.eth.getTransactionCount(from)
            .then((x: number): string => toHex(x));

        const gasPrice = await this.web3.eth.getGasPrice()
            .then((x: string): string => toHex(x));

        const gas = data

            ? await this.web3.eth.estimateGas({ to, data, gas: 5000000, from, value })
                .then((x: number): string => toHex(x))

            : toHex(21000);

        value = toHex(value);

        const txParam: TxData = { nonce, to, value, data, gasPrice, gasLimit: gas };

        return sign(txParam, privateKey);
    }
}

function sign(txParam: TxData, privateKey: string): string {
    if (privateKey.indexOf('0x') === 0) {
        privateKey = privateKey.substring(2);
    }

    const tx = new Tx(txParam);
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    tx.sign(privateKeyBuffer);
    const serializedTx = tx.serialize();
    return serializedTx.toString('hex');
}

function toHex(val: number | string | BigNumber): string {
    if (typeof val === "string") {
        return "0x" + tbn(val).toString(16);
    }
    return "0x" + val.toString(16);
}

export const hash = keccak256;

export const tbn = (x: number | string): BigNumber => new BigNumber(x);
export const tw = (x: string | number | BigNumber) =>
    BigNumber.isBigNumber(x) ? x.times(1e18).integerValue() : tbn(x).times(1e18).integerValue();
export const fw = (x: string | number | BigNumber) =>
    BigNumber.isBigNumber(x) ? x.times(1e-18).toNumber() : tbn(x).times(1e-18).toNumber();

export function getEvents(instance: Contract, event: string): Promise<EventData[]> {
    return instance.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
}

export function gasLessCall(
    instance: Contract,
    methodName: string,
    parameters: Array<any>,
    addressFrom: string = '0x0000000000000000000000000000000000000000',
    blockNumber: string = 'latest'
): any {
    return instance.methods[methodName](...parameters).call({ from: addressFrom }, blockNumber);
}

export function getCallData(instance: Contract, methodName: string, parameters: any): string {
    if (!instance.methods[methodName])
        throw new Error(`Method ${methodName} does not exist`);
    return instance.methods[methodName](...parameters).encodeABI();
}

export function getEthereumAddress(privateKey: string) {
    if (privateKey.indexOf('0x') === 0) {
        privateKey = privateKey.substring(2);
    }
    const addressBuffer = privateToAddress(Buffer.from(privateKey, 'hex'));
    const hexAddress = addressBuffer.toString('hex');
    return addHexPrefix(toChecksumAddress(hexAddress));
}

