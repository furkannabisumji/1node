import { Link, useNavigate } from 'react-router';
import { Zap, ArrowRight, Play, TrendingUp, Shield, Bot, ChevronRight, DollarSign, Clock, Send, Check, Wallet } from 'lucide-react';
import { ConnectKitButton } from 'connectkit';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import axiosInstance from '~/lib/axios';
import { useAuth } from '~/auth/AuthProvider';

import { useSignMessage } from 'wagmi';
import axios from 'axios';


export function Welcome() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const signIn = async () => {
      if (!isConnected || !address) return;
      try {
        const message = `Sign this message to authenticate. Timestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });
        const res = await axiosInstance.post('/auth/connect-wallet', {
          walletAddress: address,
          signature,
          message,
        });
        if (res.data) {
          navigate('/dashboard');
        }
      } catch (err) {
        // Optionally handle error (e.g., show notification)
        // console.error('Wallet sign-in failed:', err);
        if (axios.isAxiosError(err)) {
          console.error('Wallet connect failed:', err.response?.data?.error);

        } else {
          console.error('Unexpected error:', err);
        }
      }
    };
    signIn();
  }, [isConnected])
  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">1</span>
              </div>
              <span className="text-white font-bold text-xl">Node</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-neutral-300 hover:text-white transition-colors">Features</a>
              <a href="#automation" className="text-neutral-300 hover:text-white transition-colors">Automation</a>
              <a href="#examples" className="text-neutral-300 hover:text-white transition-colors">Examples</a>
              <a href="#pricing" className="text-neutral-300 hover:text-white transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center gap-4">
              <ConnectKitButton.Custom>
                {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
                  return (
                    <>
                      <button
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors 
                          hover:bg-neutral-700 text-white cursor-pointer
                          `}
                        onClick={show}
                      // disabled={isConnected}
                      >
                        <Wallet className="w-5 h-5" />
                        {isConnected ? "Wallet Connected" : "Connect Wallet"}


                      </button>

                    </>
                  );
                }}
              </ConnectKitButton.Custom>
              <Link
                to="/onboarding"
                className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2 text-neutral-300 text-sm">
              <Bot className="w-4 h-4 text-green-500" />
              The Future of DeFi Automation
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Build DeFi
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Automations
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Visually
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Create sophisticated DeFi strategies with our visual no-code builder.
            Connect triggers, conditions, and actions to automate your portfolio across
            multiple blockchains.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/onboarding"
              className="bg-green-500 hover:bg-green-600 text-black px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-green-500/25 transition-all flex items-center gap-2"
            >
              Start Building Free
              <Zap className="w-5 h-5" />
            </Link>
            <button className="group flex items-center gap-3 text-white hover:text-green-400 transition-colors">
              <div className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors">
                <Play className="w-5 h-5 ml-1" />
              </div>
              <span className="font-medium">Watch 2min Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Visual Builder Preview */}
      <section className="py-20 px-4 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Visual Automation Builder
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Drag, drop, and connect nodes to create powerful DeFi automations.
              No coding required - just visual flow creation.
            </p>
          </div>

          {/* Mock Automation Builder Interface */}
          <div className="bg-black border border-neutral-800 rounded-2xl p-8 mb-12">
            <div className="flex gap-8">
              {/* Left Sidebar Mock */}
              <div className="w-80 bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                <div className="text-white font-medium mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  Triggers
                </div>
                <div className="space-y-2 mb-6">
                  <div className="bg-neutral-800 rounded-lg p-3 flex items-center gap-3 border border-neutral-700">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-white text-sm font-medium">Price Change</div>
                      <div className="text-neutral-400 text-xs">Token price movement</div>
                    </div>
                  </div>
                  <div className="bg-neutral-800 rounded-lg p-3 flex items-center gap-3 border border-neutral-700">
                    <Clock className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-white text-sm font-medium">Time Schedule</div>
                      <div className="text-neutral-400 text-xs">Recurring schedule</div>
                    </div>
                  </div>
                </div>
                <div className="text-white font-medium mb-4 flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-500" />
                  Actions
                </div>
                <div className="space-y-2">
                  <div className="bg-neutral-800 rounded-lg p-3 flex items-center gap-3 border border-neutral-700">
                    <Send className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-white text-sm font-medium">Swap Tokens</div>
                      <div className="text-neutral-400 text-xs">Exchange tokens</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Canvas Mock */}
              <div className="flex-1 bg-black border border-neutral-800 rounded-lg relative min-h-80">
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
                    {Array.from({ length: 96 }).map((_, i) => (
                      <div key={i} className="border-r border-b border-neutral-700"></div>
                    ))}
                  </div>
                </div>
                {/* Sample Flow */}
                <div className="relative p-8">
                  <div className="flex items-center gap-8">
                    {/* Trigger Node */}
                    <div className="bg-neutral-800 border-2 border-green-500/50 rounded-lg p-4 min-w-48">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-white font-medium">Price Change</span>
                      </div>
                      <p className="text-neutral-400 text-xs">ETH drops 10%</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-neutral-400">Configured</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-6 h-6 text-green-500" />

                    {/* Action Node */}
                    <div className="bg-neutral-800 border-2 border-purple-500/50 rounded-lg p-4 min-w-48">
                      <div className="flex items-center gap-2 mb-2">
                        <Send className="w-4 h-4 text-purple-500" />
                        <span className="text-white font-medium">Swap Tokens</span>
                      </div>
                      <p className="text-neutral-400 text-xs">50% ETH → USDC</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-neutral-400">Needs Setup</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/automations/create"
              className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-neutral-600"
            >
              Try the Builder
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need for DeFi Automation
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Professional-grade tools and features designed for both beginners and advanced DeFi users.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ title, description, icon, highlight }) => (
              <div key={title} className="group bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-8 rounded-2xl transition-all hover:transform hover:scale-105">
                <div className="text-green-500 mb-6 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {title}
                </h3>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  {description}
                </p>
                {highlight && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <span className="text-green-400 text-sm font-medium">{highlight}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Automation Examples */}
      <section id="examples" className="py-20 px-4 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Real-World Automation Strategies
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              See how our users are automating complex DeFi strategies with simple visual workflows.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map(({ title, description, flow, impact }) => (
              <div key={title} className="bg-black border border-neutral-800 p-8 rounded-2xl hover:border-neutral-700 transition-colors">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {title}
                </h3>
                <p className="text-neutral-300 mb-6 leading-relaxed">
                  {description}
                </p>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
                  <div className="text-green-400 text-sm font-mono">
                    {flow}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Node Types Overview */}
      <section id="automation" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              19 Powerful Node Types
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Mix and match triggers, conditions, and actions to create unlimited automation possibilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Triggers */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Triggers</h3>
                  <p className="text-neutral-400">4 Types</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-neutral-300">• Price Change</div>
                <div className="text-neutral-300">• Gas Price</div>
                <div className="text-neutral-300">• Time Schedule</div>
                <div className="text-neutral-300">• Wallet Balance</div>
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Conditions</h3>
                  <p className="text-neutral-400">7 Types</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-neutral-300">• Amount Limits</div>
                <div className="text-neutral-300">• Time Restrictions</div>
                <div className="text-neutral-300">• Portfolio Percentage</div>
                <div className="text-neutral-300">• Market Volume</div>
                <div className="text-neutral-300">• Gas Fee Limit</div>
                <div className="text-neutral-300">• Safety Checks</div>
                <div className="text-neutral-300">• Loss Limits</div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Actions</h3>
                  <p className="text-neutral-400">8 Types</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-neutral-300">• Swap Tokens</div>
                <div className="text-neutral-300">• Send/Transfer</div>
                <div className="text-neutral-300">• Stake/Unstake</div>
                <div className="text-neutral-300">• Provide Liquidity</div>
                <div className="text-neutral-300">• Claim Rewards</div>
                <div className="text-neutral-300">• Rebalance Portfolio</div>
                <div className="text-neutral-300">• Send Alert</div>
                <div className="text-neutral-300">• Execute Strategy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Automating Today
          </h2>
          <p className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto">
            Join the future of DeFi with intelligent automation that works 24/7 across multiple blockchains.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/onboarding"
              className="bg-green-500 hover:bg-green-600 text-black px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-green-500/25 transition-all flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard"
              className="border border-neutral-600 hover:border-green-500 text-white hover:text-green-400 px-8 py-4 rounded-xl text-lg font-semibold transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">1</span>
            </div>
            <span className="text-white font-bold text-xl">Node</span>
          </div>
          <p className="text-neutral-400 mb-6">
            The visual DeFi automation platform for the decentralized future.
          </p>
          <div className="flex justify-center gap-8 text-neutral-400">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    title: "No-Code Builder",
    description: "Create complex DeFi automations with drag-and-drop simplicity. No programming required.",
    highlight: "Build in minutes, not months",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7v10c0 5.55 3.84 9.64 9 11 5.16-1.36 9-5.45 9-11V7l-10-5z" />
      </svg>
    )
  },
  {
    title: "Cross-Chain Execution",
    description: "Automate actions across Ethereum, Polygon, Arbitrum, and more with seamless interoperability.",
    highlight: "5+ chains supported",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    )
  },
  {
    title: "AI-Powered Suggestions",
    description: "Get personalized automation recommendations based on your portfolio and market conditions.",
    highlight: "Smart recommendations",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
      </svg>
    )
  },
  {
    title: "Conditional Logic",
    description: "Set up complex triggers and conditions using advanced on-chain logic and real-time data.",
    highlight: "19 node types available",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    )
  },
  {
    title: "Risk Management",
    description: "Built-in safety features and AI alerts to protect your portfolio from market volatility.",
    highlight: "Advanced protection",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 9.64 9 11 5.16-1.36 9-5.45 9-11V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z" />
      </svg>
    )
  },
  {
    title: "1inch Integration",
    description: "Powered by 1inch Fusion+ for optimal swap rates and deep liquidity across all chains.",
    highlight: "Best execution guaranteed",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }
];

const useCases = [
  {
    title: "Portfolio Protection",
    description: "Automatically protect your holdings from market downturns with smart stop-loss strategies.",
    flow: "IF ETH drops 10% THEN swap 50% to USDC on Polygon AND send alert",
    impact: "Saved 25% during market downturns"
  },
  {
    title: "Yield Optimization",
    description: "Continuously monitor and move funds to the highest yielding opportunities across chains.",
    flow: "IF USDC APY on Optimism > 8% THEN move funds from Polygon to Optimism",
    impact: "15% higher yields achieved"
  },
  {
    title: "Automated Arbitrage",
    description: "Capture price differences between chains with automated cross-chain arbitrage.",
    flow: "IF ETH price difference between Ethereum and Polygon > 2% THEN execute cross-chain swap",
    impact: "2-5% profit on arbitrage opportunities"
  },
  {
    title: "DCA Strategies",
    description: "Set up dollar-cost averaging strategies that execute based on market conditions.",
    flow: "IF BTC drops 5% AND volume spikes THEN buy $100 BTC weekly for 4 weeks",
    impact: "22% better entry points vs manual DCA"
  }
];
