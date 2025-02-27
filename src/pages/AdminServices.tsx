import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Loader2, 
  AlertCircle, 
  Grid,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  GripVertical,
  X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Service, createService, updateService, deleteService, getServices, uploadServiceImage } from '../lib/firebase';
import ServiceEditor from '../components/admin/ServiceEditor';

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

const initialFormData: ServiceFormData = {
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

export default function AdminServices() {
  const { t } = useTranslation();
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isServiceFormOpen, setIsServiceFormOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<ServiceFormData>(initialFormData);
  const [editingServiceId, setEditingServiceId] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const handleServiceSubmit = async (serviceData: ServiceFormData) => {
    setSaving(true);
    setError(null);

    try {
      let imageUrl = serviceData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadServiceImage(imageFile);
      }

      const finalServiceData = {
        ...serviceData,
        imageUrl,
        order: editingServiceId ? services.find(s => s.id === editingServiceId)?.order || 0 : services.length
      };

      if (editingServiceId) {
        await updateService(editingServiceId, finalServiceData);
      } else {
        await createService(finalServiceData);
      }

      await loadServices();
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving service';
      setError(errorMessage);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
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

  const handleEdit = (service: Service) => {
    setFormData({
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

  const resetForm = () => {
    setFormData(initialFormData);
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

    // Update order in UI immediately
    setServices(items);

    // Update order in database
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
      await loadServices(); // Reload original order
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
        <h1 className="text-2xl font-bold text-white">Services Management</h1>
        <button
          onClick={() => {
            setEditingServiceId(null);
            setIsServiceFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Service
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
          <p className="text-red-500 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </p>
        </div>
      )}

      {/* Service Form Modal */}
      {isServiceFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 w-full h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingServiceId ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={() => {
                  setIsServiceFormOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ServiceEditor
              onSubmit={handleServiceSubmit}
              onCancel={() => {
                setIsServiceFormOpen(false);
                resetForm();
              }}
              initialData={formData}
              editingId={editingServiceId}
            />
          </div>
        </div>
      )}

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
                      className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4"
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
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#242424] flex items-center justify-center">
                            <Grid className="h-6 w-6 text-gray-400" />
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

                        <div className="flex items-center gap-2">
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
                            onClick={() => handleEdit(service)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => handleDelete(service.id)}
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
  );
}