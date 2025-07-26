import { CheckCircle, Pause, Eye, Settings } from 'lucide-react';

interface Automation {
  id: number;
  name: string;
  status: 'active' | 'paused';
  network: string;
  trigger: string;
  action: string;
  deposited: number;
  earned: number;
}

interface AutomationCardProps {
  automation: Automation;
}

export function AutomationCard({ automation }: AutomationCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'paused':
        return 'text-yellow-500';
      default:
        return 'text-neutral-400';
    }
  };

  return (
    <div className=" rounded-lg border border-neutral-800 p-6 pb-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 flex justify-between items-center">
       <div >
         <h3 className="text-white font-semibold text-lg mb-1">{automation.name}</h3>
         <div className="flex items-center gap-2 mb-3">
           {getStatusIcon(automation.status)}
           <span className={`text-sm font-medium ${getStatusColor(automation.status)}`}>
              {getStatusText(automation.status)}
            </span>
         </div>
       </div>
          <div className="text-right">
            <span className="text-neutral-400 text-sm bg-neutral-800 px-2 py-1 rounded">
              {automation.network}
            </span>
          </div>
        </div>
      </div>

      {/* Trigger and Action */}
      <div className="space-y-3 mb-6">
        <div>
          <span className="text-neutral-400 text-sm">Trigger: </span>
          <span className="text-white text-sm">{automation.trigger}</span>
        </div>
        <div>
          <span className="text-neutral-400 text-sm">Action: </span>
          <span className="text-white text-sm">{automation.action}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4 text-sm border-t border-neutral-800 pt-4">
     <div className="flex items-center gap-2 ">
       <div>
       <span className="text-neutral-400">Deposited: </span>
       <span className="text-white font-medium">${automation.deposited.toLocaleString()}</span>
     </div>
       <div>
         <span className="text-neutral-400">Earned: </span>
         <span className="text-green-500 font-medium">+${automation.earned}</span>
       </div>
     </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
            <Eye className="w-4 h-4 text-neutral-400 " />
          </button>
          <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
            <Settings className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

    </div>
  );
}