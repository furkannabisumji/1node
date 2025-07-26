export function Welcome() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent mb-6">
            IFTTT for DeFi
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-white mb-8 max-w-3xl mx-auto">
            Automate complex DeFi strategies across multiple blockchains with zero code required
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all">
              Start Automating
            </button>
            <button className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black dark:text-white mb-12">
            Powerful DeFi Automation Made Simple
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ title, description, icon }) => (
              <div key={title} className="bg-white dark:bg-black dark:border dark:border-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-green-500 mb-4">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-white">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black dark:text-white mb-12">
            Real-World Automation Examples
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map(({ title, description, example }) => (
              <div key={title} className="bg-white dark:bg-black dark:border dark:border-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {description}
                </p>
                <div className="bg-green-50 dark:bg-gray-900 dark:border dark:border-green-500 p-4 rounded-lg">
                  <code className="text-sm text-green-800 dark:text-green-400">
                    {example}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-6">
            Ready to Automate Your DeFi Strategy?
          </h2>
          <p className="text-xl text-gray-600 dark:text-white mb-8">
            Join thousands of users who have automated their DeFi workflows with our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all">
              Connect Wallet
            </button>
            <button className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              Explore Templates
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    title: "No-Code Builder",
    description: "Create complex DeFi automations with drag-and-drop simplicity. No programming required.",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7v10c0 5.55 3.84 9.64 9 11 5.16-1.36 9-5.45 9-11V7l-10-5z"/>
      </svg>
    )
  },
  {
    title: "Cross-Chain Execution",
    description: "Automate actions across Ethereum, Polygon, Arbitrum, and more with seamless interoperability.",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    )
  },
  {
    title: "AI-Powered Suggestions",
    description: "Get personalized automation recommendations based on your portfolio and market conditions.",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
      </svg>
    )
  },
  {
    title: "Conditional Logic",
    description: "Set up complex triggers and conditions using advanced on-chain logic and real-time data.",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    )
  },
  {
    title: "Risk Management",
    description: "Built-in safety features and AI alerts to protect your portfolio from market volatility.",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 9.64 9 11 5.16-1.36 9-5.45 9-11V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/>
      </svg>
    )
  },
  {
    title: "1inch Integration",
    description: "Powered by 1inch Fusion+ for optimal swap rates and deep liquidity across all chains.",
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    )
  }
];

const useCases = [
  {
    title: "Portfolio Protection",
    description: "Automatically protect your holdings from market downturns with smart stop-loss strategies.",
    example: "IF ETH drops 10% THEN swap 50% to USDC on Polygon AND send alert"
  },
  {
    title: "Yield Optimization",
    description: "Continuously monitor and move funds to the highest yielding opportunities across chains.",
    example: "IF USDC APY on Optimism > 8% THEN move funds from Polygon to Optimism"
  },
  {
    title: "Automated Arbitrage",
    description: "Capture price differences between chains with automated cross-chain arbitrage.",
    example: "IF ETH price difference between Ethereum and Polygon > 2% THEN execute cross-chain swap"
  },
  {
    title: "DCA Strategies",
    description: "Set up dollar-cost averaging strategies that execute based on market conditions.",
    example: "IF BTC drops 5% AND volume spikes THEN buy $100 BTC weekly for 4 weeks"
  }
];
