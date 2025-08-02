// Import ABIs from separate files
export { USDC_ABI } from './abis/usdc';
export { VAULT_ABI } from './abis/vault';

// Contract addresses and configuration
export const CONTRACTS = {
  // 1Node Vault Contracts
  VAULT: {
    [10]: '0x4E19A6C2B37c799E6BC8eb682889f33C6d97760A', // Optimism
    [42793]: '0x4E19A6C2B37c799E6BC8eb682889f33C6d97760A', // Etherlink
  },
  
  // USDC Token Contracts (6 decimals)
  USDC: {
    [10]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // Optimism
    [42793]: '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9', // Etherlink
  }
} as const;


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