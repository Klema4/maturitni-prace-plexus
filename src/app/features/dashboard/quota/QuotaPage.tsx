"use client";

import { Card } from "@/components/ui/dashboard/Card";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { StatsCard } from "@/components/ui/dashboard/StatsCard";
import { HardDrive, FileText, Gauge, Clock3 } from "lucide-react";
import NoData from "@/components/ui/dashboard/NoData";
import { useQuotaPage } from "./hooks/useQuotaPage";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(date: string) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatDateOnly(date: string) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "—";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatTimeOnly(date: string) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "—";
  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default function QuotaPage() {
  const {
    profile,
    stats,
    files,
    loading,
    error,
    quotaLimitBytes,
    usedBytes,
    remainingBytes,
    usagePercent,
    usagePercentRounded,
    latestUpload,
  } = useQuotaPage();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Kvóta úložiště</Heading>
          <Paragraph>
            Přehled využití tvého úložiště a nahraných souborů.
          </Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám kvótu...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Kvóta úložiště</Heading>
          <Paragraph>
            Přehled využití tvého úložiště a nahraných souborů.
          </Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">
            {error}
          </Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Kvóta úložiště</Heading>
        <Paragraph>
          {profile
            ? `Přehled pro ${profile.name} ${profile.surname}.`
            : "Přehled využití tvého úložiště a nahraných souborů."}
        </Paragraph>
      </header>

      <section className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<Gauge size={20} />}
            label="Zaplnění"
            value={`${usagePercentRounded} %`}
            helperText={`${formatBytes(usedBytes)} využito`}
          />
          <StatsCard
            icon={<HardDrive size={20} />}
            label="Zbývá"
            value={formatBytes(remainingBytes)}
            helperText={`z ${formatBytes(quotaLimitBytes)}`}
          />
          <StatsCard
            icon={<FileText size={20} />}
            label="Moje soubory"
            value={stats.totalFiles}
            helperText="Nahrané položky"
          />
          <StatsCard
            icon={<Clock3 size={20} />}
            label="Poslední nahrání"
            value={latestUpload ? formatDateOnly(latestUpload) : "—"}
            helperText={
              latestUpload ? formatTimeOnly(latestUpload) : "Žádný soubor"
            }
          />
        </div>
      </section>

      <section className="mt-6">
        <Card className="p-5!">
          <div className="flex items-center justify-between gap-3 mb-4">
            <Heading variant="h4">Využití kvóty</Heading>
            <p className="text-sm font-semibold tracking-tight text-zinc-300">
              {usagePercentRounded} %
            </p>
          </div>
          <div className="h-4 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/70">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium tracking-tight text-zinc-400">
            <span>{formatBytes(usedBytes)} využito</span>
            <span>{formatBytes(remainingBytes)} zbývá</span>
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Heading variant="h3">Nahrané soubory</Heading>
        <div className="mt-3">
          <Card className="p-0! overflow-hidden">
            <div className="grid grid-cols-12 border-b border-zinc-800 bg-zinc-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <div className="col-span-7">Název</div>
              <div className="col-span-2 text-right">Velikost</div>
              <div className="col-span-3 text-right">Nahráno</div>
            </div>
            {files.length === 0 ? (
              <NoData />
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-12 items-center px-4 py-3 border-b border-zinc-800/70 last:border-b-0"
                >
                  <div className="col-span-7 min-w-0">
                    <p className="text-sm font-semibold tracking-tight text-zinc-200 truncate">
                      {file.fileName}
                    </p>
                  </div>
                  <div className="col-span-2 text-right text-sm font-medium tracking-tight text-zinc-400">
                    {formatBytes(file.fileSize)}
                  </div>
                  <div className="col-span-3 text-right text-sm font-medium tracking-tight text-zinc-400">
                    {formatDate(file.uploadedAt)}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
