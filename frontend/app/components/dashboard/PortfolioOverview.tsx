import { TrendingUp } from 'lucide-react';

interface CryptoHolding {
  name: string;
  symbol: string;
  amount: number;
  usdValue: number;
  usdcAmount: number;
  usdcValue: number;
}

interface PortfolioData {
  totalValue: number;
  change24h: string;
  changeType: 'positive' | 'negative';
}

interface PortfolioOverviewProps {
  portfolioData: PortfolioData;
  holdings: CryptoHolding[];
}

export function PortfolioOverview({ portfolioData, holdings }: PortfolioOverviewProps) {
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
          ${portfolioData.totalValue.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-green-500 font-medium">{portfolioData.change24h} (24h)</span>
        </div>
      </div>

      {/* Holdings List */}
      <div className="space-y-4">
        {holdings.map((holding, index) => (
          <div key={index} className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{holding.name}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">{holding.symbol}</span>
                    <div className="text-white font-medium">{holding.amount}</div>
                    <div className="text-neutral-400">${holding.usdValue.toLocaleString()}</div>
                  </div>
                  <div className="lg:col-start-4">
                    <span className="text-neutral-400">USDC</span>
                    <div className="text-white font-medium">{holding.usdcAmount.toLocaleString()}</div>
                    <div className="text-neutral-400">${holding.usdcValue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}