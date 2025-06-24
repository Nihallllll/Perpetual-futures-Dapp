import React, { useState } from 'react';
import { useAccount, useBalance, useContractWrite, useContractRead } from 'wagmi';
import { TrendingUp, TrendingDown, Sliders as Slider, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CONTRACTS, ABIS } from '../../config/contracts';

const TradeForm: React.FC = () => {
  const { address } = useAccount();
  const [leverage, setLeverage] = useState(1);
  const [margin, setMargin] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');

  const { data: usdcBalance } = useBalance({
    address,
    token: CONTRACTS.USDC,
    enabled: !!address,
  });

  const { data: markPrice } = useContractRead({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    functionName: 'getMarkPrice',
    watch: true,
  });

  const { write: openLongPosition, isLoading: isLongLoading } = useContractWrite({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    functionName: 'openPosition',
    onSuccess: () => {
      toast.success('Long position opened successfully!');
      setMargin('');
    },
    onError: (error) => {
      toast.error('Failed to open long position');
      console.error(error);
    },
  });

  const { write: openShortPosition, isLoading: isShortLoading } = useContractWrite({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    functionName: 'openPosition',
    onSuccess: () => {
      toast.success('Short position opened successfully!');
      setMargin('');
    },
    onError: (error) => {
      toast.error('Failed to open short position');
      console.error(error);
    },
  });

  const handleOpenLong = () => {
    if (!margin || !markPrice) return;
    
    const marginAmount = parseFloat(margin) * 1e6; // Convert to USDC decimals
    const price = orderType === 'market' ? markPrice : parseFloat(limitPrice) * 1e8;
    
    openLongPosition({
      args: [marginAmount, leverage, true, price],
    });
  };

  const handleOpenShort = () => {
    if (!margin || !markPrice) return;
    
    const marginAmount = parseFloat(margin) * 1e6; // Convert to USDC decimals
    const price = orderType === 'market' ? markPrice : parseFloat(limitPrice) * 1e8;
    
    openShortPosition({
      args: [marginAmount, leverage, false, price],
    });
  };

  const maxMargin = usdcBalance ? parseFloat(usdcBalance.formatted) : 0;
  const positionSize = parseFloat(margin || '0') * leverage;
  const quantity = positionSize / (markPrice ? Number(markPrice) / 1e8 : 43000);

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <DollarSign className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Open Position</h3>
      </div>

      {/* Order Type */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              orderType === 'market'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              orderType === 'limit'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Limit
          </button>
        </div>
      </div>

      {/* Limit Price */}
      {orderType === 'limit' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Limit Price
          </label>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder="Enter limit price"
            className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      )}

      {/* Leverage Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Leverage</label>
          <span className="text-sm font-semibold text-blue-400">{leverage}×</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1×</span>
            <span>5×</span>
            <span>10×</span>
          </div>
        </div>
      </div>

      {/* Margin Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Margin (USDC)</label>
          <span className="text-xs text-gray-400">
            Balance: {usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(2) : '0.00'} USDC
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            placeholder="Enter margin amount"
            className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => setMargin(maxMargin.toString())}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Position Details */}
      <div className="bg-black/20 rounded-lg p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Position Size:</span>
          <span className="text-white">${positionSize.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Quantity:</span>
          <span className="text-white">{quantity.toFixed(6)} BTC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Entry Price:</span>
          <span className="text-white">
            ${orderType === 'market' 
              ? (markPrice ? Number(markPrice) / 1e8 : 43000).toLocaleString()
              : (limitPrice || '0')
            }
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleOpenLong}
          disabled={!margin || isLongLoading || !usdcBalance}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
        >
          <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>{isLongLoading ? 'Opening...' : 'Long'}</span>
        </button>
        
        <button
          onClick={handleOpenShort}
          disabled={!margin || isShortLoading || !usdcBalance}
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
        >
          <TrendingDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>{isShortLoading ? 'Opening...' : 'Short'}</span>
        </button>
      </div>
    </div>
  );
};

export default TradeForm;