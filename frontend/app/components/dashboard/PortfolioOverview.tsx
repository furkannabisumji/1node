import { TrendingUp, Copy } from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceWei: string;
  priceUSD: number;
  valueUSD: number;
}

interface ChainData {
  name: string;
  id: number;
  totalValue: number;
  tokens: Token[];
  deposits?: any[];
  error?: string;
}

interface Portfolio {
  totalValue: number;
  chains: Record<string, ChainData>;
  workflows: number;
  activeWorkflows: number;
  totalDeposits: number;
}

interface PortfolioOverviewProps {
  portfolio: Portfolio | null;
}

export function PortfolioOverview({ portfolio }: PortfolioOverviewProps) {
  const truncateAddress = (address: string) => {
    if (!address) return address;
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!portfolio) {
    return (
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 text-white">$</div>
          <h2 className="text-xl font-semibold text-white">Portfolio Overview</h2>
        </div>
        <div className="text-neutral-400">No portfolio data available</div>
      </div>
    );
  }

  const chainsWithBalances = Object.entries(portfolio.chains).filter(
    ([, chainData]) => chainData.totalValue > 0 && !chainData.error
  );

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      {/* Portfolio Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 text-white">$</div>
        <h2 className="text-xl font-semibold text-white">Portfolio Overview</h2>
      </div>

      {/* Total Value */}
      <div className="mb-8">
        <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
          ${portfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          <span>Total Deposits: ${portfolio.totalDeposits.toLocaleString()}</span>
          <span>•</span>
          <span>Workflows: {portfolio.activeWorkflows}/{portfolio.workflows}</span>
        </div>
      </div>

      {/* Chain Breakdown */}
      {chainsWithBalances.length > 0 ? (
        <div className="space-y-6">
          {chainsWithBalances.map(([chainKey, chainData]) => (
            <div key={chainKey} className="bg-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  {chainData.name}
                </h3>
                <div className="text-white font-medium">
                  ${chainData.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              
              {/* Tokens */}
              {chainData.tokens && chainData.tokens.length > 0 ? (
                <div className="space-y-3">
                  {chainData.tokens.map((token) => (
                    <div key={token.address} className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{token.symbol}</span>
                          <span className="text-neutral-400 text-sm">({token.name})</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(token.address)}
                          className="text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-sm"
                          title={`Click to copy: ${token.address}`}
                        >
                          {truncateAddress(token.address)}
                          <Copy className="w-3 h-3 opacity-50" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {parseFloat(token.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </div>
                        <div className="text-neutral-400 text-sm">
                          ${token.valueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-neutral-500 text-xs">
                          @${token.priceUSD.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-400 text-sm">No tokens with balance found</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-neutral-400 mb-2">No active balances found</div>
          <div className="text-neutral-500 text-sm">
            Your portfolio will appear here once you start using automations
          </div>
        </div>
      )}
    </div>
  );
}