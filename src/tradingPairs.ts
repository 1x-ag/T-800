export type SupportedCurrencies = 'ETH' | 'DAI';

export interface ILeverage {
    2: string
}

export interface IPairParams {
    leverage: ILeverage,
}

export type TradingPairs = {
    [tokenOne in SupportedCurrencies]?: {
        [tokenTwo in SupportedCurrencies]?: IPairParams;
    };
};

export const tradingPairs: TradingPairs = {
    "ETH": {
        "DAI": {
            "leverage": {
                2: "0x7778d1011e19c0091c930d4befa2b0e47441562a"
            }
        }
    }
};

export type tokenAddresses = {
    [token in SupportedCurrencies]: string;
};

export const tokenAddresses: tokenAddresses = {
    "ETH": "0x0000000000000000000000000000000000000000",
    "DAI": "0x6b175474e89094c44da98b954eedeac495271d0f"
};
