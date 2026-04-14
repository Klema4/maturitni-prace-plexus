import Link from 'next/link';

import { SitePageShell } from '@/app/features/site/components/SitePageShell';

/**
 * About us stránka pro Plexus.
 * Text je psaný „důvěryhodně“ pro školní projekt a můžete si doplnit konkrétní údaje do hranatých závorek.
 *
 * @returns {JSX.Element} Stránka O nás.
 */
export function AboutUsPage() {
  return (
    <SitePageShell
      title="O nás"
      lead="Plexus je moderní redakční systém a magazín — postavený s důrazem na kvalitu obsahu, použitelnost a transparentní pravidla."
    >
      <p>
        Plexus vznikl jako projekt, který spojuje <strong>publikování článků</strong>, práci s <strong>kategoriemi a štítky</strong>,{' '}
        komunitní funkce (komentáře, hodnocení) a nástroje pro <strong>správu reklam</strong> a základní analytiku.
        Cílem je jednoduché prostředí pro čtenáře a přehledné workflow pro redaktory.
      </p>

      <h2>Co u nás najdeš</h2>
      <ul>
        <li>
          <strong>Články a rubriky</strong> — obsah třídíme do sekcí, kategorií a štítků pro rychlé vyhledávání.
        </li>
        <li>
          <strong>Diskuze a hodnocení</strong> — registrovaní uživatelé mohou reagovat a pomáhat vytvářet zdravou komunitu.
        </li>
        <li>
          <strong>Transparentní pravidla</strong> — moderace má jasná pravidla a reaguje na nahlášený obsah.
        </li>
        <li>
          <strong>Reklamní platforma</strong> — umožňuje spravovat reklamní plochy a základně vyhodnocovat výkon.
        </li>
      </ul>

      <h2>Naše zásady</h2>
      <ul>
        <li>
          <strong>Důvěra</strong>: snažíme se o jasné informace, žádné „skryté“ překvapení v nastavení.
        </li>
        <li>
          <strong>Bezpečnost</strong>: účty chráníme standardními postupy (hashování hesel, řízení oprávnění, ochrana proti zneužití).
        </li>
        <li>
          <strong>Respekt</strong>: prostor pro diskuzi je pro lidi — ne pro spam a útoky.
        </li>
      </ul>

      <h2>Kdo za tím stojí</h2>
      <p>
        Provozovatel: <strong>[NÁZEV / JMÉNO]</strong> · Kontakt: <strong>[kontakt@email.cz]</strong> · Sídlo: <strong>[ADRESA]</strong>
      </p>

      <h2>Právní a soukromí</h2>
      <p>
        Pokud Vás zajímají podrobnosti, podívejte se na{' '}
        <Link href="/privacy-policy">Zásady ochrany osobních údajů</Link> a{' '}
        <Link href="/terms-of-service">Podmínky použití</Link>.
      </p>
    </SitePageShell>
  );
}

