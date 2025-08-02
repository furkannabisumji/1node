import 'dotenv/config';

interface Config {
  // Server
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  corsOrigin: string;

  // Database
  databaseUrl: string;

  // Redis
  redisUrl: string;

  // 1inch API
  oneInchApiKey: string;
  oneInchBaseUrl: string;
  oneInchServerUrl: string;

  // Blockchain RPC URLs
  alchemyApiKey: string;

  // Private keys
  executorPrivateKey: string;

  // Smart Contracts
  vaultContractAddress: string;
  vaultContractAddressEtherlink: string;

  // AI Services
  openaiApiKey: string;

  // Notifications
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;


  // Logging
  logLevel: string;
  logFile: string;

  // Feature flags
  enableAiSuggestions: boolean;
  enableCrossChain: boolean;
  enableNotifications: boolean;
}

function validateConfig(): Config {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ONEINCH_API_KEY',
    'ALCHEMY_API_KEY',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    // Server
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET!,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Database
    databaseUrl: process.env.DATABASE_URL!,

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

    // 1inch API
    oneInchApiKey: process.env.ONEINCH_API_KEY!,
    oneInchBaseUrl: process.env.ONEINCH_BASE_URL || 'https://api.1inch.dev',
    oneInchServerUrl: process.env.ONEINCH_SERVER_URL || 'http://localhost:3001',

    // Blockchain RPC URLs
    alchemyApiKey: process.env.ALCHEMY_API_KEY!,

    // Private keys
    executorPrivateKey: process.env.EXECUTOR_PRIVATE_KEY || '',

    // Smart Contracts
    vaultContractAddress: process.env.VAULT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    vaultContractAddressEtherlink: process.env.VAULT_CONTRACT_ADDRESS_ETHERLINK || '0x0000000000000000000000000000000000000000',

    // AI Services
    openaiApiKey: process.env.OPENAI_API_KEY || '',

    // Notifications
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE || 'logs/app.log',

    // Feature flags
    enableAiSuggestions: process.env.ENABLE_AI_SUGGESTIONS === 'true',
    enableCrossChain: process.env.ENABLE_CROSS_CHAIN === 'true',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  };
}

export const config = validateConfig();

// Chain configurations
export const SUPPORTED_CHAINS = {
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${config.alchemyApiKey}`,
    nativeCurrency: 'ETH',
  },
  POLYGON: {
    id: 137,
    name: 'Polygon',
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${config.alchemyApiKey}`,
    nativeCurrency: 'MATIC',
  },
  OPTIMISM: {
    id: 10,
    name: 'Optimism',
    rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${config.alchemyApiKey}`,
    nativeCurrency: 'ETH',
  },
  ARBITRUM: {
    id: 42161,
    name: 'Arbitrum',
    rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${config.alchemyApiKey}`,
    nativeCurrency: 'ETH',
  },
  BASE: {
    id: 8453,
    name: 'Base',
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${config.alchemyApiKey}`,
    nativeCurrency: 'ETH',
  },
  ETHERLINK: {
    id: 128123,
    name: 'Etherlink',
    rpcUrl: process.env.ETHERLINK_RPC_URL || 'https://node.mainnet.etherlink.com',
    nativeCurrency: 'XTZ',
  },
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS; 