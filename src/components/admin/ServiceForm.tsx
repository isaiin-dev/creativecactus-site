import React from 'react';
import { X, Save, Upload, AlertCircle, Loader2 } from 'lucide-react';

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ServiceFormData>;
  isLoading?: boolean;
}

export interface ServiceFormData {
  name: string;
  description: string;
  category: ServiceCategory;
  basePrice: number;
  currency: Currency;
  deliveryTime: string;
  thumbnail: File | null;
  visibleInCatalog: boolean;
  categoryFields: CategoryFields;
}

type Currency = 'MXN' | 'USD' | 'COP' | 'CLP' | 'EUR';

type ServiceCategory = 
  | 'Network Management'
  | 'Graphic Design'
  | 'Web Development'
  | 'Video Marketing'
  | 'Advertising Campaigns'
  | 'Agency Memberships';

interface NetworkManagementFields {
  socialNetworks: ('Facebook' | 'Instagram' | 'TikTok' | 'Pinterest' | 'LinkedIn')[];
  numberOfDesigns: number;
  maximumVideos: number;
  includesReview: boolean;
  includesCampaigns: boolean;
}

interface GraphicDesignFields {
  designType: 'Logo' | 'Flyer' | 'Business Card' | 'Poster';
  deliveryFormat: ('Editable' | 'JPG' | 'PNG' | 'PDF')[];
}

interface WebDevelopmentFields {
  websiteType: 'Landing Page' | 'Informative' | 'WhatsApp E-commerce' | 'Payment Gateway E-commerce';
  numberOfPages: number;
  includesHosting: boolean;
  includesSSL: boolean;
  corporateEmailAccounts: number;
}

interface VideoMarketingFields {
  videoType: 'Basic' | 'Intermediate' | 'Complete';
  duration: number;
  format: 'Reels' | 'TikTok' | 'YouTube';
  includesNarration: boolean;
}

interface AdvertisingCampaignsFields {
  platform: 'Google Ads' | 'Facebook Ads' | 'Instagram Ads' | 'TikTok Ads';
  campaignType: 'Search' | 'Display' | 'YouTube';
  campaignDuration: number;
}

type CategoryFields = 
  | NetworkManagementFields 
  | GraphicDesignFields 
  | WebDevelopmentFields 
  | VideoMarketingFields 
  | AdvertisingCampaignsFields;

const initialFormData: ServiceFormData = {
  name: '',
  description: '',
  category: 'Network Management',
  basePrice: 0,
  currency: 'MXN',
  deliveryTime: '',
  thumbnail: null,
  visibleInCatalog: true,
  categoryFields: {
    socialNetworks: [],
    numberOfDesigns: 0,
    maximumVideos: 0,
    includesReview: false,
    includesCampaigns: false
  } as NetworkManagementFields
};

export default function ServiceForm({
  onSubmit,
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

  const handleCategoryChange = (category: ServiceCategory) => {
    let defaultFields: CategoryFields;

    switch (category) {
      case 'Network Management':
        defaultFields = {
          socialNetworks: [],
          numberOfDesigns: 0,
          maximumVideos: 0,
          includesReview: false,
          includesCampaigns: false
        } as NetworkManagementFields;
        break;
      case 'Graphic Design':
        defaultFields = {
          designType: 'Logo',
          deliveryFormat: []
        } as GraphicDesignFields;
        break;
      case 'Web Development':
        defaultFields = {
          websiteType: 'Landing Page',
          numberOfPages: 1,
          includesHosting: false,
          includesSSL: false,
          corporateEmailAccounts: 0
        } as WebDevelopmentFields;
        break;
      case 'Video Marketing':
        defaultFields = {
          videoType: 'Basic',
          duration: 30,
          format: 'Reels',
          includesNarration: false
        } as VideoMarketingFields;
        break;
      case 'Advertising Campaigns':
        defaultFields = {
          platform: 'Google Ads',
          campaignType: 'Search',
          campaignDuration: 30
        } as AdvertisingCampaignsFields;
        break;
      default:
        defaultFields = {} as CategoryFields;
    }

    setFormData(prev => ({
      ...prev,
      category,
      categoryFields: defaultFields
    }));
  };

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

      setFormData(prev => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
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

    if (formData.basePrice <= 0) {
      setError('Base price must be greater than 0');
      return false;
    }

    if (!formData.deliveryTime.trim()) {
      setError('Delivery time is required');
      return false;
    }

    if (!formData.thumbnail && !initialData?.thumbnail) {
      setError('Thumbnail image is required');
      return false;
    }

    // Validate category-specific fields
    switch (formData.category) {
      case 'Network Management': {
        const fields = formData.categoryFields as NetworkManagementFields;
        if (fields.socialNetworks.length === 0) {
          setError('At least one social network must be selected');
          return false;
        }
        if (fields.numberOfDesigns < 0) {
          setError('Number of designs must be 0 or greater');
          return false;
        }
        if (fields.maximumVideos < 0) {
          setError('Maximum videos must be 0 or greater');
          return false;
        }
        break;
      }
      case 'Graphic Design': {
        const fields = formData.categoryFields as GraphicDesignFields;
        if (fields.deliveryFormat.length === 0) {
          setError('At least one delivery format must be selected');
          return false;
        }
        break;
      }
      case 'Web Development': {
        const fields = formData.categoryFields as WebDevelopmentFields;
        if (fields.numberOfPages <= 0) {
          setError('Number of pages must be greater than 0');
          return false;
        }
        break;
      }
      case 'Video Marketing': {
        const fields = formData.categoryFields as VideoMarketingFields;
        if (fields.duration <= 0) {
          setError('Video duration must be greater than 0');
          return false;
        }
        break;
      }
      case 'Advertising Campaigns': {
        const fields = formData.categoryFields as AdvertisingCampaignsFields;
        if (fields.campaignDuration <= 0) {
          setError('Campaign duration must be greater than 0');
          return false;
        }
        break;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const renderCategoryFields = () => {
    switch (formData.category) {
      case 'Network Management':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Social Networks *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Facebook', 'Instagram', 'TikTok', 'Pinterest', 'LinkedIn'].map(network => (
                  <label key={network} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(formData.categoryFields as NetworkManagementFields).socialNetworks.includes(network as any)}
                      onChange={(e) => {
                        const fields = formData.categoryFields as NetworkManagementFields;
                        setFormData(prev => ({
                          ...prev,
                          categoryFields: {
                            ...fields,
                            socialNetworks: e.target.checked
                              ? [...fields.socialNetworks, network as any]
                              : fields.socialNetworks.filter(n => n !== network)
                          }
                        }));
                      }}
                      className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
                    />
                    <span className="text-gray-300">{network}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Number of Designs
                </label>
                <input
                  type="number"
                  min="0"
                  value={(formData.categoryFields as NetworkManagementFields).numberOfDesigns}
                  onChange={(e) => {
                    const fields = formData.categoryFields as NetworkManagementFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        numberOfDesigns: parseInt(e.target.value) || 0
                      }
                    }));
                  }}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Maximum Videos
                </label>
                <input
                  type="number"
                  min="0"
                  value={(formData.categoryFields as NetworkManagementFields).maximumVideos}
                  onChange={(e) => {
                    const fields = formData.categoryFields as NetworkManagementFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        maximumVideos: parseInt(e.target.value) || 0
                      }
                    }));
                  }}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData.categoryFields as NetworkManagementFields).includesReview}
                  onChange={(e) => {
                    const fields = formData.categoryFields as NetworkManagementFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        includesReview: e.target.checked
                      }
                    }));
                  }}
                  className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
                />
                <span className="text-gray-300">Includes Review</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData.categoryFields as NetworkManagementFields).includesCampaigns}
                  onChange={(e) => {
                    const fields = formData.categoryFields as NetworkManagementFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        includesCampaigns: e.target.checked
                      }
                    }));
                  }}
                  className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
                />
                <span className="text-gray-300">Includes Campaigns</span>
              </label>
            </div>
          </div>
        );

      case 'Graphic Design':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Design Type *
              </label>
              <select
                value={(formData.categoryFields as GraphicDesignFields).designType}
                onChange={(e) => {
                  const fields = formData.categoryFields as GraphicDesignFields;
                  setFormData(prev => ({
                    ...prev,
                    categoryFields: {
                      ...fields,
                      designType: e.target.value as GraphicDesignFields['designType']
                    }
                  }));
                }}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              >
                <option value="Logo">Logo</option>
                <option value="Flyer">Flyer</option>
                <option value="Business Card">Business Card</option>
                <option value="Poster">Poster</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Format *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Editable', 'JPG', 'PNG', 'PDF'].map(format => (
                  <label key={format} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(formData.categoryFields as GraphicDesignFields).deliveryFormat.includes(format as any)}
                      onChange={(e) => {
                        const fields = formData.categoryFields as GraphicDesignFields;
                        setFormData(prev => ({
                          ...prev,
                          categoryFields: {
                            ...fields,
                            deliveryFormat: e.target.checked
                              ? [...fields.deliveryFormat, format as any]
                              : fields.deliveryFormat.filter(f => f !== format)
                          }
                        }));
                      }}
                      className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
                    />
                    <span className="text-gray-300">{format}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Web Development':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Website Type *
              </label>
              <select
                value={(formData.categoryFields as WebDevelopmentFields).websiteType}
                onChange={(e) => {
                  const fields = formData.categoryFields as WebDevelopmentFields;
                  setFormData(prev => ({
                    ...prev,
                    categoryFields: {
                      ...fields,
                      websiteType: e.target.value as WebDevelopmentFields['websiteType']
                    }
                  }));
                }}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              >
                <option value="Landing Page">Landing Page</option>
                <option value="Informative">Informative</option>
                <option value="WhatsApp E-commerce">WhatsApp E-commerce</option>
                <option value="Payment Gateway E-commerce">Payment Gateway E-commerce</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Number of Pages *
                </label>
                <input
                  type="number"
                  min="1"
                  value={(formData.categoryFields as WebDevelopmentFields).numberOfPages}
                  onChange={(e) => {
                    const fields = formData.categoryFields as WebDevelopmentFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        numberOfPages: parseInt(e.target.value) || 1
                      }
                    }));
                  }}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Corporate Email Accounts
                </label>
                <input
                  type="number"
                  min="0"
                  value={(formData.categoryFields as WebDevelopmentFields).corporateEmailAccounts}
                  onChange={(e) => {
                    const fields = formData.categoryFields as WebDevelopmentFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        corporateEmailAccounts: parseInt(e.target.value) || 0
                      }
                    }));
                  }}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData.categoryFields as WebDevelopmentFields).includesHosting}
                  onChange={(e) => {
                    const fields = formData.categoryFields as WebDevelopmentFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        includesHosting: e.target.checked
                      }
                    }));
                  }}
                  className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
                />
                <span className="text-gray-300">Includes Hosting</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData.categoryFields as WebDevelopmentFields).includesSSL}
                  onChange={(e) => {
                    const fields = formData.categoryFields as WebDevelopmentFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        includesSSL: e.target.checked
                      }
                    }));
                  }}
                  className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
                />
                <span className="text-gray-300">Includes SSL</span>
              </label>
            </div>
          </div>
        );

      case 'Video Marketing':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Video Type *
              </label>
              <select
                value={(formData.categoryFields as VideoMarketingFields).videoType}
                onChange={(e) => {
                  const fields = formData.categoryFields as VideoMarketingFields;
                  setFormData(prev => ({
                    ...prev,
                    categoryFields: {
                      ...fields,
                      videoType: e.target.value as VideoMarketingFields['videoType']
                    }
                  }));
                }}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              >
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Complete">Complete</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Duration (seconds) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={(formData.categoryFields as VideoMarketingFields).duration}
                  onChange={(e) => {
                    const fields = formData.categoryFields as VideoMarketingFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        duration: parseInt(e.target.value) || 30
                      }
                    }));
                  }}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Format *
                </label>
                <select
                  value={(formData.categoryFields as VideoMarketingFields).format}
                  onChange={(e) => {
                    const fields = formData.categoryFields as VideoMarketingFields;
                    setFormData(prev => ({
                      ...prev,
                      categoryFields: {
                        ...fields,
                        format: e.target.value as VideoMarketingFields['format']
                      }
                    }));
                  }}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                >
                  <option value="Reels">Reels</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formData.categoryFields as VideoMarketingFields).includesNarration}
                onChange={(e) => {
                  const fields = formData.categoryFields as VideoMarketingFields;
                  setFormData(prev => ({
                    ...prev,
                    categoryFields: {
                      ...fields,
                      includesNarration: e.target.checked
                    }
                  }));
                }}
                className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
              />
              <span className="text-gray-300">Includes Narration</span>
            </label>
          </div>
        );

      case 'Advertising Campaigns':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Platform *
              </label>
              <select
                value={(formData.categoryFields as AdvertisingCampaignsFields).platform}
                onChange={(e) => {
                  const fields = formData.categoryFields as AdvertisingCampaignsFields;
                  setFormData(prev => ({
                    ...prev,
                    categoryFields: {
                      ...fields,
                      platform: e.target.value as AdvertisingCampaignsFields['platform']
                    }
                  }));
                }}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              >
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Instagram Ads">Instagram Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Campaign Type *
              </label>
              <select
                value={(formData.categoryFields as AdvertisingCampaignsFields).campaignType}
                onChange={(e) => {
                  const fields = formData.categoryFields as AdvertisingCampaignsFields;
                  setFormData(prev => ({
                    ...prev,
                    categoryFields: {
                      ...fields,
                      campaignType: e.target.value as AdvertisingCampaignsFields['campaignType']
                    }
                  }));
                }}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              >
                <option value="Search">Search</option>
                <option value="Display">Display</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Campaign Duration (days) *
              </label>
              <input
                type="number"
                min="1"
                value={(formData.categoryFields as AdvertisingCampaignsFields).campaignDuration}
                onChange={(e) => {
                  const fields = formData.categoryFields as AdvertisingCampaignsFields;
                  setFormData(prev => ({
                    ...prev,
                    categoryFields: {
                      ...fields,
                      campaignDuration: parseInt(e.target.value) || 30
                    }
                  }));
                }}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
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

      {/* Base Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Service Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleCategoryChange(e.target.value as ServiceCategory)}
            required
            className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
          >
            <option value="Network Management">Network Management</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Web Development">Web Development</option>
            <option value="Video Marketing">Video Marketing</option>
            <option value="Advertising Campaigns">Advertising Campaigns</option>
            <option value="Agency Memberships">Agency Memberships</option>
          </select>
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Delivery Time *
          </label>
          <input
            type="text"
            value={formData.deliveryTime}
            onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
            required
            placeholder="e.g., 5-7 business days"
            className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Thumbnail Image *
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
              <div className="w-20 h-20 bg-[#242424] rounded-lg flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#242424] text-gray-300 rounded-lg hover:text-white transition-colors"
              >
                Choose Image
              </button>
              <p className="mt-1 text-xs text-gray-400">
                Max size: 2MB. Formats: JPG, PNG
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.visibleInCatalog}
              onChange={(e) => setFormData(prev => ({ ...prev, visibleInCatalog: e.target.checked }))}
              className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
            />
            <span className="text-gray-300">Visible in Catalog</span>
          </label>
        </div>
      </div>

      {/* Category-specific Fields */}
      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Category-specific Details
        </h3>
        {renderCategoryFields()}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
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