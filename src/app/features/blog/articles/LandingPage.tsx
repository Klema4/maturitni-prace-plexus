import DiscoverSection from "@/app/features/blog/articles/components/DiscoverSection";
import MainArticleCard from "@/app/features/blog/articles/components/MainArticleCard";
import { getHeroArticle, getLatestArticles } from "@/app/features/blog/articles/api/articles.api";
import ArticlesGrid from "@/app/features/blog/articles/components/ArticlesGrid";

/**
 * LandingPage komponenta
 * Načítá nejnovější publikovaný článek a zobrazuje ho v hero kartě,
 * spolu s objevovací sekcí článků a gridem nejnovějších článků.
 * @returns {Promise<JSX.Element>} Landing page blogu.
 */
export default async function LandingPage() {
    const heroArticle = await getHeroArticle();
    const { articles: latestArticles, personalized } = await getLatestArticles(4);

    return (
        <>
            <DiscoverSection />
            {heroArticle && <MainArticleCard article={heroArticle} />}
            <ArticlesGrid
                title={personalized ? "Doporučeno pro vás" : "To nejnovější z naší redakce"}
                description={personalized ? "Články podle vašich oblíbených štítků." : "Zde najdete nejnovější články z naší redakce."}
                articles={latestArticles}
                loadMoreButton={true}
                limit={4}
            />
        </>
    );
}