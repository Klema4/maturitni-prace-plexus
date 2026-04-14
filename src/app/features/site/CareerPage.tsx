import Link from 'next/link';

import { SitePageShell } from '@/app/features/site/components/SitePageShell';

/**
 * Kariéra stránka pro Plexus.
 * Je psaná tak, aby působila věrohodně pro školní projekt, s konkrétními body co nabízíme a koho hledáme.
 *
 * @returns {JSX.Element} Stránka Kariéra.
 */
export function CareerPage() {
  return (
    <SitePageShell
      title="Kariéra"
      lead="Hledáme lidi, kterým záleží na obsahu, komunitě a kvalitním produktu. I malý tým může dělat velké věci."
    >
      <p>
        Plexus je projekt, který roste iterativně — postupně přidáváme funkce pro čtenáře, redaktory i správu reklamy.
        Pokud Vás baví web, psaní, design nebo produktové myšlení, rádi se ozveme.
      </p>

      <h2>Koho typicky hledáme</h2>
      <ul>
        <li>
          <strong>Redaktory a autory</strong> — kteří umí psát srozumitelně a mají cit pro zdroje.
        </li>
        <li>
          <strong>Moderátory komunity</strong> — kteří pomůžou udržet diskuze věcné a férové.
        </li>
        <li>
          <strong>Produkt / UX</strong> — lidi, kteří umí zjednodušovat složité věci.
        </li>
        <li>
          <strong>Vývoj</strong> — zaměření na Next.js/React, API a databázi, se smyslem pro stabilitu.
        </li>
      </ul>

      <h2>Co nabízíme</h2>
      <ul>
        <li>
          <strong>Jasné zadání a prioritu dopadu</strong> — radši méně věcí, ale pořádně.
        </li>
        <li>
          <strong>Prostor pro vlastní iniciativu</strong> — dobré nápady se u nás neztratí.
        </li>
        <li>
          <strong>Férovou komunikaci</strong> — očekávání dopředu, žádné „domýšlení“.
        </li>
        <li>
          <strong>Možnost spolupráce</strong> — [remote / hybrid / dle domluvy].
        </li>
      </ul>

      <h2>Jak se přihlásit</h2>
      <p>
        Pošlete krátké představení a odkazy na práci (GitHub/portfolio/ukázky textů) na <strong>[jobs@email.cz]</strong>.
        Pokud si nejste jistý/á, napište klidně i tak — nasměrujeme Vás.
      </p>
      <p>
        Obecné dotazy můžete poslat přes <Link href="/contact">kontakt</Link>.
      </p>
    </SitePageShell>
  );
}

