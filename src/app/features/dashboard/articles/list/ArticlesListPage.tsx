'use client'

import Avatar from "@/components/ui/dashboard/Avatar";
import { Card } from "@/components/ui/dashboard/Card";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { Newspaper, Plus, Edit, Trash2, Eye, Clock } from "lucide-react";
import Image from "next/image";
import type {
  ArticleStatus,
  DashboardArticle as Article,
} from "@/app/features/dashboard/articles/types";
import { useArticlesListPage } from "@/app/features/dashboard/articles/list/hooks/useArticlesListPage";

export default function Articles() {
  const { articles, loading, error, handleDelete, openEdit } =
    useArticlesListPage();

  const getStatusLabel = (status: ArticleStatus) => {
    switch (status) {
      case "draft":
        return { label: "Koncept", color: "bg-zinc-800 text-zinc-300" };
      case "need_factcheck":
        return { label: "Potřebuje faktickou kontrolu", color: "bg-amber-900/50 text-amber-400" };
      case "need_read":
        return { label: "Potřebuje korekturu", color: "bg-blue-900/50 text-blue-400" };
      case "published":
        return { label: "Publikováno", color: "bg-green-900/50 text-green-400" };
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('cs-CZ').format(num);
  };

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Příspěvky</Heading>
          <Paragraph>Piš a nahrávej nové příběhy ze světa.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám články...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Příspěvky</Heading>
          <Paragraph>Piš a nahrávej nové příběhy ze světa.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">{error}</Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Příspěvky</Heading>
        <Paragraph>Piš a nahrávej nové příběhy ze světa.</Paragraph>
      </header>
      <QuickOptions options={[
        { label: "Nový článek", variant: "primary", icon: Plus, link: "/dashboard/articles/new" },
      ]} />
      <section className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => {
            const statusInfo = getStatusLabel(article.status);
            const authorName = article.author 
              ? `${article.author.name} ${article.author.surname}` 
              : "Neznámý autor";
            return (
              <Card className="p-2.5!" key={article.id}>
                {article.imageUrl ? (
                  <Image
                    width={1024}
                    height={512}
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    priority
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg mb-4"></div>
                )}
                <div className="flex items-start justify-between mb-2 px-2 h-36">
                  <div className="flex-1 space-y-2">
                    <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <div className="flex items-center gap-2 mb-1">
                      <Heading variant="h4" className="line-clamp-2">{article.title}</Heading>
                    </div>
                    {article.description && (
                      <Paragraph size="small" className="mt-1 line-clamp-2">{article.description}</Paragraph>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button 
                      className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                      onClick={() => openEdit(article.id)}
                    >
                      <Edit size={16} className="text-zinc-400" />
                    </button>
                    <button 
                      className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-medium tracking-tight text-zinc-500 mt-3 px-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{formatNumber(article.viewCount)}</span>
                    </div>
                    {article.readingTime && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{article.readingTime} min</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {article.author?.image && (
                      <Avatar src={article.author.image} alt={authorName} size="xs" />
                    )}
                    <span>{authorName}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
