import React from 'react';
import ServiceForm, { ServiceFormData } from './ServiceForm';
import ServicePreview from './ServicePreview';
import { Share2, Save, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ServiceEditorProps {
  initialData?: Partial<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  editingId?: string | null;
}

export default function ServiceEditor({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  editingId
}: ServiceEditorProps) {
  const [formData, setFormData] = React.useState<ServiceFormData>({
    name: '',
    description: '',
    category: '',
    basePrice: 0,
    currency: 'MXN',
    deliveryTime: '',
    thumbnail: null,
    visibleInCatalog: true,
    ...initialData
  });
  const [previewMode, setPreviewMode] = React.useState(false);
  const [viewportMode, setViewportMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDraft, setIsDraft] = React.useState(!initialData?.visibleInCatalog);
  const [showShareNotification, setShowShareNotification] = React.useState(false);

  const handleFormChange = (newData: Partial<ServiceFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setError(null);
  };

  const handleSave = async (publish: boolean = false) => {
    try {
      setError(null);
      const updatedData = {
        ...formData,
        visibleInCatalog: publish
      };
      await onSubmit(updatedData);
      setIsDraft(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
    }
  };

  const handleShare = () => {
    // Generate unique preview URL
    const previewUrl = `${window.location.origin}/preview/services/${editingId || Date.now()}`;
    setPreviewUrl(previewUrl);
    
    // Copy to clipboard
    navigator.clipboard.writeText(previewUrl)
      .then(() => {
        setShowShareNotification(true);
        setTimeout(() => setShowShareNotification(false), 3000);
      })
      .catch(() => {
        setError('Failed to copy preview link');
      });
  };

  return (
    <div className={`h-[calc(100vh-12rem)] ${previewMode ? 'grid grid-cols-2 gap-6' : ''}`}>
      {/* Form Panel */}
      <div className={`bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden flex flex-col ${previewMode ? 'max-w-[50%]' : 'h-full'}`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Service Details</h3>
          <div className="flex items-center gap-2">
            {/* Preview Toggle */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`
                p-2 rounded-lg transition-colors
                ${previewMode
                  ? 'bg-[#96C881] text-white'
                  : 'text-gray-400 hover:text-white'}
              `}
              title={previewMode ? 'Hide Preview' : 'Show Preview'}
            >
              <Eye className="h-5 w-5" />
            </button>

            {/* Share Button & Notification */}
            <button
              onClick={handleShare}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
              title="Share preview link"
              disabled={!editingId}
            >
              <Share2 className="h-5 w-5" />
              {showShareNotification && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-[#96C881] text-white text-sm rounded-lg whitespace-nowrap flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Link copied!
                </div>
              )}
            </button>

            {/* Save Draft Button */}
            <button
              onClick={() => handleSave(false)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#242424] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isDraft ? (
                <Save className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {isDraft ? 'Save Draft' : 'Saved'}
            </button>

            {/* Publish/Unpublish Button */}
            <button
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isDraft ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
              {isDraft ? 'Publish' : 'Unpublish'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900/20 border-b border-red-900/50">
            <p className="text-red-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          <ServiceForm
            initialData={formData}
            onChange={handleFormChange}
            onSubmit={handleSave}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Preview Panel */}
      {previewMode && (
        <ServicePreview
          data={formData}
          viewportMode={viewportMode}
          onViewportChange={setViewportMode}
          className="flex-1"
        />
      )}
    </div>
  );
}