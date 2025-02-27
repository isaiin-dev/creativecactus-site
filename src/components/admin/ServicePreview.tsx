import React from 'react';
import { ServiceFormData } from './ServiceForm';
import { Laptop, Smartphone } from 'lucide-react';

interface ServicePreviewProps {
  data: ServiceFormData;
  viewportMode: 'desktop' | 'mobile';
  onViewportChange: (mode: 'desktop' | 'mobile') => void;
  className?: string;
}

export default function ServicePreview({
  data,
  viewportMode,
  onViewportChange,
  className = ''
}: ServicePreviewProps) {
  return (
    <div className={`bg-[#1a1a1a] rounded-lg border border-gray-800 h-full flex flex-col ${className}`}>
      {/* Preview Controls */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Live Preview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewportChange('desktop')}
            className={`p-2 rounded-lg transition-colors ${
              viewportMode === 'desktop'
                ? 'bg-[#96C881] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Desktop view"
          >
            <Laptop className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewportChange('mobile')}
            className={`p-2 rounded-lg transition-colors ${
              viewportMode === 'mobile'
                ? 'bg-[#96C881] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Mobile view"
          >
            <Smartphone className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div 
          className={`mx-auto transition-all duration-300 ${
            viewportMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
          }`}
        >
          <div className="bg-[#242424] rounded-2xl overflow-hidden shadow-lg">
            {/* Service Image */}
            {data.thumbnail ? (
              <div className="aspect-video w-full bg-[#1a1a1a] relative">
                <img
                  src={URL.createObjectURL(data.thumbnail)}
                  alt={data.name}
                  className="w-full h-full object-cover transition-opacity"
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '1';
                  }}
                  style={{ opacity: 0 }}
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-[#1a1a1a] flex items-center justify-center">
                <span className="text-gray-500">No image selected</span>
              </div>
            )}

            {/* Service Content */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {data.name || 'Service Name'}
                  </h3>
                  <p className="text-sm text-gray-400 capitalize">
                    {data.category || 'Category'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#96C881]">
                    {data.basePrice > 0 ? (
                      <>
                        {data.currency} {data.basePrice.toLocaleString()}
                      </>
                    ) : (
                      'Price not set'
                    )}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {data.deliveryTime || 'Delivery time not set'}
                  </p>
                </div>
              </div>

              <div className="mt-6 prose prose-invert">
                <p className="text-gray-300">
                  {data.description || 'No description provided'}
                </p>
              </div>

              {/* Status Badge */}
              <div className="mt-8 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    data.visibleInCatalog
                      ? 'bg-[#96C881]/20 text-[#96C881]'
                      : 'bg-gray-700/20 text-gray-400'
                  }`}
                >
                  {data.visibleInCatalog ? 'Active' : 'Hidden'}
                </span>
                <span className="text-sm text-gray-500">
                  {viewportMode === 'mobile' ? 'Mobile View' : 'Desktop View'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}