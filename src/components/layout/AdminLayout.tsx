import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../lib/firebase';
import LanguageSwitcher from '../LanguageSwitcher';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex w-full">
      {/* Sidebar */}
      <div
        className={`
          h-screen bg-[#1a1a1a] border-r border-gray-800
          transition-all duration-300 z-20
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          sticky top-0 left-0
        `}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Creative Cactus"
              className="h-8 w-auto"
            />
            {isSidebarOpen && (
              <span className="ml-2 text-white font-semibold">
                Admin Portal
              </span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          {/* Add your navigation items here */}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="bg-[#1a1a1a] border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-gray-800" />
            <div className="text-sm text-gray-400">
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}