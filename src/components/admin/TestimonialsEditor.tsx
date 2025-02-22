import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Star,
  Calendar,
  Image as ImageIcon,
  Search,
  Filter,
  GripVertical,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  X,
  CheckCircle2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TestimonialsData, TestimonialItem, defaultTestimonialsData } from '../../lib/firebase';

interface TestimonialsEditorProps {
  data?: TestimonialsData;
  onChange: (data: TestimonialsData) => void;
  onSave: () => void;
  previewMode?: boolean;
}

interface TestimonialFormData {
  name: string;
  position: string;
  company: string;
  photoUrl?: string;
  testimonial: string;
  rating: number;
  status: 'active' | 'inactive';
}

const initialFormData: TestimonialFormData = {
  name: '',
  position: '',
  company: '',
  photoUrl: '',
  testimonial: '',
  rating: 5,
  status: 'active'
};

export default function TestimonialsEditor({
  data,
  onChange,
  onSave,
  previewMode = false
}: TestimonialsEditorProps) {
  const [testimonialsData, setTestimonialsData] = React.useState<TestimonialsData>(defaultTestimonialsData);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<TestimonialFormData>(initialFormData);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [ratingFilter, setRatingFilter] = React.useState<number | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize testimonials data with defaults or provided data
  React.useEffect(() => {
    if (data) {
      setTestimonialsData({
        ...defaultTestimonialsData,
        ...data
      });
    }
    setLoading(false);
  }, [data]);

  const handleChange = (newData: TestimonialsData) => {
    setTestimonialsData(newData);
    onChange(newData);
  };

  const validateImage = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateTestimonial = (testimonial: TestimonialFormData): boolean => {
    if (!testimonial.name.trim()) {
      setError('Client name is required');
      return false;
    }

    if (!testimonial.testimonial.trim()) {
      setError('Testimonial text is required');
      return false;
    }

    if (testimonial.testimonial.length > 300) {
      setError('Testimonial must be less than 300 characters');
      return false;
    }

    if (!validateImage(testimonial.photoUrl || '')) {
      setError('Invalid image URL format');
      return false;
    }

    if (testimonial.rating < 1 || testimonial.rating > 5) {
      setError('Rating must be between 1 and 5');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTestimonial(formData)) {
      return;
    }

    const newTestimonial: TestimonialItem = {
      id: editingId || Date.now().toString(),
      ...formData,
      publishedAt: editingId ? 
        testimonialsData.items.find(item => item.id === editingId)?.publishedAt || 
        defaultTestimonialsData.metadata.lastModified : 
        defaultTestimonialsData.metadata.lastModified,
      order: editingId ? 
        testimonialsData.items.find(item => item.id === editingId)?.order || 0 : 
        testimonialsData.items.length
    };

    const newItems = editingId ?
      testimonialsData.items.map(item => 
        item.id === editingId ? newTestimonial : item
      ) :
      [...testimonialsData.items, newTestimonial];

    handleChange({
      ...testimonialsData,
      items: newItems
    });

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    handleChange({
      ...testimonialsData,
      items: testimonialsData.items.filter(item => item.id !== id)
    });
  };

  const handleEdit = (testimonial: TestimonialItem) => {
    setFormData({
      name: testimonial.name,
      position: testimonial.position,
      company: testimonial.company,
      photoUrl: testimonial.photoUrl,
      testimonial: testimonial.testimonial,
      rating: testimonial.rating,
      status: testimonial.status
    });
    setEditingId(testimonial.id);
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

    const items = Array.from(testimonialsData.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    handleChange({
      ...testimonialsData,
      items: updatedItems
    });
  };

  // Filter and search testimonials
  const filteredTestimonials = testimonialsData.items
    .filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.testimonial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesRating = !ratingFilter || item.rating === ratingFilter;

      return matchesSearch && matchesStatus && matchesRating;
    })
    .sort((a, b) => a.order - b.order);

  // Pagination
  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
  const paginatedTestimonials = filteredTestimonials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-[#96C881] animate-spin" />
      </div>
    );
  }

  if (previewMode) {
    return (
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Client Success Stories</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Don't just take our word for it - hear what our clients have to say
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonialsData.items
              .filter(item => item.status === 'active')
              .map((testimonial) => (
                <div key={testimonial.id} className="bg-[#242424] p-8 rounded-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    {testimonial.photoUrl && (
                      <img
                        src={testimonial.photoUrl}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-white">{testimonial.name}</h3>
                      <p className="text-gray-400">
                        {testimonial.position}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{testimonial.testimonial}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating
                            ? 'text-[#96C881] fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
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
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={ratingFilter || ''}
              onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>{rating} Stars</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Testimonial
        </button>
      </div>

      {/* Testimonials List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="testimonials">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {paginatedTestimonials.map((testimonial, index) => (
                <Draggable
                  key={testimonial.id}
                  draggableId={testimonial.id}
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

                        {testimonial.photoUrl ? (
                          <img
                            src={testimonial.photoUrl}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#242424] flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-white">
                              {testimonial.name}
                            </h3>
                            <span className="text-sm text-gray-400">
                              {testimonial.position}, {testimonial.company}
                            </span>
                          </div>
                          <p className="text-gray-300 line-clamp-2">
                            {testimonial.testimonial}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < testimonial.rating
                                    ? 'text-[#96C881] fill-current'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>

                          {testimonial.status === 'active' ? (
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
                            onClick={() => handleEdit(testimonial)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => handleDelete(testimonial.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`
                px-4 py-2 rounded-lg transition-colors
                ${currentPage === index + 1
                  ? 'bg-[#96C881] text-white'
                  : 'bg-[#242424] text-gray-400 hover:text-white'}
              `}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Testimonial Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  />
                </div>

                {/* Photo URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Testimonial */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Testimonial *
                </label>
                <textarea
                  value={formData.testimonial}
                  onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
                  required
                  maxLength={300}
                  rows={4}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-400">
                  {formData.testimonial.length}/300 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            i < formData.rating
                              ? 'text-[#96C881] fill-current'
                              : 'text-gray-600'
                          }`}
                        />
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
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}