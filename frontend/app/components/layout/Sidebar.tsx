import { 
  LayoutDashboard, 
  Zap, 
  Plus,
  X,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isButton?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Automations', href: '/automations', icon: Zap },
];

const bottomNavigation: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
  { name: 'Sign Out', href: '/logout', icon: LogOut },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0  left-0 z-50 w-screen bg-black/50  backdrop-blur-sm border-r border-neutral-800 
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onClick={onClose}
      >
        <div 
          className="flex flex-col h-full w-64 bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with logo and close button */}
          <div className="flex items-center justify-between py-3  px-4 border-b border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">1N</span>
              </div>
              <div>
                <h2 className="text-white font-semibold">1Node</h2>
                <p className="text-neutral-400 text-xs">Automation Builder</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-neutral-700"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>

          {/* Create Automation Button */}
          <div className="p-4">
            <Link
              to="/automations/create"
              className="w-full border border-white cursor-pointer text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Automation
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 mt-10 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? ' text-green-500' 
                      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-neutral-700 p-4 space-y-1">
            {bottomNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}