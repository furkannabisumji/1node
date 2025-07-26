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
      {/* Overlay */}
      <div 
        className={`
          fixed inset-0 z-40 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-neutral-800
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`
          flex flex-col h-full
          transition-opacity duration-200 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}>
          {/* Header with logo and close button */}
          <div className="flex items-center justify-between py-3 px-4 border-b border-neutral-700">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">1N</span>
              </div>
              <div>
                <h2 className="text-white font-semibold">1Node</h2>
                <p className="text-neutral-400 text-xs">Automation Builder</p>
              </div>
            </Link>
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
              className="w-full border border-white cursor-pointer text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ease-in-out hover:bg-white hover:text-black hover:scale-105"
              style={{
                transitionDelay: isOpen ? '100ms' : '0ms'
              }}
            >
              <Plus className="h-4 w-4" />
              Create Automation
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 mt-10 space-y-1">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium 
                    transition-all duration-200 ease-in-out hover:transform hover:translate-x-1
                    ${isActive 
                      ? 'text-green-500 bg-green-500/10' 
                      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                    }
                  `}
                  style={{
                    transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-neutral-700 p-4 space-y-1">
            {bottomNavigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all duration-200 ease-in-out hover:transform hover:translate-x-1"
                style={{
                  transitionDelay: isOpen ? `${(navigation.length + index) * 50}ms` : '0ms'
                }}
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