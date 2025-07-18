const providerData = [
  {
    token: "oweth",
    providerUrl: "https://endpoints.omniatech.io/v1/op/mainnet/public",
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
    blockTimeSeconds: 1n,
    multiplier: 4n,
  },
];

export default providerData;