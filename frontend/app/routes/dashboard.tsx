import { AppLayout } from '~/components/layout/AppLayout';
import { PortfolioOverview } from '~/components/dashboard/PortfolioOverview';
import { UserProfile } from '~/components/dashboard/UserProfile';
import { TrendingUp, AlertTriangle } from 'lucide-react';

// Mock portfolio data
const portfolioData = {
  totalValue: 45678.9,
  change24h: '+12.5%',
  changeType: 'positive' as const
};

const cryptoHoldings = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    amount: 8.5,
    usdValue: 20400,
    usdcAmount: 5030.5,
    usdcValue: 5030.5
  },
  {
    name: 'Ethereum',
    symbol: 'ETH', 
    amount: 8.5,
    usdValue: 20400,
    usdcAmount: 5030.5,
    usdcValue: 5030.5
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    amount: 8.5,
    usdValue: 20400,
    usdcAmount: 5030.5,
    usdcValue: 5030.5
  }
];

const aiInsights = [
  {
    type: 'opportunity',
    title: 'High Yield Opportunity Detected',
    description: 'USDC staking on Optimism now offers 12.5% APY - 4% higher than your current position',
    actionText: 'Move $5,000 USDC to Optimism',
    icon: TrendingUp,
    color: 'text-green-500'
  },
  {
    type: 'alert',
    title: 'Portfolio Risk Alert',
    description: 'Your ETH exposure is 65% of portfolio. Consider rebalancing to reduce risk',
    actionText: 'Diversify into stablecoins',
    icon: AlertTriangle,
    color: 'text-yellow-500'
  }
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="p-4 lg:p-6 mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Portfolio Overview - Takes 2 columns on large screens */}
          <div className="xl:col-span-2">
            <PortfolioOverview 
              portfolioData={portfolioData}
              holdings={cryptoHoldings}
            />
          </div>

          {/* User Profile Sidebar */}
          <div className="xl:col-span-1">
            <UserProfile 
              walletAddress="0x3AdE67...780"
              username="John Doe"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}