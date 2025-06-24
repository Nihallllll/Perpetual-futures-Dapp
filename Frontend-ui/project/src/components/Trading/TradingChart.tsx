import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { ChartOptions } from 'chart.js'
import { useContractRead } from 'wagmi'
import { CONTRACTS, ABIS } from '../../config/contracts'
import { TrendingUp } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const TradingChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1H')
  const [spotPrices, setSpotPrices] = useState<number[]>([])
  const [perpPrices, setPerpPrices] = useState<number[]>([])
  const [priceData, setPriceData] = useState<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] })

  // 1️⃣ Fetch initial 20-point history
  useEffect(() => {
    fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=20')
      .then(res => res.json())
      .then((data: any[]) => setSpotPrices(data.map(d => parseFloat(d[4]))))
      .catch(console.error)

    fetch('https://www.deribit.com/api/v2/public/get_index?index_name=btc_usd')
      .then(res => res.json())
      .then(j => setPerpPrices(Array(20).fill(j.result.index_price as number)))
      .catch(console.error)
  }, [])

  // 2️⃣ Subscribe to WebSockets
  useEffect(() => {
    const spotWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker')
    spotWs.onmessage = e => {
      const { c } = JSON.parse(e.data)
      const price = parseFloat(c)
      setSpotPrices(prev => [...prev.slice(-19), price])
    }
    spotWs.onerror = console.error

    const perpWs = new WebSocket('wss://ws.deribit.com/ws/api/v2')
    perpWs.onopen = () => {
      perpWs.send(JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'public/subscribe',
        params: { channels: ['index_price.btc_usd'] }
      }))
    }
    perpWs.onmessage = e => {
      const msg = JSON.parse(e.data)
      const idx = msg.params?.data?.index_price as number | undefined
      if (typeof idx === 'number') setPerpPrices(prev => [...prev.slice(-19), idx])
    }
    perpWs.onerror = console.error

    return () => { spotWs.close(); perpWs.close() }
  }, [])

  // 3️⃣ Read on-chain mark price (if desired)
  const { data: onChainMark } = useContractRead({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    functionName: 'getMarkPrice',
    watch: true
  })
  useEffect(() => {
    if (typeof onChainMark === 'bigint') {
      setPerpPrices(prev => [...prev.slice(-19), Number(onChainMark)])
    }
  }, [onChainMark])

  // 4️⃣ Build chart data on updates
  useEffect(() => {
    if (!spotPrices.length) return
    const now = Date.now()
    const labels = spotPrices.map((_, i) => new Date(now - (spotPrices.length - 1 - i) * 3600_000)
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

    setPriceData({
      labels,
      datasets: [
        {
          label: 'Spot Price',
          data: spotPrices,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          tension: 0.4,
          pointRadius: 2
        },
        {
          label: 'Perp Mark Price',
          data: perpPrices,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          tension: 0.4,
          pointRadius: 2
        }
      ]
    })
  }, [spotPrices, perpPrices])

  // Compute stats
  const currentSpot = spotPrices.at(-1) ?? 0
  const currentPerp = perpPrices.at(-1) ?? 0
  const diff = currentPerp - currentSpot
  const pct = currentSpot ? ((diff / currentSpot) * 100).toFixed(2) : '0.00'

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#9CA3AF' } },
      tooltip: {
        backgroundColor: '#1F2937', titleColor: '#F9FAFB', bodyColor: '#F9FAFB',
        borderColor: '#374151', borderWidth: 1, cornerRadius: 8
      }
    },
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } },
      y: {
        ticks: { color: '#9CA3AF', callback: v => '$' + Number(v).toLocaleString() },
        grid: { color: '#374151' }
      }
    }
  }

  const timeframes = ['5M','15M','1H','4H','1D']

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">BTC/USD Perpetual</h2>
        </div>
        <div className="flex items-center space-x-2">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                timeframe===tf? 'bg-blue-500 text-white':'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >{tf}</button>
          ))}
        </div>
      </div>
      {/* Price Info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card label="Spot Price" color="blue" value={currentSpot} />
        <Card label="Mark Price" color="green" value={currentPerp} />
        <Card label="Price Diff" color={diff>=0?'green':'red'} text={
          `${diff>=0?'+':''}$${diff.toFixed(0)}`
        }/>
        <Card label="Premium" color={diff>=0?'green':'red'} text={`${diff>=0?'+':''}${pct}%`}/>
      </div>
      {/* Chart */}
      <div className="h-80 lg:h-96">
        <Line data={priceData} options={chartOptions} />
      </div>
    </div>
  )
}

// Reusable Price Card Component
const Card: React.FC<{label:string;color:string;value?:number;text?:string}> = ({label,color,value,text}) => (
  <div className="bg-black/20 rounded-lg p-4">
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className={`text-lg font-semibold text-${color}-400`}>
      {text ?? `$${value?.toLocaleString()}`}
    </div>
  </div>
)

export default TradingChart