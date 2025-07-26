import { AppLayout } from '~/components/layout/AppLayout';
import { AutomationCard } from '~/components/automations/AutomationCard';
import { NotificationBar } from '~/components/automations/NotificationBar';
import {Bot, Plus} from 'lucide-react';
import {Link} from "react-router";

// Mock automation data
const automations = [
  {
    id: 1,
    name: 'ETH Stop Loss Protection',
    status: 'active',
    network: 'Ethereum',
    trigger: 'ETH price drops 10%',
    action: 'Swap 50% ETH → USDC',
    deposited: 5000,
    earned: 125.5
  },
  {
    id: 2,
    name: 'ETH Stop Loss Protection',
    status: 'active',
    network: 'Ethereum',
    trigger: 'ETH price drops 10%',
    action: 'Swap 50% ETH → USDC',
    deposited: 5000,
    earned: 125.5
  },
  {
    id: 3,
    name: 'Arbitrage Bot',
    status: 'paused',
    network: 'Ethereum/Polygon',
    trigger: 'Price difference > 2%',
    action: 'Execute cross-chain swap',
    deposited: 2500,
    earned: 45.8
  },
  {
    id: 4,
    name: 'ETH Stop Loss Protection',
    status: 'active',
    network: 'Ethereum',
    trigger: 'ETH price drops 10%',
    action: 'Swap 50% ETH → USDC',
    deposited: 5000,
    earned: 125.5
  },
  {
    id: 5,
    name: 'Arbitrage Bot',
    status: 'paused',
    network: 'Ethereum/Polygon',
    trigger: 'Price difference > 2%',
    action: 'Execute cross-chain swap',
    deposited: 2500,
    earned: 45.8
  },
  {
    id: 6,
    name: 'ETH Stop Loss Protection',
    status: 'active',
    network: 'Ethereum',
    trigger: 'ETH price drops 10%',
    action: 'Swap 50% ETH → USDC',
    deposited: 5000,
    earned: 125.5
  },
  {
    id: 7,
    name: 'ETH Stop Loss Protection',
    status: 'active',
    network: 'Ethereum',
    trigger: 'ETH price drops 10%',
    action: 'Swap 50% ETH → USDC',
    deposited: 5000,
    earned: 125.5
  },
  {
    id: 8,
    name: 'ETH Stop Loss Protection',
    status: 'active',
    network: 'Ethereum',
    trigger: 'ETH price drops 10%',
    action: 'Swap 50% ETH → USDC',
    deposited: 5000,
    earned: 125.5
  },
  {
    id: 9,
    name: 'Arbitrage Bot',
    status: 'paused',
    network: 'Ethereum/Polygon',
    trigger: 'Price difference > 2%',
    action: 'Execute cross-chain swap',
    deposited: 2500,
    earned: 45.8
  }
];

export default function Automations() {

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <AppLayout>
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between border-b border-neutral-800">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">ETH Protection Strategy</h1>
            <p className="text-neutral-400">Auto-swap when price drops with gas optimization</p>
          </div>

          <div className="p-4">
            <Link
                to="/automations/create"
                className="w-full border border-white cursor-pointer text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Automation
            </Link>
          </div>
        </div>



        {/* Automations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {automations.map((automation) => (
            //   @ts-ignore
            <AutomationCard key={automation.id} automation={automation} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}