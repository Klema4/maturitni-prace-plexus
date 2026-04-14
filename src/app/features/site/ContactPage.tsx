import Link from 'next/link';

import { SitePageShell } from '@/app/features/site/components/SitePageShell';

/**
 * Kontaktní stránka pro Plexus.
 * Obsahuje praktické kontakty a očekávání odpovědi (placeholdery v hranatých závorkách).
 *
 * @returns {JSX.Element} Stránka Kontakt.
 */
export function ContactPage() {
  return (
    <SitePageShell
      title="Kontakt"
      lead="Napište nám — ať už řešíte podporu účtu, nahlášení obsahu, spolupráci nebo reklamu."
    >
      <h2>Rychlé kontakty</h2>
      <ul>
        <li>
          <strong>Podpora a účet</strong>: <strong>[support@email.cz]</strong>
        </li>
        <li>
          <strong>Redakce</strong>: <strong>[redakce@email.cz]</strong>
        </li>
        <li>
          <strong>Reklama / spolupráce</strong>: <strong>[ads@email.cz]</strong>
        </li>
      </ul>

      <h2>Nahlášení nevhodného obsahu</h2>
      <p>
        Pokud narazíte na obsah, který je spam, porušuje pravidla nebo je jinak nevhodný, dejte nám vědět. Ideálně pošlete:
      </p>
      <ul>
        <li>odkaz na článek/komentář,</li>
        <li>stručný popis, co je problém,</li>
        <li>případně screenshot (pokud pomůže).</li>
      </ul>
      <p>
        Děláme maximum pro rychlé vyřešení, ale některé případy vyžadují ověření (např. opakované zneužití, více účtů
        apod.).
      </p>

      <h2>Často řešené věci</h2>
      <ul>
        <li>
          <strong>Přihlášení / zapomenuté heslo</strong>: zkuste reset v účtu, případně napište na podporu.
        </li>
        <li>
          <strong>Soukromí</strong>: podrobnosti najdete v <Link href="/privacy-policy">Zásadách ochrany osobních údajů</Link>.
        </li>
        <li>
          <strong>Podmínky</strong>: pravidla používání jsou v <Link href="/terms-of-service">Podmínkách použití</Link>.
        </li>
      </ul>

      <h2>Fakturační údaje (pokud se uplatní)</h2>
      <p>
        Provozovatel: <strong>[NÁZEV / JMÉNO]</strong> · IČO: <strong>[IČO]</strong> · Adresa: <strong>[ADRESA]</strong>
      </p>
      <p>
        <strong>Odpověď obvykle do:</strong> [24–72 hodin] (dle vytížení).
      </p>
    </SitePageShell>
  );
}

