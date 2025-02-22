import React from 'react';
import { ContentBlock, HeroData } from '../../lib/firebase';
import HeaderEditor from './HeaderEditor';
import HeroEditor from './HeroEditor';
import TestimonialsEditor from './TestimonialsEditor';
import TextEditor from './TextEditor';

interface ContentEditorProps {
  content: ContentBlock | null;
  onChange: (data: any) => void;
  previewMode?: boolean;
}

export default function ContentEditor({
  content,
  onChange,
  previewMode = false
}: ContentEditorProps) {
  if (!content) {
    return null;
  }

  switch (content.type) {
    case 'header':
      return (
        <HeaderEditor
          data={content.data}
          onChange={onChange}
          onSave={() => {}}
          previewMode={previewMode}
        />
      );
    case 'hero':
      return (
        <HeroEditor
          data={content.data}
          onChange={onChange}
          onSave={() => {}}
          previewMode={previewMode}
        />
      );
    case 'testimonials':
      return (
        <TestimonialsEditor
          data={content.data}
          onChange={onChange}
          onSave={() => {}}
          previewMode={previewMode}
        />
      );

    default:
      return (
        <TextEditor
          content={content.data.content || ''}
          onChange={(content) => onChange({ content })}
          previewMode={previewMode}
        />
      );
  }
}