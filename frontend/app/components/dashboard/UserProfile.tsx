import { User, Copy, ExternalLink } from 'lucide-react';

interface UserProfileProps {
  walletAddress: string;
  username?: string;
  avatar?: string;
}

export function UserProfile({ walletAddress, username, avatar }: UserProfileProps) {
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-12 h-12 rounded-full" />
          ) : (
            <User className="w-6 h-6 text-neutral-300" />
          )}
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">
            {username || 'Anonymous User'}
          </h3>
          <p className="text-neutral-400 text-sm">DeFi Trader</p>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="space-y-4">
        <div>
          <label className="text-neutral-400 text-sm mb-2 block">Wallet Address</label>
          <div className="bg-neutral-800 rounded-lg p-3 flex items-center justify-between">
            <span className="text-white font-mono text-sm">{shortAddress}</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={copyAddress}
                className="p-1 rounded hover:bg-neutral-700 transition-colors"
                title="Copy address"
              >
                <Copy className="w-4 h-4 text-neutral-400" />
              </button>
              <button 
                className="p-1 rounded hover:bg-neutral-700 transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-800 rounded-lg p-3">
            <div className="text-neutral-400 text-xs mb-1">Active Bots</div>
            <div className="text-white font-semibold">8</div>
          </div>
          <div className="bg-neutral-800 rounded-lg p-3">
            <div className="text-neutral-400 text-xs mb-1">Total Earned</div>
            <div className="text-green-500 font-semibold">$1,247</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Create Bot
          </button>
          <button className="w-full bg-transparent border border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-400 font-medium py-2 px-4 rounded-lg transition-colors">
            View All Bots
          </button>
        </div>
      </div>
    </div>
  );
}