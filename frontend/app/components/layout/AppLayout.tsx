import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import {Bot, Sparkles} from 'lucide-react';
import { Link } from 'react-router';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // State to control sidebar visibility - hidden by default after onboarding
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex bg-black">
      {/* Sidebar - Fixed position overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area - full width */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-black">
          {children}
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/automations/create"
          className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </Link>
      </div>

    </div>
  );
}