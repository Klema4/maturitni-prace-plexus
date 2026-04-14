## Plexus - Dlouhodobá maturitní práce

Blogový a redakční systém s reklamní platformou a analytickými nástroji.

## Požadavky

- **Node.js**: doporučeno LTS (projekt používá `npm` nebo `pnpm`)
- **pnpm**: verze dle `package.json` (`packageManager`)
- **Databáze**: PostgreSQL (typicky Neon). Povinné pro běh aplikace.
- **Storage (volitelné)**: MinIO / S3 kompatibilní storage (pro uploady)

## Instalace

```bash
npm install
#nebo
pnpm install
```

## Konfigurace prostředí (ENV)

Projekt očekává proměnné primárně v **`.env`** (používá je Drizzle i init skripty).

### Rychlý start (PowerShell)

```powershell
Copy-Item .env.example .env
```

Pak uprav minimálně:

- **`DATABASE_URL`**: Postgres connection string (Neon apod.), např. `postgresql://...?...`
- **`BETTER_AUTH_SECRET`**: min. 32 znaků
- Volitelně: `SITE_URL`, `NEXT_PUBLIC_BASE_URL`, `MINIO_*`, `PLUNK_SECRET_KEY`, `SECRETS_ENCRYPTION_KEY_BASE64`

Poznámka: některé části kódu načítají i `.env`, ale doporučený zdroj pravdy je **`.env`**.

## Inicializace databáze (Drizzle + základní data)

Skript:
- provede `drizzle-kit push` (vytvoří/aktualizuje tabulky podle `src/lib/schema.ts`)
- založí role `superadmin/admin/user`
- vytvoří výchozího superadmin uživatele

```bash
pnpm db:init
```

Volitelné proměnné pro superadmina:
- `SUPERADMIN_EMAIL` (default `admin@plexus.local`)
- `SUPERADMIN_PASSWORD` (default `PlexusAdmin123!`)
- `SUPERADMIN_NAME` (default `Super Admin`)

## Inicializace storage (volitelné, MinIO/S3)

Pokud používáš MinIO/RustFS lokálně, nastav `MINIO_*` proměnné a spusť:

```bash
npm run storage:init
# nebo
pnpm storage:init
```

Skript ověří/vytvoří buckety: `files` (nebo `MINIO_BUCKET_NAME`), `profiles`, `ads`.

## Spuštění aplikace

### Vývoj

```bash
npm run dev
# nebo
pnpm dev
```

Aplikace poběží na `http://localhost:3000`.

### Produkce (lokálně)

```bash
npm run build
#nebo
pnpm build
# a potom
npm run start
# nebo
pnpm start
```

## Užitečné příkazy

- **`pnpm lint`**: lint

## Troubleshooting

- **Chyba `DATABASE_URL environment variable is not set`**: doplň `DATABASE_URL` do `.env`.
- **Drizzle nevidí proměnné**: ověř, že existuje `.env` (Drizzle config ho načítá explicitně).
