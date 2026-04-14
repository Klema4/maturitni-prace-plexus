import React from "react";
import { BaseEmailLayout } from "@/emails/layout/BaseEmailLayout";

interface CompanyRejectedEmailProps {
  companyName: string;
  reason: string;
  registrationUrl: string;
}

/**
 * CompanyRejectedEmail
 * React email šablona pro zamítnutí firemní žádosti do reklamní sítě.
 * @param {CompanyRejectedEmailProps} props - Název firmy, důvod zamítnutí a URL na registraci.
 * @returns {React.ReactElement} HTML email s informací o zamítnutí.
 */
export function CompanyRejectedEmail({
  companyName,
  reason,
  registrationUrl,
}: CompanyRejectedEmailProps) {
  return (
    <BaseEmailLayout
      title="Žádost o firemní účet zamítnuta - Plexus"
      previewText={`Vaše žádost o registraci firmy ${companyName} do reklamní sítě Plexus byla zamítnuta.`}
    >
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>Dobrý den,</p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        vaše žádost o registraci firmy <strong>{companyName}</strong> do reklamní sítě Plexus byla{" "}
        <strong>zamítnuta</strong>.
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        Důvod zamítnutí:
      </p>
      <p
        style={{
          margin: "0 0 24px",
          fontSize: "14px",
          padding: "12px 14px",
          borderRadius: "8px",
          backgroundColor: "#fef2f2",
          color: "#b91c1c",
        }}
      >
        {reason}
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        Po úpravě údajů můžete podat novou žádost na stránce registrace firmy:
      </p>
      <p style={{ margin: "0 0 24px" }}>
        <a
          href={registrationUrl}
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
          Otevřít stránku registrace firmy
        </a>
      </p>
      <p style={{ margin: "0", fontSize: "14px" }}>S pozdravem,<br />tým Plexus</p>
    </BaseEmailLayout>
  );
}

