import React from 'react';
import { useAccount } from 'wagmi';
import TradingChart from '../components/Trading/TradingChart';
import TradeForm from '../components/Trading/TradeForm';
import PositionsTable from '../components/Trading/PositionsTable';
import FundingPanel from '../components/Trading/FundingPanel';
import { Wallet } from 'lucide-react';

const TradingDashboard: React.FC = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
            <Wallet className="h-12 w-12 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400">Connect your wallet to start trading perpetual futures</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Chart Panel */}
        <div className="xl:col-span-3">
          <TradingChart />
        </div>
        
        {/* Trade Form & Funding Panel */}
        <div className="space-y-6">
          <TradeForm />
          {/* <FundingPanel /> */}
        </div>
      </div>

      {/* Positions Table */}
      <PositionsTable />
    </div>
  );
};

export default TradingDashboard;