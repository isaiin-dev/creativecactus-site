import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Building2,
  ChevronDown,
  Star,
  Shield,
  Calendar,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  Briefcase,
  UserCheck,
  AlertCircle,
  Loader2,
  Save,
  X,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Download,
  FileUp,
  Image as ImageIcon
} from 'lucide-react';
import { 
  UserData, 
  TeamData,
  Certification,
  Document,
  Schedule,
  updateTeamMember,
  createTeam,
  updateTeam,
  getTeamMembers,
  createNotification,
  uploadDocument
} from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface MemberFormData extends Partial<UserData> {
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const initialMemberFormData: MemberFormData = {
  fullName: '',
  email: '',
  title: '',
  department: '',
  phone: '',
  status: 'active',
  role: 'viewer',
  skills: [],
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  }
};

export default function AdminTeam() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<UserData[]>([]);
  const [teams, setTeams] = React.useState<TeamData[]>([]);
  const [selectedMember, setSelectedMember] = React.useState<UserData | null>(null);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [departmentFilter, setDepartmentFilter] = React.useState<string>('all');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [currentView, setCurrentView] = React.useState<'list' | 'org' | 'teams'>('list');
  const [memberFormData, setMemberFormData] = React.useState<MemberFormData>(initialMemberFormData);
  const [showMemberForm, setShowMemberForm] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [documentType, setDocumentType] = React.useState<Document['type']>('contract');
  const [documentCategory, setDocumentCategory] = React.useState('');
  const [documentTags, setDocumentTags] = React.useState<string[]>([]);
  const [showDocumentUpload, setShowDocumentUpload] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load team data
  React.useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        // Load data from Firebase
        // This is a placeholder - implement actual data loading
        setLoading(false);
      } catch (err) {
        console.error('Error loading team data:', err);
        setError('Failed to load team data');
        setLoading(false);
      }
    };

    loadTeamData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedFile || !selectedMember) return;

    try {
      await uploadDocument(selectedFile, {
        type: documentType,
        name: selectedFile.name,
        category: documentCategory,
        tags: documentTags,
        accessRoles: ['admin', 'super_admin']
      });

      // Refresh member data
      // Implement refresh logic

      setShowDocumentUpload(false);
      setSelectedFile(null);
      setDocumentType('contract');
      setDocumentCategory('');
      setDocumentTags([]);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      await updateTeamMember(selectedMember.uid, memberFormData);
      setShowMemberForm(false);
      // Refresh member data
      // Implement refresh logic
    } catch (err) {
      console.error('Error updating member:', err);
      setError('Failed to update member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-[#96C881] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Team Management</h1>
        <button
          onClick={() => setShowMemberForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
        >
          <UserPlus className="h-5 w-5" />
          Add Member
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 p-1 bg-[#1a1a1a] rounded-lg w-fit">
        {[
          { id: 'list', label: 'List View', icon: Users },
          { id: 'org', label: 'Org Chart', icon: Building2 },
          { id: 'teams', label: 'Teams', icon: Users }
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setCurrentView(view.id as typeof currentView)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${currentView === view.id
                ? 'bg-[#96C881] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#242424]'}
            `}
          >
            <view.icon className="h-5 w-5" />
            {view.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
        >
          <option value="all">All Departments</option>
          <option value="development">Development</option>
          <option value="design">Design</option>
          <option value="marketing">Marketing</option>
          <option value="sales">Sales</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-2 space-y-4">
          {teamMembers.map(member => (
            <div
              key={member.uid}
              className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4"
            >
              <div className="flex items-center gap-4">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#242424] flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-white">
                      {member.fullName}
                    </h3>
                    <span className="text-sm text-gray-400">
                      {member.position}
                    </span>
                  </div>
                  <p className="text-gray-400">
                    {member.department}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {member.status === 'active' ? (
                    <span className="flex items-center gap-1 text-[#96C881] text-sm">
                      <Eye className="h-4 w-4" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <EyeOff className="h-4 w-4" />
                      {member.status}
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setMemberFormData({
                        ...member,
                        emergencyContact: member.emergencyContact || {
                          name: '',
                          relationship: '',
                          phone: ''
                        }
                      });
                      setShowMemberForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Member Details */}
        {selectedMember && (
          <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">
                Member Details
              </h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-300">{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-300">{selectedMember.phone || 'Not provided'}</span>
                  </div>
                  {selectedMember.emergencyContact && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Emergency Contact
                      </h4>
                      <div className="space-y-2">
                        <p className="text-gray-300">
                          {selectedMember.emergencyContact.name}
                        </p>
                        <p className="text-gray-300">
                          {selectedMember.emergencyContact.relationship}
                        </p>
                        <p className="text-gray-300">
                          {selectedMember.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">
                    Documents
                  </h3>
                  <button
                    onClick={() => setShowDocumentUpload(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-[#242424] text-gray-300 rounded-lg hover:text-white transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedMember.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-[#242424] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-white text-sm">{doc.name}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {/* Implement download */}}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Schedule
                </h3>
                {selectedMember.schedule ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Work Hours
                      </h4>
                      <p className="text-gray-300">
                        {selectedMember.schedule.workHours.start} - {selectedMember.schedule.workHours.end}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Time Off
                      </h4>
                      {selectedMember.schedule.vacationDays.map(vacation => (
                        <div
                          key={vacation.id}
                          className="flex items-center justify-between p-2 bg-[#242424] rounded-lg mb-2"
                        >
                          <div>
                            <p className="text-white text-sm">
                              {new Date(vacation.start).toLocaleDateString()} - {new Date(vacation.end).toLocaleDateString()}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {vacation.type}
                            </p>
                          </div>
                          <span
                            className={`
                              px-2 py-1 rounded-full text-xs
                              ${vacation.status === 'approved'
                                ? 'bg-green-900/20 text-green-500'
                                : vacation.status === 'rejected'
                                ? 'bg-red-900/20 text-red-500'
                                : 'bg-yellow-900/20 text-yellow-500'}
                            `}
                          >
                            {vacation.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No schedule information available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member Form Modal */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {selectedMember ? 'Edit Member' : 'Add New Member'}
              </h2>
              <button
                onClick={() => {
                  setShowMemberForm(false);
                  setSelectedMember(null);
                  setMemberFormData(initialMemberFormData);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleMemberSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={memberFormData.fullName}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        fullName: e.target.value
                      }))}
                      required
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={memberFormData.email}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      required
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={memberFormData.phone}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={memberFormData.title}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">
                  Emergency Contact
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={memberFormData.emergencyContact.name}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        emergencyContact: {
                          ...prev.emergencyContact,
                          name: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={memberFormData.emergencyContact.relationship}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        emergencyContact: {
                          ...prev.emergencyContact,
                          relationship: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="tel"
                      value={memberFormData.emergencyContact.phone}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        emergencyContact: {
                          ...prev.emergencyContact,
                          phone: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">
                  Work Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={memberFormData.department}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        department: e.target.value
                      }))}
                      required
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      <option value="development">Development</option>
                      <option value="design">Design</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Role *
                    </label>
                    <select
                      value={memberFormData.role}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        role: e.target.value as UserData['role']
                      }))}
                      required
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={memberFormData.status}
                      onChange={(e) => setMemberFormData(prev => ({
                        ...prev,
                        status: e.target.value as UserData['status']
                      }))}
                      className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberForm(false);
                    setSelectedMember(null);
                    setMemberFormData(initialMemberFormData);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
                >
                  <Save className="h-5 w-5" />
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Upload Document
              </h2>
              <button
                onClick={() => {
                  setShowDocumentUpload(false);
                  setSelectedFile(null);
                  setDocumentType('contract');
                  setDocumentCategory('');
                  setDocumentTags([]);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as Document['type'])}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                >
                  <option value="contract">Contract</option>
                  <option value="id">ID Document</option>
                  <option value="certification">Certification</option>
                  <option value="hr">HR Document</option>
                  <option value="training">Training</option>
                  <option value="performance">Performance Review</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={documentCategory}
                  onChange={(e) => setDocumentCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  placeholder="Enter document category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={documentTags.join(', ')}
                  onChange={(e) => setDocumentTags(e.target.value.split(',').map(tag => tag.trim()))}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  placeholder="Enter tags, separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-[#96C881] hover:text-[#86b873] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#96C881]"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      PDF, DOC, DOCX, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDocumentUpload(false);
                    setSelectedFile(null);
                    setDocumentType('contract');
                    setDocumentCategory('');
                    setDocumentTags([]);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDocumentUpload}
                  disabled={!selectedFile}
                  className="flex items-center gap-2 px-6 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-5 w-5" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}