import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  GripVertical,
  Image as ImageIcon,
  Globe,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { HeaderData, defaultHeaderData, initializeHeaderIfNeeded } from '../../lib/firebase';

interface HeaderEditorProps {
  data?: HeaderData;
  onChange: (data: HeaderData) => void;
  onSave: () => void;
  previewMode?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  isExternal?: boolean;
}

const defaultNavItem: NavItem = {
  id: '',
  label: '',
  path: '',
  isExternal: false
};

export default function HeaderEditor({ 
  data, 
  onChange,
  onSave,
  previewMode = false 
}: HeaderEditorProps) {
  const [headerData, setHeaderData] = React.useState<HeaderData>(defaultHeaderData);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { t } = useTranslation();
  const [editingNavItem, setEditingNavItem] = React.useState<NavItem | null>(null);
  const [showNavItemForm, setShowNavItemForm] = React.useState(false);
  const [logoUploadError, setLogoUploadError] = React.useState<string | null>(null);

  // Initialize header data with defaults or provided data
  React.useEffect(() => {
    if (data) {
      setHeaderData({
        ...defaultHeaderData,
        ...data,
        navigation: data.navigation || defaultHeaderData.navigation
      });
    }
    setLoading(false);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-[#96C881] animate-spin" />
      </div>
    );
  }

  const handleChange = (newData: HeaderData) => {
    setHeaderData(newData);
    onChange(newData);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setLogoUploadError('Logo image must be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setLogoUploadError('File must be an image');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange({
          ...headerData,
          logo: {
            ...headerData.logo,
            url: reader.result as string
          }
        });
        setLogoUploadError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNavItemChange = (item: NavItem) => {
    if (editingNavItem) {
      const updatedNav = headerData.navigation.map(nav => 
        nav.id === editingNavItem.id ? item : nav
      );
      handleChange({ ...headerData, navigation: updatedNav });
    } else {
      handleChange({
        ...headerData,
        navigation: [...headerData.navigation, { ...item, id: Date.now().toString() }]
      });
    }
    setShowNavItemForm(false);
    setEditingNavItem(null);
  };

  const handleNavItemDelete = (id: string) => {
    handleChange({
      ...headerData,
      navigation: headerData.navigation.filter(item => item.id !== id)
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(headerData.navigation);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    handleChange({ ...headerData, navigation: items });
  };

  if (previewMode) {
    return (
      <div className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src={headerData.logo?.url || '/logo.png'}
                alt={headerData.logo.alt}
                className="h-8 w-auto"
              />
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              {headerData.navigation.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  className="text-gray-300 hover:text-[#E4656E] transition-colors"
                >
                  {item.label}
                </a>
              ))}
              {headerData.showLanguageSwitcher && (
                <button className="flex items-center space-x-1 px-3 py-1 rounded-full border border-gray-700 text-gray-300">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">EN</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Logo</h3>
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {headerData.logo?.url ? (
              <div className="relative">
                <img
                  src={headerData.logo.url}
                  alt={headerData.logo.alt}
                  className="h-16 w-auto rounded-lg"
                />
                <button
                  onClick={() => handleChange({ ...headerData, logo: { url: '', alt: '' } })}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="h-16 w-16 bg-[#242424] rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Logo Image
              </label>
              <input
                type="file"
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#242424] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <ImageIcon className="h-5 w-5" />
                Choose Logo
              </label>
              {logoUploadError && (
                <p className="mt-1 text-sm text-red-500">{logoUploadError}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={headerData.logo?.alt || ''}
                onChange={(e) => handleChange({
                  ...headerData,
                  logo: { ...headerData.logo, alt: e.target.value }
                })}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                placeholder="Enter alt text for logo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Navigation</h3>
          <button
            onClick={() => {
              setEditingNavItem(null);
              setShowNavItemForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Link
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="nav-items">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {headerData.navigation.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-[#242424] rounded-lg p-4 flex items-center gap-4"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="text-gray-400 hover:text-white transition-colors cursor-move"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{item.label}</h4>
                          <p className="text-sm text-gray-400">{item.path}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {item.isExternal && (
                            <LinkIcon className="h-4 w-4 text-gray-400" />
                          )}
                          <button
                            onClick={() => {
                              setEditingNavItem(item);
                              setShowNavItemForm(true);
                            }}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleNavItemDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
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

      {/* Settings Section */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={headerData.showLanguageSwitcher}
              onChange={(e) => handleChange({
                ...headerData,
                showLanguageSwitcher: e.target.checked
              })}
              className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
            />
            <span className="text-gray-300">Show Language Switcher</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={headerData.showAdminPortal}
              onChange={(e) => handleChange({
                ...headerData,
                showAdminPortal: e.target.checked
              })}
              className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
            />
            <span className="text-gray-300">Show Admin Portal Link</span>
          </label>
        </div>
      </div>

      {/* Navigation Item Form Modal */}
      {showNavItemForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingNavItem ? 'Edit Navigation Link' : 'Add Navigation Link'}
              </h2>
              <button
                onClick={() => {
                  setShowNavItemForm(false);
                  setEditingNavItem(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleNavItemChange({
                  id: editingNavItem?.id || '',
                  label: formData.get('label') as string,
                  path: formData.get('path') as string,
                  isExternal: formData.get('isExternal') === 'true'
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  name="label"
                  defaultValue={editingNavItem?.label}
                  required
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Path
                </label>
                <input
                  type="text"
                  name="path"
                  defaultValue={editingNavItem?.path}
                  required
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isExternal"
                  value="true"
                  defaultChecked={editingNavItem?.isExternal}
                  className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
                />
                <span className="text-gray-300">Open in new tab</span>
              </label>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowNavItemForm(false);
                    setEditingNavItem(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
                >
                  {editingNavItem ? 'Save Changes' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}