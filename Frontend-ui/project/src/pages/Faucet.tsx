import React, { useState } from 'react';
import { useAccount, useBalance, useContractWrite, useWaitForTransaction } from 'wagmi';
import { Droplets, Wallet, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CONTRACTS, ABIS } from '../config/contracts';

const Faucet: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [claimAmount] = useState('1,000');

  const { data: usdcBalance, refetch: refetchBalance } = useBalance({
    address,
    token: CONTRACTS.USDC,
    enabled: !!address,
  });

  const { write: claimTokens, isLoading: isClaimLoading } = useContractWrite({
    address: CONTRACTS.USDC_FAUCET,
    abi: ABIS.USDC_FAUCET,
    functionName: 'claim',
    onSuccess: (data) => {
      toast.success('Claim transaction submitted!');
    },
    onError: (error) => {
      toast.error('Failed to claim tokens');
      console.error(error);
    },
  });

  const handleClaim = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    claimTokens?.();
  };

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
            <Wallet className="h-12 w-12 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400">Connect your wallet to claim test USDC tokens</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="p-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full w-20 h-20 mx-auto mb-4">
            <Droplets className="h-12 w-12 text-blue-400 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">USDC Faucet</h1>
          <p className="text-gray-400">Claim test USDC tokens for trading on Sepolia testnet</p>
        </div>

        {/* Wallet Info */}
        <div className="bg-black/20 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Connected Address</span>
            <span className="text-white font-mono text-sm">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Current USDC Balance</span>
            <span className="text-white font-semibold">
              {usdcBalance ? `${parseFloat(usdcBalance.formatted).toFixed(2)} USDC` : '0.00 USDC'}
            </span>
          </div>
        </div>

        {/* Claim Section */}
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-6">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {claimAmount} USDC
            </div>
            <p className="text-gray-400">Available to claim every 24 hours</p>
          </div>

          <button
            onClick={handleClaim}
            disabled={isClaimLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
          >
            {isClaimLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Claiming...</span>
              </>
            ) : (
              <>
                <Droplets className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Claim {claimAmount} Test USDC</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400">Free Testnet Tokens</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400">24 Hour Cooldown</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400">Sepolia Network Only</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faucet;