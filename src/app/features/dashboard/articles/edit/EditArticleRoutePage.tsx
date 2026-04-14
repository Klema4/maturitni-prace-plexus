import { Suspense } from "react";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { EditArticleClient } from "@/app/features/dashboard/articles/edit/EditArticlePage";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Serverový obal komponenty pro úpravu článku.
 * Načte ID z params a předá ho klientské komponentě EditArticleClient.
 */
export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <>
          <header>
            <Heading variant="h1">Úprava článku</Heading>
            <Paragraph>Načítám článek...</Paragraph>
          </header>
          <div className="mt-4 flex items-center justify-center">
            <Paragraph color="muted">Načítám...</Paragraph>
          </div>
        </>
      }
    >
      <EditArticleClient articleId={id} />
    </Suspense>
  );
}
