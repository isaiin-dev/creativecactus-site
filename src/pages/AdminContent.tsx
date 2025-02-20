import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Layout,
  Globe, 
  Plus,
  Image as ImageIcon,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save, 
  DollarSign,
  Grid,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  GripVertical,
  History,
  RotateCcw,
  X,
  Briefcase
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../contexts/AuthContext';
import ContentEditor from '../components/admin/ContentEditor';
import { 
  ContentBlock, 
  ContentVersion,
  getContentBlock, 
  updateContentBlock,
  approveContentVersion,
  Service,
  createService,
  updateService,
  deleteService,
  getServices,
  uploadServiceImage
} from '../lib/firebase';

type ContentSection = 'header' | 'footer' | 'hero' | 'testimonials' | 'features' | 'services';

interface ServiceFormData {
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  price?: number;
  status: 'active' | 'inactive';
  category: string;
  features: string[];
}

const initialServiceFormData: ServiceFormData = {
  title: '',
  description: '',
  icon: '',
  price: undefined,
  status: 'active',
  category: '',
  features: ['']
};

const categories = [
  'design',
  'development',
  'marketing',
  'consulting',
  'content',
  'other'
];

interface ContentForm {
  type: ContentSection;
  data: any;
  scheduledFor?: Date;
}

export default function AdminContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [services, setServices] = React.useState<Service[]>([]);
  const [activeSection, setActiveSection] = React.useState<ContentSection>('hero');
  const [content, setContent] = React.useState<ContentBlock | null>(null);
  const [versions, setVersions] = React.useState<ContentVersion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState(false);
  const [form, setForm] = React.useState<ContentForm>({
    type: 'hero',
    data: {},
  });
  const [isServiceFormOpen, setIsServiceFormOpen] = React.useState(false);
  const [serviceFormData, setServiceFormData] = React.useState<ServiceFormData>(initialServiceFormData);
  const [editingServiceId, setEditingServiceId] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sections: { id: ContentSection; label: string; icon: React.ReactNode }[] = [
    { id: 'header', label: 'Header', icon: <Layout className="h-5 w-5" /> },
    { id: 'hero', label: 'Hero Section', icon: <Globe className="h-5 w-5" /> },
    { id: 'services', label: 'Services', icon: <Briefcase className="h-5 w-5" /> },
    { id: 'testimonials', label: 'Testimonials', icon: <Layout className="h-5 w-5" /> },
    { id: 'features', label: 'Features', icon: <Layout className="h-5 w-5" /> },
    { id: 'footer', label: 'Footer', icon: <Layout className="h-5 w-5" /> },
  ];

  React.useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServices();
      if (!data) {
        throw new Error('No services data available');
      }
      setServices(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading services';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let imageUrl = serviceFormData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadServiceImage(imageFile);
      }

      const serviceData = {
        ...serviceFormData,
        imageUrl,
        order: editingServiceId ? services.find(s => s.id === editingServiceId)?.order || 0 : services.length
      };

      if (editingServiceId) {
        await updateService(editingServiceId, serviceData);
      } else {
        await createService(serviceData);
      }

      await loadServices();
      resetServiceForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving service';
      setError(errorMessage);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleServiceDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteService(id);
      await loadServices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting service';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceEdit = (service: Service) => {
    setServiceFormData({
      title: service.title,
      description: service.description,
      icon: service.icon,
      imageUrl: service.imageUrl,
      price: service.price,
      status: service.status,
      category: service.category,
      features: service.features
    });
    setEditingServiceId(service.id);
    setIsServiceFormOpen(true);
    if (service.imageUrl) {
      setPreviewUrl(service.imageUrl);
    }
  };

  const resetServiceForm = () => {
    setServiceFormData(initialServiceFormData);
    setEditingServiceId(null);
    setIsServiceFormOpen(false);
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(services);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setServices(items);

    try {
      await Promise.all(
        items.map((item, index) => 
          updateService(item.id, { order: index })
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating order';
      setError(errorMessage);
      console.error(err);
      await loadServices();
    }
  };

  const loadContent = async (section: ContentSection) => {
    setLoading(true);
    try {
      if (!user) return;
      
      const contentData = await getContentBlock(section);
      setContent(contentData);
      if (contentData) {
        setForm({
          type: section,
          data: contentData.data || {},
        });
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadContent(activeSection);
  }, [activeSection]);

  const handleSave = async (status: ContentVersion['status'] = 'draft') => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateContentBlock(
        form.type,
        form.data,
        user.uid,
        status,
        form.scheduledFor
      );
      
      await loadContent(form.type);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (versionId: string) => {
    if (!user) return;
    
    setSaving(true);
    try {
      await approveContentVersion(activeSection, versionId, user.uid);
      await loadContent(activeSection);
    } catch (error) {
      console.error('Error approving version:', error);
    } finally {
      setSaving(false);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${previewMode
                ? 'bg-[#96C881] text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'}
            `}
          >
            <Eye className="h-5 w-5" />
            Preview Mode
          </button>
          
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800 rounded-lg transition-colors"
          >
            <Save className="h-5 w-5" />
            Save Draft
          </button>
          
          {user?.role === 'admin' && (
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 space-y-4">
          <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
            <h2 className="text-lg font-medium text-white mb-4">Sections</h2>
            <nav className="space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors
                    ${activeSection === section.id
                      ? 'bg-[#96C881] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#242424]'}
                  `}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
            <h2 className="text-lg font-medium text-white mb-4">Version History</h2>
            <div className="space-y-4">
              {versions.map(version => (
                <div
                  key={version.id}
                  className="p-3 bg-[#242424] rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {version.createdAt.toLocaleDateString()}
                    </span>
                    <span
                      className={`
                        text-xs px-2 py-1 rounded-full
                        ${version.status === 'published'
                          ? 'bg-[#96C881]/20 text-[#96C881]'
                          : version.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-gray-500/20 text-gray-400'}
                      `}
                    >
                      {version.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          data: version.data
                        }));
                      }}
                      className="flex items-center gap-1 text-sm text-[#96C881] hover:text-[#86b873] transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </button>
                    
                    {user?.role === 'admin' && version.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(version.id)}
                        className="flex items-center gap-1 text-sm text-[#96C881] hover:text-[#86b873] transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9 space-y-6">
          {activeSection === 'services' ? (
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-white">Services Management</h2>
                <button
                  onClick={() => setIsServiceFormOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Service
                </button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="services">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-1 gap-4"
                    >
                      {services.map((service, index) => (
                        <Draggable key={service.id} draggableId={service.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-[#242424] rounded-lg p-4"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-gray-400 hover:text-white transition-colors cursor-move"
                                >
                                  <GripVertical className="h-5 w-5" />
                                </div>

                                {service.imageUrl ? (
                                  <img
                                    src={service.imageUrl}
                                    alt={service.title}
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                                    <Grid className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}

                                <div className="flex-1">
                                  <h3 className="text-lg font-medium text-white">
                                    {service.title}
                                  </h3>
                                  <p className="text-sm text-gray-400">
                                    {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4">
                                  {service.status === 'active' ? (
                                    <span className="flex items-center gap-1 text-[#96C881] text-sm">
                                      <Eye className="h-4 w-4" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                                      <EyeOff className="h-4 w-4" />
                                      Inactive
                                    </span>
                                  )}
                                  
                                  {service.price && (
                                    <span className="text-white font-medium">
                                      ${service.price}
                                    </span>
                                  )}

                                  <button
                                    onClick={() => handleServiceEdit(service)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                  >
                                    <Edit2 className="h-5 w-5" />
                                  </button>

                                  <button
                                    onClick={() => handleServiceDelete(service.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          ) : (
            <ContentEditor
              content={content}
              onChange={(data) => setForm(prev => ({ ...prev, data }))}
              previewMode={previewMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}