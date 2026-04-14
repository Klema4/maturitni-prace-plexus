import EditArticleRoutePage from "@/app/features/dashboard/articles/edit/EditArticleRoutePage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  return <EditArticleRoutePage params={params} />;
}
