"use client";

import Image from "next/image";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { Avatar, Button } from "@/app/components/blog/ui";
import type { ArticleHeaderProps } from "@/app/features/blog/article-detail/types";
import { formatDateAgo } from "@/lib/utils/date";

export default function ArticleHeader({
  backHref,
  backLabel = "Zpět na články",
  date,
  updatedAt,
  publishedAtIso,
  title,
  description,
  authorName,
  authorAvatar,
  readingTime,
  viewCount,
  heroImageUrl,
}: ArticleHeaderProps) {
  const normalizedUpdatedAt = updatedAt ? new Date(updatedAt) : null;
  const normalizedPublishedAt = publishedAtIso ? new Date(publishedAtIso) : null;
  const showUpdatedAt =
    normalizedUpdatedAt &&
    Number.isFinite(normalizedUpdatedAt.getTime()) &&
    normalizedPublishedAt &&
    Number.isFinite(normalizedPublishedAt.getTime()) &&
    normalizedUpdatedAt.getTime() - normalizedPublishedAt.getTime() > 60_000;

  return (
    <>
      <div className="w-full min-h-140 h-172 md:h-200 absolute top-0 left-0 -z-1">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt="Article hero"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900" aria-hidden="true" />
        )}
      </div>

      <div className="absolute top-0 left-0 w-full min-h-172 md:h-200 bg-linear-to-b from-black/0 via-black/30 to-black backdrop-blur-[2px]">
        <section className="w-full px-6 lg:px-8 min-h-172 md:h-200 mt-8 flex flex-col justify-center items-center">
          <div className="max-w-5xl w-full mx-auto">
            <Button
              href={backHref}
              variant="subtle"
              size="sm"
              className="mb-6 md:mb-12 w-fit backdrop-blur-sm hover:bg-primary! hover:text-white!"
            >
              <ArrowLeft size={16} />
              {backLabel}
            </Button>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} />
                <p className="text-xs md:text-sm font-medium tracking-tight">{date}</p>
                {showUpdatedAt ? (
                  <p className="text-xs md:text-sm font-medium tracking-tight text-white/70">
                    • Upraveno {formatDateAgo(normalizedUpdatedAt)}
                  </p>
                ) : null}
              </div>
              <h1 className="newsreader text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tighter text-white max-w-3xl">
                {title}
              </h1>
              <p className="text-sm text-justify md:text-start lg:text-lg text-white tracking-tight max-w-3xl">
                {description}
              </p>
              <div className="flex flex-wrap gap-2">
                {typeof viewCount === "number" ? (
                  <MetaBadge icon={<Eye size={16} />} label={`${viewCount} zobrazení`} />
                ) : null}
                {readingTime ? (
                  <MetaBadge icon={<Clock size={16} />} label={`${readingTime} minut čtení`} />
                ) : null}
              </div>
              <div className="flex items-center gap-4">
                <Avatar src={authorAvatar || undefined} alt={authorName} size="sm" variant="dark" />
                <p className="text-sm text-white font-medium tracking-tight">{authorName}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function MetaBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <p className="bg-white text-zinc-800 text-xs font-medium tracking-tight py-2 px-3 rounded-full flex items-center gap-2">
      {icon}
      {label}
    </p>
  );
}

