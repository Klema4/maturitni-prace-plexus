'use client'

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, Heading1, Heading2, Heading3, Quote, Code, Minus, Undo, Redo, Strikethrough, Link as LinkIcon } from "lucide-react";

interface TipTapEditorProps {
  content?: string | object;
  onChange?: (content: any) => void;
}

export default function TipTapEditor({ content = '<p>Začni psát svůj článek...</p>', onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '<p>Začni psát svůj článek...</p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON());
      }
    },
  });

  // Aktualizovat obsah editoru, když se změní content prop
  useEffect(() => {
    if (!editor) return;
    
    if (content === undefined || content === null) {
      return;
    }

    try {
      // Použít setTimeout, aby se to spustilo až po renderu
      const timeoutId = setTimeout(() => {
        if (!editor.isDestroyed) {
          // Zkontrolovat, jestli se obsah liší
          const currentJSON = editor.getJSON();
          let shouldUpdate = false;
          
          if (typeof content === 'string') {
            const currentHTML = editor.getHTML();
            if (currentHTML !== content) {
              shouldUpdate = true;
            }
          } else if (typeof content === 'object') {
            const currentStr = JSON.stringify(currentJSON);
            const contentStr = JSON.stringify(content);
            if (currentStr !== contentStr) {
              shouldUpdate = true;
            }
          }
          
          if (shouldUpdate) {
            editor.commands.setContent(content, { emitUpdate: false });
          }
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error updating editor content:', error);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const setLink = (linkUrl: string) => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-2 bg-zinc-800/50 rounded-lg mb-2 border border-zinc-700/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Nadpis 1"
          >
            <Heading1 size={18} className="text-zinc-300" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Nadpis 2"
          >
            <Heading2 size={18} className="text-zinc-300" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Nadpis 3"
          >
            <Heading3 size={18} className="text-zinc-300" />
          </button>
        </div>
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('bold') ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Tučné"
          >
            <Bold size={18} className="text-zinc-300" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('italic') ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Kurzíva"
          >
            <Italic size={18} className="text-zinc-300" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('strike') ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Přeškrtnutí"
          >
            <Strikethrough size={18} className="text-zinc-300" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('code') ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Kód"
          >
            <Code size={18} className="text-zinc-300" />
          </button>
        </div>
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('bulletList') ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Seznam s odrážkami"
          >
            <List size={18} className="text-zinc-300" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('orderedList') ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Číslovaný seznam"
          >
            <List size={18} className="text-zinc-300 rotate-90" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('blockquote') ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Citace"
          >
            <Quote size={18} className="text-zinc-300" />
          </button>
        </div>
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const url = window.prompt('Zadej URL:', editor.getAttributes('link').href || '');
              if (url !== null) {
                setLink(url);
              }
            }}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
              editor.isActive('link') ? 'bg-zinc-700' : ''
            }`}
            type="button"
            title="Odkaz"
          >
            <LinkIcon size={18} className="text-zinc-300" />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-zinc-700 transition-colors"
            type="button"
            title="Vodorovná čára"
          >
            <Minus size={18} className="text-zinc-300" />
          </button>
        </div>
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            title="Zpět"
          >
            <Undo size={18} className="text-zinc-300" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            title="Vpřed"
          >
            <Redo size={18} className="text-zinc-300" />
          </button>
        </div>
      </div>
      <div className="border border-zinc-700 rounded-lg bg-zinc-900/50">
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p {
          margin: 0.75em 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.75em 0;
        }
        .ProseMirror li {
          margin: 0.25em 0;
        }
        .ProseMirror strong {
          font-weight: bold;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror code {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .ProseMirror pre {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }
        .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid rgba(255, 255, 255, 0.3);
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid rgba(255, 255, 255, 0.1);
          margin: 1.5em 0;
        }
        .ProseMirror a {
          color: #60a5fa;
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          color: #93c5fd;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </>
  );
}

