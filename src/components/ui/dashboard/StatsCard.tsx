import { clsx } from "clsx";
import { Card } from "./Card";

/**
 * Karta se statistikou.
 * @param {StatsCardProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} StatsCard.
 */

export interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helperText?: string;
  className?: string;
  iconWrapperClassName?: string;
  valueClassName?: string;
  helperClassName?: string;
}

export function StatsCard({
  icon,
  label,
  value,
  helperText,
  className,
  iconWrapperClassName,
  valueClassName,
  helperClassName = "text-zinc-400",
}: StatsCardProps) {
  return (
    <Card className={clsx("p-4!", className)}>
      <div className="flex flex-col xl:flex-row items-start gap-4">
        <div
          className={clsx(
            "size-10 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center",
            iconWrapperClassName,
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-zinc-400 font-semibold tracking-tight">{label}</p>
          <p className={clsx("text-2xl font-medium text-white tracking-tight", valueClassName)}>
            {value}
          </p>
          {helperText && (
            <p className={clsx("text-xs tracking-tight font-semibold", helperClassName)}>{helperText}</p>
          )}
        </div>
      </div>
    </Card>
  );
}


