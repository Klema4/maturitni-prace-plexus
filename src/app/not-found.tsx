import Template from "./template";
import Image from "next/image";
import ArticlesGrid from "@/app/features/blog/articles/components/ArticlesGrid";
import { getLatestArticles } from "@/app/features/blog/articles/api/articles.api";
import Navbar from "@/app/components/blog/Navbar";
import Footer from "@/app/components/blog/Footer";
import { Button } from "@/app/components/blog/ui";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotFoundPage() {
  const { articles: latestArticles } = await getLatestArticles(6);

  return (
    <Template>
      <Navbar />
      <div className="mt-8 max-w-screen-2xl mx-auto flex flex-col items-center justify-center w-full gap-4">
        <Image
          src="/doodles/SittingDoodle.svg"
          alt="Not Found"
          width={256}
          height={256}
        />
        <h1 className="text-dark font-medium text-4xl xl:text-5xl tracking-tighter newsreader">
          Tato stránka neexistuje
        </h1>
        <p className="max-w-sm text-center text-zinc-500 font-medium text-sm lg:text-base tracking-tight">
          Omlouváme se, ale stránka, kterou hledáte, nebyla nalezena. Zkuste se
          vrátit na hlavní stránku.
        </p>
        <Button href="/" variant="primary" size="md">
          Zpět na hlavní stránku <ArrowUpRight size={16} />
        </Button>
        {latestArticles.length > 0 && (
          <ArticlesGrid
            title="Nejnovější články"
            description="Možná vás zaujmou tyto články."
            articles={latestArticles}
            loadMoreButton={false}
            limit={6}
          />
        )}
      </div>
      <Footer />
    </Template>
  );
}
