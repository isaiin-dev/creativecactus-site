import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Heading,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from 'lucide-react';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  previewMode?: boolean;
}

export default function TextEditor({ 
  content, 
  onChange,
  previewMode = false
}: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !previewMode
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    active = false,
    children 
  }: { 
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`
        p-2 rounded-lg transition-colors
        ${active 
          ? 'bg-[#96C881] text-white' 
          : 'text-gray-400 hover:text-white hover:bg-[#242424]'}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {!previewMode && (
        <div className="bg-[#1a1a1a] border-b border-gray-800 p-2 flex flex-wrap gap-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <Bold className="h-5 w-5" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <Italic className="h-5 w-5" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
          >
            <Heading className="h-5 w-5" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <List className="h-5 w-5" />
          </ToolbarButton>
          
          <div className="h-6 w-px bg-gray-800 mx-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
          >
            <AlignLeft className="h-5 w-5" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
          >
            <AlignCenter className="h-5 w-5" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
          >
            <AlignRight className="h-5 w-5" />
          </ToolbarButton>
          
          <div className="h-6 w-px bg-gray-800 mx-1" />
          
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter the URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            active={editor.isActive('link')}
          >
            <LinkIcon className="h-5 w-5" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter the image URL');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
          >
            <ImageIcon className="h-5 w-5" />
          </ToolbarButton>
          
          <div className="h-6 w-px bg-gray-800 mx-1" />
          
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="h-5 w-5" />
          </ToolbarButton>
          
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="h-5 w-5" />
          </ToolbarButton>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className="prose prose-invert max-w-none p-4 min-h-[200px] bg-[#242424]"
      />
    </div>
  );
}