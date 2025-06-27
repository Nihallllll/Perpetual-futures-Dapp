import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import TradingChart from './components/tradingChart'
import { ClosePosition, GetPnl, OpenPosition, ShowUserPosition } from './components/perpLogig'
import { Appbar } from './components/walletConnect'

const queryClient = new QueryClient()
 
export default function App() {
   return (
     <WagmiProvider config={config}>
       <QueryClientProvider client={queryClient}> 
       <TradingChart/>
       <Appbar/>
       <OpenPosition/>
       <ClosePosition/>
       <GetPnl/>
       <ShowUserPosition/>
       </QueryClientProvider> 
     </WagmiProvider>
   )
 }