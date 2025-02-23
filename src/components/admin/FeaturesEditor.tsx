import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Search,
  GripVertical,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  X,
  LineChart,
  Brush,
  Users,
  Target,
  Zap,
  Rocket,
  Code,
  MessageSquare,
  Heart,
  Shield,
  Settings,
  Globe
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FeaturesData, FeatureItem, defaultFeaturesData } from '../../lib/firebase';

interface FeaturesEditorProps {
  data?: FeaturesData;
  onChange: (data: FeaturesData) => void;
  onSave: () => void;
  previewMode?: boolean;
}

interface FeatureFormData {
  title: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
}

const initialFormData: FeatureFormData = {
  title: '',
  description: '',
  icon: 'Zap',
  status: 'active'
};

const availableIcons = {
  LineChart,
  Brush,
  Users,
  Target,
  Zap,
  Rocket,
  Code,
  MessageSquare,
  Heart,
  Shield,
  Settings,
  Globe
};

export default function FeaturesEditor({
  data,
  onChange,
  onSave,
  previewMode = false
}: FeaturesEditorProps) {
  const [featuresData, setFeaturesData] = React.useState<FeaturesData>(defaultFeaturesData);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<FeatureFormData>(initialFormData);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  const { t } = useTranslation();

  // Initialize features data with defaults or provided data
  React.useEffect(() => {
    if (data) {
      setFeaturesData({
        ...defaultFeaturesData,
        ...data
      });
    }
    setLoading(false);
  }, [data]);

  const handleChange = (newData: FeaturesData) => {
    setFeaturesData(newData);
    onChange(newData);
  };

  const validateFeature = (feature: FeatureFormData): boolean => {
    if (!feature.title.trim()) {
      setError('Title is required');
      return false;
    }

    if (feature.title.length > 50) {
      setError('Title must be less than 50 characters');
      return false;
    }

    if (!feature.description.trim()) {
      setError('Description is required');
      return false;
    }

    if (feature.description.length > 200) {
      setError('Description must be less than 200 characters');
      return false;
    }

    if (!feature.icon) {
      setError('Icon is required');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFeature(formData)) {
      return;
    }

    const newFeature: FeatureItem = {
      id: editingId || Date.now().toString(),
      ...formData,
      order: editingId ? 
        featuresData.items.find(item => item.id === editingId)?.order || 0 : 
        featuresData.items.length
    };

    const newItems = editingId ?
      featuresData.items.map(item => 
        item.id === editingId ? newFeature : item
      ) :
      [...featuresData.items, newFeature];

    handleChange({
      ...featuresData,
      items: newItems
    });

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feature?')) {
      return;
    }

    handleChange({
      ...featuresData,
      items: featuresData.items.filter(item => item.id !== id)
    });
  };

  const handleEdit = (feature: FeatureItem) => {
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      status: feature.status
    });
    setEditingId(feature.id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsFormOpen(false);
    setError(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(featuresData.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    handleChange({
      ...featuresData,
      items: updatedItems
    });
  };

  // Filter features
  const filteredFeatures = featuresData.items
    .filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-[#96C881] animate-spin" />
      </div>
    );
  }

  if (previewMode) {
    return (
      <section className="py-20 px-4 bg-[#242424]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuresData.items
              .filter(item => item.status === 'active')
              .map((feature) => {
                const IconComponent = availableIcons[feature.icon as keyof typeof availableIcons];
                return (
                  <div key={feature.id} className="flex items-start gap-4">
                    <div className="p-2 bg-[#1a1a1a] rounded-lg">
                      <IconComponent className="h-6 w-6 text-[#96C881]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
          <p className="text-red-500 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Feature
        </button>
      </div>

      {/* Features List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="features">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {filteredFeatures.map((feature, index) => {
                const IconComponent = availableIcons[feature.icon as keyof typeof availableIcons];
                return (
                  <Draggable
                    key={feature.id}
                    draggableId={feature.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            {...provided.dragHandleProps}
                            className="text-gray-400 hover:text-white transition-colors cursor-move"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>

                          <div className="p-2 bg-[#242424] rounded-lg">
                            <IconComponent className="h-6 w-6 text-[#96C881]" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-white">
                              {feature.title}
                            </h3>
                            <p className="text-gray-300 line-clamp-2">
                              {feature.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            {feature.status === 'active' ? (
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

                            <button
                              onClick={() => handleEdit(feature)}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>

                            <button
                              onClick={() => handleDelete(feature.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Feature Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Feature' : 'Add New Feature'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  maxLength={50}
                  required
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  placeholder="Enter feature title"
                />
                <p className="mt-1 text-sm text-gray-400">
                  {formData.title.length}/50 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  placeholder="Enter feature description"
                />
                <p className="mt-1 text-sm text-gray-400">
                  {formData.description.length}/200 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Icon *
                  </label>
                  <div className="grid grid-cols-4 gap-2 p-2 bg-[#242424] rounded-lg border border-gray-700">
                    {Object.entries(availableIcons).map(([name, Icon]) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                        className={`
                          p-2 rounded-lg transition-colors
                          ${formData.icon === name
                            ? 'bg-[#96C881] text-white'
                            : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}
                        `}
                      >
                        <Icon className="h-6 w-6" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      status: e.target.value as 'active' | 'inactive'
                    }))}
                    required
                    className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
                >
                  <Save className="h-5 w-5" />
                  Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}