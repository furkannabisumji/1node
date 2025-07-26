import { X } from 'lucide-react';

interface NotificationBarProps {
  message: string;
  type?: 'default' | 'warning' | 'error';
  showDot?: boolean;
  onDismiss?: () => void;
}

export function NotificationBar({ 
  message, 
  type = 'default', 
  showDot = false, 
  onDismiss 
}: NotificationBarProps) {
  const getDotColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">{message}</span>
          {showDot && (
            <div className={`w-2 h-2 ${getDotColor()} rounded-full`}></div>
          )}
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}