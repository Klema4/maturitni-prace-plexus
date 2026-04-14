import React from "react";
import { BaseEmailLayout } from "@/emails/layout/BaseEmailLayout";

interface ResetPasswordEmailProps {
  resetUrl: string;
}

/**
 * ResetPasswordEmail
 * React email šablona pro obnovení hesla.
 * @param {ResetPasswordEmailProps} props - Vstupní vlastnosti s URL pro reset hesla.
 * @returns {React.ReactElement} HTML email s odkazem na reset hesla.
 */
export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <BaseEmailLayout
      title="Obnovení hesla - Plexus"
      previewText="Odkaz pro obnovení hesla k vašemu účtu v Plexus."
    >
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>Dobrý den,</p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        obdrželi jsme požadavek na obnovení hesla k&nbsp;vašemu účtu v Plexus.
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        Pokud jste požadavek zadali vy, pokračujte kliknutím na následující tlačítko:
      </p>
      <p style={{ margin: "0 0 24px" }}>
        <a
          href={resetUrl}
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
          Obnovit heslo
        </a>
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#4b5563" }}>
        Pokud tlačítko nefunguje, můžete použít následující odkaz:
      </p>
      <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#4b5563", wordBreak: "break-all" }}>
        <a href={resetUrl} style={{ color: "#111827" }}>
          {resetUrl}
        </a>
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        Pokud jste obnovu hesla nevyžádali, můžete tento email ignorovat. Vaše heslo zůstane beze změny.
      </p>
      <p style={{ margin: "0", fontSize: "14px" }}>S pozdravem,<br />tým Plexus</p>
    </BaseEmailLayout>
  );
}

