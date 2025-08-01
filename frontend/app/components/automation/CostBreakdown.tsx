import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCost, type CostBreakdown as CostBreakdownType } from '~/utils/costCalculation';

interface CostBreakdownProps {
  breakdown: CostBreakdownType;
  userBalance: number;
  isLoading?: boolean;
}

export function CostBreakdown({ breakdown, userBalance, isLoading = false }: CostBreakdownProps) {
  const isInsufficientBalance = userBalance < breakdown.total;
  const remaining = Math.max(0, breakdown.total - userBalance);

  if (isLoading) {
    return (
      <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-yellow-500" />
          <span className="text-white font-medium">Calculating costs...</span>
        </div>
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-neutral-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-yellow-500" />
        <span className="text-white font-medium">Required Deposit Breakdown</span>
      </div>

      {breakdown.items.length === 0 ? (
        <div className="text-center py-4 text-neutral-400">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm">Add nodes to see cost breakdown</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Cost Items */}
          <div className="space-y-2">
            {breakdown.items
              .filter(item => item.category !== 'buffer')
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-300">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{formatCost(item.cost)}</span>
                </div>
              ))}
          </div>

          {/* Subtotal */}
          <div className="border-t border-neutral-700 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-white">{formatCost(breakdown.subtotal)}</span>
            </div>
            
            {/* Safety Buffer */}
            {breakdown.items.find(item => item.category === 'buffer') && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Safety Buffer (20%)</span>
                <span className="text-white">{formatCost(breakdown.buffer)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-neutral-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Total Required</span>
              <span className="text-white font-bold text-lg">{formatCost(breakdown.total)}</span>
            </div>
          </div>

          {/* Balance Status */}
          <div className="bg-neutral-900 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Your Balance</span>
              <span className="text-white font-medium">{formatCost(userBalance)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isInsufficientBalance ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-400 text-sm font-medium">Insufficient Balance</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-400 text-sm font-medium">Sufficient Balance</span>
                  </>
                )}
              </div>
              
              {isInsufficientBalance && (
                <span className="text-red-400 font-medium text-sm">
                  Need {formatCost(remaining)}
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isInsufficientBalance ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (userBalance / breakdown.total) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>{formatCost(0)}</span>
                <span>{formatCost(breakdown.total)}</span>
              </div>
            </div>
          </div>

          {/* Cost Categories Summary */}
          <div className="mt-4 p-3 bg-neutral-900 rounded-lg">
            <div className="text-xs text-neutral-400 mb-2">Cost Breakdown</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {breakdown.items
                .reduce((acc, item) => {
                  const existing = acc.find(a => a.category === item.category);
                  if (existing) {
                    existing.cost += item.cost;
                    existing.count += 1;
                  } else {
                    acc.push({ 
                      category: item.category, 
                      cost: item.cost, 
                      count: 1,
                      icon: item.icon 
                    });
                  }
                  return acc;
                }, [] as Array<{category: string, cost: number, count: number, icon: string}>)
                .filter(item => item.category !== 'buffer')
                .map((summary) => (
                  <div key={summary.category} className="flex items-center justify-between">
                    <span className="text-neutral-400 capitalize">
                      {summary.icon} {summary.category}s ({summary.count})
                    </span>
                    <span className="text-white">{formatCost(summary.cost)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}