import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { TrendingUp, Droplets } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const isWrongNetwork = chain && chain.id !== 11155111; // Sepolia chain ID

  return (
    <header className="backdrop-blur-xl bg-black/20 border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg group-hover:scale-105 transition-transform">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PerpFutures
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Trading
            </Link>
            <Link
              to="/faucet"
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                location.pathname === '/faucet'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Droplets className="h-4 w-4" />
              <span>Faucet</span>
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isWrongNetwork && (
              <button
                onClick={() => switchNetwork?.(11155111)}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Switch to Sepolia
              </button>
            )}
            <ConnectButton
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;