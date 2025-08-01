import {Play, AlertTriangle, Brain, Eye, Cog, BotIcon} from 'lucide-react';

interface TopActionBarProps {
  status: 'draft' | 'deployed' | 'active';
  onDeploy: () => void;
}

export function TopActionBar({ status, onDeploy }: TopActionBarProps) {
  return (
    <div className="bg-black border-b border-neutral-800 px-6 py-4">
      {/* Strategy Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">ETH Protection Strategy</h1>
          <p className="text-neutral-400 text-sm">Auto-swap when price drops with gas optimization</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Deploy/Withdraw/Deactivate */}
          {status === 'draft' && (
            <button 
              onClick={onDeploy}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              Deploy
            </button>
          )}

          {status === 'deployed' && (
            <>
              <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors border border-neutral-600">
                Withdraw
              </button>
              <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                <AlertTriangle className="w-4 h-4" />
                Deactivate
              </button>
            </>
          )}

          
        </div>
      </div>
    </div>
  );
}