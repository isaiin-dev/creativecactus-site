import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, LayoutDashboard, FolderKanban, Users, Building2, FileBox, DollarSign, BarChart3, Settings, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../lib/firebase';
import LanguageSwitcher from '../LanguageSwitcher';
import { Link, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: string[];
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      path: '/admin/dashboard',
      roles: ['viewer', 'editor', 'admin', 'super_admin']
    },
    {
      icon: <FolderKanban className="h-5 w-5" />,
      label: 'Projects',
      path: '/admin/projects',
      roles: ['viewer', 'editor', 'admin', 'super_admin']
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Services',
      path: '/admin/services',
      roles: ['editor', 'admin', 'super_admin']
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: 'Clients',
      path: '/admin/clients',
      roles: ['editor', 'admin', 'super_admin']
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Team',
      path: '/admin/team',
      roles: ['admin', 'super_admin']
    },
    {
      icon: <FileBox className="h-5 w-5" />,
      label: 'Resources',
      path: '/admin/resources',
      roles: ['viewer', 'editor', 'admin', 'super_admin']
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: 'Finance',
      path: '/admin/finance',
      roles: ['admin', 'super_admin']
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Reports',
      path: '/admin/reports',
      roles: ['editor', 'admin', 'super_admin']
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      path: '/admin/settings',
      roles: ['super_admin']
    }
  ];

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
          <img
            src="/logo.png"
            alt="Creative Cactus"
            className="h-8 w-auto"
          />
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
        <nav className="mt-8 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isVisible = user?.role && item.roles.includes(user.role);
              if (!isVisible) return null;

              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors
                    ${isActive 
                      ? 'bg-[#96C881] text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-[#242424]'}
                    ${!isSidebarOpen && 'justify-center'}
                  `}
                >
                  {item.icon}
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
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