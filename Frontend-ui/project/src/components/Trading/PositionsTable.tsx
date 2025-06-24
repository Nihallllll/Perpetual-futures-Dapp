import React from 'react'
import { useAccount, useContractRead } from 'wagmi'
import { Perpabi } from '../../../../../Frontend/src/abi'

interface Position {
  entryPrice: bigint
  margin: bigint
  leverage: number
  timestamp: bigint
  size: bigint
  isLong: boolean
  quantity: bigint
}

const PositionsTable: React.FC = () => {
  const { address, isConnected } = useAccount()

  // Read on-chain user position tuple
  const { data: raw } = useContractRead({
    address: '0x2CC3cd0ebA37db68c909b90972E1E500BC82Cdf4',
    abi: Perpabi,
    functionName: 'getUserPosition',
    args: isConnected && address ? [address] : undefined,
    watch: true,
  }) as { data?: [
    bigint, // entryPrice
    bigint, // leverage
    bigint, // timestamp
    bigint, // margin
    bigint, // size
    boolean, // isLong
    bigint  // quantity
  ] }

  // Decode to Position
  const pos: Position | null = raw && raw.length === 7
    ? {
        entryPrice: raw[0],
        leverage: Number(raw[1]),
        timestamp: raw[2],
        margin: raw[3],
        size: raw[4],
        isLong: raw[5],
        quantity: raw[6],
      }
    : null

  // If not connected or no position
  if (!isConnected) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-gray-400 mb-2">Connect your wallet to view positions</div>
      </div>
    )
  }

  if (!pos) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-gray-400 mb-2">No open positions</div>
        <div className="text-sm text-gray-500">Open one using the trade form</div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Your Position</h3>
      </div>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 text-left text-sm text-gray-400">Side</th>
              <th className="py-2 text-left text-sm text-gray-400">Size</th>
              <th className="py-2 text-left text-sm text-gray-400">Quantity</th>
              <th className="py-2 text-left text-sm text-gray-400">Entry Price</th>
              <th className="py-2 text-left text-sm text-gray-400">Leverage</th>
              <th className="py-2 text-left text-sm text-gray-400">Margin</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800">
              <td className="py-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  pos.isLong ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>{pos.isLong ? 'LONG' : 'SHORT'}</span>
              </td>
              <td className="py-4 text-white">${(Number(pos.size) / 1e6).toLocaleString()}</td>
              <td className="py-4 text-white">{(Number(pos.quantity) / 1e18).toFixed(6)} BTC</td>
              <td className="py-4 text-white">${(Number(pos.entryPrice) / 1e8).toLocaleString()}</td>
              <td className="py-4 text-white">{pos.leverage}×</td>
              <td className="py-4 text-white">${(Number(pos.margin) / 1e6).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="lg:hidden space-y-4">
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              pos.isLong ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>{pos.isLong ? 'LONG' : 'SHORT'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-400">Size</div>
              <div className="text-white font-medium">${(Number(pos.size) / 1e6).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">Entry</div>
              <div className="text-white">${(Number(pos.entryPrice) / 1e8).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">Leverage</div>
              <div className="text-white">{pos.leverage}×</div>
            </div>
            <div>
              <div className="text-gray-400">Margin</div>
              <div className="text-white">${(Number(pos.margin) / 1e6).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PositionsTable