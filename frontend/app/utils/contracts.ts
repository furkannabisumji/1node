// Contract addresses and configuration
export const CONTRACTS = {
  // 1Node Deposit Contracts
  DEPOSIT_CONTRACT: {
    [10]: '0x4E19A6C2B37c799E6BC8eb682889f33C6d97760A', // Optimism
    [42793]: '0x4E19A6C2B37c799E6BC8eb682889f33C6d97760A', // Etherlink
  },
  
  // USDC Token Contracts (6 decimals)
  USDC: {
    [10]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // Optimism
    [42793]: '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', // Etherlink
  }
} as const;

// USDC ABI (standard ERC20)
export const USDC_ABI = [
  {
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: 'remaining', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// 1Node Deposit Contract ABI (simplified)
export const DEPOSIT_CONTRACT_ABI = [
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Chain information
export const SUPPORTED_CHAINS = {
  [10]: {
    name: 'Optimism',
    symbol: 'OP',
    nativeCurrency: 'ETH',
  },
  [42793]: {
    name: 'Etherlink',
    symbol: 'XTZ',
    nativeCurrency: 'XTZ',
  },
} as const;

// USDC formatting utilities (6 decimals)
export const formatUSDC = (amount: bigint): number => {
  return Number(amount) / 1_000_000; // 6 decimals
};

export const parseUSDC = (amount: number): bigint => {
  return BigInt(Math.round(amount * 1_000_000)); // 6 decimals
};

export const formatUSDCDisplay = (amount: number): string => {
  return amount.toFixed(2);
};