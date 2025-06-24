
import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiconfig = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/ykmlhC0B4H137VurA9aPk"),
  },
})

export const chains = [sepolia, mainnet];