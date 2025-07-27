import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

  // Blockchain RPC URLs
  ethereumRpcUrl: string;
  polygonRpcUrl: string;

  // Private keys
  executorPrivateKey: string;

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
    'ETHEREUM_RPC_URL',
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

    // Blockchain RPC URLs
    ethereumRpcUrl: process.env.ETHEREUM_RPC_URL!,
    polygonRpcUrl: process.env.POLYGON_RPC_URL || '',

    // Private keys
    executorPrivateKey: process.env.EXECUTOR_PRIVATE_KEY || '',

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
    rpcUrl: config.ethereumRpcUrl,
    nativeCurrency: 'ETH',
  },
  POLYGON: {
    id: 137,
    name: 'Polygon',
    rpcUrl: config.polygonRpcUrl,
    nativeCurrency: 'MATIC',
  },

} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS; 