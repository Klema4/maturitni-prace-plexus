import Link from 'next/link';

import { LegalPageShell } from '@/app/features/legal/components/LegalPageShell';

/**
 * Terms of Service (Podmínky použití) – právní stránka pro Plexus.
 * Text je záměrně psaný srozumitelně a „důvěryhodně“ pro školní projekt,
 * s placeholdery v hranatých závorkách pro doplnění reálných údajů.
 *
 * @returns {JSX.Element} Stránka Podmínek použití.
 */
export function TermsOfServicePage() {
  return (
    <LegalPageShell
      title="Podmínky použití"
      lead="Tyto podmínky vysvětlují, jak funguje Plexus, co od Vás očekáváme a jak zacházíme s obsahem a účty."
    >
      <p>
        Tyto Podmínky použití („<strong>Podmínky</strong>“) upravují přístup a užívání webové aplikace{' '}
        <strong>Plexus</strong> („<strong>Služba</strong>“), dostupné na adrese <strong>[domena.cz]</strong>, provozované{' '}
        <strong>[NÁZEV / JMÉNO]</strong>, IČO: <strong>[IČO]</strong>, se sídlem <strong>[ADRESA]</strong> (dále jen{' '}
        „<strong>Provozovatel</strong>“).
      </p>

      <p>
        Používáním Služby potvrzujete, že jste se s Podmínkami seznámil/a, rozumíte jim a souhlasíte s nimi. Pokud s nimi
        nesouhlasíte, Službu prosím nepoužívejte.
      </p>

      <h2>1) Co Plexus umí</h2>
      <p>Plexus je blogový a redakční systém, který může umožňovat zejména:</p>
      <ul>
        <li>prohlížení článků a veřejného obsahu,</li>
        <li>registraci a správu uživatelského profilu,</li>
        <li>komentování a hodnocení obsahu (pro registrované uživatele),</li>
        <li>správu obsahu, kategorií/štítků a reklam (pro administrátory),</li>
        <li>případně předplatné pro omezení zobrazování reklam.</li>
      </ul>

      <h2>2) Uživatelské účty a zabezpečení</h2>
      <ul>
        <li>
          <strong>Registrace</strong>: Některé funkce vyžadují účet. Při registraci uveďte pravdivé a aktuální údaje.
        </li>
        <li>
          <strong>Odpovědnost</strong>: Za činnost v rámci Vašeho účtu odpovídáte Vy. Pokud máte podezření na zneužití,
          napište nám na <strong>[kontakt@email.cz]</strong>.
        </li>
        <li>
          <strong>Přihlašování</strong>: Hesla ukládáme bezpečným způsobem (hash). Pokud Služba podporuje{' '}
          <strong>passkeys</strong>, můžete je využít jako pohodlnější způsob přihlášení.
        </li>
      </ul>

      <h2>3) Pravidla chování</h2>
      <p>Je zakázáno zejména:</p>
      <ul>
        <li>šířit nezákonný obsah, spam, malware nebo obsah porušující práva třetích stran,</li>
        <li>pokoušet se narušit bezpečnost Služby, obcházet omezení nebo přistupovat bez oprávnění,</li>
        <li>zneužívat komentáře/reakce k obtěžování, šikaně nebo nenávistným projevům.</li>
      </ul>
      <p>
        Provozovatel si vyhrazuje právo obsah moderovat a v odůvodněných případech odstranit nebo omezit přístup k účtu.
      </p>

      <h2>4) Uživatelský obsah (komentáře apod.)</h2>
      <p>
        Pokud do Služby vložíte obsah (např. komentář), prohlašujete, že k němu máte potřebná práva a že neporušuje zákon
        ani práva třetích stran.
      </p>
      <p>
        Vložením obsahu udělujete Provozovateli nevýhradní licenci k jeho zobrazení v rámci Služby a k technickým úpravám
        nutným pro publikaci (např. formátování).
      </p>

      <h2>5) Reklama a měření</h2>
      <p>
        Služba může zobrazovat reklamy a využívat základní měření návštěvnosti za účelem fungování a zlepšování Služby,
        vyhodnocení výkonu obsahu a reklamních ploch a prevence zneužití.
      </p>
      <p>
        Podrobnosti o zpracování osobních údajů najdete na stránce{' '}
        <Link href="/privacy-policy">Zásady ochrany osobních údajů</Link>.
      </p>

      <h2>6) Předplatné (pokud je dostupné)</h2>
      <p>Pokud Služba nabízí předplatné, platí zejména:</p>
      <ul>
        <li>cena, období a podmínky jsou uvedeny v rozhraní Služby,</li>
        <li>platby mohou být zpracovány prostřednictvím třetí strany (platební brány),</li>
        <li>pokud jde o „fiktivní“ předplatné pro školní projekt, je to výslovně označeno v rozhraní.</li>
      </ul>

      <h2>7) Dostupnost a změny Služby</h2>
      <p>
        Službu se snažíme provozovat spolehlivě, ale nezaručujeme nepřetržitou dostupnost. Můžeme ji dočasně omezit kvůli
        údržbě, bezpečnosti nebo z technických důvodů. Funkce a obsah Služby se mohou vyvíjet a měnit.
      </p>

      <h2>8) Odpovědnost</h2>
      <p>
        Služba je poskytována „tak jak je“. V maximálním rozsahu dovoleném právními předpisy neneseme odpovědnost za
        škody vzniklé užíváním nebo nemožností užívání Služby, za obsah vložený uživateli ani za odkazy na externí weby
        a služby.
      </p>

      <h2>9) Kontakt</h2>
      <p>
        Dotazy k Podmínkám směřujte na <strong>[kontakt@email.cz]</strong> nebo na adresu <strong>[ADRESA]</strong>.
      </p>

      <h2>10) Změny Podmínek</h2>
      <p>
        Podmínky můžeme aktualizovat. Datum účinnosti je uvedeno níže. Pokračováním v užívání Služby po změně berete
        aktualizaci na vědomí.
      </p>
      <p>
        <strong>Datum účinnosti:</strong> [DD.MM.RRRR]
      </p>
    </LegalPageShell>
  );
}

