'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from 'lucide-react';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

export function TipTapEditor({ value, onChange, placeholder, className }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing your contract...',
      }),
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none text-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. template load)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  const charCount = editor?.storage.characterCount?.characters?.() ?? 0;

  const handleToolbarClick = useCallback(
    (action: () => void) => (e: React.MouseEvent) => {
      e.preventDefault();
      action();
    },
    []
  );

  if (!editor) return null;

  return (
    <div className={cn('border border-input rounded-md overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-input bg-muted/30">
        {/* Undo / Redo */}
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().undo().run())}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().redo().run())}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Text formatting */}
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().toggleBold().run())}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().toggleItalic().run())}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().toggleUnderline().run())}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().toggleStrike().run())}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().toggleBulletList().run())}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().toggleOrderedList().run())}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().setTextAlign('left').run())}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().setTextAlign('center').run())}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarClick(() => editor.chain().focus().setTextAlign('right').run())}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={15} />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Footer: character count */}
      <div className="flex justify-end px-3 py-1.5 border-t border-input bg-muted/20">
        <span className="text-xs text-muted-foreground">{charCount} characters</span>
      </div>
    </div>
  );
}
