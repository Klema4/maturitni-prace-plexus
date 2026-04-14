'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/blog/ui/Button";
import { Input } from "@/app/components/blog/ui/Inputs";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import {
  signInWithEmail,
  signInWithPasskey,
} from "@/app/features/blog/auth/api/auth.api";
import { useAuthSessionRedirect } from "@/app/features/blog/auth/hooks/useAuthSessionRedirect";

/**
 * DashboardLoginForm
 * Přihlašovací formulář pro administrátorský dashboard.
 * Používá Better Auth (stejný systém jako veřejná část) a po přihlášení
 * přesměruje uživatele do `/dashboard`. Registrace zde není dostupná.
 *
 * @returns {JSX.Element} Přihlašovací formulář pro dashboard.
 */
export function DashboardLoginForm() {
  const router = useRouter();
  const { checkingSession } = useAuthSessionRedirect("/dashboard");
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkConditionalUI = async () => {
        if (
          window.PublicKeyCredential &&
          "isConditionalMediationAvailable" in window.PublicKeyCredential &&
          (await (window.PublicKeyCredential as any)
            .isConditionalMediationAvailable?.())
        ) {
          void signInWithPasskey({ autoFill: true });
        }
      };
      void checkConditionalUI();
    }
  }, []);

  const handleEmailLogin = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithEmail({
        email: formData.email,
        password: formData.password,
      });

      if ((result as any)?.error) {
        setError(
          (result as any).error?.message || "Přihlášení selhalo",
        );
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Nastala chyba při přihlášení",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async (): Promise<void> => {
    setError(null);
    setPasskeyLoading(true);

    try {
      const result = await signInWithPasskey({
        autoFill: false,
        fetchOptions: {
          onSuccess: () => {
            router.push("/dashboard");
            router.refresh();
          },
          onError: (context: any) => {
            setError(
              context?.error?.message ||
                "Přihlášení přes passkey selhalo",
            );
          },
        },
      });

      if ((result as any)?.error) {
        setError(
          (result as any).error?.message ||
            "Přihlášení přes passkey selhalo",
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Nastala chyba při přihlášení přes passkey",
      );
    } finally {
      setPasskeyLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center py-8">
          <Loader2
            className="text-zinc-400 animate-spin"
            size={24}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {error && (
        <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm tracking-tight font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-5">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          required
          disabled={loading || passkeyLoading}
          autoComplete="username webauthn"
          variant="light"
        />

        <Input
          label="Heslo"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
          required
          disabled={loading || passkeyLoading}
          autoComplete="current-password webauthn"
          variant="light"
        />

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/account/auth/reset-password"
            className="text-primary hover:underline tracking-tight font-medium"
          >
            Zapomněli jste heslo?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full h-12!"
          disabled={loading || passkeyLoading}
        >
          {loading ? (
            <>
              <Loader2
                className="text-white animate-spin"
                size={16}
              />{" "}
              Přihlašuji...
            </>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ArrowRight className="text-white" size={16} />{" "}
              Přihlásit se
            </span>
          )}
        </Button>
      </form>

      <div className="text-center font-medium tracking-tight text-xs flex items-center justify-center gap-4">
        <div className="w-full border-t border-zinc-200" />
        <span className="text-zinc-500 uppercase">
          nebo
        </span>
        <div className="w-full border-t border-zinc-200" />
      </div>

      <Button
        type="button"
        variant="subtle"
        size="md"
        className="w-full h-12!"
        onClick={handlePasskeyLogin}
        disabled={loading || passkeyLoading}
      >
        {passkeyLoading ? (
          <>
            <Loader2
              className="text-zinc-500 animate-spin"
              size={16}
            />{" "}
            Přihlašuji...
          </>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="text-zinc-500" size={16} />{" "}
            Přihlásit se přes Passkey
          </span>
        )}
      </Button>
    </div>
  );
}

