import React, { useEffect, useCallback } from 'react';
import { ContentBlock, HeroData } from '../../lib/firebase';
import HeaderEditor from './HeaderEditor';
import HeroEditor from './HeroEditor';
import TestimonialsEditor from './TestimonialsEditor';
import FeaturesEditor from './FeaturesEditor';
import FooterEditor from './FooterEditor';
import TextEditor from './TextEditor';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ContentEditorProps {
  content: ContentBlock | null;
  onChange: (data: any) => void;
  onSave: () => Promise<void>;
  previewMode?: boolean;
}

interface SaveState {
  hasChanges: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSaved: Date | null;
}

export default function ContentEditor({
  content,
  onChange,
  onSave,
  previewMode = false
}: ContentEditorProps) {
  const [saveState, setSaveState] = React.useState<SaveState>({
    hasChanges: false,
    isSaving: false,
    saveError: null,
    lastSaved: null
  });

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState.hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveState.hasChanges]);

  const handleContentChange = useCallback((data: any) => {
    setSaveState(prev => ({ ...prev, hasChanges: true }));
    onChange(data);
  }, [onChange]);

  const handleSave = async () => {
    setSaveState(prev => ({ ...prev, isSaving: true, saveError: null }));
    try {
      if (!content) {
        throw new Error('No content to save');
      }

      // Ensure data has metadata
      const dataToSave = {
        ...content.data,
        metadata: content.data.metadata || {
          version: 0,
          lastModified: null,
          lastModifiedBy: ''
        }
      };

      // Call parent save handler with prepared data
      await onSave();
      
      setSaveState({
        hasChanges: false,
        isSaving: false,
        saveError: null,
        lastSaved: new Date()
      });
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Error al guardar los cambios. Por favor intenta de nuevo.'
      }));
    }
  };

  if (!content) {
    return null;
  }

  // Save notification component
  const SaveNotification = () => (
    <div
      className={`
        fixed bottom-4 right-4 p-4 rounded-lg shadow-lg
        transition-all duration-300 transform
        ${saveState.hasChanges || saveState.isSaving || saveState.saveError
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0'}
        ${saveState.saveError ? 'bg-red-900/90' : 'bg-[#1a1a1a]/90'}
        backdrop-blur-sm border border-gray-800
      `}
    >
      <div className="flex items-center gap-3">
        {saveState.saveError ? (
          <>
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-500">{saveState.saveError}</span>
          </>
        ) : saveState.isSaving ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-[#96C881] border-t-transparent rounded-full" />
            <span className="text-gray-300">Saving changes...</span>
          </>
        ) : saveState.hasChanges ? (
          <>
            <span className="text-gray-300">You have unsaved changes</span>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </>
        ) : saveState.lastSaved && (
          <>
            <CheckCircle className="h-5 w-5 text-[#96C881]" />
            <span className="text-gray-300">
              Saved {saveState.lastSaved.toLocaleTimeString()}
            </span>
          </>
        )}
      </div>
    </div>
  );

  switch (content.type) {
    case 'header':
      return (
        <>
          <HeaderEditor
            data={content.data}
            onChange={handleContentChange}
            onSave={handleSave}
            previewMode={previewMode}
          />
          <SaveNotification />
        </>
      );
    case 'hero':
      return (
        <>
          <HeroEditor
            data={content.data}
            onChange={handleContentChange}
            onSave={handleSave}
            previewMode={previewMode}
          />
          <SaveNotification />
        </>
      );
    case 'testimonials':
      return (
        <>
          <TestimonialsEditor
            data={content.data}
            onChange={handleContentChange}
            onSave={handleSave}
            previewMode={previewMode}
          />
          <SaveNotification />
        </>
      );
    case 'features':
      return (
        <>
          <FeaturesEditor
            data={content.data}
            onChange={handleContentChange}
            onSave={handleSave}
            previewMode={previewMode}
          />
          <SaveNotification />
        </>
      );
    case 'footer':
      return (
        <>
          <FooterEditor
            data={content.data}
            onChange={handleContentChange}
            onSave={handleSave}
            previewMode={previewMode}
          />
          <SaveNotification />
        </>
      );

    default:
      return (
        <>
          <TextEditor
            content={content.data.content || ''}
            onChange={(content) => handleContentChange({ content })}
            previewMode={previewMode}
          />
          <SaveNotification />
        </>
      );
  }
}