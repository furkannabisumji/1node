import { optimism, sepolia } from 'viem/chains';
import { http, createConfig } from 'wagmi'


declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}


const CONNECT_KIT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const config = createConfig({
    chains: [optimism],
    transports: {
        [optimism.id]: http(),
    },
    // Required API Keys
    walletConnectProjectId: CONNECT_KIT_ID,

    appName: "1Node",
})
