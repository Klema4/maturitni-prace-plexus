import { ArticleProps } from "../types";
import Image from "next/image";
import { formatPublishedAt } from "@/lib/utils/date";
import { Avatar } from "@/app/components/blog/ui";
import Link from "next/link";
import { Clock3 } from "lucide-react";

export default function ArticleCard({ article }: { article: ArticleProps }) {
    return (
        <Link href={`/article/${article.slug}`} className="w-full h-full">
            <div className="w-full h-full rounded-xl overflow-hidden bg-white/80 hover:bg-primary/10 border border-zinc-200 hover:border-primary/15 transition-all">
                {article.imageUrl ? (
                    <Image src={article.imageUrl} alt={article.title} width={1920} height={1080} className="w-full h-48 object-cover" />
                ) : (
                    <div className="w-full h-48 bg-zinc-100" aria-hidden="true" />
                )}
                <div className="p-4">
                    <div className="flex flex-col gap-2 w-full h-24">
                        <h4 className="line-clamp-2 newsreader w-full text-lg xl:text-xl font-medium tracking-tight leading-tight text-dark">{article.title}</h4>
                        <p className="line-clamp-2 text-sm lg:text-md text-zinc-500 font-medium tracking-tight max-w-3xl leading-relaxed">{article.description}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <Avatar src={article.author?.image ?? undefined} alt={article.author?.name ?? undefined} size="xs" variant="dark" />
                        <div>
                            <p className="text-sm text-zinc-700 font-semibold tracking-tight leading-4">{article.author?.name} {article.author?.surname}</p>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium tracking-tight">
                                <p>{formatPublishedAt(article.createdAt ?? new Date())}</p>
                                {article.readingTime ? (
                                    <>
                                        <span aria-hidden="true">•</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 size={12} />
                                            {article.readingTime} min čtení
                                        </span>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
