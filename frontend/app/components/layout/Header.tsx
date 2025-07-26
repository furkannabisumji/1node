import { useState } from 'react';
import {Menu, Bell, Settings, User, PanelRight} from 'lucide-react';
import { useLocation } from 'react-router';
import { AccountSettingsModal } from '../modals/AccountSettingsModal';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

// Function to get page title from pathname
const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/automations':
      return 'Automations';
    case '/automations/create':
      return 'Create Automation';
    case '/settings':
      return 'Settings';
    case '/help':
      return 'Help';
    default:
      return 'Automation Builder';
  }
};

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  return (
    <header className="bg-black border-b border-neutral-800 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left section with sidebar toggle */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <PanelRight className="h-5 w-5 text-neutral-300" />
        </button>

        {/* Logo/Brand - only show when sidebar is closed */}
        {!sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">1N</span>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">
              1Node
            </span>
          </div>
        )}

        {/* Page title - positioned close to left */}
        <h1 className="text-white font-medium text-lg hidden md:block ml-4">
          {pageTitle}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Right section with user actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors relative">
          <Bell className="h-5 w-5 text-neutral-300" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors">
          <Settings className="h-5 w-5 text-neutral-300" />
        </button>

        {/* User menu */}
        <button 
          onClick={() => setIsAccountModalOpen(true)}
          className="flex items-center gap-2 ml-2 p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-neutral-300" />
          </div>
          <span className="text-neutral-300 text-sm hidden lg:block">
            0x3AdE67...780
          </span>
        </button>
      </div>

      {/* Account Settings Modal */}
      <AccountSettingsModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </header>
  );
}