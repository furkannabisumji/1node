import { optimism, sepolia } from 'viem/chains';
import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'


declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}


const CONNECT_KIT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// Define Etherlink chain
export const etherlink = defineChain({
  id: 42793,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Tez',
    symbol: 'XTZ',
  },
  rpcUrls: {
    default: {
      http: ['https://node.ghostnet.etherlink.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet-explorer.etherlink.com' },
  },
})

export const config = createConfig({
    chains: [optimism, etherlink],
    transports: {
        [optimism.id]: http(),
        [etherlink.id]: http(),
    },
    // Required API Keys
    walletConnectProjectId: CONNECT_KIT_ID,

    appName: "1Node",
})
