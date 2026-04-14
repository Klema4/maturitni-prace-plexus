'use client';

import { useState } from "react";

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "bmp",
  "svg",
]);

const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "m4v",
  "avi",
  "mkv",
]);

function getFileExtension(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function isImageFile(fileName: string) {
  return IMAGE_EXTENSIONS.has(getFileExtension(fileName));
}

function isVideoFile(fileName: string) {
  return VIDEO_EXTENSIONS.has(getFileExtension(fileName));
}

export default function FilePreview({
  fileName,
  fileUrl,
}: {
  fileName: string;
  fileUrl: string;
}) {
  const [hasPreviewError, setHasPreviewError] = useState(false);

  if (hasPreviewError) {
    return (
      <div className="mb-2 flex h-36 w-full items-center justify-center rounded-xl bg-zinc-800/50 px-3 text-center">
        <p className="text-xs font-medium tracking-tight text-zinc-400">
          Náhled není dostupný pro tento formát
        </p>
      </div>
    );
  }

  if (isImageFile(fileName)) {
    return (
      <img
        src={fileUrl}
        alt={fileName}
        className="mb-2 h-36 w-full rounded-xl bg-zinc-800/50 object-cover"
        loading="lazy"
        onError={() => setHasPreviewError(true)}
      />
    );
  }

  if (isVideoFile(fileName)) {
    return (
      <video
        src={fileUrl}
        className="mb-2 h-36 w-full rounded-xl bg-zinc-800/50 object-cover"
        muted
        playsInline
        preload="metadata"
        controls
        onError={() => setHasPreviewError(true)}
      />
    );
  }

  return (
    <div className="mb-2 h-36 w-full rounded-xl bg-zinc-800/50 flex items-center justify-center">
      <p className="text-xs font-medium tracking-tight text-zinc-400">
        Náhled není dostupný
      </p>
    </div>
  );
}
