import { useState } from 'react';
import { Play, DollarSign, AlertTriangle } from 'lucide-react';

interface RightSidebarProps {
  onWithdraw: () => void;
  onDeposit: () => void;
  onDeploy: () => void;
}

export function RightSidebar({ onWithdraw, onDeposit, onDeploy }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'simulation' | 'requirements' | 'insights'>('requirements');

  return (
    <div className="w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Secondary Actions */}
        <div className="flex items-center gap-2 px-4 py-3 w-full box-border overflow-x-auto">
          {/* <button onClick={() => setActiveTab('simulation')} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            <Eye className="w-4 h-4" />
            Simulation
          </button> */}
          <button onClick={() => setActiveTab('requirements')} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            <AlertTriangle className="w-4 h-4" />
            Requirements
          </button>
          {/* <button onClick={() => setActiveTab('insights')} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            <BotIcon className="w-4 h-4" />
            AI Insights
          </button> */}
        </div>

        {/* {activeTab === 'simulation' && (
          <>
            Live Simulation Section
            <div className="p-4">
              <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-4 h-4 text-green-500" />
                  <span className="text-white font-medium">Live Simulation</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Status</span>
                    <span className="text-green-500 font-medium">Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">ETH Price</span>
                    <span className="text-white">$2493.32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Trigger at</span>
                    <span className="text-red-400">$2,902.99 (-10%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Current Gas</span>
                    <span className="text-blue-400">$3.24</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-700">
                  <div className="text-neutral-400 text-xs mb-1">Expected Outcome</div>
                  <div className="text-white text-sm font-medium">Swap 0.5 ETH → ~$1,281</div>
                </div>
              </div>
            </div>

            Live Simulation Steps
            <div className="px-4 pb-4">
              <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-white font-medium">Live Simulation</span>
                </div>

                <div className="space-y-3">
                  Step 1
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-white text-sm">Price Monitor Active</div>
                      <div className="text-neutral-400 text-xs">Checking every 30s</div>
                    </div>
                  </div>

                  Step 2
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                    <div>
                      <div className="text-neutral-400 text-sm">Trigger Condition</div>
                      <div className="text-neutral-500 text-xs">Waiting for -10% drop</div>
                    </div>
                  </div>

                  Step 3
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                    <div>
                      <div className="text-neutral-400 text-sm">Execute Swap</div>
                      <div className="text-neutral-500 text-xs">~15s execution time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )} */}

        {activeTab === 'requirements' && (
          <>
            {/* Required Balances */}
            <div className="px-4 pb-4">
              <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  <span className="text-white font-medium">Required Balances</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">E</div>
                      <span className="text-white text-sm">ETH</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">1.0 ETH</div>
                      <div className="text-green-500 text-xs">✓ Available: 2.24 ETH</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">U</div>
                      <span className="text-white text-sm">USDC</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">0 USDC</div>
                      <div className="text-neutral-400 text-xs">For receiving swap</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onDeposit}
                  className="w-full mt-4 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  Deposit
                </button>
              </div>
            </div>
            {/* Available Balances */}
            <div className="px-4 pb-4">
              <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className="text-white font-medium">Available Balances</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">E</div>
                      <span className="text-white text-sm">ETH</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">1.0 ETH</div>
                      <div className="text-neutral-400 text-xs">Locked</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">E</div>
                      <span className="text-white text-sm">ETH</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">1.6 ETH</div>
                      <div className="text-green-500 text-xs">Available</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onWithdraw}
                  className="w-full mt-4 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </>
        )}


      </div>

      {/* Fixed Deploy Button */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900">
        <button 
          onClick={onDeploy}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Deploy Automation
        </button>
      </div>
    </div >
  );
}