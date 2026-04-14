"use client";

import { useEffect, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";
import { clsx } from "clsx";
import {
  createHeadingDocument,
  createParagraphDocument,
  isTipTapDocument,
  type ArticleRichTextContent,
} from "@/app/features/dashboard/articles/content";

interface TextBlockProps {
  content: ArticleRichTextContent;
  isHeading?: boolean;
  onChange: (content: ArticleRichTextContent) => void;
}

export default function TextBlock({
  content,
  isHeading = false,
  onChange,
}: TextBlockProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: isHeading ? "Nadpis sekce" : "Začni psát obsah článku",
      }),
    ],
    content: getInitialContent(content, isHeading),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: clsx(
          "prose prose-invert max-w-none rounded-lg px-3 py-2 focus:outline-none",
          isHeading
            ? "min-h-[3.5rem] text-zinc-100"
            : "min-h-[7rem] text-zinc-300",
        ),
      },
    },
    onCreate: ({ editor: instance }) => {
      if (isHeading && !instance.isActive("heading")) {
        instance.chain().focus().setHeading({ level: 1 }).run();
      }
    },
    onUpdate: ({ editor: instance }) => {
      if (isHeading) {
        const normalizedContent = normalizeHeadingDocument(instance.getJSON());
        const currentContent = JSON.stringify(instance.getJSON());
        const nextContent = JSON.stringify(normalizedContent);

        if (currentContent !== nextContent) {
          instance.commands.setContent(normalizedContent, { emitUpdate: false });
        }

        onChange(normalizedContent);
        return;
      }

      onChange(instance.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const normalizedContent = getInitialContent(content, isHeading);
    const currentContent = JSON.stringify(editor.getJSON());
    const nextContent = JSON.stringify(normalizedContent);

    if (currentContent !== nextContent) {
      editor.commands.setContent(normalizedContent, { emitUpdate: false });
    }
  }, [content, editor, isHeading]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1.5">
        <ToolbarButton
          title="Tučné"
          isActive={editor.isActive("bold")}
          onMouseDown={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Kurzíva"
          isActive={editor.isActive("italic")}
          onMouseDown={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} />
        </ToolbarButton>
        {isHeading ? (
          <>
            <ToolbarButton
              title="Nadpis 1"
              isActive={editor.isActive("heading", { level: 1 })}
              onMouseDown={() =>
                editor.chain().focus().setHeading({ level: 1 }).run()
              }
            >
              <Heading1 size={14} />
            </ToolbarButton>
            <ToolbarButton
              title="Nadpis 2"
              isActive={editor.isActive("heading", { level: 2 })}
              onMouseDown={() =>
                editor.chain().focus().setHeading({ level: 2 }).run()
              }
            >
              <Heading2 size={14} />
            </ToolbarButton>
            <ToolbarButton
              title="Nadpis 3"
              isActive={editor.isActive("heading", { level: 3 })}
              onMouseDown={() =>
                editor.chain().focus().setHeading({ level: 3 }).run()
              }
            >
              <Heading3 size={14} />
            </ToolbarButton>
          </>
        ) : (
          <>
            <ToolbarButton
              title="Odrážky"
              isActive={editor.isActive("bulletList")}
              onMouseDown={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List size={14} />
            </ToolbarButton>
            <ToolbarButton
              title="Číslovaný seznam"
              isActive={editor.isActive("orderedList")}
              onMouseDown={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
            >
              <ListOrdered size={14} />
            </ToolbarButton>
            <ToolbarButton
              title="Kód"
              isActive={editor.isActive("code")}
              onMouseDown={() => editor.chain().focus().toggleCode().run()}
            >
              <Code size={14} />
            </ToolbarButton>
          </>
        )}
      </div>

      <div
        className={clsx(
          "rounded-lg border border-zinc-800/50 bg-zinc-900",
          isHeading ? "px-1 py-2" : "px-1 py-1",
        )}
      >
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before,
        .ProseMirror h1.is-editor-empty:first-child::before,
        .ProseMirror h2.is-editor-empty:first-child::before,
        .ProseMirror h3.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          pointer-events: none;
          float: left;
          height: 0;
          color: #71717a;
        }

        .ProseMirror h1,
        .ProseMirror h2 {
          margin: 0;
          line-height: 1.1;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: #fafafa;
        }

        .ProseMirror h1 {
          font-size: 2rem;
        }

        .ProseMirror h2 {
          font-size: 1.6rem;
        }

        .ProseMirror h3 {
          margin: 0;
          font-size: 1.3rem;
          line-height: 1.2;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #f4f4f5;
        }

        .ProseMirror p,
        .ProseMirror ul,
        .ProseMirror ol,
        .ProseMirror blockquote {
          margin: 0.75rem 0;
          font-size: 0.9rem;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror li {
          color: inherit;
        }

        .ProseMirror li p {
          margin: 0.2rem 0;
        }
      `}</style>
    </div>
  );
}

interface ToolbarButtonProps {
  children: ReactNode;
  title: string;
  isActive: boolean;
  onMouseDown: () => void;
}

function ToolbarButton({
  children,
  title,
  isActive,
  onMouseDown,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown();
      }}
      className={clsx(
        "cursor-pointer rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100",
        isActive && "bg-zinc-800 text-zinc-100",
      )}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function getInitialContent(
  content: ArticleRichTextContent,
  isHeading: boolean,
): ArticleRichTextContent {
  if (isTipTapDocument(content) || typeof content === "string") {
    return isHeading && isTipTapDocument(content)
      ? normalizeHeadingDocument(content)
      : content;
  }

  return isHeading ? createHeadingDocument() : createParagraphDocument();
}

function normalizeHeadingDocument(content: ArticleRichTextContent) {
  if (!isTipTapDocument(content)) {
    return createHeadingDocument();
  }

  const firstNode = content.content?.[0];
  const level = getHeadingLevel(content);

  return {
    ...content,
    content: [
      {
        type: "heading",
        attrs: { level },
        content: firstNode?.content,
      },
    ],
  };
}

function getHeadingLevel(content: ArticleRichTextContent) {
  if (!isTipTapDocument(content)) {
    return 1;
  }

  const firstNode = content.content?.[0];
  const level = firstNode?.attrs?.level;

  if (level === 1 || level === 2 || level === 3) {
    return level;
  }

  return 1;
}
