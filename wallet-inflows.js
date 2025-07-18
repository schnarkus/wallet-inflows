import Web3 from 'web3';
import axios from 'axios';
import dotenv from 'dotenv';
import providerData from './providerData.js';
dotenv.config();

const walletAddress = process.env.WALLET_ADDRESS;
const coingeckoApiKey = process.env.COINGECKO_API_KEY;

async function getEthUsdRate() {
    if (getEthUsdRate.cache !== undefined) return getEthUsdRate.cache;
    try {
        const { data } = await axios.get(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
            {
                headers: {
                    'accept': 'application/json',
                    'x-cg-demo-api-key': coingeckoApiKey
                }
            }
        );
        getEthUsdRate.cache = data.ethereum.usd;
        return getEthUsdRate.cache;
    } catch (error) {
        console.error('Error fetching ETH price:', error?.response?.data || error);
        return null;
    }
}

async function getTotalTokenReceivedLast24Hours({ providerUrl, tokenAddress, blockTimeSeconds, multiplier, token }) {
    const web3 = new Web3(providerUrl);
    const currentBlock = await web3.eth.getBlockNumber();
    const secondsInDay = 24n * 60n * 60n;
    let blocksPerDay = secondsInDay / BigInt(blockTimeSeconds);
    if (multiplier) blocksPerDay *= BigInt(multiplier);
    const fromBlock = '0x' + (currentBlock - blocksPerDay).toString(16);

    const filter = {
        address: tokenAddress,
        fromBlock,
        toBlock: 'latest',
        topics: [
            web3.utils.sha3('Transfer(address,address,uint256)'),
            null,
            web3.utils.padLeft(walletAddress.toLowerCase(), 64)
        ]
    };

    let logs;
    try {
        logs = await web3.eth.getPastLogs(filter);
    } catch (err) {
        console.error(`[${token}] Log fetch error:`, err?.message || err);
        return 0;
    }

    let totalWei = logs.reduce((acc, log) => acc + BigInt(log.data), 0n);
    return Number(totalWei) / 1e18;
}

async function main() {
    const ethUsd = await getEthUsdRate();
    if (!ethUsd) {
        console.error('ETH price unavailable, aborting.');
        return;
    }
    let totalUsdDay = 0;
    for (const info of providerData) {
        const eth = await getTotalTokenReceivedLast24Hours(info);
        const usd = eth * ethUsd;
        console.log(`Total ${info.token.toUpperCase()} received: ${eth} (~$${usd.toFixed(2)} USD)`);
        totalUsdDay += usd;
    }
    console.log(`Total USD value of all ETH tokens received in last 24h: $${totalUsdDay.toFixed(2)} (~$${(totalUsdDay * 30).toFixed(2)} per month)`);
}

main();
