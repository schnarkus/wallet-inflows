import Web3 from 'web3';
import axios from 'axios';
import dotenv from 'dotenv';
import providerData from './providerData.js';
dotenv.config();

const walletAddress = process.env.WALLET_ADDRESS;

let conversionRates = {}; // Cache for conversion rates

async function fetchConversionRate(token) {
    try {
        let tokenName;
        if (token === 'oweth' || token === 'bweth' || token === 'aweth' || token === 'leth') {
            tokenName = 'ethereum';
        } else if (token === 'wftm') {
            tokenName = 'fantom';
        } else if (token === 'wbnb') {
            tokenName = 'binancecoin';
        } else if (token === 'wmatic') {
            tokenName = 'matic-network';
        } else if (token === 'wavax') {
            tokenName = 'avalanche-2';
        } else {
            throw new Error('Unsupported token');
        }

        // Check if conversion rate is already cached
        if (conversionRates[tokenName]) {
            return conversionRates[tokenName];
        }

        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenName}&vs_currencies=usd`);
        const rate = response.data[tokenName].usd;

        // Cache the conversion rate
        conversionRates[tokenName] = rate;

        return rate;
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

                let blocksPerDay = secondsInDay / blockTimeSeconds;
                if (multiplier) {
                    blocksPerDay *= multiplier;
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
