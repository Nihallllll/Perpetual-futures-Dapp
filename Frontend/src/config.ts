// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
// import { sepolia } from 'wagmi/chains';
// import { http } from 'wagmi';

// export const config = getDefaultConfig({
//   appName: 'Perpetual Futures dApp',
//   projectId: "bf8373fc9fd81f7b1415eab854309909 ",
//   chains: [sepolia],
//   transports: {
//     [sepolia.id]: http(
//       import.meta.env.VITE_ALCHEMY_API_KEY
//         ? `https://eth-sepolia.g.alchemy.com/v2/ykmlhC0B4H137VurA9aPk`
//         : undefined
//     ),
//   },
//   ssr: false,
// });

import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/ykmlhC0B4H137VurA9aPk"),
  },
})