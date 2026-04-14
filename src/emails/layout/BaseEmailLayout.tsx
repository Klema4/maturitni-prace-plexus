import React from "react";

interface BaseEmailLayoutProps {
  previewText?: string;
  title?: string;
  children: React.ReactNode;
}

/**
 * Základní HTML layout pro všechny emaily.
 * Jednoduchý responzivní obal s neutrálním stylingem.
 */
export function BaseEmailLayout({ previewText, title, children }: BaseEmailLayoutProps) {
  return (
    <html lang="cs">
      <head>
        <meta charSet="utf-8" />
        <title>{title ?? "Plexus"}</title>
        {previewText && (
          <meta name="description" content={previewText} />
        )}
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f4f4f5" }}>
        {/* preview text pro email klienty */}
        {previewText && (
          <span
            style={{
              display: "none",
              color: "transparent",
              height: 0,
              width: 0,
              opacity: 0,
              overflow: "hidden",
              visibility: "hidden",
            }}
          >
            {previewText}
          </span>
        )}
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: "#f4f4f5", padding: "24px 0" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  width={600}
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "32px 32px 24px 32px",
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    color: "#111827",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ paddingBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: 600,
                            letterSpacing: "-0.03em",
                          }}
                        >
                          Plexus
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingTop: "24px", fontSize: "14px", lineHeight: 1.6 }}>
                        {children}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          paddingTop: "24px",
                          borderTop: "1px solid #e5e7eb",
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          Tento email byl odeslán automaticky systémem Plexus. Prosím, neodpovídej na něj.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

