/**
 * Převede datum na českou lidsky čitelnou ("ago") nebo absolutní interpretaci pro blog.
 * Pro nedávná data vrací tvary jako "Publikováno před 12 hodinami" nebo "Publikováno před 2 dny",
 * pro starší data vrací absolutní datum ve tvaru "Publikováno 1. 1. 2024".
 * @param {string | Date} input - Datum publikace jako objekt Date nebo parsovatelný řetězec.
 * @returns {string} Naformátovaný český text pro zobrazení data publikace.
 */
export function formatPublishedAt(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Budoucí datum – "Bude publikováno za ..." nebo "Bude publikováno DD. MM. YYYY" pro vzdálenější datum.
  if (diffMs < 0) {
    const futureMs = -diffMs;
    const futureSeconds = Math.floor(futureMs / 1000);
    const futureMinutes = Math.floor(futureSeconds / 60);
    const futureHours = Math.floor(futureMinutes / 60);
    const futureDays = Math.floor(futureHours / 24);

    if (futureSeconds < 60) {
      return 'Bude publikováno za pár vteřin';
    }

    if (futureMinutes < 60) {
      const minutes = futureMinutes;
      const unit =
        minutes === 1 ? 'minutu' : minutes >= 2 && minutes <= 4 ? 'minuty' : 'minut';
      return `Bude publikováno za ${minutes} ${unit}`;
    }

    if (futureHours < 24) {
      const hours = futureHours;
      const unit =
        hours === 1 ? 'hodinu' : hours >= 2 && hours <= 4 ? 'hodiny' : 'hodin';
      return `Bude publikováno za ${hours} ${unit}`;
    }
    
    // Pokud je datum dál než týden, vrať absolutní datum s prefixem.
    if (futureDays >= 7) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `Bude publikováno ${day}. ${month}. ${year}`;
    }

    const days = futureDays || 1;
    const unit = days === 1 ? 'den' : days >= 2 && days <= 4 ? 'dny' : 'dní';
    return `Bude publikováno za ${days} ${unit}`;
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Publikováno před několika vteřinami';
  }

  if (diffMinutes < 60) {
    const minutes = diffMinutes;
    const suffix =
      minutes === 1 ? 'minutou' : minutes >= 2 && minutes <= 4 ? 'minutami' : 'minutami';
    return `Publikováno před ${minutes} ${suffix}`;
  }

  if (diffHours < 24) {
    const hours = diffHours;
    const suffix = hours === 1 ? 'hodinou' : hours >= 2 && hours <= 4 ? 'hodinami' : 'hodinami';
    return `Publikováno před ${hours} ${suffix}`;
  }

  if (diffDays < 30) {
    const days = diffDays;
    const suffix = days === 1 ? 'dnem' : 'dny';
    return `Publikováno před ${days} ${suffix}`;
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `Publikováno ${day}. ${month}. ${year}`;
}

/**
 * Převede datum na český relativní čas bez prefixu ("před ...") nebo absolutní datum ("D. M. YYYY").
 * Použij pro texty typu "Upraveno ..." bez zdvojení slov "Publikováno".
 * @param {string | Date} input - Datum jako objekt Date nebo parsovatelný řetězec.
 * @returns {string} Naformátovaný český text bez prefixu.
 */
export function formatDateAgo(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}. ${month}. ${year}`;
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "před několika vteřinami";
  }

  if (diffMinutes < 60) {
    const minutes = diffMinutes;
    const suffix =
      minutes === 1 ? "minutou" : minutes >= 2 && minutes <= 4 ? "minutami" : "minutami";
    return `před ${minutes} ${suffix}`;
  }

  if (diffHours < 24) {
    const hours = diffHours;
    const suffix =
      hours === 1 ? "hodinou" : hours >= 2 && hours <= 4 ? "hodinami" : "hodinami";
    return `před ${hours} ${suffix}`;
  }

  if (diffDays < 30) {
    const days = diffDays;
    const suffix = days === 1 ? "dnem" : "dny";
    return `před ${days} ${suffix}`;
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}. ${month}. ${year}`;
}