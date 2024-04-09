import Web3 from 'web3';
import axios from 'axios';

const walletAddress = '0xfB41Cbf2ce16E8f626013a2F465521d27BA9a610'

const providerData = [
    {
        token: "oweth",
        providerUrl: 'https://optimism.meowrpc.com',
        tokenAddress: '0x4200000000000000000000000000000000000006',
        blockTimeSeconds: 2n
    },
    {
        token: "bweth",
        providerUrl: 'https://base.meowrpc.com',
        tokenAddress: '0x4200000000000000000000000000000000000006',
        blockTimeSeconds: 2n
    },
    {
        token: "aweth",
        providerUrl: 'https://arbitrum.meowrpc.com',
        tokenAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        blockTimeSeconds: 1n, // actually 0.25, so times 4 the blocks
        multiplier: 4n
    },
    {
        token: "wftm",
        providerUrl: 'https://endpoints.omniatech.io/v1/fantom/mainnet/public',
        tokenAddress: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
        blockTimeSeconds: 1n
    },
    {
        token: "wbnb",
        providerUrl: 'https://bsc.meowrpc.com',
        tokenAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        blockTimeSeconds: 3n
    },
];

async function fetchConversionRate(token) {
    try {
        let tokenName;
        if (token === 'oweth' || token === 'bweth' || token === 'aweth') {
            tokenName = 'ethereum';
        } else if (token === 'wftm') {
            tokenName = 'fantom';
        } else if (token === 'wbnb') {
            tokenName = 'binancecoin';
        } else {
            throw new Error('Unsupported token');
        }

        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenName}&vs_currencies=usd`);
        return response.data[tokenName].usd;
    } catch (error) {
        console.error('Error fetching conversion rate:', error);
        return null;
    }
}

async function getTotalTokenReceivedLast24Hours(token) {
    try {
        const conversionRate = await fetchConversionRate(token);
        if (!conversionRate) return;

        let totalTokenReceivedUSD = 0;

        for (const providerInfo of providerData) {
            if (providerInfo.token === token) {
                const { providerUrl, tokenAddress, blockTimeSeconds, multiplier } = providerInfo;

                const web3 = new Web3(providerUrl);

                const currentBlock = await web3.eth.getBlockNumber();
                const secondsInDay = 24n * 60n * 60n;

                let blocksPerDay;
                if (token === "aweth") {
                    blocksPerDay = (secondsInDay / blockTimeSeconds) * multiplier;
                } else {
                    blocksPerDay = secondsInDay / blockTimeSeconds;
                }

                const twentyFourHoursAgoBlock = currentBlock - blocksPerDay;

                const transferFilter = {
                    address: tokenAddress,
                    fromBlock: twentyFourHoursAgoBlock,
                    toBlock: 'latest',
                    topics: [
                        web3.utils.sha3('Transfer(address,address,uint256)'),
                        null,
                        web3.utils.padLeft(walletAddress.toLowerCase(), 64)
                    ]
                };

                const logs = await web3.eth.getPastLogs(transferFilter);

                let totalTokenReceivedWei = BigInt(0);

                for (const log of logs) {
                    const amountWei = BigInt(log.data);
                    totalTokenReceivedWei += amountWei;
                }

                const totalTokenReceivedEther = web3.utils.fromWei(totalTokenReceivedWei.toString(), 'ether');
                const totalTokenReceivedUSDForProvider = totalTokenReceivedEther * conversionRate;

                console.log(`Total ${token.toUpperCase()} received: ${totalTokenReceivedEther} (~$${totalTokenReceivedUSDForProvider.toFixed(2)} USD)`);
                totalTokenReceivedUSD += totalTokenReceivedUSDForProvider;
            }
        }

        return totalTokenReceivedUSD;
    } catch (error) {
        console.error('Error occurred:', error);
        return 0;
    }
}

async function getTotalUSDValueOfAllTokens() {
    let totalUSDValue = 0;

    for (const { token } of providerData) {
        const usdValueForToken = await getTotalTokenReceivedLast24Hours(token);
        totalUSDValue += usdValueForToken;
    }

    console.log(`Total USD value of all tokens received in the last 24 hours: $${totalUSDValue.toFixed(2)}`);
}

getTotalUSDValueOfAllTokens(); 