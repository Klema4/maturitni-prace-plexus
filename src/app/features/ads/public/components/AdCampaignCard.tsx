import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";
import type { PublicAdCampaign } from "@/app/features/ads/public/types";

interface AdCampaignCardProps {
  campaign: PublicAdCampaign;
  className?: string;
  interactive?: boolean;
}

function resolveAdHref(campaign: PublicAdCampaign) {
  return campaign.bannerUrl || campaign.organization.websiteUrl || null;
}

export default function AdCampaignCard({
  campaign,
  className,
  interactive = false,
}: AdCampaignCardProps) {
  const href = resolveAdHref(campaign);

  const content = (
    <>
      <div
        className="relative overflow-hidden bg-zinc-100"
        style={{ aspectRatio: "17 / 5" }}
      >
        {campaign.bannerImageUrl ? (
          <Image
            src={campaign.bannerImageUrl}
            alt={campaign.name}
            fill
            quality={75}
            className={`aspect-17/5 object-cover transition-transform duration-300 ${
              interactive ? "group-hover:scale-[1.02]" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_45%),linear-gradient(180deg,_rgba(244,244,245,1),_rgba(228,228,231,1))] text-zinc-500">
            <Megaphone size={28} />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium tracking-tight text-zinc-700 backdrop-blur-sm">
            Reklama
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {campaign.organization.imageUrl ? (
              <Image
                src={campaign.organization.imageUrl}
                alt={`${campaign.organization.name} logo`}
                width={20}
                height={20}
                className="h-5 w-5 rounded-full border border-zinc-200 bg-white object-cover"
              />
            ) : null}
            <p className="text-xs font-medium tracking-tight text-zinc-500">
              {campaign.organization.name}
            </p>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            {campaign.name}
          </h3>
          {campaign.description ? (
            <p className="text-sm leading-6 tracking-tight text-zinc-600">
              {campaign.description}
            </p>
          ) : null}
        </div>

        {href ? (
          <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-primary">
            Otevřít
            <ArrowUpRight size={16} />
          </span>
        ) : null}
      </div>
    </>
  );

  const wrapperClassName = [
    "overflow-hidden rounded-xl border border-zinc-200 bg-white/75 font-medium tracking-tight backdrop-blur-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noreferrer sponsored"
        className={`${wrapperClassName} group block transition-transform duration-200 hover:-translate-y-0.5`}
      >
        {content}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
