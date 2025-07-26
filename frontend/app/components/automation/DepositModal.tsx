import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const requiredBalances = [
    { 
      symbol: 'ETH', 
      required: '1.0', 
      available: '2.24', 
      status: 'available',
      note: '✓ Available: 2.24 ETH'
    },
    { 
      symbol: 'USDC', 
      required: '0', 
      available: '0',
      status: 'none', 
      note: 'For receiving swap'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">💰 Deposit Balance</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Required Balances */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-white">💰 Required Balances</span>
            </div>
            
            <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
              {requiredBalances.map((balance, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      balance.symbol === 'ETH' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {balance.symbol === 'ETH' ? 'E' : 'U'}
                    </div>
                    <span className="text-white text-sm">{balance.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{balance.required} {balance.symbol}</div>
                    <div className={`text-xs ${
                      balance.status === 'available' ? 'text-green-500' : 'text-neutral-400'
                    }`}>
                      {balance.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="relative">
                <select 
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none pr-10"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Deposit Button */}
          <button className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-3 rounded-lg transition-colors">
            Deposit
          </button>
        </div>
      </div>
    </div>
  );
}