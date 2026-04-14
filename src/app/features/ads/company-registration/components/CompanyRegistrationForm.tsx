"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import { Card } from "@/app/components/blog/ui/Card";
import { Button } from "@/app/components/blog/ui/Button";
import { Input } from "@/app/components/blog/ui/Inputs";
import {
  Loader2,
  FileText,
  ArrowRight,
  ShieldCheck,
  Clock3,
  XCircle,
} from "lucide-react";

type ApplicationStatus =
  | "none"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "withdrawn";

interface ExistingApplication {
  status: ApplicationStatus;
  companyName: string;
  rejectionReason?: string | null;
}
export default function CompanyRegistrationForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [existingApplication, setExistingApplication] =
    useState<ExistingApplication | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    websiteUrl: "",
    email: "",
    phone: "",
    location: "",
    ico: "",
    note: "",
  });

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/companies/registration/me");
        if (res.status === 401) {
          setExistingApplication(null);
          return;
        }
        if (!res.ok) {
          throw new Error("Nepodařilo se načíst stav žádosti");
        }
        const data = await res.json();
        if (data.application) {
          setExistingApplication({
            status: data.application.status,
            companyName: data.application.companyName,
            rejectionReason: data.application.rejectionReason ?? null,
          });
        } else {
          setExistingApplication(null);
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Nepodařilo se načíst stav žádosti");
      } finally {
        setLoading(false);
      }
    };

    void loadStatus();
  }, []);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    setSubmitting(true);
    try {
      const res = await fetch("/api/companies/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Nepodařilo se odeslat žádost");
      }

      setSuccessMessage(
        "Žádost byla úspěšně odeslána. O jejím stavu Vás budeme informovat.",
      );
      if (data.application) {
        setExistingApplication({
          status: data.application.status,
          companyName: data.application.companyName,
          rejectionReason: data.application.rejectionReason ?? null,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Nepodařilo se odeslat žádost");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = () => {
    if (!existingApplication) return null;

    const status = existingApplication.status;
    const baseClasses =
      "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium tracking-tight";

    if (status === "approved") {
      return (
        <span className={clsx(baseClasses, "bg-emerald-100 text-emerald-800")}>
          <ShieldCheck size={16} />
          Schváleno
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className={clsx(baseClasses, "bg-rose-100 text-rose-800")}>
          <XCircle size={16} />
          Zamítnuto
        </span>
      );
    }

    if (status === "submitted" || status === "under_review") {
      return (
        <span className={clsx(baseClasses, "bg-amber-100 text-amber-800")}>
          <Clock3 size={16} />
          V řešení
        </span>
      );
    }

    if (status === "withdrawn") {
      return (
        <span className={clsx(baseClasses, "bg-zinc-100 text-zinc-700")}>
          Žádost byla stažena
        </span>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Card className="rounded-[28px] border-black/6 bg-white/88 p-8 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.3)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary animate-spin" size={32} />
          <p className="text-zinc-600 tracking-tight">Načítám stav žádosti…</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {existingApplication && (
        <Card className="rounded-[28px] border-black/6 bg-white/88 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.3)]">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Stav Vaší poslední žádosti
            </p>
            {renderStatusBadge()}
            <p className="text-sm text-zinc-600 tracking-tight">
              Firma:{" "}
              <span className="font-semibold">
                {existingApplication.companyName}
              </span>
            </p>
            {existingApplication.status === "approved" ? (
              <p className="text-sm tracking-tight text-zinc-600">
                Žádost byla schválena a firemní prostor reklam je připravený k použití.
              </p>
            ) : null}
            {existingApplication.status === "submitted" ||
            existingApplication.status === "under_review" ? (
              <p className="text-sm tracking-tight text-zinc-600">
                Žádost právě kontrolujeme. Jakmile ji uzavřeme, ozveme se na uvedený kontakt.
              </p>
            ) : null}
            {existingApplication.status === "rejected" &&
              existingApplication.rejectionReason && (
                <p className="text-sm text-rose-700 tracking-tight">
                  Důvod zamítnutí: {existingApplication.rejectionReason}
                </p>
              )}
          </div>
          {existingApplication.status === "approved" && (
            <div className="mt-4">
              <Link href="/firmy/reklamy" className="inline-flex w-full">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full cursor-pointer tracking-tight flex items-center gap-2 h-10"
                >
                  Přejít do panelu pro správu reklam
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          )}
        </Card>
      )}

      <Card className="rounded-[28px] border-black/6 bg-white/88 p-8 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.3)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Údaje o firmě
            </p>
            <h2 className="newsreader text-3xl font-medium tracking-[-0.04em] text-dark">
              Odeslat žádost
            </h2>
            <p className="max-w-2xl text-sm font-medium leading-relaxed tracking-tight text-zinc-600">
              Vyplňte základní identitu firmy a kontakt, na který se můžeme v případě potřeby ozvat.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm tracking-tight font-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm tracking-tight font-medium">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Název firmy"
              type="text"
              value={formData.companyName}
              onChange={handleChange("companyName")}
              required
              maxLength={64}
              variant="light"
            />
            <Input
              label="IČO"
              type="text"
              value={formData.ico}
              onChange={handleChange("ico")}
              maxLength={9}
              variant="light"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Webová stránka"
              type="url"
              value={formData.websiteUrl}
              onChange={handleChange("websiteUrl")}
              placeholder="https://"
              maxLength={128}
              variant="light"
            />
            <Input
              label="E-mail firmy"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              required
              maxLength={128}
              variant="light"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefon"
              type="text"
              value={formData.phone}
              onChange={handleChange("phone")}
              required
              maxLength={128}
              variant="light"
            />
            <Input
              label="Lokace"
              type="text"
              value={formData.location}
              onChange={handleChange("location")}
              required
              maxLength={128}
              variant="light"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="company-registration-note"
              className="flex items-center gap-2 text-sm font-medium tracking-tight text-zinc-800"
            >
              <FileText size={16} />
              Poznámka k žádosti (volitelné)
            </label>
            <textarea
              id="company-registration-note"
              value={formData.note}
              onChange={handleChange("note")}
              rows={4}
              maxLength={2048}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm tracking-tight text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Popište, jak chcete reklamní účet využívat, případně doplňte další informace."
            />
            <p className="text-xs text-zinc-400 tracking-tight">
              Max. 2000 znaků.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="cursor-pointer"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Odesílám žádost…
                </>
              ) : (
                "Odeslat žádost"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
