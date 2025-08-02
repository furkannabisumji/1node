import { useEffect, useState } from 'react';
import { Menu, User, PanelRight, Bell, ChevronDown } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router';
import { AccountSettingsModal } from '../modals/AccountSettingsModal';
import axiosInstance from '~/lib/axios';
import axios from 'axios';
import { useAuth } from '~/auth/AuthProvider';
import formatAddress from '~/utils/formatAddress';
import { useDisconnect } from 'wagmi';

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
      return 'Automation Builder';
    case '/settings':
      return 'Settings';
    case '/help':
      return 'Help';
    default:
      return '';
  }
};

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false)
  const navigate = useNavigate()
  const { disconnect } = useDisconnect()
  const { user, setUser } = useAuth()

  useEffect(() => {
    axiosInstance.get(`/auth/me`, {
      validateStatus: () => true, // disables automatic throwing for non-2xx
    }).then((res) => {
      setUser(res.data.user)
      if (res.status === 401) {
        navigate('/onboarding')
      }
    }).catch((err) => {
      navigate('/onboarding')
    })
  }, [])

  const handleLogout = async () => {
    try {

      await axiosInstance.post('/auth/logout')
      disconnect()
      navigate('/')
      setUser(null)

    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Wallet connect failed:', err.response?.data?.error);

      } else {
        console.error('Unexpected error:', err);
      }
    }
  }
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
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">1N</span>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">
              1Node
            </span>
          </Link>
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
        {/* User icon */}
        <button
          onClick={() => setIsAccountModalOpen(true)}
          className="p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <User className="h-5 w-5 text-neutral-300" />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors relative">
          <Bell className="h-5 w-5 text-neutral-300" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Wallet Connection Button */}
        <div className="relative">
          <button
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 cursor-pointer py-2 rounded-lg transition-colors border border-neutral-600"
            onClick={() => setShowWalletDropdown((prev) => !prev)}
          >
            {user && (
              <span className="text-sm font-medium">{user.username ? user.username : formatAddress(user.walletAddress)}</span>
            )}
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </button>
          {showWalletDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-neutral-900 border cursor-pointer border-neutral-700 rounded-lg shadow-lg z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-500 cursor-pointerhover:bg-neutral-800 rounded-t-lg"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </header>
  );
}