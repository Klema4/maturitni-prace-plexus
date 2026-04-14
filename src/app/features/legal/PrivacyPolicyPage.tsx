import Link from 'next/link';

import { LegalPageShell } from '@/app/features/legal/components/LegalPageShell';

/**
 * Privacy Policy (Zásady ochrany osobních údajů) – právní stránka pro Plexus.
 * Text je určený pro školní projekt a obsahuje placeholdery v hranatých závorkách
 * pro doplnění reálných údajů správce a kontaktů.
 *
 * @returns {JSX.Element} Stránka zásad ochrany osobních údajů.
 */
export function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Zásady ochrany osobních údajů"
      lead="Zde najdete přehledně, jaké údaje zpracováváme, proč je potřebujeme a jaká máte práva."
    >
      <p>
        Tyto zásady vysvětlují, jak ve Službě <strong>Plexus</strong> zpracováváme osobní údaje. Snažíme se být
        transparentní a používat jen takové údaje, které dává smysl pro bezpečný a funkční provoz.
      </p>

      <h2>1) Kdo je správce</h2>
      <p>
        Správcem osobních údajů je <strong>[NÁZEV / JMÉNO]</strong>, IČO: <strong>[IČO]</strong>, se sídlem{' '}
        <strong>[ADRESA]</strong> („<strong>Správce</strong>“).
      </p>
      <p>
        Kontakt: <strong>[kontakt@email.cz]</strong>
      </p>

      <h2>2) Jaké údaje zpracováváme</h2>
      <p>V závislosti na tom, jak Službu používáš, můžeme zpracovávat:</p>
      <ul>
        <li>
          <strong>Účetní údaje</strong>: e-mail, uživatelské jméno/přezdívka, nastavení účtu, role/oprávnění.
        </li>
        <li>
          <strong>Autentizační údaje</strong>: bezpečně uložené přihlašovací údaje (heslo ukládáme jako hash), případně
          veřejné identifikátory pro <strong>passkeys</strong>.
        </li>
        <li>
          <strong>Obsah a interakce</strong>: komentáře, hodnocení, hlášení nevhodného obsahu.
        </li>
        <li>
          <strong>Technické údaje</strong>: IP adresa, typ zařízení a prohlížeče, identifikátory cookies/úložiště, logy
          pro bezpečnost a diagnostiku.
        </li>
        <li>
          <strong>Analytika používání</strong>: přibližné informace o návštěvnosti a chování v aplikaci (např. zobrazení
          stránek, základní události).
        </li>
        <li>
          <strong>Předplatné/platby (pokud je aktivní)</strong>: stav předplatného a identifikátory od platební brány.
        </li>
      </ul>

      <h2>3) Proč údaje zpracováváme (účely)</h2>
      <ul>
        <li>
          <strong>Provoz Služby</strong>: registrace, přihlášení, správa účtu, poskytování funkcí.
        </li>
        <li>
          <strong>Zabezpečení</strong>: prevence zneužití, ochrana proti útokům, auditní logy.
        </li>
        <li>
          <strong>Moderace a komunita</strong>: správa komentářů, řešení hlášení, vymáhání pravidel.
        </li>
        <li>
          <strong>Analytika a zlepšování</strong>: měření výkonu a použitelnosti, ladění chyb.
        </li>
        <li>
          <strong>Reklama (pokud je součástí)</strong>: zobrazování reklamních ploch a vyhodnocení jejich základního
          výkonu.
        </li>
        <li>
          <strong>Komunikace</strong>: reakce na dotazy a provozní upozornění (např. bezpečnostní incident).
        </li>
      </ul>

      <h2>4) Právní základy zpracování</h2>
      <p>Zpracování typicky stojí na:</p>
      <ul>
        <li>
          <strong>plnění smlouvy</strong> (poskytování účtu a funkcí),
        </li>
        <li>
          <strong>oprávněném zájmu</strong> (zabezpečení, prevence zneužití, základní analytika a zlepšování),
        </li>
        <li>
          <strong>souhlasu</strong> (tam, kde je vyžadován — typicky pro některé typy cookies/marketing),
        </li>
        <li>
          <strong>splnění právní povinnosti</strong> (pokud se uplatní, např. účetnictví).
        </li>
      </ul>

      <h2>5) Cookies a podobné technologie</h2>
      <p>
        Používáme cookies a/nebo local storage pro nezbytné funkce (např. přihlášení a bezpečnost), preferenční nastavení
        a analytiku. V závislosti na konfiguraci Služby může být dostupná správa souhlasů.
      </p>

      <h2>6) Komu údaje předáváme (zpracovatelé)</h2>
      <p>
        Údaje můžeme sdílet pouze v nezbytném rozsahu s ověřenými poskytovateli, kteří nám pomáhají Službu provozovat,
        například infrastruktura/hosting, e-mailové služby, analytické nástroje, úložiště souborů nebo platební brána (pokud
        je aktivní).
      </p>
      <p>
        Konkrétní seznam si můžete vyžádat na <strong>[kontakt@email.cz]</strong>.
      </p>

      <h2>7) Přenos mimo EU/EHP</h2>
      <p>
        Pokud některý poskytovatel působí mimo EU/EHP, dbáme na odpovídající záruky (např. standardní smluvní doložky),
        aby byla zachována úroveň ochrany.
      </p>

      <h2>8) Jak dlouho údaje uchováváme</h2>
      <p>Údaje uchováváme po dobu nezbytnou pro účely zpracování, typicky:</p>
      <ul>
        <li>účetní údaje po dobu existence účtu a přiměřeně poté (např. pro řešení sporů),</li>
        <li>bezpečnostní logy krátkodobě, pokud není nutné delší uchování kvůli incidentu,</li>
        <li>komentáře a obsah do smazání/anonymizace nebo dle pravidel moderace,</li>
        <li>údaje o předplatném dle zákonných/účetních povinností, pokud se uplatní.</li>
      </ul>

      <h2>9) Jaká máš práva</h2>
      <p>V závislosti na situaci můžete uplatnit právo na:</p>
      <ul>
        <li>přístup k údajům,</li>
        <li>opravu nepřesných údajů,</li>
        <li>výmaz (pokud nejsou důvody pro další zpracování),</li>
        <li>omezení zpracování,</li>
        <li>přenositelnost (kde je relevantní),</li>
        <li>námitku proti zpracování z oprávněného zájmu,</li>
        <li>odvolání souhlasu (pokud je zpracování na souhlasu založené).</li>
      </ul>
      <p>
        Pro uplatnění práv nás kontaktujte na <strong>[kontakt@email.cz]</strong>.
      </p>

      <h2>10) Zabezpečení</h2>
      <p>
        Používáme přiměřená technická a organizační opatření, zejména hashování hesel, řízení přístupových práv (role) a
        ochranu proti zneužití. Komunikace se Službou by měla probíhat přes HTTPS, pokud je správně nasazeno na doméně.
      </p>

      <h2>11) Související dokumenty</h2>
      <p>
        Podmínky použití najdeš na stránce <Link href="/terms-of-service">Podmínky použití</Link>.
      </p>

      <h2>12) Změny těchto zásad</h2>
      <p>
        Tyto zásady můžeme aktualizovat. Aktuální verze je dostupná na <strong>[domena.cz/privacy-policy]</strong>.
      </p>
      <p>
        <strong>Datum účinnosti:</strong> [DD.MM.RRRR]
      </p>
    </LegalPageShell>
  );
}

