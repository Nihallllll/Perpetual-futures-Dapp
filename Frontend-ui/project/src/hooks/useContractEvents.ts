import { useContractEvent } from 'wagmi';
import { toast } from 'react-hot-toast';
import { CONTRACTS, ABIS } from '../config/contracts';

export const useContractEvents = () => {
  // Position Opened Event
  useContractEvent({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    eventName: 'PositionOpened',
    listener: (logs) => {
      logs.forEach((log) => {
        const { args } = log;
        const isLong = args?.isLong;
        const margin = args?.margin;
        
        toast.success(
          `${isLong ? 'Long' : 'Short'} position opened! Margin: $${Number(margin) / 1e6}`,
          { duration: 5000 }
        );
      });
    },
  });

  // Position Closed Event
  useContractEvent({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    eventName: 'PositionClosed',
    listener: (logs) => {
      logs.forEach((log) => {
        const { args } = log;
        const pnl = args?.pnl;
        const pnlValue = Number(pnl) / 1e6;
        
        toast.success(
          `Position closed! P&L: ${pnlValue >= 0 ? '+' : ''}$${pnlValue.toFixed(2)}`,
          { 
            duration: 5000,
            icon: pnlValue >= 0 ? '📈' : '📉'
          }
        );
      });
    },
  });

  // Margin Added Event
  useContractEvent({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    eventName: 'MarginAdded',
    listener: (logs) => {
      logs.forEach((log) => {
        const { args } = log;
        const amount = args?.amount;
        
        toast.success(
          `Margin added: $${Number(amount) / 1e6}`,
          { duration: 4000 }
        );
      });
    },
  });

  // Margin Removed Event
  useContractEvent({
    address: CONTRACTS.PERPS,
    abi: ABIS.PERPS,
    eventName: 'MarginRemoved',
    listener: (logs) => {
      logs.forEach((log) => {
        const { args } = log;
        const amount = args?.amount;
        
        toast.success(
          `Margin removed: $${Number(amount) / 1e6}`,
          { duration: 4000 }
        );
      });
    },
  });
};