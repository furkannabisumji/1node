import { Activity, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface RecentExecution {
  id: string;
  workflowName: string;
  status: string;
  createdAt: string;
  success: boolean;
  gasUsed?: string;
  result?: any;
}

interface RecentActivityProps {
  recentActivity: RecentExecution[];
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
  const getStatusIcon = (success: boolean, status: string) => {
    if (status === 'PENDING') {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return success 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (success: boolean, status: string) => {
    if (status === 'PENDING') return 'text-yellow-500';
    return success ? 'text-green-500' : 'text-red-500';
  };

  const getStatusText = (success: boolean, status: string) => {
    if (status === 'PENDING') return 'Pending';
    return success ? 'Success' : 'Failed';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        </div>
        <Link 
          to="/automations"
          className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-1 cursor-pointer"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Activity List */}
      {!recentActivity || recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 mb-2">No recent activity</p>
          <p className="text-neutral-500 text-sm">
            Your automation executions will appear here
          </p>
          <Link 
            to="/automations/create"
            className="inline-flex items-center gap-2 mt-4 text-green-500 hover:text-green-400 transition-colors text-sm cursor-pointer"
          >
            Create your first automation
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recentActivity.slice(0, 10).map((execution) => (
            <div key={execution.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
              <div className="flex items-center gap-3">
                {getStatusIcon(execution.success, execution.status)}
                <div>
                  <p className="text-white text-sm font-medium">
                    {execution.workflowName}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-medium ${getStatusColor(execution.success, execution.status)}`}>
                      {getStatusText(execution.success, execution.status)}
                    </span>
                    {execution.gasUsed && (
                      <>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-400">
                          {parseFloat(execution.gasUsed).toLocaleString()} gas
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-neutral-400 text-xs">
                {formatTimeAgo(execution.createdAt)}
              </span>
            </div>
          ))}
          
          {recentActivity.length > 10 && (
            <div className="text-center pt-4 border-t border-neutral-700">
              <Link 
                to="/automations"
                className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer"
              >
                View {recentActivity.length - 10} more activities
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}