/**
 * PLEXUS PERMISSIONS SYSTEM
 * Každé oprávnění je reprezentováno jedním bitem v 64-bitovém čísle (BigInt).
 * Používáme bitové posuny (BigInt(1) << BigInt(pozice)) pro maximální přehlednost.
 *
 * PostgreSQL BIGINT má limit 64 bitů (signed), proto používáme pozice 0-62.
 * Pozice 63 je vyhrazena pro budoucí použití nebo speciální flagy.
 *
 * Poznámka: Používáme BigInt() konstruktor místo literálů (1n) kvůli kompatibilitě
 * s TypeScript target ES2017, který nepodporuje BigInt literály (ty jsou od ES2020).
 */

export const PERMISSIONS = {
   // --- 1. SYSTÉMOVÉ & NÁSTROJE (0-9) ---
   ANALYTICS_VIEW: BigInt(1) << BigInt(0),
   ANALYTICS_EXPORT: BigInt(1) << BigInt(1),
   OVERVIEW_VIEW: BigInt(1) << BigInt(2),

   // --- 2. OBSAH & STRUKTURA (10-19) ---
   SECTIONS_MANAGE: BigInt(1) << BigInt(10),
   TAGS_MANAGE: BigInt(1) << BigInt(11),

   // --- 3. ČLÁNKY (20-29) ---
   ARTICLES_VIEW: BigInt(1) << BigInt(20),
   ARTICLES_CREATE: BigInt(1) << BigInt(21),
   ARTICLES_EDIT_OWN: BigInt(1) << BigInt(22),
   ARTICLES_EDIT_ANY: BigInt(1) << BigInt(23),
   ARTICLES_DELETE_OWN: BigInt(1) << BigInt(24),
   ARTICLES_DELETE_ANY: BigInt(1) << BigInt(25),
   ARTICLES_PUBLISH: BigInt(1) << BigInt(26), // Změna stavu na 'published'
   ARTICLES_APPROVE: BigInt(1) << BigInt(27), // Fact-check, korektura
   ARTICLES_VIEW_DRAFTS: BigInt(1) << BigInt(28),

   // --- 4. NEWSLETTER & ÚLOŽIŠTĚ (30-34) ---
   NEWSLETTER_MANAGE: BigInt(1) << BigInt(30),
   STORAGE_UPLOAD: BigInt(1) << BigInt(31),
   STORAGE_DELETE: BigInt(1) << BigInt(32),
   STORAGE_MANAGE: BigInt(1) << BigInt(33), // Vytváření složek, systémové soubory

   // --- 5. UŽIVATELÉ & PŘEDPLATNÉ (35-44) ---
   USERS_VIEW: BigInt(1) << BigInt(35),
   USERS_MANAGE: BigInt(1) << BigInt(36), // Ban, editace profilů
   SUBSCRIPTIONS_VIEW: BigInt(1) << BigInt(37),
   SUBSCRIPTIONS_MANAGE: BigInt(1) << BigInt(38),

   // --- 5.1. KOMENTÁŘE & MODERACE (39-43) ---
   COMMENTS_VIEW: BigInt(1) << BigInt(39),
   COMMENTS_MODERATE: BigInt(1) << BigInt(40), // Skrývání, moderace komentářů
   COMMENTS_DELETE: BigInt(1) << BigInt(41),
   REPORTS_VIEW: BigInt(1) << BigInt(42), // Zobrazení reportů
   REPORTS_MANAGE: BigInt(1) << BigInt(43), // Řešení reportů

   // --- 6. REKLAMY (45-54) ---
   ADS_ORGS_MANAGE: BigInt(1) << BigInt(45),
   ADS_CAMPAIGNS_MANAGE: BigInt(1) << BigInt(46),
   ADS_CALENDAR_VIEW: BigInt(1) << BigInt(47),

   // --- 7. ADMINISTRACE (55-62) ---
   REDACTION_MANAGE: BigInt(1) << BigInt(55), // Správa týmu
   PERMISSIONS_MANAGE: BigInt(1) << BigInt(56), // Úprava rolí a přiřazování
   SETTINGS_MANAGE: BigInt(1) << BigInt(57), // Nastavení webu/SEO

   // --- SPECIÁLNÍ FLAG (62) ---
   ADMINISTRATOR: BigInt(1) << BigInt(62), // "God Mode" - přebije vše ostatní
} as const;

/**
 * KOMPOZITNÍ MASKY (Skupiny práv pro snadnější definici rolí)
 */
export const MASKS = {
   ARTICLES_FULL:
      PERMISSIONS.ARTICLES_VIEW |
      PERMISSIONS.ARTICLES_CREATE |
      PERMISSIONS.ARTICLES_EDIT_ANY |
      PERMISSIONS.ARTICLES_DELETE_ANY |
      PERMISSIONS.ARTICLES_PUBLISH |
      PERMISSIONS.ARTICLES_APPROVE |
      PERMISSIONS.ARTICLES_VIEW_DRAFTS,

   STORAGE_FULL:
      PERMISSIONS.STORAGE_UPLOAD |
      PERMISSIONS.STORAGE_DELETE |
      PERMISSIONS.STORAGE_MANAGE,

   ANALYTICS_FULL: PERMISSIONS.ANALYTICS_VIEW | PERMISSIONS.ANALYTICS_EXPORT,
} as const;

/**
 * POMOCNÉ FUNKCE PRO KONTROLU OPRÁVNĚNÍ
 */

/**
 * Zkontroluje, zda má uživatel dané oprávnění
 * @param userFlags - Bitmask oprávnění uživatele
 * @param required - Požadované oprávnění
 * @returns true pokud má uživatel oprávnění
 */
export function hasPermission(userFlags: bigint, required: bigint): boolean {
   // Pokud je uživatel Administrator, má právo na vše
   if ((userFlags & PERMISSIONS.ADMINISTRATOR) !== BigInt(0)) return true;
   return (userFlags & required) !== BigInt(0);
}

/**
 * Zkontroluje, zda má uživatel alespoň jedno z oprávnění
 * @param userFlags - Bitmask oprávnění uživatele
 * @param permissions - Pole požadovaných oprávnění
 * @returns true pokud má uživatel alespoň jedno oprávnění
 */
export function hasAnyPermission(
   userFlags: bigint,
   ...permissions: bigint[]
): boolean {
   if ((userFlags & PERMISSIONS.ADMINISTRATOR) !== BigInt(0)) return true;
   return permissions.some((permission) =>
      hasPermission(userFlags, permission),
   );
}

/**
 * Zkontroluje, zda má uživatel všechna oprávnění
 * @param userFlags - Bitmask oprávnění uživatele
 * @param permissions - Pole požadovaných oprávnění
 * @returns true pokud má uživatel všechna oprávnění
 */
export function hasAllPermissions(
   userFlags: bigint,
   ...permissions: bigint[]
): boolean {
   if ((userFlags & PERMISSIONS.ADMINISTRATOR) !== BigInt(0)) return true;
   return permissions.every((permission) =>
      hasPermission(userFlags, permission),
   );
}

/**
 * Kontrola vlastnictví zdroje (pro články/soubory)
 * Umožňuje uživateli upravovat vlastní zdroje i když nemá obecné oprávnění
 * @param userFlags - Bitmask oprávnění uživatele
 * @param ownerId - ID vlastníka zdroje
 * @param userId - ID aktuálního uživatele
 * @param ownPermission - Oprávnění pro vlastní zdroje (např. ARTICLES_EDIT_OWN)
 * @param anyPermission - Oprávnění pro jakékoli zdroje (např. ARTICLES_EDIT_ANY)
 * @returns true pokud může uživatel spravovat zdroj
 */
export function canManageResource(
   userFlags: bigint,
   ownerId: string,
   userId: string,
   ownPermission: bigint,
   anyPermission: bigint,
): boolean {
   // Pokud má oprávnění pro jakékoli zdroje, může spravovat
   if (hasPermission(userFlags, anyPermission)) return true;
   // Pokud je vlastník a má oprávnění pro vlastní zdroje
   return ownerId === userId && hasPermission(userFlags, ownPermission);
}

/**
 * Přidá oprávnění k existujícím
 * @param userFlags - Aktuální bitmask oprávnění
 * @param permission - Oprávnění k přidání
 * @returns Nová bitmask s přidaným oprávněním
 */
export function addPermission(userFlags: bigint, permission: bigint): bigint {
   return userFlags | permission;
}

/**
 * Odebere oprávnění z existujících
 * @param userFlags - Aktuální bitmask oprávnění
 * @param permission - Oprávnění k odebrání
 * @returns Nová bitmask bez odebraného oprávnění
 */
export function removePermission(
   userFlags: bigint,
   permission: bigint,
): bigint {
   return userFlags & ~permission;
}

/**
 * Vrátí seznam všech oprávnění uživatele jako pole názvů
 * @param userFlags - Bitmask oprávnění uživatele
 * @returns Pole názvů oprávnění
 */
export function getUserPermissions(userFlags: bigint): string[] {
   const permissions: string[] = [];

   // Pokud má Administrator flag, vrátíme všechny
   if ((userFlags & PERMISSIONS.ADMINISTRATOR) !== BigInt(0)) {
      return ["ADMINISTRATOR"];
   }

   for (const [key, value] of Object.entries(PERMISSIONS)) {
      if ((userFlags & value) !== BigInt(0)) {
         permissions.push(key);
      }
   }

   return permissions;
}

/**
 * Kombinuje více bitmask pomocí bitového OR
 * @param permissions - Pole oprávnění ke kombinování
 * @returns Kombinovaná bitmask
 */
export function combinePermissions(...permissions: bigint[]): bigint {
   return permissions.reduce((acc, perm) => acc | perm, BigInt(0));
}

/**
 * PŘEDDEFINOVANÉ ROLE
 */
export const ROLE_PERMISSIONS = {
   /**
    * Superadministrátor - má všechna oprávnění včetně Administrator flagu
    */
   SUPERADMIN:
      PERMISSIONS.ADMINISTRATOR |
      combinePermissions(
         PERMISSIONS.ANALYTICS_VIEW,
         PERMISSIONS.ANALYTICS_EXPORT,
         PERMISSIONS.OVERVIEW_VIEW,
         PERMISSIONS.SECTIONS_MANAGE,
         PERMISSIONS.TAGS_MANAGE,
         MASKS.ARTICLES_FULL,
         PERMISSIONS.NEWSLETTER_MANAGE,
         MASKS.STORAGE_FULL,
         PERMISSIONS.USERS_VIEW,
         PERMISSIONS.USERS_MANAGE,
         PERMISSIONS.SUBSCRIPTIONS_VIEW,
         PERMISSIONS.SUBSCRIPTIONS_MANAGE,
         PERMISSIONS.ADS_ORGS_MANAGE,
         PERMISSIONS.ADS_CAMPAIGNS_MANAGE,
         PERMISSIONS.ADS_CALENDAR_VIEW,
         PERMISSIONS.REDACTION_MANAGE,
         PERMISSIONS.PERMISSIONS_MANAGE,
         PERMISSIONS.SETTINGS_MANAGE,
      ),

   /**
    * Administrátor - plná kontrola systému (kromě změny oprávnění)
    */
   ADMIN: combinePermissions(
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.ANALYTICS_EXPORT,
      PERMISSIONS.OVERVIEW_VIEW,
      PERMISSIONS.SECTIONS_MANAGE,
      PERMISSIONS.TAGS_MANAGE,
      MASKS.ARTICLES_FULL,
      PERMISSIONS.NEWSLETTER_MANAGE,
      MASKS.STORAGE_FULL,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.SUBSCRIPTIONS_VIEW,
      PERMISSIONS.SUBSCRIPTIONS_MANAGE,
      PERMISSIONS.ADS_ORGS_MANAGE,
      PERMISSIONS.ADS_CAMPAIGNS_MANAGE,
      PERMISSIONS.ADS_CALENDAR_VIEW,
      PERMISSIONS.REDACTION_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
      // POZOR: ADMIN nemá PERMISSIONS_MANAGE - to má jen SUPERADMIN
   ),

   /**
    * Editor - tvorba a úprava obsahu
    */
   EDITOR: combinePermissions(
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.OVERVIEW_VIEW,
      PERMISSIONS.SECTIONS_MANAGE,
      PERMISSIONS.TAGS_MANAGE,
      MASKS.ARTICLES_FULL,
      PERMISSIONS.NEWSLETTER_MANAGE,
      MASKS.STORAGE_FULL,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.ADS_CAMPAIGNS_MANAGE,
   ),

   /**
    * Korektor - kontrola a korektura článků
    */
   CHECKER: combinePermissions(
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.OVERVIEW_VIEW,
      PERMISSIONS.ARTICLES_VIEW,
      PERMISSIONS.ARTICLES_VIEW_DRAFTS,
      PERMISSIONS.ARTICLES_APPROVE,
      PERMISSIONS.ARTICLES_EDIT_ANY, // Může upravovat pro korekturu
   ),

   /**
    * Spisovatel - tvorba článků
    */
   WRITER: combinePermissions(
      PERMISSIONS.OVERVIEW_VIEW,
      PERMISSIONS.ARTICLES_VIEW,
      PERMISSIONS.ARTICLES_CREATE,
      PERMISSIONS.ARTICLES_EDIT_OWN,
      PERMISSIONS.ARTICLES_DELETE_OWN,
      PERMISSIONS.STORAGE_UPLOAD,
   ),

   /**
    * Moderátor - správa komentářů a obsahu
    */
   MODERATOR: combinePermissions(
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.OVERVIEW_VIEW,
      PERMISSIONS.ARTICLES_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.COMMENTS_VIEW,
      PERMISSIONS.COMMENTS_MODERATE,
      PERMISSIONS.COMMENTS_DELETE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_MANAGE,
   ),

   /**
    * Uživatel - žádná oprávnění v dashboardu
    */
   USER: BigInt(0),
} as const;

/**
 * Typ pro názvy rolí
 */
export type RoleName = keyof typeof ROLE_PERMISSIONS;

/**
 * Vrátí bitmask oprávnění pro danou roli
 * @param roleName - Název role
 * @returns Bitmask oprávnění role
 */
export function getRolePermissions(roleName: RoleName): bigint {
   return ROLE_PERMISSIONS[roleName];
}
