"use client";

import { useMemo } from "react";
import Button from "@/components/ui/dashboard/Button";
import { Paragraph } from "@/components/ui/dashboard/TextUtils";

/**
 * Dashboard pagination komponenta.
 * Umí přepínat stránky, zobrazit kompaktní rozsah a změnit počet položek na stránku.
 *
 * @param {Object} props - Props komponenty.
 * @param {number} props.page - Aktuální stránka (1-index).
 * @param {number} props.totalPages - Celkový počet stránek.
 * @param {number} props.total - Celkový počet položek (pro text).
 * @param {number} props.perPage - Položek na stránku.
 * @param {(nextPage: number) => void} props.onPageChange - Změna stránky.
 * @param {(nextPerPage: number) => void} props.onPerPageChange - Změna počtu položek na stránku.
 * @param {number[]} [props.perPageOptions] - Volitelné možnosti pro perPage.
 * @param {number} [props.visiblePageCount] - Počet zobrazených stránek v paginaci.
 * @returns {JSX.Element} Paginace.
 */
export default function Pagination({
  page,
  totalPages,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 20, 50, 100],
  visiblePageCount = 7,
}: {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (nextPage: number) => void;
  onPerPageChange: (nextPerPage: number) => void;
  perPageOptions?: number[];
  visiblePageCount?: number;
}) {
  const range = useMemo(() => {
    const safeTotalPages = Math.max(1, totalPages);
    const safePage = Math.min(Math.max(1, page), safeTotalPages);

    const half = Math.floor(visiblePageCount / 2);
    let start = Math.max(1, safePage - half);
    let end = Math.min(safeTotalPages, start + visiblePageCount - 1);
    start = Math.max(1, end - visiblePageCount + 1);
    return { start, end, safeTotalPages, safePage };
  }, [page, totalPages, visiblePageCount]);

  if (range.safeTotalPages <= 1) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Paragraph size="small" color="muted">
          Celkem <span className="text-zinc-200 font-semibold">{total}</span> · 1 stránka
        </Paragraph>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium tracking-tight text-zinc-500">
            Na stránku
          </label>
          <select
            value={perPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            className="h-9 rounded-md border border-zinc-700/50 bg-zinc-800/75 px-3 text-sm font-medium tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-white/75"
          >
            {perPageOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Paragraph size="small" color="muted">
        Stránka <span className="text-zinc-200 font-semibold">{range.safePage}</span>{" "}
        z <span className="text-zinc-200 font-semibold">{range.safeTotalPages}</span>{" "}
        · Celkem <span className="text-zinc-200 font-semibold">{total}</span>
      </Paragraph>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex items-center gap-2">
          <Button
            href="#"
            variant="outline"
            onClick={() => onPageChange(Math.max(1, range.safePage - 1))}
            className="cursor-pointer tracking-tight"
            disabled={range.safePage <= 1}
          >
            Předchozí
          </Button>
          <Button
            href="#"
            variant="outline"
            onClick={() =>
              onPageChange(Math.min(range.safeTotalPages, range.safePage + 1))
            }
            className="cursor-pointer tracking-tight"
            disabled={range.safePage >= range.safeTotalPages}
          >
            Další
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {range.start > 1 ? (
            <>
              <Button
                href="#"
                variant={range.safePage === 1 ? "primary" : "outline"}
                onClick={() => onPageChange(1)}
                className="cursor-pointer tracking-tight"
              >
                1
              </Button>
              {range.start > 2 ? (
                <span className="px-1 text-xs font-medium tracking-tight text-zinc-500">
                  …
                </span>
              ) : null}
            </>
          ) : null}

          {Array.from({ length: range.end - range.start + 1 }, (_, idx) => range.start + idx).map(
            (p) => (
              <Button
                key={p}
                href="#"
                variant={range.safePage === p ? "primary" : "outline"}
                onClick={() => onPageChange(p)}
                className="cursor-pointer tracking-tight"
              >
                {p}
              </Button>
            ),
          )}

          {range.end < range.safeTotalPages ? (
            <>
              {range.end < range.safeTotalPages - 1 ? (
                <span className="px-1 text-xs font-medium tracking-tight text-zinc-500">
                  …
                </span>
              ) : null}
              <Button
                href="#"
                variant={range.safePage === range.safeTotalPages ? "primary" : "outline"}
                onClick={() => onPageChange(range.safeTotalPages)}
                className="cursor-pointer tracking-tight"
              >
                {range.safeTotalPages}
              </Button>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:ml-2">
          <label className="text-xs font-medium tracking-tight text-zinc-500">
            Na stránku
          </label>
          <select
            value={perPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            className="h-9 rounded-md border border-zinc-700/50 bg-zinc-800/75 px-3 text-sm font-medium tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-white/75"
          >
            {perPageOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

