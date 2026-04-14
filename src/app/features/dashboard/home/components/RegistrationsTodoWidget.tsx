import { Card } from "@/components/ui/dashboard/Card";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { ChevronRight } from "lucide-react";

/**
 * Vlastnosti pro RegistrationsTodoWidget.
 */
export interface RegistrationsTodoWidgetProps {
  /** Počet žádostí čekajících na vyřízení */
  pendingCount: number;
}

/**
 * TODO widget zobrazující počet pending firemních registrací a odkaz na správu žádostí.
 * Zobrazuje se pouze adminům s ADS_ORGS_MANAGE.
 * @param {RegistrationsTodoWidgetProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} Widget s odkazem na stránku registrací.
 */
export function RegistrationsTodoWidget({
  pendingCount,
}: RegistrationsTodoWidgetProps) {
  if (pendingCount <= 0) {
    return <></>;
  }

  return (
    <Card
      href="/dashboard/ads/registrations"
      className="border-indigo-800/25! bg-indigo-800/10! hover:bg-indigo-800/20! hover:border-indigo-800/30! cursor-pointer"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <Heading variant="h4" className="tracking-tight">
              Firemní registrace
            </Heading>
            <Paragraph size="small" color="muted" className="tracking-tight">
              {pendingCount === 1
                ? "1 žádost čeká na vyřízení"
                : pendingCount < 5
                  ? `${pendingCount} žádosti čekají na vyřízení`
                  : `${pendingCount} žádostí čeká na vyřízení`}
            </Paragraph>
          </div>
        </div>
        <ChevronRight
          className="text-white shrink-0 mt-1"
          size={20}
          aria-hidden
        />
      </div>
    </Card>
  );
}
