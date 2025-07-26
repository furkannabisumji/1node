import {Save, Play, AlertTriangle, Brain, Eye, Cog, BotIcon} from 'lucide-react';

interface TopActionBarProps {
  status: 'draft' | 'deployed' | 'active';
  onSave: () => void;
  onDeploy: () => void;
}

export function TopActionBar({ status, onSave, onDeploy }: TopActionBarProps) {
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
          {/* Save Button */}
          <button 
            onClick={onSave}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors border border-neutral-600"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

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

          {/* Secondary Actions */}
          <div className="flex items-center gap-2 ml-2">
            <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
              Simulation
            </button>
            <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors">
              <AlertTriangle className="w-4 h-4" />
              Requirements
            </button>
            <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors">
              <BotIcon
                className="w-4 h-4" />
              AI Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}