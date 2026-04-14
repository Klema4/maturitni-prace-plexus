/**
 * Serverově bezpečný formátovač data.
 *
 * Tento modul formátuje `Date` nebo parsovatelný řetězec/číslo na lokalizovaný
 * český řetězec data ve formátu `dd.MM.yyyy`. Záměrně nepoužívá DOM ani čistě
 * browserová API a spoléhá jen na rozhraní dostupná v ECMAScriptu a Node.js
 * (`Date`, `Intl`).
 *
 * Použití:
 *   import { formatDateServer } from "@/utils/formatDateServer";
 *   formatDateServer(new Date());
 *
 * Funkce kopíruje chování klientského helperu `formatDate`:
 * - Pokud je `value` instance `Date`, použije ji přímo.
 * - Pokud je `value` řetězec nebo číslo, předá se do `new Date(value)`.
 * - Pokud je výsledné datum neplatné, vrátí se původní `value` jako řetězec.
 *
 * Implementace se nejdřív pokusí použít `Intl.DateTimeFormat`. Pokud `Intl`
 * není v runtime k dispozici, použije se jednoduchý formátovač `DD.MM.YYYY`
 * s doplněním nul zleva.
 */

export function formatDateServer(value: string | Date | number | null | undefined): string {
  if (value === null || value === undefined) return String(value);

  const date = value instanceof Date ? value : new Date(value as any);
  if (Number.isNaN(date.getTime())) return String(value);

  // Preferovaná cesta: použij `Intl`, pokud je k dispozici
  try {
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    // Záložní cesta: ruční formátování na `dd.MM.yyyy`
    const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));
    const day = pad2(date.getDate());
    const month = pad2(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
}

export default formatDateServer;
