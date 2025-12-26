const useWalletBalances = () => {
    //example balances
    return [
        {
            currency: 'USDT',
            amount: 1000,
            blockchain: 'Osmosis',
        },
    ]
}

const usePrices = () => {
    //example prices
    return {
        'USDT': 1,
        'ETH': 2000,
        'USDC': 1000,
    }
}

export { useWalletBalances, usePrices };