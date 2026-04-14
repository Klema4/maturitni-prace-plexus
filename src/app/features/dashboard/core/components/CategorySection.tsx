import { Card } from "@/components/ui/dashboard/Card";
import { Heading } from "@/components/ui/dashboard/TextUtils";
import type { DashboardCategory } from "../dashboardNavigation";

/**
 * Komponenta pro zobrazení jedné kategorie stránek dashboardu
 * @param {Object} props - Vlastnosti komponenty
 * @param {DashboardCategory} props.category - Kategorie stránek k zobrazení
 * @param {boolean} props.showDivider - Zda zobrazit oddělovač pod kategorií
 * @returns {JSX.Element} Renderovaná sekce kategorie
 */
export function CategorySection({ category, showDivider }: { category: DashboardCategory; showDivider: boolean }) {
  const IconComponent = category.icon;

  return (
    <>
      <div>
        <Heading variant="h3" className="mb-2 flex items-center gap-2">
          <IconComponent size={24} /> {category.category}
        </Heading>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {category.pages.map((page) => {
            const PageIcon = page.icon;
            return (
              <Card href={page.href} className="flex flex-col gap-3 h-full" key={page.name}>
                <div className="rounded-lg size-10 flex items-center justify-center bg-zinc-800 text-zinc-200">
                  <PageIcon size={20} />
                </div>
                <div>
                  <h5 className="text-lg tracking-tight font-semibold text-zinc-200">{page.name}</h5>
                  <p className="text-xs text-zinc-400 font-medium -tracking-[0.01em]">{page.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      {showDivider && <hr className="my-8 border-zinc-800/50" />}
    </>
  );
}

