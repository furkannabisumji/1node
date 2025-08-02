import { AppLayout } from '~/components/layout/AppLayout';
import { PortfolioOverview } from '~/components/dashboard/PortfolioOverview';
import { RecentActivity } from '~/components/dashboard/RecentActivity';

import { TrendingUp, AlertTriangle, Activity, DollarSign, Target, Plus } from 'lucide-react';
import { redirect, useLoaderData, useNavigate } from 'react-router';

import axiosInstance from '~/lib/axios';
import { useEffect, useState } from 'react';
import { useAuth } from '~/auth/AuthProvider';
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - 1Node DeFi Automations" },
    { name: "description", content: "Dashboard for 1Node DeFi Automations" },
  ];
}

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
  const [portfolio, setPortfolio] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check authentication first
        const authRes = await axiosInstance.get(`/auth/me`, {
          validateStatus: () => true,
        })

        setUser(authRes.data.user)
       
        
        // Fetch portfolio and analytics data in parallel
        const [portfolioRes, analyticsRes] = await Promise.all([
          axiosInstance.get('/portfolio'),
          axiosInstance.get('/portfolio/analytics')
        ])
        
        console.log('Portfolio data:', portfolioRes.data)
        console.log('Analytics data:', analyticsRes.data)
        
        setPortfolio(portfolioRes.data.portfolio)
        setAnalytics(analyticsRes.data.analytics)
        setRecentActivity(analyticsRes.data.recentActivity || [])
        setLoading(false)
      } catch (err: any) {
        console.error('Dashboard data fetch error:', err)
        if (err?.response?.status === 401) {
          // UnAuthenticated
        } else {
          setError(err?.response?.data?.error || 'Failed to load dashboard data')
          setLoading(false)
        }
      }
    }
    
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-neutral-400">Loading dashboard...</div>
        </div>
      </AppLayout>
    )
  }
  
  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h1>
              <p className="text-neutral-400">Here's your portfolio overview and automation insights</p>
            </div>
            
            <button
              onClick={() => navigate('/automations/create')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Create Automation
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${portfolio?.totalValue?.toLocaleString() || '0'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Active Automations</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.activeWorkflows}/{analytics.totalWorkflows}
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.successRate?.toFixed(1) || '0'}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Executions</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.totalExecutions || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Portfolio Overview - Takes 2 columns on large screens */}
          <div className="xl:col-span-2">
            <PortfolioOverview portfolio={portfolio} />
          </div>

          {/* Recent Activity Sidebar */}
          <div className="xl:col-span-1">
            <RecentActivity recentActivity={recentActivity} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}