import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import TradingChart from './components/tradingChart'

const queryClient = new QueryClient()
 
export default function App() {
   return (
     <WagmiProvider config={config}>
       <QueryClientProvider client={queryClient}> 
       <TradingChart/>
       </QueryClientProvider> 
     </WagmiProvider>
   )
 }