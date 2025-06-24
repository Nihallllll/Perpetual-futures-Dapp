// Smart contract addresses and ABIs
export const CONTRACTS = {
  USDC_FAUCET: '0x...', // Replace with actual contract address
  PERPS: '0x...', // Replace with actual contract address
  FUNDING_RATE_MANAGER: '0x...', // Replace with actual contract address
  LIQUIDATION_ENGINE: '0x...', // Replace with actual contract address
  USDC: '0x...', // Replace with actual USDC token address
};

// Simplified ABIs - replace with actual contract ABIs
export const ABIS = {
  USDC_FAUCET: [
    'function claim() external',
    'function balanceOf(address) view returns (uint256)',
  ],
  PERPS: [
    'function openPosition(uint256 margin, uint256 leverage, bool isLong, uint256 price) external',
    'function closePosition() external',
    'function addMargin(uint256 amount) external',
    'function removeMargin(uint256 amount) external',
    'function getUserPosition(address user) view returns (tuple)',
    'function getMarkPrice() view returns (uint256)',
    'function getPnL(address user) view returns (int256)',
    'event PositionOpened(address indexed user, uint256 margin, uint256 leverage, bool isLong)',
    'event PositionClosed(address indexed user, int256 pnl)',
    'event MarginAdded(address indexed user, uint256 amount)',
    'event MarginRemoved(address indexed user, uint256 amount)',
  ],
  FUNDING_RATE_MANAGER: [
    'function getFundingRate() view returns (int256)',
    'function settleFunding() external',
    'function getNextSettlementTime() view returns (uint256)',
  ],
  LIQUIDATION_ENGINE: [
    'function liquidate(address user) external',
    'function getMarginRatio(address user) view returns (uint256)',
  ],
  ERC20: [
    'function balanceOf(address) view returns (uint256)',
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
  ],
};