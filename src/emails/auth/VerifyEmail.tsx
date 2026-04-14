import React from "react";
import { BaseEmailLayout } from "@/emails/layout/BaseEmailLayout";

interface VerifyEmailProps {
  verifyUrl: string;
}

/**
 * VerifyEmail
 * React email šablona pro ověření emailové adresy.
 * @param {VerifyEmailProps} props - Vstupní vlastnosti s URL pro ověření.
 * @returns {React.ReactElement} HTML email s odkazem na ověření emailu.
 */
export function VerifyEmail({ verifyUrl }: VerifyEmailProps) {
  return (
    <BaseEmailLayout
      title="Ověření emailové adresy - Plexus"
      previewText="Ověřte svou emailovou adresu pro dokončení registrace v Plexus."
    >
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>Dobrý den,</p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        děkujeme za registraci v Plexus. Pro dokončení nastavení účtu prosím ověřte svou emailovou adresu kliknutím na následující tlačítko:
      </p>
      <p style={{ margin: "0 0 24px" }}>
        <a
          href={verifyUrl}
          style={{
            display: "inline-block",
            padding: "10px 18px",
            borderRadius: "9999px",
            backgroundColor: "#111827",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Ověřit email
        </a>
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#4b5563" }}>
        Pokud tlačítko nefunguje, můžete použít následující odkaz:
      </p>
      <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#4b5563", wordBreak: "break-all" }}>
        <a href={verifyUrl} style={{ color: "#111827" }}>
          {verifyUrl}
        </a>
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        Pokud jste se v Plexus neregistrovali vy, můžete tento email ignorovat.
      </p>
      <p style={{ margin: "0", fontSize: "14px" }}>S pozdravem,<br />tým Plexus</p>
    </BaseEmailLayout>
  );
}

