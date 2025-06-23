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
  const [spotPrices, setSpotPrices] = useState<number[]>([])
  const [perpPrices, setPerpPrices] = useState<number[]>([])
  const [priceData, setPriceData] = useState<{
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      tension: number
      pointRadius: number
      pointHoverRadius?: number
    }[]
  }>({
    labels: [],
    datasets: [],
  })

  // 1️⃣ Fetch initial 20-point history
  useEffect(() => {
    // Spot: last 20 hourly closes
    fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=50')
      .then(res => res.json())
      .then((data: any[]) => {
        const closes = data.map(d => parseFloat(d[4]))
        setSpotPrices(closes)
      })
      .catch(console.error)

    // Perp: Deribit index repeated 20 times
    fetch('https://www.deribit.com/api/v2/public/get_index?index_name=btc_usd')
      .then(res => res.json())
      .then(j => {
        const idx = j.result.index_price as number
        setPerpPrices(Array(20).fill(idx))
      })
      .catch(console.error)
  }, [])

  // 2️⃣ Subscribe to WebSocket for live ticks
  useEffect(() => {
    const spotWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade')
    spotWs.onmessage = e => {
      const { p } = JSON.parse(e.data)
      const price = parseFloat(p)
      setSpotPrices(old => [...old.slice(-19), price])
    }
    spotWs.onerror = console.error

    const perpWs = new WebSocket('wss://ws.deribit.com/ws/api/v2')
    perpWs.onopen = () => {
      perpWs.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'public/subscribe',
        params: { channels: ['index_price.btc_usd'] },
      }))
    }
    perpWs.onmessage = e => {
      const msg = JSON.parse(e.data)
      const idx = msg.params?.data?.index_price as number | undefined
      if (typeof idx === 'number') {
        setPerpPrices(old => [...old.slice(-19), idx])
      }
    }
    perpWs.onerror = console.error

    return () => {
      spotWs.close()
      perpWs.close()
    }
  }, [])

  // 3️⃣ Build chart data whenever prices update
  useEffect(() => {
    if (spotPrices.length === 0) return

    const now = Date.now()
    const labels = spotPrices.map((_, i) => {
      const ts = now - (spotPrices.length - 1 - i) * 3600_000
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    setPriceData({
      labels,
      datasets: [
        {
          label: 'Spot Price',
          data: spotPrices,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointRadius: 2,
        },
        {
          label: 'Perp Mark Price',
          data: perpPrices,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          pointRadius: 2,
        },
      ],
    })
  }, [spotPrices, perpPrices])

  // Compute latest stats
  const currentSpot = spotPrices.at(-1) ?? 0
  const currentPerp = perpPrices.at(-1) ?? 0
  const diff = currentPerp - currentSpot
  const pct = currentSpot ? ((diff / currentSpot) * 100).toFixed(2) : '0.00'

  // Chart options typed correctly
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#9CA3AF' } },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } },
      y: {
        ticks: {
          color: '#9CA3AF',
          callback: (value) => '$' + value.toLocaleString(),
        },
        grid: { color: '#374151' },
      },
    },
  }

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold text-white">BTC/USDT Perpetual</h2>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-black/20 rounded-lg">
          <div className="text-sm text-gray-400">Spot Price</div>
          <div className="text-lg text-blue-400">${currentSpot.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-black/20 rounded-lg">
          <div className="text-sm text-gray-400">Mark Price</div>
          <div className="text-lg text-green-400">${currentPerp.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-black/20 rounded-lg">
          <div className="text-sm text-gray-400">Premium</div>
          <div className={`text-lg ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {diff >= 0 ? '+' : ''}${diff.toFixed(0)} ({pct}%)
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={priceData} options={chartOptions} />
      </div>
    </div>
  )
}

export default TradingChart
