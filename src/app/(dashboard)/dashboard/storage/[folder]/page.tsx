import StorageFolderPage from "@/app/features/dashboard/storage/StorageFolderPage";

export default function Page({
  params,
}: {
  params: Promise<{ folder: string }>;
}) {
  return <StorageFolderPage params={params} />;
}
