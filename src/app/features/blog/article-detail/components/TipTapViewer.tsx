"use client";

import { useEffect, useRef, type RefObject } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react";
import type { PublicAdCampaign } from "@/app/features/ads/public/types";
import InlineAdBlock from "@/app/features/blog/article-detail/components/InlineAdBlock";
import {
  getYouTubeVideoId,
  isArticleBlockArray,
  isTipTapDocument,
  type ArticleBlock,
  type ArticleRichTextContent,
} from "@/app/features/dashboard/articles/content";

/**
 * CalloutType
 * Typ oznámení v článku.
 */
type CalloutType = "info" | "warning" | "success" | "tip";

const EMPTY_HEADING_IDS: string[] = [];

export default function TipTapViewer({
  content,
  headingIds = EMPTY_HEADING_IDS,
  adCampaign = null,
}: {
  content: unknown;
  headingIds?: string[];
  adCampaign?: PublicAdCampaign | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (isArticleBlockArray(content)) {
    return (
      <article ref={containerRef} className="tip-tap-viewer flex flex-col gap-8">
        <ArticleBlocksView
          blocks={content}
          headingIds={headingIds}
          adCampaign={adCampaign}
        />
        <style jsx global>{globalStyles}</style>
      </article>
    );
  }

  return (
    <LegacyTipTapViewer
      content={content}
      headingIds={headingIds}
      containerRef={containerRef}
    />
  );
}

function ArticleBlocksView({
  blocks,
  headingIds,
  adCampaign,
}: {
  blocks: ArticleBlock[];
  headingIds: string[];
  adCampaign: PublicAdCampaign | null;
}) {
  let headingIndex = 0;

  return (
    <>
      {blocks.map((block) => {
        const assignedHeadingId =
          block.type === "heading" ? headingIds[headingIndex++] || block.id : undefined;

        return (
          <section key={block.id} className="flex flex-col gap-3">
            <BlockRenderer
              block={block}
              headingId={assignedHeadingId}
              adCampaign={adCampaign}
            />
          </section>
        );
      })}
    </>
  );
}

function BlockRenderer({
  block,
  headingId,
  adCampaign,
}: {
  block: ArticleBlock;
  headingId?: string;
  adCampaign: PublicAdCampaign | null;
}) {
  switch (block.type) {
    case "text":
      return <ReadonlyTipTapContent content={block.content} />;
    case "heading":
      return (
        <ReadonlyTipTapContent content={block.content} headingId={headingId} />
      );
    case "ad":
      return <InlineAdBlock campaign={adCampaign} />;
    case "image":
      if (!block.content.url) {
        return null;
      }

      return (
        <figure className="space-y-3">
          <img
            src={block.content.url}
            alt={block.content.caption || "Obrázek v článku"}
            className="w-full rounded-2xl border border-zinc-200 object-cover"
          />
          {block.content.caption ? (
            <figcaption className="text-sm tracking-tight text-zinc-500">
              {block.content.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case "divider":
      return <hr className="border-zinc-200" />;
    case "quote":
      if (!block.content.text.trim()) {
        return null;
      }

      return (
        <blockquote className="rounded-xl border border-zinc-200 bg-white/75 px-6 py-5 text-lg font-medium italic tracking-tight text-zinc-700">
          <div className="flex gap-4">
            <div
              className="w-1 shrink-0 rounded-full bg-primary"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="leading-relaxed">{block.content.text}</p>
              {block.content.author ? (
                <cite className="mt-4 block text-sm font-medium not-italic tracking-tight text-zinc-500">
                  {block.content.author}
                </cite>
              ) : null}
            </div>
          </div>
          {block.content.author ? (
            null
          ) : null}
        </blockquote>
      );
    case "code":
      if (!block.content.code.trim()) {
        return null;
      }

      return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 font-medium tracking-tight">
          <div className="border-b border-zinc-200 bg-white/70 px-4 py-2 text-xs font-medium tracking-tight text-zinc-600">
            {(block.content.language || "kód").toLowerCase()}
          </div>
          <pre className='overflow-x-auto p-5 font-["JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace] text-sm leading-7 text-zinc-900'>
            <code>{block.content.code}</code>
          </pre>
        </div>
      );
    case "callout":
      if (!block.content.text.trim()) {
        return null;
      }

      const calloutStyles = getCalloutStyles(block.content.type);
      const CalloutIcon = getCalloutIcon(block.content.type);
      return (
        <div
          className={[
            "rounded-xl border px-4 py-3 text-zinc-800 font-medium tracking-tight",
            calloutStyles.wrapper,
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex shrink-0">
              <CalloutIcon size={18} className={calloutStyles.icon} />
            </span>
            <div className="min-w-0">
              <p
                className={[
                  "text-sm font-semibold tracking-tight",
                  calloutStyles.label,
                ].join(" ")}
              >
                {getCalloutLabel(block.content.type)}
              </p>
              <p className="mt-2 text-base leading-relaxed text-zinc-700">
                {block.content.text}
              </p>
            </div>
          </div>
        </div>
      );
    case "video": {
      const videoId = getYouTubeVideoId(block.content.url);

      if (!videoId) {
        return null;
      }

      return (
        <div className="overflow-hidden rounded-2xl border border-zinc-200">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Vložené video"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
  }
}

function ReadonlyTipTapContent({
  content,
  headingId,
}: {
  content: ArticleRichTextContent;
  headingId?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editor = useEditor({
    extensions: [StarterKit],
    content: getViewerContent(content),
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setContent(getViewerContent(content), { emitUpdate: false });
  }, [content, editor]);

  useEffect(() => {
    if (!headingId || !wrapperRef.current) {
      return;
    }

    const heading = wrapperRef.current.querySelector("h1, h2, h3, h4, h5, h6");

    if (heading) {
      heading.id = headingId;
    }
  }, [content, headingId]);

  if (!editor) {
    return null;
  }

  return (
    <div ref={wrapperRef}>
      <EditorContent editor={editor} />
    </div>
  );
}

function LegacyTipTapViewer({
  content,
  headingIds,
  containerRef,
}: {
  content: unknown;
  headingIds: string[];
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: getViewerContent(content),
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setContent(getViewerContent(content), { emitUpdate: false });
  }, [content, editor]);

  useEffect(() => {
    if (!containerRef.current || headingIds.length === 0) {
      return;
    }

    const headings = containerRef.current.querySelectorAll("h1, h2, h3");
    headings.forEach((heading, index) => {
      if (headingIds[index]) {
        heading.id = headingIds[index];
      }
    });
  }, [containerRef, content, headingIds]);

  if (!editor) {
    return null;
  }

  return (
    <article ref={containerRef} className="tip-tap-viewer flex flex-col gap-10">
      <EditorContent editor={editor} />
      <style jsx global>{globalStyles}</style>
    </article>
  );
}

function getViewerContent(content: unknown) {
  if (isTipTapDocument(content) || typeof content === "string") {
    return content;
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tento článek zatím nemá obsah.",
          },
        ],
      },
    ],
  };
}

function getCalloutLabel(type: "info" | "warning" | "success" | "tip") {
  switch (type) {
    case "warning":
      return "Varování";
    case "success":
      return "Dobré vědět";
    case "tip":
      return "Tip";
    default:
      return "Poznámka";
  }
}

/**
 * getCalloutStyles
 * Vrátí třídy pro vzhled calloutu dle typu (info/warning/success/tip).
 * @param {CalloutType} type - Typ calloutu.
 * @returns {{ wrapper: string; label: string; icon: string }} CSS třídy pro wrapper a text.
 */
function getCalloutStyles(type: CalloutType): {
  wrapper: string;
  label: string;
  icon: string;
} {
  switch (type) {
    case "warning":
      return {
        wrapper: "border-amber-400 bg-amber-300/40",
        label: "text-amber-900",
        icon: "text-amber-900",
      };
    case "success":
      return {
        wrapper: "border-emerald-400 bg-emerald-300/40",
        label: "text-emerald-900",
        icon: "text-emerald-900",
      };
    case "tip":
      return {
        wrapper: "border-indigo-400 bg-indigo-300/40",
        label: "text-indigo-900",
        icon: "text-indigo-900",
      };
    default:
      return {
        wrapper: "border-sky-400 bg-sky-300/40",
        label: "text-sky-950",
        icon: "text-sky-950",
      };
  }
}

/**
 * getCalloutIcon
 * Vrátí ikonku pro daný typ calloutu.
 * @param {CalloutType} type - Typ calloutu.
 * @returns {React.ComponentType<{ size?: number; className?: string }>} Ikonka.
 */
function getCalloutIcon(type: CalloutType) {
  switch (type) {
    case "warning":
      return AlertTriangle;
    case "success":
      return CheckCircle2;
    case "tip":
      return Lightbulb;
    default:
      return Info;
  }
}

const globalStyles = `
  .tip-tap-viewer .ProseMirror {
    outline: none;
    color: #3f3f46;
    font-size: 1.0625rem;
    line-height: 1.9;
  }

  .tip-tap-viewer .ProseMirror > :first-child {
    margin-top: 0;
  }

  .tip-tap-viewer .ProseMirror > :last-child {
    margin-bottom: 0;
  }

  .tip-tap-viewer .ProseMirror h1,
  .tip-tap-viewer .ProseMirror h2,
  .tip-tap-viewer .ProseMirror h3 {
    margin: 2rem 0 0.75rem;
    font-family: "Newsreader", serif;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #18181b;
  }

  .tip-tap-viewer .ProseMirror h1 {
    font-size: 2.25rem;
  }

  .tip-tap-viewer .ProseMirror h2 {
    font-size: 1.875rem;
  }

  .tip-tap-viewer .ProseMirror h3 {
    font-size: 1.5rem;
  }

  .tip-tap-viewer .ProseMirror p,
  .tip-tap-viewer .ProseMirror ul,
  .tip-tap-viewer .ProseMirror ol,
  .tip-tap-viewer .ProseMirror blockquote,
  .tip-tap-viewer .ProseMirror pre {
    margin: 1.1rem 0;
  }

  .tip-tap-viewer .ProseMirror ul,
  .tip-tap-viewer .ProseMirror ol {
    padding-left: 1.6rem;
  }

  .tip-tap-viewer .ProseMirror ul {
    list-style: disc;
  }

  .tip-tap-viewer .ProseMirror ol {
    list-style: decimal;
  }

  .tip-tap-viewer .ProseMirror ul ul {
    list-style: circle;
  }

  .tip-tap-viewer .ProseMirror ol ol {
    list-style: lower-alpha;
  }

  .tip-tap-viewer .ProseMirror li {
    display: list-item;
    margin: 0.35rem 0;
    padding-left: 0.15rem;
  }

  .tip-tap-viewer .ProseMirror li::marker {
    color: #52525b;
  }

  .tip-tap-viewer .ProseMirror li > p {
    margin: 0.2rem 0;
  }

  .tip-tap-viewer .ProseMirror code {
    border-radius: 0.375rem;
    background: #e4e4e7;
    padding: 0.15rem 0.35rem;
    font-size: 0.9em;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco,
      Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .tip-tap-viewer .ProseMirror pre {
    overflow-x: auto;
    border-radius: 1rem;
    background: #fafafa;
    color: #18181b;
    border: 1px solid #e4e4e7;
    padding: 1rem 1.25rem;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco,
      Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .tip-tap-viewer .ProseMirror pre code {
    background: transparent;
    padding: 0;
    color: inherit;
  }

  .tip-tap-viewer .ProseMirror blockquote {
    border-left: 4px solid #18181b;
    padding-left: 1rem;
    color: #52525b;
    font-style: italic;
  }

  .tip-tap-viewer .ProseMirror blockquote p {
    margin: 0;
  }

  .tip-tap-viewer .ProseMirror a {
    color: #18181b;
    text-decoration: underline;
  }
`;
