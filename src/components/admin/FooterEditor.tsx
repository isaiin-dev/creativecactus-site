import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Image as ImageIcon,
  GripVertical,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  X,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Copyright,
  Scale
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FooterData, FooterSection, FooterLink, SocialLink, defaultFooterData } from '../../lib/firebase';

interface FooterEditorProps {
  data?: FooterData;
  onChange: (data: FooterData) => void;
  onSave: () => void;
  previewMode?: boolean;
}

interface SectionFormData {
  title: string;
  links: FooterLink[];
}

interface LinkFormData {
  label: string;
  path: string;
  isExternal: boolean;
  status: 'active' | 'inactive';
}

const initialLinkFormData: LinkFormData = {
  label: '',
  path: '',
  isExternal: false,
  status: 'active'
};

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin
};

export default function FooterEditor({
  data,
  onChange,
  onSave,
  previewMode = false
}: FooterEditorProps) {
  const [footerData, setFooterData] = React.useState<FooterData>(defaultFooterData);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLinkFormOpen, setIsLinkFormOpen] = React.useState(false);
  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = React.useState<string | null>(null);
  const [linkFormData, setLinkFormData] = React.useState<LinkFormData>(initialLinkFormData);
  const [editingLinkType, setEditingLinkType] = React.useState<'section' | 'legal' | null>(null);
  const [isSocialFormOpen, setIsSocialFormOpen] = React.useState(false);
  const [editingSocialId, setEditingSocialId] = React.useState<string | null>(null);

  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize footer data with defaults or provided data
  React.useEffect(() => {
    if (data) {
      setFooterData({
        ...defaultFooterData,
        ...data
      });
    }
    setLoading(false);
  }, [data]);

  const handleChange = (newData: FooterData) => {
    setFooterData(newData);
    onChange(newData);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('/') ? `http://example.com${url}` : url);
      return true;
    } catch {
      return false;
    }
  };

  const validateLink = (link: LinkFormData): boolean => {
    if (!link.label.trim()) {
      setError('Link label is required');
      return false;
    }

    if (!link.path.trim()) {
      setError('Link path is required');
      return false;
    }

    if (!validateUrl(link.path)) {
      setError('Invalid URL format');
      return false;
    }

    setError(null);
    return true;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Logo image must be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange({
          ...footerData,
          logo: {
            ...footerData.logo,
            url: reader.result as string
          }
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLink(linkFormData)) {
      return;
    }

    if (editingLinkType === 'section' && editingSectionId) {
      const newLinks = editingLinkId ?
        footerData.sections
          .find(s => s.id === editingSectionId)?.links
          .map(link => link.id === editingLinkId ? {
            ...link,
            ...linkFormData
          } : link) || [] :
        [...(footerData.sections.find(s => s.id === editingSectionId)?.links || []), {
          id: Date.now().toString(),
          ...linkFormData,
          order: footerData.sections.find(s => s.id === editingSectionId)?.links.length || 0
        }];

      handleChange({
        ...footerData,
        sections: footerData.sections.map(section =>
          section.id === editingSectionId ? {
            ...section,
            links: newLinks
          } : section
        )
      });
    } else if (editingLinkType === 'legal') {
      const newLinks = editingLinkId ?
        footerData.legalLinks.map(link =>
          link.id === editingLinkId ? {
            ...link,
            ...linkFormData
          } : link
        ) :
        [...footerData.legalLinks, {
          id: Date.now().toString(),
          ...linkFormData,
          order: footerData.legalLinks.length
        }];

      handleChange({
        ...footerData,
        legalLinks: newLinks
      });
    }

    resetLinkForm();
  };

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const platform = (document.getElementById('platform') as HTMLSelectElement).value as SocialLink['platform'];
    const url = (document.getElementById('socialUrl') as HTMLInputElement).value;
    const status = (document.getElementById('socialStatus') as HTMLSelectElement).value as 'active' | 'inactive';

    if (!validateUrl(url)) {
      setError('Invalid social media URL');
      return;
    }

    const newSocial = editingSocialId ?
      footerData.social.map(link =>
        link.id === editingSocialId ? {
          ...link,
          platform,
          url,
          status
        } : link
      ) :
      [...footerData.social, {
        id: Date.now().toString(),
        platform,
        url,
        status,
        order: footerData.social.length
      }];

    handleChange({
      ...footerData,
      social: newSocial
    });

    resetSocialForm();
  };

  const handleDeleteLink = (sectionId: string | null, linkId: string) => {
    if (!window.confirm('Are you sure you want to delete this link?')) {
      return;
    }

    if (sectionId) {
      handleChange({
        ...footerData,
        sections: footerData.sections.map(section =>
          section.id === sectionId ? {
            ...section,
            links: section.links.filter(link => link.id !== linkId)
          } : section
        )
      });
    } else {
      handleChange({
        ...footerData,
        legalLinks: footerData.legalLinks.filter(link => link.id !== linkId)
      });
    }
  };

  const handleDeleteSocial = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this social link?')) {
      return;
    }

    handleChange({
      ...footerData,
      social: footerData.social.filter(link => link.id !== id)
    });
  };

  const resetLinkForm = () => {
    setLinkFormData(initialLinkFormData);
    setEditingLinkId(null);
    setEditingSectionId(null);
    setEditingLinkType(null);
    setIsLinkFormOpen(false);
    setError(null);
  };

  const resetSocialForm = () => {
    setEditingSocialId(null);
    setIsSocialFormOpen(false);
    setError(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;

    if (sourceId === 'sections') {
      const items = Array.from(footerData.sections);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      handleChange({
        ...footerData,
        sections: items.map((item, index) => ({ ...item, order: index }))
      });
    } else if (sourceId === 'social') {
      const items = Array.from(footerData.social);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      handleChange({
        ...footerData,
        social: items.map((item, index) => ({ ...item, order: index }))
      });
    } else if (sourceId === 'legal') {
      const items = Array.from(footerData.legalLinks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      handleChange({
        ...footerData,
        legalLinks: items.map((item, index) => ({ ...item, order: index }))
      });
    } else {
      // Section links
      const sectionId = sourceId.replace('section-', '');
      const section = footerData.sections.find(s => s.id === sectionId);
      if (section) {
        const items = Array.from(section.links);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        handleChange({
          ...footerData,
          sections: footerData.sections.map(s =>
            s.id === sectionId ? {
              ...s,
              links: items.map((item, index) => ({ ...item, order: index }))
            } : s
          )
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-[#96C881] animate-spin" />
      </div>
    );
  }

  if (previewMode) {
    return (
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div>
              {footerData.logo.url && (
                <img
                  src={footerData.logo.url}
                  alt={footerData.logo.alt}
                  className="h-8 w-auto mb-4"
                />
              )}
              <p className="text-gray-400">
                {footerData.description}
              </p>
            </div>
            
            {/* Navigation Sections */}
            {footerData.sections.map(section => (
              <div key={section.id}>
                <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links
                    .filter(link => link.status === 'active')
                    .sort((a, b) => a.order - b.order)
                    .map(link => (
                      <li key={link.id}>
                        <a
                          href={link.path}
                          target={link.isExternal ? '_blank' : undefined}
                          rel={link.isExternal ? 'noopener noreferrer' : undefined}
                          className="text-gray-400 hover:text-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}

            {/* Contact Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4 mb-4">
                {footerData.social
                  .filter(link => link.status === 'active')
                  .sort((a, b) => a.order - b.order)
                  .map(link => {
                    const Icon = socialIcons[link.platform];
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        className="text-gray-400 hover:text-white"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon className="h-6 w-6" />
                      </a>
                    );
                  })}
              </div>
              <div className="space-y-2 text-gray-400">
                <p>Email: {footerData.contact.email}</p>
                <p>Phone: {footerData.contact.phone}</p>
                {footerData.contact.address && (
                  <p>{footerData.contact.address}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">
                {footerData.copyright}
              </p>
              <div className="mt-4 md:mt-0">
                {footerData.legalLinks
                  .filter(link => link.status === 'active')
                  .sort((a, b) => a.order - b.order)
                  .map(link => (
                    <a
                      key={link.id}
                      href={link.path}
                      className="text-gray-400 hover:text-white mx-3"
                    >
                      {link.label}
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
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

      {/* Brand Section */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Brand</h3>
        <div className="space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Logo
            </label>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {footerData.logo.url ? (
                  <div className="relative">
                    <img
                      src={footerData.logo.url}
                      alt={footerData.logo.alt}
                      className="h-16 w-auto rounded-lg"
                    />
                    <button
                      onClick={() => handleChange({
                        ...footerData,
                        logo: { url: '', alt: '' }
                      })}
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
                  <input
                    type="file"
                    ref={fileInputRef}
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={footerData.logo.alt}
                    onChange={(e) => handleChange({
                      ...footerData,
                      logo: { ...footerData.logo, alt: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    placeholder="Enter alt text for logo"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={footerData.description}
              onChange={(e) => handleChange({
                ...footerData,
                description: e.target.value
              })}
              rows={3}
              className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-white">Navigation Sections</h3>
          <button
            onClick={() => {
              const newSection: FooterSection = {
                id: Date.now().toString(),
                title: 'New Section',
                links: [],
                order: footerData.sections.length
              };
              handleChange({
                ...footerData,
                sections: [...footerData.sections, newSection]
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Section
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-6"
              >
                {footerData.sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-[#242424] rounded-lg p-4"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            {...provided.dragHandleProps}
                            className="text-gray-400 hover:text-white transition-colors cursor-move"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>

                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => handleChange({
                              ...footerData,
                              sections: footerData.sections.map(s =>
                                s.id === section.id ? {
                                  ...s,
                                  title: e.target.value
                                } : s
                              )
                            })}
                            className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                          />

                          <button
                            onClick={() => {
                              setEditingSectionId(section.id);
                              setEditingLinkType('section');
                              setIsLinkFormOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-gray-300 rounded-lg hover:text-white transition-colors"
                          >
                            <Plus className="h-5 w-5" />
                            Add Link
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this section?')) {
                                handleChange({
                                  ...footerData,
                                  sections: footerData.sections.filter(s => s.id !== section.id)
                                });
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <Droppable droppableId={`section-${section.id}`}>
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-2"
                            >
                              {section.links
                                .sort((a, b) => a.order - b.order)
                                .map((link, linkIndex) => (
                                  <Draggable
                                    key={link.id}
                                    draggableId={`${section.id}-${link.id}`}
                                    index={linkIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="flex items-center gap-4 p-2 bg-[#1a1a1a] rounded-lg"
                                      >
                                        <div
                                          {...provided.dragHandleProps}
                                          className="text-gray-400 hover:text-white transition-colors cursor-move"
                                        >
                                          <GripVertical className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-white">
                                              {link.label}
                                            </span>
                 ```
                                            {link.isExternal && (
                                              <LinkIcon className="h-3 w-3 text-gray-400" />
                                            )}
                                          </div>
                                          <span className="text-sm text-gray-400">
                                            {link.path}
                                          </span>
                                        </div>

                                        {link.status === 'active' ? (
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
                                          onClick={() => {
                                            setEditingSectionId(section.id);
                                            setEditingLinkId(link.id);
                                            setEditingLinkType('section');
                                            setLinkFormData({
                                              label: link.label,
                                              path: link.path,
                                              isExternal: link.isExternal || false,
                                              status: link.status
                                            });
                                            setIsLinkFormOpen(true);
                                          }}
                                          className="p-2 text-gray-400 hover:text-white transition-colors"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </button>

                                        <button
                                          onClick={() => handleDeleteLink(section.id, link.id)}
                                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
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

      {/* Social Links */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-white">Social Links</h3>
          <button
            onClick={() => setIsSocialFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Social Link
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="social">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {footerData.social
                  .sort((a, b) => a.order - b.order)
                  .map((link, index) => {
                    const Icon = socialIcons[link.platform];
                    return (
                      <Draggable
                        key={link.id}
                        draggableId={link.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-4 p-4 bg-[#242424] rounded-lg"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="text-gray-400 hover:text-white transition-colors cursor-move"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>

                            <div className="p-2 bg-[#1a1a1a] rounded-lg">
                              <Icon className="h-6 w-6 text-[#96C881]" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white capitalize">
                                  {link.platform}
                                </span>
                              </div>
                              <span className="text-sm text-gray-400">
                                {link.url}
                              </span>
                            </div>

                            {link.status === 'active' ? (
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
                              onClick={() => {
                                setEditingSocialId(link.id);
                                setIsSocialFormOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>

                            <button
                              onClick={() => handleDeleteSocial(link.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
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
      </div>

      {/* Contact Information */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={footerData.contact.email}
                onChange={(e) => handleChange({
                  ...footerData,
                  contact: { ...footerData.contact, email: e.target.value }
                })}
                className="w-full pl-10 pr-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={footerData.contact.phone}
                onChange={(e) => handleChange({
                  ...footerData,
                  contact: { ...footerData.contact, phone: e.target.value }
                })}
                className="w-full pl-10 pr-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Address (Optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={footerData.contact.address || ''}
                onChange={(e) => handleChange({
                  ...footerData,
                  contact: { ...footerData.contact, address: e.target.value }
                })}
                className="w-full pl-10 pr-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legal Section */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-white">Legal</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setEditingLinkType('legal');
                setIsLinkFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Legal Link
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Copyright */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Copyright Text
            </label>
            <div className="relative">
              <Copyright className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={footerData.copyright}
                onChange={(e) => handleChange({
                  ...footerData,
                  copyright: e.target.value
                })}
                className="w-full pl-10 pr-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Legal Links</h4>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="legal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {footerData.legalLinks
                      .sort((a, b) => a.order - b.order)
                      .map((link, index) => (
                        <Draggable
                          key={link.id}
                          draggableId={link.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-4 p-4 bg-[#242424] rounded-lg"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="text-gray-400 hover:text-white transition-colors cursor-move"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>

                              <div className="p-2 bg-[#1a1a1a] rounded-lg">
                                <Scale className="h-5 w-5 text-[#96C881]" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-white">
                                    {link.label}
                                  </span>
                                  {link.isExternal && (
                                    <LinkIcon className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-400">
                                  {link.path}
                                </span>
                              </div>

                              {link.status === 'active' ? (
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
                                onClick={() => {
                                  setEditingLinkId(link.id);
                                  setEditingLinkType('legal');
                                  setLinkFormData({
                                    label: link.label,
                                    path: link.path,
                                    isExternal: link.isExternal || false,
                                    status: link.status
                                  });
                                  setIsLinkFormOpen(true);
                                }}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteLink(null, link.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
        </div>
      </div>

      {/* Link Form Modal */}
      {isLinkFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingLinkId ? 'Edit Link' : 'Add New Link'}
              </h2>
              <button
                onClick={resetLinkForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLinkSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  value={linkFormData.label}
                  onChange={(e) => setLinkFormData(prev => ({
                    ...prev,
                    label: e.target.value
                  }))}
                  required
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Path *
                </label>
                <input
                  type="text"
                  value={linkFormData.path}
                  onChange={(e) => setLinkFormData(prev => ({
                    ...prev,
                    path: e.target.value
                  }))}
                  required
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={linkFormData.isExternal}
                    onChange={(e) => setLinkFormData(prev => ({
                      ...prev,
                      isExternal: e.target.checked
                    }))}
                    className="w-4 h-4 bg-[#242424] border-gray-700 rounded focus:ring-[#96C881]"
                  />
                  <span className="text-gray-300">Open in new tab</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={linkFormData.status}
                    onChange={(e) => setLinkFormData(prev => ({
                      ...prev,
                      status: e.target.value as 'active' | 'inactive'
                    }))}
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
                  onClick={resetLinkForm}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
                >
                  <Save className="h-5 w-5" />
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Form Modal */}
      {isSocialFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingSocialId ? 'Edit Social Link' : 'Add Social Link'}
              </h2>
              <button
                onClick={resetSocialForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSocialSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Platform *
                </label>
                <select
                  id="platform"
                  defaultValue={editingSocialId ? 
                    footerData.social.find(s => s.id === editingSocialId)?.platform :
                    'facebook'
                  }
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                >
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  id="socialUrl"
                  defaultValue={editingSocialId ?
                    footerData.social.find(s => s.id === editingSocialId)?.url :
                    ''
                  }
                  required
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="socialStatus"
                  defaultValue={editingSocialId ?
                    footerData.social.find(s => s.id === editingSocialId)?.status :
                    'active'
                  }
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetSocialForm}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
                >
                  <Save className="h-5 w-5" />
                  Save Social Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}