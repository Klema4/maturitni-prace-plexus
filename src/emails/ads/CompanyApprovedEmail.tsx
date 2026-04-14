import React from "react";
import { BaseEmailLayout } from "@/emails/layout/BaseEmailLayout";

interface CompanyApprovedEmailProps {
  companyName: string;
  dashboardUrl: string;
}

/**
 * CompanyApprovedEmail
 * React email šablona pro schválení firemní žádosti do reklamní sítě.
 * @param {CompanyApprovedEmailProps} props - Název firmy a URL na reklamní dashboard.
 * @returns {React.ReactElement} HTML email s informací o schválení.
 */
export function CompanyApprovedEmail({
  companyName,
  dashboardUrl,
}: CompanyApprovedEmailProps) {
  return (
    <BaseEmailLayout
      title="Žádost o firemní účet schválena - Plexus"
      previewText={`Vaše žádost o registraci firmy ${companyName} do reklamní sítě Plexus byla schválena.`}
    >
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>Dobrý den,</p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        vaše žádost o registraci firmy <strong>{companyName}</strong> do reklamní sítě Plexus byla{" "}
        <strong>schválena</strong>.
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        Nyní máte přístup k&nbsp;reklamnímu dashboardu a můžete začít spravovat své kampaně.
      </p>
      <p style={{ margin: "0 0 24px" }}>
        <a
          href={dashboardUrl}
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
          Otevřít reklamní dashboard
        </a>
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
        Přihlaste se do Plexus a pokračujte na stránku reklamního dashboardu, kde můžete založit první kampaň.
      </p>
      <p style={{ margin: "0", fontSize: "14px" }}>S pozdravem,<br />tým Plexus</p>
    </BaseEmailLayout>
  );
}

