"use client";

import { Input } from "@/components/ui/dashboard/Inputs";
import { Paragraph } from "@/components/ui/dashboard/TextUtils";
import { getYouTubeVideoId } from "@/app/features/dashboard/articles/content";

interface VideoBlockProps {
  content: {
    url: string;
  };
  onChange: (content: { url: string }) => void;
}

export default function VideoBlock({ content, onChange }: VideoBlockProps) {
  const videoId = getYouTubeVideoId(content.url);

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
      <Input
        label="YouTube odkaz"
        value={content.url}
        onChange={(event) => onChange({ url: event.target.value })}
        placeholder="https://www.youtube.com/watch?v=..."
      />

      {videoId ? (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Náhled videa"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <Paragraph size="small" color="muted">
          Zatím podporujeme jen YouTube odkazy. Po vložení platné URL se zobrazí
          náhled.
        </Paragraph>
      )}
    </div>
  );
}
