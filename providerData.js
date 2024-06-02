const providerData = [
  {
    token: "oweth",
    providerUrl: "https://optimism.meowrpc.com",
    tokenAddress: "0x4200000000000000000000000000000000000006",
    blockTimeSeconds: 2n,
  },
  {
    token: "bweth",
    providerUrl: "https://base.meowrpc.com",
    tokenAddress: "0x4200000000000000000000000000000000000006",
    blockTimeSeconds: 2n,
  },
  {
    token: "aweth",
    providerUrl: "https://arbitrum.meowrpc.com",
    tokenAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    blockTimeSeconds: 1n, // actually 0.25, so times 4 the blocks
    multiplier: 4n,
  },
  {
    token: "leth",
    providerUrl: 'https://linea.decubate.com',
    tokenAddress: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    blockTimeSeconds: 3n
  },
  {
    token: "wftm",
    providerUrl: "https://endpoints.omniatech.io/v1/fantom/mainnet/public",
    tokenAddress: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    blockTimeSeconds: 2n,
  },
  {
    token: "wbnb",
    providerUrl: "https://bsc.meowrpc.com",
    tokenAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    blockTimeSeconds: 3n,
  },
  {
    token: "wmatic",
    providerUrl: 'https://endpoints.omniatech.io/v1/matic/mainnet/public',
    tokenAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    blockTimeSeconds: 2n
  },
  {
    token: "wavax",
    providerUrl: 'https://avax.meowrpc.com',
    tokenAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    blockTimeSeconds: 2n
  },
];

export default providerData;