const BETTER_AUTH_MESSAGE_CS: Record<string, string> = {
  "Invalid email or password": "Nesprávný email nebo heslo",
};

/**
 * Přeloží známé anglické chybové hlášky z Better Auth do češtiny pro zobrazení uživateli.
 * Neznámé texty vrátí beze změny.
 * @param {string | undefined | null} message - Původní message z API.
 * @returns {string} Text k zobrazení.
 */
export function mapAuthClientErrorMessage(
  message: string | undefined | null,
): string {
  if (message == null || message === "") {
    return "";
  }
  return BETTER_AUTH_MESSAGE_CS[message] ?? message;
}
