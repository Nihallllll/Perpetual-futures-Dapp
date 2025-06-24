import React from 'react';
import { useContractRead, useContractWrite } from 'wagmi';
import { Clock, DollarSign, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CONTRACTS, ABIS } from '../../config/contracts';

const FundingPanel: React.FC = () => {
  // Mock data - replace with actual contract reads
  const fundingRate = -0.0025; // -0.25%
  const nextSettlement = Date.now() + 3600000; // 1 hour from now
  const isAtRisk = false; // Based on margin ratio calculation

  const { write: settleFunding, isLoading: isSettling } = useContractWrite({
    address: CONTRACTS.FUNDING_RATE_MANAGER,
    abi: ABIS.FUNDING_RATE_MANAGER,
    functionName: 'settleFunding',
    onSuccess: () => {
      toast.success('Funding settled successfully!');
    },
    onError: (error) => {
      toast.error('Failed to settle funding');
      console.error(error);
    },
  });

  const timeUntilSettlement = nextSettlement - Date.now();
  const hours = Math.floor(timeUntilSettlement / 3600000);
  const minutes = Math.floor((timeUntilSettlement % 3600000) / 60000);
  const seconds = Math.floor((timeUntilSettlement % 60000) / 1000);

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Funding & Risk</h3>
      </div>

      {/* Funding Rate */}
      <div className="bg-black/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Current Funding Rate</span>
          <DollarSign className="h-4 w-4 text-blue-400" />
        </div>
        <div className={`text-2xl font-bold ${
          fundingRate >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {fundingRate >= 0 ? '+' : ''}{(fundingRate * 100).toFixed(4)}%
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {fundingRate >= 0 ? 'Longs pay shorts' : 'Shorts pay longs'}
        </div>
      </div>

      {/* Next Settlement */}
      <div className="bg-black/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Next Settlement</span>
          <Clock className="h-4 w-4 text-blue-400" />
        </div>
        <div className="text-lg font-semibold text-white">
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Automatic settlement every 8 hours
        </div>
      </div>

      {/* Settle Button */}
      <button
        onClick={() => settleFunding()}
        disabled={isSettling}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
      >
        <Zap className="h-4 w-4" />
        <span>{isSettling ? 'Settling...' : 'Settle Funding Now'}</span>
      </button>

      {/* Liquidation Risk */}
      {isAtRisk && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Liquidation Risk</span>
          </div>
          <div className="text-xs text-gray-300 mb-3">
            Your position is at risk of liquidation. Consider adding margin or closing the position.
          </div>
          <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-2 px-3 rounded-lg transition-colors text-sm">
            Add Margin
          </button>
        </div>
      )}

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Maintenance Margin</div>
          <div className="text-sm font-semibold text-white">5%</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Liquidation Fee</div>
          <div className="text-sm font-semibold text-white">0.5%</div>
        </div>
      </div>
    </div>
  );
};

export default FundingPanel;