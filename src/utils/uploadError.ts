/**
 * Přeloží časté upload chyby z knihoven/SDK do češtiny.
 */
export function localizeUploadErrorMessage(message?: string | null): string {
  if (!message) return "Chyba při nahrávání souboru";

  const normalized = message.toLowerCase();

  if (normalized.includes("invalid file type")) {
    return "Jeden nebo více souborů má nepodporovaný typ.";
  }
  if (normalized.includes("file too large") || normalized.includes("exceed maximum allowed size")) {
    return "Soubor překračuje maximální povolenou velikost.";
  }
  if (normalized.includes("too many files")) {
    return "Byl překročen maximální počet souborů pro jedno nahrání.";
  }
  if (normalized.includes("network") || normalized.includes("failed to fetch")) {
    return "Síťová chyba při nahrávání souboru.";
  }
  if (normalized.includes("storage endpoint")) {
    return "Úložiště není správně nakonfigurované.";
  }
  if (normalized.includes("access key")) {
    return "Přístupové údaje k úložišti nejsou správně nastavené.";
  }

  return message;
}

