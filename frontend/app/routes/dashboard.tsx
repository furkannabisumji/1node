import { AppLayout } from '~/components/layout/AppLayout';
import { PortfolioOverview } from '~/components/dashboard/PortfolioOverview';
import { AIInsights } from '~/components/dashboard/AIInsights';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { redirect, useLoaderData, useNavigate } from 'react-router';
import axiosInstance from '~/lib/axios';
import { useEffect, useState } from 'react';
import { useAuth } from '~/auth/AuthProvider';


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
  const [user, setUser] = useState()
  const navigate = useNavigate()
  
  useEffect(() => {
    axiosInstance.get(`/auth/me`, {
      validateStatus: () => true, // disables automatic throwing for non-2xx
    }).then((res) => {
      console.log(res)
      setUser(res.data.user)
      if (res.status === 401) {
        navigate('/onboarding')
      }
    }).catch((err) => {
      navigate('/onboarding')
    })
  }, [])

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

          {/* AI Insights Sidebar */}
          <div className="xl:col-span-1">
            <AIInsights insights={aiInsights} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}