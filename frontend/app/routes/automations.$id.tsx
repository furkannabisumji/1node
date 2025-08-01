import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { AppLayout } from '~/components/layout/AppLayout';
import { CheckCircle, Pause, ArrowLeft, Play, Square, Trash2, Edit, Copy } from 'lucide-react';
import axiosInstance from '~/lib/axios';

interface Automation {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  triggers: Array<{
    id: string;
    type: string;
    chainId: number;
    config: any;
  }>;
  actions: Array<{
    id: string;
    type: string;
    chainId: number | null;
    config: any;
  }>;
  conditions: Array<any>;
  executions: Array<{
    id: string;
    status: string;
    createdAt: string;
    result: any;
  }>;
  _count: {
    executions: number;
  };
}

export default function AutomationDetail() {
  const { id } = useParams();
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchAutomation = async () => {
      try {
        console.log(`Fetching automation ${id} from /automations/${id} endpoint...`);
        const response = await axiosInstance.get(`/automations/${id}`);
        console.log('Automation detail response:', response.data);
        // Handle both possible response structures
        const automationData = response.data.automation || response.data;
        setAutomation(automationData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching automation:', err);
        setError(err?.response?.data?.error || 'Failed to fetch automation');
        setLoading(false);
      }
    };

    if (id) {
      fetchAutomation();
    }
  }, [id]);

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 10: return 'Optimism';
      case 42161: return 'Arbitrum';
      case 137: return 'Polygon';
      default: return `Chain ${chainId}`;
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return address;
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if desired
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderValue = (key: string, value: any) => {
    // Handle addresses (typically start with 0x and are 42 characters long)
    if (typeof value === 'string' && value.startsWith('0x') && value.length === 42) {
      return (
        <button
          onClick={() => copyToClipboard(value)}
          className="text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title={`Click to copy: ${value}`}
        >
          {truncateAddress(value)}
          <Copy className="w-3 h-3 opacity-50" />
        </button>
      );
    }
    
    // Handle chain IDs - convert to names (but not for chainId field in config details)
    if ((key === 'fromChain' || key === 'toChain') && typeof value === 'number') {
      return <span className="text-neutral-300">{getNetworkName(value)}</span>;
    }
    
    // Show chainId as number in config details, but with network name tooltip
    if (key === 'chainId' && typeof value === 'number') {
      return (
        <span className="text-neutral-300" title={getNetworkName(value)}>
          {value}
        </span>
      );
    }
    
    // Default rendering
    return <span className="text-neutral-300">{String(value)}</span>;
  };

  const handleToggleAutomation = async () => {
    if (!automation || !id) return;
    
    setActionLoading('toggle');
    try {
      console.log(`Toggling automation ${id}...`);
      const response = await axiosInstance.put(`/automations/${id}/toggle`);
      console.log('Toggle response:', response.data);
      
      // Update the automation state with the new status
      if (response.data.automation) {
        setAutomation(response.data.automation);
      } else {
        // Fallback: just toggle the current state
        setAutomation(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      }
      
      console.log(`Automation ${automation.isActive ? 'paused' : 'resumed'} successfully`);
    } catch (err: any) {
      console.error('Error toggling automation:', err);
      // You could add a toast notification here for better UX
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAutomation = async () => {
    if (!automation || !id) return;
    
    // Add confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${automation.name}"? This action cannot be undone.`)) {
      return;
    }


    
    setActionLoading('delete');
    try {
      console.log(`Deleting automation ${id}...`);
      const response = await axiosInstance.delete(`/automations/${id}`);
      console.log('Delete response:', response.data);

      // Redirect to automations list after successful deletion
      window.location.href = '/automations';
    } catch (err: any) {
      console.error('Error deleting automation:', err);
      // You could add a toast notification here for better UX
      setActionLoading(null);
    }
  };

  const getTriggerDescription = (trigger: any) => {
    if (trigger.type === 'PRICE_THRESHOLD') {
      const config = trigger.config;
      const operatorText = config.operator === 'gte' ? 'hits' : 
                         config.operator === 'lte' ? 'drops to' : 
                         config.operator === 'gt' ? 'exceeds' : 
                         config.operator === 'lt' ? 'falls below' : 'reaches';
      return `${config.token} ${operatorText} $${config.threshold}`;
    } else if (trigger.type === 'WALLET_BALANCE') {
      return `Wallet balance condition`;
    }
    return trigger.type;
  };

  const getActionDescription = (action: any) => {
    if (action.type === 'FUSION_ORDER') {
      const config = action.config;
      const fromChain = getNetworkName(config.fromChain);
      const toChain = getNetworkName(config.toChain);
      return `Swap ${config.amount} tokens from ${fromChain} to ${toChain}`;
    }
    return action.type;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-neutral-400">Loading automation...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !automation) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-red-400">Error: {error || 'Automation not found'}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/automations" 
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Automations
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{automation.name}</h1>
              <p className="text-neutral-300 mb-4">{automation.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {automation.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Pause className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className={`font-medium ${automation.isActive ? 'text-green-500' : 'text-yellow-500'}`}>
                    {automation.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                
                <div className="text-neutral-400 text-sm">
                  Created: {new Date(automation.createdAt).toLocaleDateString()}
                </div>
                
                <div className="text-neutral-400 text-sm">
                  Executions: {automation._count?.executions || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">

              
              <button 
                onClick={handleToggleAutomation}
                disabled={actionLoading === 'toggle'}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {actionLoading === 'toggle' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {automation.isActive ? 'Pausing...' : 'Resuming...'}
                  </>
                ) : automation.isActive ? (
                  <>
                    <Square className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                )}
              </button>
              
              <button 
                onClick={handleDeleteAutomation}
                disabled={actionLoading === 'delete'}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {actionLoading === 'delete' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Triggers */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Triggers
            </h2>
            
            {!automation.triggers || automation.triggers.length === 0 ? (
              <p className="text-neutral-400">No triggers configured</p>
            ) : (
              <div className="space-y-4">
                {automation.triggers.map((trigger) => (
                  <div key={trigger.id} className="bg-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{trigger.type}</span>
                      <span className="text-neutral-400 text-sm bg-neutral-700 px-2 py-1 rounded">
                        {getNetworkName(trigger.chainId)}
                      </span>
                    </div>
                    <p className="text-neutral-300 text-sm">{getTriggerDescription(trigger)}</p>
                    
                    {/* Trigger Config Details */}
                    <div className="mt-3 pt-3 border-t border-neutral-700">
                      <div className="text-xs text-neutral-400 space-y-1">
                        {Object.entries(trigger.config).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span>{key}:</span>
                            {renderValue(key, value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Actions
            </h2>
            
            {!automation.actions || automation.actions.length === 0 ? (
              <p className="text-neutral-400">No actions configured</p>
            ) : (
              <div className="space-y-4">
                {automation.actions.map((action) => (
                  <div key={action.id} className="bg-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{action.type}</span>
                      {action.chainId && (
                        <span className="text-neutral-400 text-sm bg-neutral-700 px-2 py-1 rounded">
                          {getNetworkName(action.chainId)}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-300 text-sm">{getActionDescription(action)}</p>
                    
                    {/* Action Config Details */}
                    <div className="mt-3 pt-3 border-t border-neutral-700">
                      <div className="text-xs text-neutral-400 space-y-1">
                        {Object.entries(action.config).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span>{key}:</span>
                            {renderValue(key, value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Execution History */}
        {automation.executions && automation.executions.length > 0 && (
          <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Execution History</h2>
            
            <div className="space-y-3">
              {(automation.executions || []).slice(0, 10).map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      execution.status === 'SUCCESS' ? 'bg-green-500' : 
                      execution.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-white text-sm">{execution.status}</span>
                  </div>
                  <span className="text-neutral-400 text-sm">
                    {new Date(execution.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}