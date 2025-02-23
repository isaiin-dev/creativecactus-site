import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, FolderKanban, Users, Building2, FileBox, DollarSign, BarChart3, Settings, Briefcase, Layout, ChevronLeft, ChevronRight } from 'lucide-react';
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
      icon: <Layout className="h-5 w-5" />,
      label: 'Content',
      path: '/admin/content',
      roles: ['editor', 'admin', 'super_admin']
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
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen
          bg-[#1a1a1a] border-r border-gray-800
          transition-all duration-300 ease-in-out z-20
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          flex flex-col
        `}
      >
        {/* Logo & Toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center w-full overflow-hidden">
            <img
              src="/logo.png"
              alt="Creative Cactus"
              className={`
                h-8 w-auto
                transition-transform duration-300
                ${!isSidebarOpen && 'transform -translate-x-full'}
              `}
            />
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`
              p-2 rounded-lg text-gray-400 hover:text-white
              transition-colors hover:bg-[#242424]
              flex-shrink-0 ml-2
            `}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
          <div className="space-y-1 relative">
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
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-[#96C881] text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-[#242424]'}
                  `}
                >
                  <div className="flex-shrink-0 w-5">
                    {item.icon}
                  </div>
                  <span
                    className={`
                      whitespace-nowrap
                      transition-all duration-300
                      ${!isSidebarOpen ? 'hidden' : 'block'}
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`
        flex-1 min-w-0 transition-all duration-300
        ${isSidebarOpen ? 'md:ml-0' : 'md:ml-0'}
      `}>
        {/* Top Bar */}
        <div className="bg-[#1a1a1a] border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4" />
          
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