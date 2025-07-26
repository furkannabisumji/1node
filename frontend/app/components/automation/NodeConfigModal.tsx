import { useState } from 'react';
import { X, DollarSign, Percent, Clock, Zap } from 'lucide-react';

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeType: 'trigger' | 'condition' | 'action';
  nodeLabel: string;
  onSave: (config: any) => void;
}

export function NodeConfigModal({ isOpen, onClose, nodeType, nodeLabel, onSave }: NodeConfigModalProps) {
  const [config, setConfig] = useState<any>({});

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const renderTriggerConfig = () => {
    if (nodeLabel === 'Price Change') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Token</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={config.token || 'ETH'}
              onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDC">USD Coin (USDC)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="BTC">Bitcoin (BTC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Price Change Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={config.changeType || 'percentage'}
              onChange={(e) => setConfig(prev => ({ ...prev, changeType: e.target.value }))}
            >
              <option value="percentage">Percentage Change</option>
              <option value="absolute">Absolute Price</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {config.changeType === 'percentage' ? 'Percentage (%)' : 'Price ($)'}
            </label>
            <div className="flex gap-2">
              <select 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                value={config.direction || 'drops'}
                onChange={(e) => setConfig(prev => ({ ...prev, direction: e.target.value }))}
              >
                <option value="drops">Drops</option>
                <option value="rises">Rises</option>
              </select>
              <input
                type="number"
                placeholder={config.changeType === 'percentage' ? '10' : '2000'}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={config.value || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, value: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Network</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={config.network || 'ethereum'}
              onChange={(e) => setConfig(prev => ({ ...prev, network: e.target.value }))}
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="optimism">Optimism</option>
            </select>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Gas Price') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Network</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={config.network || 'ethereum'}
              onChange={(e) => setConfig(prev => ({ ...prev, network: e.target.value }))}
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="arbitrum">Arbitrum</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Condition</label>
            <div className="flex gap-2">
              <select 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                value={config.condition || 'less_than'}
                onChange={(e) => setConfig(prev => ({ ...prev, condition: e.target.value }))}
              >
                <option value="less_than">Less than</option>
                <option value="greater_than">Greater than</option>
              </select>
              <input
                type="number"
                placeholder="5"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={config.gasLimit || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, gasLimit: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">USD</span>
            </div>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Time Schedule') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Schedule Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={config.scheduleType || 'recurring'}
              onChange={(e) => setConfig(prev => ({ ...prev, scheduleType: e.target.value }))}
            >
              <option value="recurring">Recurring</option>
              <option value="once">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Time</label>
            <input
              type="time"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={config.time || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, time: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Timezone</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={config.timezone || 'UTC'}
              onChange={(e) => setConfig(prev => ({ ...prev, timezone: e.target.value }))}
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
            </select>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Wallet Balance') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Token</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={config.token || 'ETH'}
              onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDC">USD Coin (USDC)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Condition</label>
            <div className="flex gap-2">
              <select 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                value={config.condition || 'greater_than'}
                onChange={(e) => setConfig(prev => ({ ...prev, condition: e.target.value }))}
              >
                <option value="greater_than">Greater than</option>
                <option value="less_than">Less than</option>
                <option value="equal_to">Equal to</option>
              </select>
              <input
                type="number"
                placeholder="1.0"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={config.amount || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Wallet Address (Optional)</label>
            <input
              type="text"
              placeholder="0x... or leave empty for connected wallet"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={config.walletAddress || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, walletAddress: e.target.value }))}
            />
          </div>
        </div>
      );
    }

    return <div className="text-neutral-400">Configure {nodeLabel} trigger</div>;
  };

  const renderConditionConfig = () => {
    if (nodeLabel === 'Amount Limits') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Minimum Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.1"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.minAmount || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, minAmount: e.target.value }))}
              />
              <select 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.token || 'ETH'}
                onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Maximum Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="10"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.maxAmount || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, maxAmount: e.target.value }))}
              />
              <select 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.token || 'ETH'}
                onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Time Restrictions') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Restriction Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.restrictionType || 'hours'}
              onChange={(e) => setConfig(prev => ({ ...prev, restrictionType: e.target.value }))}
            >
              <option value="hours">Specific Hours</option>
              <option value="days">Specific Days</option>
              <option value="both">Hours and Days</option>
            </select>
          </div>

          {(config.restrictionType === 'hours' || config.restrictionType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Time Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="time"
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={config.startTime || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, startTime: e.target.value }))}
                />
                <span className="text-neutral-400">to</span>
                <input
                  type="time"
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={config.endTime || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          )}

          {(config.restrictionType === 'days' || config.restrictionType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Days of Week</label>
              <div className="grid grid-cols-2 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.days?.includes(day) || false}
                      onChange={(e) => {
                        const days = config.days || [];
                        if (e.target.checked) {
                          setConfig(prev => ({ ...prev, days: [...days, day] }));
                        } else {
                          setConfig(prev => ({ ...prev, days: days.filter(d => d !== day) }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-neutral-800 border-neutral-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-white text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (nodeLabel === 'Portfolio Percentage') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Token</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.token || 'ETH'}
              onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDC">USD Coin (USDC)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="BTC">Bitcoin (BTC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Condition</label>
            <div className="flex gap-2">
              <select 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.condition || 'greater_than'}
                onChange={(e) => setConfig(prev => ({ ...prev, condition: e.target.value }))}
              >
                <option value="greater_than">Greater than</option>
                <option value="less_than">Less than</option>
                <option value="between">Between</option>
              </select>
              <input
                type="number"
                placeholder="50"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.percentage || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, percentage: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">%</span>
            </div>
          </div>

          {config.condition === 'between' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Maximum Percentage</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="80"
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={config.maxPercentage || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxPercentage: e.target.value }))}
                />
                <span className="flex items-center px-3 text-neutral-400">%</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (nodeLabel === 'Market Volume') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Token Pair</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.pair || 'ETH/USDC'}
              onChange={(e) => setConfig(prev => ({ ...prev, pair: e.target.value }))}
            >
              <option value="ETH/USDC">ETH/USDC</option>
              <option value="BTC/USDC">BTC/USDC</option>
              <option value="ETH/BTC">ETH/BTC</option>
              <option value="USDC/USDT">USDC/USDT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Time Period</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.timePeriod || '24h'}
              onChange={(e) => setConfig(prev => ({ ...prev, timePeriod: e.target.value }))}
            >
              <option value="1h">Last 1 Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Volume Condition</label>
            <div className="flex gap-2">
              <select 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.condition || 'greater_than'}
                onChange={(e) => setConfig(prev => ({ ...prev, condition: e.target.value }))}
              >
                <option value="greater_than">Greater than</option>
                <option value="less_than">Less than</option>
              </select>
              <input
                type="number"
                placeholder="1000000"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.volume || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, volume: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">USD</span>
            </div>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Gas Fee Limit') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Network</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.network || 'ethereum'}
              onChange={(e) => setConfig(prev => ({ ...prev, network: e.target.value }))}
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="optimism">Optimism</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Gas Price Limit</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="20"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.gasPrice || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, gasPrice: e.target.value }))}
              />
              <select 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.unit || 'gwei'}
                onChange={(e) => setConfig(prev => ({ ...prev, unit: e.target.value }))}
              >
                <option value="gwei">Gwei</option>
                <option value="usd">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Priority</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.priority || 'standard'}
              onChange={(e) => setConfig(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="slow">Slow (Cheaper)</option>
              <option value="standard">Standard</option>
              <option value="fast">Fast (More Expensive)</option>
            </select>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Safety Checks') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Safety Features</label>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.slippageProtection || false}
                  onChange={(e) => setConfig(prev => ({ ...prev, slippageProtection: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-neutral-800 border-neutral-600 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">Slippage Protection</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.mevProtection || false}
                  onChange={(e) => setConfig(prev => ({ ...prev, mevProtection: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-neutral-800 border-neutral-600 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">MEV Protection</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.requireConfirmation || false}
                  onChange={(e) => setConfig(prev => ({ ...prev, requireConfirmation: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-neutral-800 border-neutral-600 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">Require Manual Confirmation</span>
              </label>
            </div>
          </div>

          {config.slippageProtection && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Maximum Slippage</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="0.5"
                  step="0.1"
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={config.maxSlippage || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxSlippage: e.target.value }))}
                />
                <span className="flex items-center px-3 text-neutral-400">%</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">Transaction Deadline</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="20"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.deadline || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, deadline: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">minutes</span>
            </div>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Loss Limits') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Loss Limit Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.limitType || 'percentage'}
              onChange={(e) => setConfig(prev => ({ ...prev, limitType: e.target.value }))}
            >
              <option value="percentage">Percentage Loss</option>
              <option value="absolute">Absolute Amount</option>
              <option value="portfolio">Portfolio Value</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {config.limitType === 'percentage' ? 'Maximum Loss (%)' : 
               config.limitType === 'absolute' ? 'Maximum Loss ($)' : 
               'Portfolio Threshold (%)'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={config.limitType === 'percentage' ? '10' : config.limitType === 'absolute' ? '1000' : '20'}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config.lossAmount || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, lossAmount: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">
                {config.limitType === 'percentage' || config.limitType === 'portfolio' ? '%' : 'USD'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Time Period</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.timePeriod || 'daily'}
              onChange={(e) => setConfig(prev => ({ ...prev, timePeriod: e.target.value }))}
            >
              <option value="trade">Per Trade</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pauseAutomation"
              checked={config.pauseOnLimit || false}
              onChange={(e) => setConfig(prev => ({ ...prev, pauseOnLimit: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-neutral-800 border-neutral-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="pauseAutomation" className="text-sm text-white">Pause automation when limit reached</label>
          </div>
        </div>
      );
    }

    return <div className="text-neutral-400">Configure {nodeLabel} condition</div>;
  };

  const renderActionConfig = () => {
    if (nodeLabel === 'Swap & Alert' || nodeLabel === 'Swap Tokens') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Swap From</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.fromToken || 'ETH'}
              onChange={(e) => setConfig(prev => ({ ...prev, fromToken: e.target.value }))}
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDC">USD Coin (USDC)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Swap To</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.toToken || 'USDC'}
              onChange={(e) => setConfig(prev => ({ ...prev, toToken: e.target.value }))}
            >
              <option value="USDC">USD Coin (USDC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="50"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.percentage || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, percentage: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Network</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.network || 'ethereum'}
              onChange={(e) => setConfig(prev => ({ ...prev, network: e.target.value }))}
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="arbitrum">Arbitrum</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendAlert"
              checked={config.sendAlert || false}
              onChange={(e) => setConfig(prev => ({ ...prev, sendAlert: e.target.checked }))}
              className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="sendAlert" className="text-sm text-white">Send notification alert</label>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Send/Transfer') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Token</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.token || 'ETH'}
              onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDC">USD Coin (USDC)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="BTC">Bitcoin (BTC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Recipient Address</label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.recipient || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, recipient: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.amountType || 'percentage'}
              onChange={(e) => setConfig(prev => ({ ...prev, amountType: e.target.value }))}
            >
              <option value="percentage">Percentage of Balance</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {config.amountType === 'percentage' ? 'Percentage (%)' : 'Amount'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={config.amountType === 'percentage' ? '25' : '1.5'}
                step={config.amountType === 'percentage' ? '1' : '0.01'}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.amount || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, amount: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">
                {config.amountType === 'percentage' ? '%' : config.token || 'ETH'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Network</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.network || 'ethereum'}
              onChange={(e) => setConfig(prev => ({ ...prev, network: e.target.value }))}
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="optimism">Optimism</option>
            </select>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Stake/Unstake') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Action</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.action || 'stake'}
              onChange={(e) => setConfig(prev => ({ ...prev, action: e.target.value }))}
            >
              <option value="stake">Stake</option>
              <option value="unstake">Unstake</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Protocol</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.protocol || 'lido'}
              onChange={(e) => setConfig(prev => ({ ...prev, protocol: e.target.value }))}
            >
              <option value="lido">Lido (stETH)</option>
              <option value="rocketpool">Rocket Pool (rETH)</option>
              <option value="frax">Frax (sfrxETH)</option>
              <option value="compound">Compound</option>
              <option value="aave">Aave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Token</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.token || 'ETH'}
              onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDC">USD Coin (USDC)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="DAI">Dai (DAI)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.amountType || 'percentage'}
              onChange={(e) => setConfig(prev => ({ ...prev, amountType: e.target.value }))}
            >
              <option value="percentage">Percentage of Balance</option>
              <option value="fixed">Fixed Amount</option>
              <option value="all">All Available</option>
            </select>
          </div>

          {config.amountType !== 'all' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {config.amountType === 'percentage' ? 'Percentage (%)' : 'Amount'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={config.amountType === 'percentage' ? '50' : '2.0'}
                  step={config.amountType === 'percentage' ? '1' : '0.01'}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={config.amount || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, amount: e.target.value }))}
                />
                <span className="flex items-center px-3 text-neutral-400">
                  {config.amountType === 'percentage' ? '%' : config.token || 'ETH'}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (nodeLabel === 'Provide Liquidity') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">DEX Protocol</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.dex || 'uniswap'}
              onChange={(e) => setConfig(prev => ({ ...prev, dex: e.target.value }))}
            >
              <option value="uniswap">Uniswap V3</option>
              <option value="sushiswap">SushiSwap</option>
              <option value="curve">Curve Finance</option>
              <option value="balancer">Balancer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Token A</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.tokenA || 'ETH'}
              onChange={(e) => setConfig(prev => ({ ...prev, tokenA: e.target.value }))}
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDC">USD Coin (USDC)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="DAI">Dai (DAI)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Token B</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.tokenB || 'USDC'}
              onChange={(e) => setConfig(prev => ({ ...prev, tokenB: e.target.value }))}
            >
              <option value="USDC">USD Coin (USDC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="DAI">Dai (DAI)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Pool Fee Tier</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.feeTier || '0.3'}
              onChange={(e) => setConfig(prev => ({ ...prev, feeTier: e.target.value }))}
            >
              <option value="0.01">0.01% (Stable pairs)</option>
              <option value="0.05">0.05% (Low volatility)</option>
              <option value="0.3">0.3% (Standard)</option>
              <option value="1.0">1.0% (High volatility)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.amountType || 'percentage'}
              onChange={(e) => setConfig(prev => ({ ...prev, amountType: e.target.value }))}
            >
              <option value="percentage">Percentage of Balance</option>
              <option value="fixed">Fixed USD Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {config.amountType === 'percentage' ? 'Percentage (%)' : 'USD Amount'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={config.amountType === 'percentage' ? '25' : '1000'}
                step={config.amountType === 'percentage' ? '1' : '10'}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.amount || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, amount: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">
                {config.amountType === 'percentage' ? '%' : 'USD'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoCompound"
              checked={config.autoCompound || false}
              onChange={(e) => setConfig(prev => ({ ...prev, autoCompound: e.target.checked }))}
              className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="autoCompound" className="text-sm text-white">Auto-compound rewards</label>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Claim Rewards') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Protocol</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.protocol || 'compound'}
              onChange={(e) => setConfig(prev => ({ ...prev, protocol: e.target.value }))}
            >
              <option value="compound">Compound</option>
              <option value="aave">Aave</option>
              <option value="uniswap">Uniswap V3</option>
              <option value="lido">Lido</option>
              <option value="curve">Curve Finance</option>
              <option value="convex">Convex Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Reward Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.rewardType || 'all'}
              onChange={(e) => setConfig(prev => ({ ...prev, rewardType: e.target.value }))}
            >
              <option value="all">All Available Rewards</option>
              <option value="staking">Staking Rewards</option>
              <option value="liquidity">Liquidity Mining</option>
              <option value="governance">Governance Tokens</option>
              <option value="fees">Trading Fees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Minimum Claim Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.01"
                step="0.001"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.minClaimAmount || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, minClaimAmount: e.target.value }))}
              />
              <select 
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.minClaimUnit || 'ETH'}
                onChange={(e) => setConfig(prev => ({ ...prev, minClaimUnit: e.target.value }))}
              >
                <option value="ETH">ETH</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Auto-Reinvest Options</label>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reinvest"
                  value="hold"
                  checked={config.reinvestOption === 'hold'}
                  onChange={(e) => setConfig(prev => ({ ...prev, reinvestOption: e.target.value }))}
                  className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 focus:ring-purple-500"
                />
                <span className="text-white text-sm">Hold rewards in wallet</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reinvest"
                  value="restake"
                  checked={config.reinvestOption === 'restake'}
                  onChange={(e) => setConfig(prev => ({ ...prev, reinvestOption: e.target.value }))}
                  className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 focus:ring-purple-500"
                />
                <span className="text-white text-sm">Restake automatically</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reinvest"
                  value="swap"
                  checked={config.reinvestOption === 'swap'}
                  onChange={(e) => setConfig(prev => ({ ...prev, reinvestOption: e.target.value }))}
                  className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 focus:ring-purple-500"
                />
                <span className="text-white text-sm">Swap to preferred token</span>
              </label>
            </div>
          </div>

          {config.reinvestOption === 'swap' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Swap To</label>
              <select 
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.swapTo || 'USDC'}
                onChange={(e) => setConfig(prev => ({ ...prev, swapTo: e.target.value }))}
              >
                <option value="USDC">USD Coin (USDC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="DAI">Dai (DAI)</option>
              </select>
            </div>
          )}
        </div>
      );
    }

    if (nodeLabel === 'Rebalance Portfolio') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Rebalancing Strategy</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.strategy || 'percentage'}
              onChange={(e) => setConfig(prev => ({ ...prev, strategy: e.target.value }))}
            >
              <option value="percentage">Target Percentages</option>
              <option value="equal">Equal Weight</option>
              <option value="custom">Custom Allocations</option>
            </select>
          </div>

          {config.strategy === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Target Allocations</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select 
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={config.ethPercentage !== undefined ? 'ETH' : ''}
                    onChange={(e) => {
                      if (e.target.value === 'ETH') {
                        setConfig(prev => ({ ...prev, ethPercentage: 40 }));
                      }
                    }}
                  >
                    <option value="">Select Token</option>
                    <option value="ETH">ETH</option>
                  </select>
                  <input
                    type="number"
                    placeholder="40"
                    max="100"
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={config.ethPercentage || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, ethPercentage: e.target.value }))}
                  />
                  <span className="flex items-center px-3 text-neutral-400">%</span>
                </div>

                <div className="flex gap-2">
                  <select 
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={config.usdcPercentage !== undefined ? 'USDC' : ''}
                    onChange={(e) => {
                      if (e.target.value === 'USDC') {
                        setConfig(prev => ({ ...prev, usdcPercentage: 60 }));
                      }
                    }}
                  >
                    <option value="">Select Token</option>
                    <option value="USDC">USDC</option>
                  </select>
                  <input
                    type="number"
                    placeholder="60"
                    max="100"
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={config.usdcPercentage || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, usdcPercentage: e.target.value }))}
                  />
                  <span className="flex items-center px-3 text-neutral-400">%</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">Rebalance Threshold</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="5"
                step="0.5"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.threshold || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, threshold: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">% deviation</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">DEX for Swaps</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.dex || 'uniswap'}
              onChange={(e) => setConfig(prev => ({ ...prev, dex: e.target.value }))}
            >
              <option value="uniswap">Uniswap V3</option>
              <option value="sushiswap">SushiSwap</option>
              <option value="1inch">1inch (Best Price)</option>
              <option value="paraswap">ParaSwap</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="considerGas"
              checked={config.considerGas || false}
              onChange={(e) => setConfig(prev => ({ ...prev, considerGas: e.target.checked }))}
              className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="considerGas" className="text-sm text-white">Consider gas costs in rebalancing</label>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Send Alert') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Alert Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.alertType || 'notification'}
              onChange={(e) => setConfig(prev => ({ ...prev, alertType: e.target.value }))}
            >
              <option value="notification">Push Notification</option>
              <option value="email">Email</option>
              <option value="webhook">Webhook</option>
              <option value="telegram">Telegram</option>
              <option value="discord">Discord</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Alert Title</label>
            <input
              type="text"
              placeholder="Price Alert Triggered"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.title || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Alert Message</label>
            <textarea
              placeholder="ETH price has dropped below $2000. Consider your next action."
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              value={config.message || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>

          {(config.alertType === 'email' || config.alertType === 'webhook') && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {config.alertType === 'email' ? 'Email Address' : 'Webhook URL'}
              </label>
              <input
                type={config.alertType === 'email' ? 'email' : 'url'}
                placeholder={config.alertType === 'email' ? 'user@example.com' : 'https://webhook.site/...'}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.destination || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, destination: e.target.value }))}
              />
            </div>
          )}

          {(config.alertType === 'telegram' || config.alertType === 'discord') && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {config.alertType === 'telegram' ? 'Telegram Chat ID' : 'Discord Webhook URL'}
              </label>
              <input
                type="text"
                placeholder={config.alertType === 'telegram' ? '@username or chat_id' : 'https://discord.com/api/webhooks/...'}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.destination || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, destination: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">Priority Level</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.priority || 'normal'}
              onChange={(e) => setConfig(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeData"
              checked={config.includeData || false}
              onChange={(e) => setConfig(prev => ({ ...prev, includeData: e.target.checked }))}
              className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="includeData" className="text-sm text-white">Include automation data in alert</label>
          </div>
        </div>
      );
    }

    if (nodeLabel === 'Execute Strategy') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Strategy Type</label>
            <select 
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={config.strategyType || 'dca'}
              onChange={(e) => setConfig(prev => ({ ...prev, strategyType: e.target.value }))}
            >
              <option value="dca">Dollar Cost Averaging</option>
              <option value="grid">Grid Trading</option>
              <option value="momentum">Momentum Trading</option>
              <option value="meanReversion">Mean Reversion</option>
              <option value="arbitrage">Cross-DEX Arbitrage</option>
              <option value="custom">Custom Strategy</option>
            </select>
          </div>

          {config.strategyType === 'dca' && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Purchase Token</label>
                <select 
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={config.purchaseToken || 'ETH'}
                  onChange={(e) => setConfig(prev => ({ ...prev, purchaseToken: e.target.value }))}
                >
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">DCA Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="100"
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={config.dcaAmount || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, dcaAmount: e.target.value }))}
                  />
                  <span className="flex items-center px-3 text-neutral-400">USD</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Frequency</label>
                <select 
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={config.frequency || 'weekly'}
                  onChange={(e) => setConfig(prev => ({ ...prev, frequency: e.target.value }))}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </>
          )}

          {config.strategyType === 'grid' && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Trading Pair</label>
                <select 
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={config.tradingPair || 'ETH/USDC'}
                  onChange={(e) => setConfig(prev => ({ ...prev, tradingPair: e.target.value }))}
                >
                  <option value="ETH/USDC">ETH/USDC</option>
                  <option value="BTC/USDC">BTC/USDC</option>
                  <option value="ETH/BTC">ETH/BTC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Lower price"
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={config.lowerPrice || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, lowerPrice: e.target.value }))}
                  />
                  <input
                    type="number"
                    placeholder="Upper price"
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={config.upperPrice || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, upperPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Grid Levels</label>
                <input
                  type="number"
                  placeholder="10"
                  min="3"
                  max="100"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={config.gridLevels || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, gridLevels: e.target.value }))}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">Total Budget</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="1000"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={config.totalBudget || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, totalBudget: e.target.value }))}
              />
              <span className="flex items-center px-3 text-neutral-400">USD</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Stop Conditions</label>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.stopOnProfit || false}
                  onChange={(e) => setConfig(prev => ({ ...prev, stopOnProfit: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 rounded focus:ring-purple-500"
                />
                <span className="text-white text-sm">Stop on target profit</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.stopOnLoss || false}
                  onChange={(e) => setConfig(prev => ({ ...prev, stopOnLoss: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 rounded focus:ring-purple-500"
                />
                <span className="text-white text-sm">Stop on maximum loss</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

    return <div className="text-neutral-400">Configure {nodeLabel} action</div>;
  };

  const getModalTitle = () => {
    const typeIcon = nodeType === 'trigger' ? '⚡' : nodeType === 'condition' ? '🔍' : '🎯';
    return `${typeIcon} Configure ${nodeLabel}`;
  };

  const getAccentColor = () => {
    return nodeType === 'trigger' ? 'green' : nodeType === 'condition' ? 'blue' : 'purple';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {nodeType === 'trigger' && renderTriggerConfig()}
          {nodeType === 'condition' && renderConditionConfig()}
          {nodeType === 'action' && renderActionConfig()}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-neutral-800">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              nodeType === 'trigger' 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : nodeType === 'condition'
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}