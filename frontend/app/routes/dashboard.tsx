import { AppLayout } from '~/components/layout/AppLayout';
import { Plus, Activity, Zap, TrendingUp } from 'lucide-react';

// Mock data for demonstration
const stats = [
  { name: 'Active Automations', value: '12', change: '+3', changeType: 'positive' },
  { name: 'Total Executions', value: '1,247', change: '+18%', changeType: 'positive' },
  { name: 'Success Rate', value: '98.5%', change: '+2.1%', changeType: 'positive' },
  { name: 'Gas Saved', value: '$324', change: '+12%', changeType: 'positive' },
];

const recentAutomations = [
  {
    id: 1,
    name: 'ETH Protection Strategy',
    description: 'Auto-swap when price drops with gas optimization',
    status: 'active',
    lastExecution: '2 hours ago',
    type: 'Price Protection'
  },
  {
    id: 2,
    name: 'Yield Farming Optimizer',
    description: 'Automatically compound rewards across protocols',
    status: 'active',
    lastExecution: '6 hours ago',
    type: 'DeFi Strategy'
  },
  {
    id: 3,
    name: 'Gas Fee Monitor',
    description: 'Execute transactions when gas is below threshold',
    status: 'paused',
    lastExecution: '1 day ago',
    type: 'Gas Optimization'
  },
];

export default function Dashboard() {
  return (
      <AppLayout>
        <div>Dashboard</div>
    </AppLayout>
  );
}