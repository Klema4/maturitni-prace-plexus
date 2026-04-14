import { ArticleProps } from "@/app/features/blog/articles/types";
import { Avatar } from "@/app/components/blog/ui";
import { formatPublishedAt } from "@/lib/utils/date";
import Link from "next/link";
import { Clock, Eye } from "lucide-react";

export default function MainArticleCard({
  article,
}: {
  article: ArticleProps;
}) {
  return (
    <section className="w-full px-4 lg:px-8 h-[60vh] lg:h-128 mt-8">
      <Link href={`/article/${article.slug}`}>
        <div className="relative w-full h-full rounded-xl overflow-hidden">
          <div className="w-full h-full bg-linear-to-b from-black/0 to-black flex flex-col justify-end items-start gap-4 z-10 absolute top-0 left-0">
            <div className="p-4 lg:p-8 xl:p-12 flex flex-col gap-4">
              <h1 className="newsreader max-w-4xl text-4xl lg:text-5xl font-medium tracking-tight leading-tight text-white">
                {article.title}
              </h1>
              <p className="text-base lg:text-lg text-zinc-200 tracking-tight max-w-3xl leading-relaxed">
                {article.description}
              </p>
              <div className="flex items-center gap-4">
                <Avatar
                  src={article.author?.image ?? undefined}
                  alt={article.author?.name ?? undefined}
                  size="sm"
                  variant="dark"
                />
                <div className="flex flex-col">
                  <p className="text-sm text-zinc-200 font-bold tracking-tight">
                    {article.author?.name} {article.author?.surname}
                  </p>
                  {article.createdAt && (
                    <p className="text-sm text-zinc-300 tracking-tight">
                      {formatPublishedAt(article.createdAt)}
                    </p>
                  )}
                </div>
              </div>
              <div className="hidden md:flex flex-wrap gap-2">
                <Badge
                  icon={<Eye size={16} />}
                  label={`${article.viewCount?.toString() ?? "0"} zobrazení`}
                />
                {article.readingTime ? (
                  <Badge
                    icon={<Clock size={16} />}
                    label={`${article.readingTime} minut čtení`}
                  />
                ) : null}
              </div>
            </div>
          </div>
          <div className="mask-t-from-60% mask-t-to-95% w-full h-full rounded-b-xl overflow-hidden relative z-0">
            {article.imageUrl ? (
              <div
                className="absolute top-0 left-0 z-1 bg-cover bg-center min-h-[70vh] h-[70vh] w-full"
                style={{ backgroundImage: `url("${article.imageUrl}")` }}
              />
            ) : (
              <div className="absolute top-0 left-0 z-1 min-h-[70vh] h-[70vh] w-full bg-zinc-900" />
            )}
          </div>
        </div>
      </Link>
    </section>
  );
}

export function Badge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <p className="bg-white text-zinc-800 text-xs font-medium tracking-tight py-2 px-3 rounded-full flex items-center gap-2">
      {icon}
      {label}
    </p>
  );
}
