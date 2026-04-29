# Pokédex

A full-stack Pokédex web app — **Next.js 14 · TypeScript · Tailwind · Prisma + Postgres · NextAuth (GitHub OAuth)**.
Browse, search, filter and catch Pokémon. Sign in to sync favorites across devices.

> Live: _add your Vercel URL after deploying_

## Features

**Mandatory** — PokéAPI data with loading/error states, responsive grid, debounced search, multi-type filter, paginated home, persistent favorites, detail page with stats/abilities.
**Bonus** — SSR + ISR detail pages, Framer Motion animations, GitHub OAuth.
**Extras** — A–Z letter filter, sort dropdown (stats / height / weight / name), evolution chain with branching, type damage relations (×4 / ×½ / immune), sprite gallery (default / back / shiny), Pokédex flavor text, full moves list, `/profile` page with avatar + recent favorites, retro GBA-style theme (pixel fonts, scanlines, holo shimmer, Poké Ball capture animation, chiptune sound effects with mute toggle).

## Architecture

```
Browser ──► Next.js (App Router)
              │
              ├── server actions ──► Postgres (Neon)
              ├── fetch          ──► PokéAPI
              └── NextAuth       ──► GitHub OAuth
```

- **Favorites**: `localStorage` for guests, Postgres for signed-in users. On sign-in, local favorites are merged into the DB (idempotent, with `skipDuplicates`) then cleared.
- **DB tables**: `User`, `Account`, `Session`, `VerificationToken` (NextAuth) + `Favorite(userId, pokemonId)` with a unique compound index.
- **Server actions** in [`src/server/favorites.ts`](src/server/favorites.ts) gate all DB access on the authed session — no public REST surface.

## Local setup

```bash
npm install              # also runs prisma generate
cp .env.example .env.local   # then fill in values below
npm run db:push          # creates tables in Neon
npm run dev              # http://localhost:3000
```

### `.env.local`

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
GITHUB_ID=<github oauth app>
GITHUB_SECRET=<github oauth app>
DATABASE_URL=postgres://...?sslmode=require
DIRECT_URL=postgres://...?sslmode=require
```

- **GitHub OAuth**: https://github.com/settings/developers → New OAuth App. Callback: `http://localhost:3000/api/auth/callback/github`.
- **Neon Postgres**: https://neon.tech → create project → copy *Pooled* (`DATABASE_URL`) and *Direct* (`DIRECT_URL`) connection strings.

> The app degrades gracefully: missing `GITHUB_*` disables sign-in, missing `DATABASE_URL` falls back to local-only favorites.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync Prisma schema to the DB |
| `npm run db:studio` | Prisma Studio GUI |

## Deploy (Vercel + Neon)

1. Push to GitHub, import at https://vercel.com/new.
2. Add the env vars (use a production GitHub callback: `https://<domain>/api/auth/callback/github`).
3. Deploy. `postinstall` runs `prisma generate` automatically.
4. Run `npm run db:push` once against the production DB to create tables.

## Notable decisions

- **Slim `PokemonCardData` view-model** (`id, name, types, totalStats, height, weight`) used for the grid; full `PokemonDetail` only loaded on detail pages. Cut the initial HTML payload from ~4.7 MB to ~50 KB.
- **Hybrid data strategy**: default home view uses cheap paginated PokéAPI calls; the full name index is only fetched lazily when search / letter filter / name sort is active.
- **Neon HTTP driver via `@prisma/adapter-neon`** so all DB queries go over port 443 — works behind networks that block raw Postgres TCP.
- **JWT session strategy** to skip a DB roundtrip on every request — favorites toggles drop from ~3s to ~250ms.
- **Optimistic UI** for favorites with stale-closure-safe mutations (latest cache via `queryClient.getQueryData`, intent passed as mutation variable, per-id pending guard).

## Credits

- Data: [PokéAPI](https://pokeapi.co/) · Sprites: [PokeAPI/sprites](https://github.com/PokeAPI/sprites)
- Fonts: Press Start 2P, VT323 (Google Fonts)
