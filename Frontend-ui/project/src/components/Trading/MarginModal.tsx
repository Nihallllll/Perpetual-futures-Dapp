import React, { useState } from 'react';
import { useContractWrite } from 'wagmi';
import { X, Plus, Minus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CONTRACTS, ABIS } from '../../config/contracts';

interface Position {
  entryPrice: number;
  size: number;
  quantity: number;
  leverage: number;
  margin: number;
  pnl: number;
  isLong: boolean;
  marginRatio: number;
}

interface MarginModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  action: 'add' | 'remove';
}

const MarginModal: React.FC<MarginModalProps> = ({ isOpen, onClose, position, action }) => {
  const [amount, setAmount] = useState('');

  const { write: addMargin, isLoading: isAddingMargin } = useContractWrite({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    functionName: 'addMargin',
    onSuccess: () => {
      toast.success('Margin added successfully!');
      onClose();
      setAmount('');
    },
    onError: (error) => {
      toast.error('Failed to add margin');
      console.error(error);
    },
  });

  const { write: removeMargin, isLoading: isRemovingMargin } = useContractWrite({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    functionName: 'removeMargin',
    onSuccess: () => {
      toast.success('Margin removed successfully!');
      onClose();
      setAmount('');
    },
    onError: (error) => {
      toast.error('Failed to remove margin');
      console.error(error);
    },
  });

  const handleSubmit = () => {
    if (!amount || !position) return;

    const marginAmount = parseFloat(amount) * 1e6; // Convert to USDC decimals

    if (action === 'add') {
      addMargin({
        args: [marginAmount],
      });
    } else {
      removeMargin({
        args: [marginAmount],
      });
    }
  };

  const isLoading = isAddingMargin || isRemovingMargin;
  const maxRemovable = position ? position.margin * 0.8 : 0; // Assume 80% can be removed safely

  if (!isOpen || !position) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {action === 'add' ? (
              <Plus className="h-5 w-5 text-blue-400" />
            ) : (
              <Minus className="h-5 w-5 text-yellow-400" />
            )}
            <h3 className="text-lg font-semibold text-white">
              {action === 'add' ? 'Add Margin' : 'Remove Margin'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Position Info */}
        <div className="bg-black/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Side</div>
              <div className={`font-medium ${
                position.isLong ? 'text-green-400' : 'text-red-400'
              }`}>
                {position.isLong ? 'LONG' : 'SHORT'}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Current Margin</div>
              <div className="text-white">${position.margin.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">Size</div>
              <div className="text-white">${position.size.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">PnL</div>
              <div className={`font-medium ${
                position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">
              Amount (USDC)
            </label>
            {action === 'remove' && (
              <span className="text-xs text-gray-400">
                Max: ${maxRemovable.toFixed(2)}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount to ${action}`}
              className="w-full bg-black/20 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            {action === 'remove' && (
              <button
                onClick={() => setAmount(maxRemovable.toString())}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                MAX
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        {amount && (
          <div className="bg-black/20 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-400 mb-2">Preview</div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">New Margin:</span>
              <span className="text-white">
                ${(action === 'add' 
                  ? position.margin + parseFloat(amount)
                  : position.margin - parseFloat(amount)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!amount || isLoading}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              action === 'add'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Processing...' : `${action === 'add' ? 'Add' : 'Remove'} Margin`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarginModal;