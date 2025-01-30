import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Bell, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStat {
  label: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: React.ReactNode;
}

interface Activity {
  id: string;
  type: 'project_update' | 'task_completed' | 'client_feedback' | 'team_mention';
  content: string;
  timestamp: Date;
  user: {
    name: string;
    avatar: string;
  };
}

interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'delayed';
  dueDate: Date;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  availability: number;
  currentTasks: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  // Example data - In a real app, this would come from your backend
  const stats: DashboardStat[] = [
    {
      label: 'Active Projects',
      value: 12,
      change: { value: 8.2, trend: 'up' },
      icon: <Briefcase className="h-6 w-6 text-[#96C881]" />,
    },
    {
      label: 'Pending Tasks',
      value: 28,
      change: { value: 2.1, trend: 'down' },
      icon: <Clock className="h-6 w-6 text-[#E4656E]" />,
    },
    {
      label: 'Team Members',
      value: 18,
      change: { value: 12, trend: 'up' },
      icon: <Users className="h-6 w-6 text-[#96C881]" />,
    },
    {
      label: 'Client Satisfaction',
      value: '94%',
      change: { value: 3.8, trend: 'up' },
      icon: <CheckCircle2 className="h-6 w-6 text-[#96C881]" />,
    },
  ];

  const recentActivity: Activity[] = [
    {
      id: '1',
      type: 'project_update',
      content: 'Updated branding assets for TechVision MX project',
      timestamp: new Date('2024-03-20T14:30:00'),
      user: {
        name: 'Ana Martínez',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
    {
      id: '2',
      type: 'task_completed',
      content: 'Completed website redesign for InnovaMex',
      timestamp: new Date('2024-03-20T13:15:00'),
      user: {
        name: 'Carlos Ruiz',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
    {
      id: '3',
      type: 'client_feedback',
      content: 'New feedback received from GlobalTech project',
      timestamp: new Date('2024-03-20T11:45:00'),
      user: {
        name: 'María González',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
  ];

  const projects: Project[] = [
    {
      id: '1',
      name: 'TechVision MX Rebrand',
      client: 'TechVision MX',
      progress: 75,
      status: 'on_track',
      dueDate: new Date('2024-04-15'),
    },
    {
      id: '2',
      name: 'InnovaMex Website',
      client: 'InnovaMex',
      progress: 90,
      status: 'at_risk',
      dueDate: new Date('2024-03-30'),
    },
    {
      id: '3',
      name: 'GlobalTech Campaign',
      client: 'GlobalTech',
      progress: 45,
      status: 'delayed',
      dueDate: new Date('2024-04-01'),
    },
  ];

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Ana Martínez',
      role: 'UI/UX Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      availability: 80,
      currentTasks: 3,
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      role: 'Frontend Developer',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      availability: 60,
      currentTasks: 4,
    },
    {
      id: '3',
      name: 'María González',
      role: 'Project Manager',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      availability: 40,
      currentTasks: 5,
    },
  ];

  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#96C881] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.displayName || 'Admin'}
        </h1>
        <p className="text-gray-400">
          Here's what's happening at Creative Cactus today
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button className="bg-[#96C881] hover:bg-[#86b873] text-white p-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Plus className="h-5 w-5" />
          New Project
        </button>
        <button className="bg-[#1a1a1a] hover:bg-[#242424] text-white p-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-gray-800">
          <Users className="h-5 w-5" />
          Manage Team
        </button>
        <button className="bg-[#1a1a1a] hover:bg-[#242424] text-white p-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-gray-800">
          <Calendar className="h-5 w-5" />
          Schedule Meeting
        </button>
        <button className="bg-[#1a1a1a] hover:bg-[#242424] text-white p-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-gray-800">
          <BarChart3 className="h-5 w-5" />
          View Reports
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.change && (
                  <div className="flex items-center mt-2">
                    {stat.change.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-[#96C881]" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-[#E4656E]" />
                    )}
                    <span
                      className={`text-sm ${
                        stat.change.trend === 'up'
                          ? 'text-[#96C881]'
                          : 'text-[#E4656E]'
                      }`}
                    >
                      {stat.change.value}%
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#242424] rounded-lg">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status */}
        <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-6">Project Status</h2>
          <div className="space-y-6">
            {projects.map(project => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-400">{project.client}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'on_track'
                        ? 'bg-[#96C881]/20 text-[#96C881]'
                        : project.status === 'at_risk'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-[#E4656E]/20 text-[#E4656E]'
                    }`}
                  >
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-[#242424] rounded-full h-2">
                  <div
                    className="bg-[#96C881] h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{project.progress}% Complete</span>
                  <span>
                    Due {project.dueDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-4">
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>{' '}
                    {activity.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload */}
        <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-6">Team Workload</h2>
          <div className="space-y-6">
            {teamMembers.map(member => (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center gap-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {member.currentTasks} Active Tasks
                  </span>
                  <span
                    className={`${
                      member.availability > 70
                        ? 'text-[#96C881]'
                        : member.availability > 30
                        ? 'text-yellow-500'
                        : 'text-[#E4656E]'
                    }`}
                  >
                    {member.availability}% Available
                  </span>
                </div>
                <div className="w-full bg-[#242424] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      member.availability > 70
                        ? 'bg-[#96C881]'
                        : member.availability > 30
                        ? 'bg-yellow-500'
                        : 'bg-[#E4656E]'
                    }`}
                    style={{ width: `${member.availability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}