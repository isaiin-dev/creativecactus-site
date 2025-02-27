import React from 'react';
import { Save, Upload, AlertCircle, Loader2, X } from 'lucide-react';

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onChange: (data: ServiceFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ServiceFormData>;
  isLoading?: boolean;
}

export interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  currency: Currency;
  deliveryTime: string;
  thumbnail: File | null;
  visibleInCatalog: boolean;
}

type Currency = 'MXN' | 'USD' | 'COP' | 'CLP' | 'EUR';

const initialFormData: ServiceFormData = {
  name: '',
  description: '',
  category: '',
  basePrice: 0,
  currency: 'MXN',
  deliveryTime: '',
  thumbnail: null,
  visibleInCatalog: true
};

export default function ServiceForm({
  onSubmit,
  onChange,
  onCancel,
  initialData,
  isLoading = false
}: ServiceFormProps) {
  const [formData, setFormData] = React.useState<ServiceFormData>({
    ...initialFormData,
    ...initialData
  });
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image must be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }

      const newData = { ...formData, thumbnail: file };
      setFormData(newData);
      onChange(newData);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Service name is required');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }

    if (!formData.category) {
      setError('Category is required');
      return false;
    }

    if (formData.basePrice < 0) {
      setError('Base price must be 0 or greater');
      return false;
    }

    if (!formData.deliveryTime.trim()) {
      setError('Delivery time is required');
      return false;
    }

    setError(null);
    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
          <p className="text-red-500 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Service Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
            className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
          >
            <option value="">Select category</option>
            <option value="design">Design</option>
            <option value="development">Development</option>
            <option value="marketing">Marketing</option>
            <option value="consulting">Consulting</option>
            <option value="content">Content</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Base Price *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
              required
              className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
            />
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as Currency }))}
              className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
              <option value="COP">COP</option>
              <option value="CLP">CLP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Delivery Time */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Delivery Time *
          </label>
          <input
            type="text"
            value={formData.deliveryTime}
            onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
            required
            placeholder="e.g., 2-3 business days"
            className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
          />
        </div>
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
          rows={4}
          className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Thumbnail Image
        </label>
        <div className="flex items-center gap-4">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setFormData(prev => ({ ...prev, thumbnail: null }));
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#242424] text-gray-300 rounded-lg hover:text-white transition-colors"
            >
              <Upload className="h-5 w-5" />
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Maximum file size: 2MB. Supported formats: JPG, PNG
        </p>
      </div>

      {/* Visibility */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.visibleInCatalog}
            onChange={(e) => setFormData(prev => ({ ...prev, visibleInCatalog: e.target.checked }))}
            className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
          />
          <span className="text-gray-300">Visible in catalog</span>
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save Service
        </button>
      </div>
    </form>
  );
}