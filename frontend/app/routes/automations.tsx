import { useState, useEffect } from 'react';
import { AppLayout } from '~/components/layout/AppLayout';
import { AutomationCard } from '~/components/automations/AutomationCard';
import {Plus} from 'lucide-react';
import {Link} from "react-router";
import axiosInstance from '~/lib/axios';

export default function Automations() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        console.log('Fetching automations from /automations endpoint...');
        const response = await axiosInstance.get('/automations');
        console.log('Automations response:', response.data);
        setAutomations(response.data.automations || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching automations:', err);
        setError(err?.response?.data?.error || 'Failed to fetch automations');
        setLoading(false);
      }
    };

    fetchAutomations();
  }, []);
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-neutral-400">Loading automations...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-red-400">Error: {error}</div>
          </div>
        ) : automations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-neutral-400">No automations found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {automations.map((automation: any) => (
              <AutomationCard key={automation.id} automation={automation} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}