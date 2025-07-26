import { BotIcon } from 'lucide-react';

interface AIInsight {
  type: string;
  title: string;
  description: string;
  actionText: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface AIInsightsProps {
  insights: AIInsight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      {/* AI Insights Header */}
      <div className="flex items-center gap-3 mb-6">
        <BotIcon className="w-6 h-6" />
        <h2 className="text-xl font-semibold text-white">AI Insights</h2>
      </div>

      {/* Insights List */}
      <div className="space-y-6">
        {insights.map((insight, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-start gap-3">
              <insight.icon className={`w-5 h-5 ${insight.color} mt-1 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium mb-2">{insight.title}</h3>
                <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
                  {insight.description}
                </p>
                <button className="w-full bg-transparent border cursor-pointer border-white text-white text-sm py-2 px-4 rounded-lg hover:bg-white hover:text-black transition-colors">
                  {insight.actionText}
                </button>
              </div>
            </div>
            {index < insights.length - 1 && (
              <div className="border-t border-neutral-800"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}