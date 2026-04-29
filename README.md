# Pokédex

A full-stack Pokédex web app built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma + Postgres**, and **NextAuth (GitHub OAuth)**.
Browse, search, filter, paginate and favorite Pokémon — and sign in to sync favorites across devices.

> Live: _add your Vercel URL here after deploying_

## Feature highlights

### Mandatory (all done)
- Live data from PokéAPI with graceful loading and error states (skeletons + retry).
- Responsive grid (mobile / tablet / desktop).
- **Search** by name (debounced, URL-synced).
- **Type filter** with multi-select intersection logic.
- **Pagination** (20 per page, URL-synced — back-button & shareable).
- **Favorites** persisted to `localStorage` for guests *and* to a Postgres database when signed in.
- **Detail view** at `/pokemon/[name]` with sprite, stats bars, abilities, height/weight.

### Bonus (all done — and more)
- **SSR + ISR** for detail pages (`generateMetadata` + 24 h revalidate).
- **Framer Motion** animations (card hover/stagger, page entrance, heart pop, sprite tab fade, AnimatePresence on filter changes).
- **OAuth** sign-in via GitHub (NextAuth) — fully working with database session strategy.

### Extra features beyond the brief
- **Persistent favorites in Postgres** (via Prisma + Neon). When you sign in on a new device, the same favorites appear.
- **Auto-merge on sign-in** — guest favorites stored in `localStorage` get merged into the server, then `localStorage` is cleared. No data loss.
- **`/profile` page** with avatar, account provider, join date, recent favorites, trainer ID.
- **A–Z letter filter** on the home page.
- **Sort dropdown** — Dex order / Name A–Z & Z–A / Strongest / Weakest / Tallest / Heaviest.
- **Detail page extras**: Pokédex flavor text, sprite gallery (default / back / shiny), legendary & mythical badges, capture rate, generation/habitat, and a full **moves list** with show-more.
- **Evolution chain** on detail page — visual sprites + arrows, supports branching evolutions like Eevee, with trigger labels ("Lvl 16", "Water Stone", "Friendship · day", etc.).
- **Damage relations** on detail page — calculates ×4 / ×2 / ×½ / ×¼ / Immune from both types (e.g. Charizard ×4 Rock).
- Optimistic UI for favorite toggles, "syncing…" indicator on the favorites page.

## Architecture

```mermaid
flowchart LR
  Browser --> NextApp[Next.js App Router]
  NextApp -->|server actions| Postgres[(Postgres - Neon)]
  NextApp -->|fetch| PokeAPI[(PokéAPI)]
  NextApp -->|NextAuth| GitHub[(GitHub OAuth)]

  subgraph storage [Favorites strategy]
    Guest[Guest user] -->|localStorage| Browser
    SignedIn[Signed-in user] -->|Postgres| Postgres
    Merge[Sign-in event] -->|merge local to DB| Postgres
  end
```

Tables created by Prisma + the NextAuth Prisma adapter:
- `User`, `Account`, `Session`, `VerificationToken` (NextAuth-managed)
- `Favorite (id, userId, pokemonId, createdAt)` with `@@unique([userId, pokemonId])`

Server actions in [src/server/favorites.ts](src/server/favorites.ts) gate all DB access on the authenticated session — no public REST surface.

## Tech choices & rationale

| Choice | Why |
| --- | --- |
| **Next.js 14 (App Router)** | SSR + ISR for fast first paint, server actions for typed, no-API-route DB calls, file-based routing. |
| **TypeScript** | End-to-end types from API client through UI through DB. |
| **Tailwind CSS** | Fast, consistent styling, type-color theming via gradients. |
| **@tanstack/react-query** | Caching, deduping, loading/error states, optimistic mutations for favorites. |
| **Zustand (`persist`)** | Tiny, no-boilerplate store with built-in localStorage persistence for guest mode. |
| **Framer Motion** | Subtle, declarative animations. |
| **NextAuth.js + GitHub** | Drop-in OAuth. Database session strategy + Prisma adapter when DB is configured; falls back to JWT-only mode if not. |
| **Prisma + Postgres (Neon)** | Industry-standard, typed ORM. Neon free tier is serverless and Vercel-friendly. |

## Local setup

Requires Node 20.18+ (or Node 22 LTS recommended).

```bash
git clone <repo>
cd <repo>
npm install        # also runs `prisma generate`
cp .env.example .env.local
# fill in values (see below)
npm run db:push    # creates tables in your Neon DB
npm run dev
```

Open http://localhost:3000.

### Environment variables

```env
# --- Auth ---
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<output of `openssl rand -base64 32`>

GITHUB_ID=<from your GitHub OAuth App>
GITHUB_SECRET=<from your GitHub OAuth App>

# --- Database (Neon Postgres) ---
DATABASE_URL=postgres://user:pass@host/db?sslmode=require
DIRECT_URL=postgres://user:pass@host/db?sslmode=require
```

#### Setting up GitHub OAuth (5 min)

1. Visit https://github.com/settings/developers → **New OAuth App**.
2. Homepage URL: `http://localhost:3000` (and later your Vercel URL).
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`.
4. Copy **Client ID** → `GITHUB_ID`.
5. Generate a new client secret → `GITHUB_SECRET`.

#### Setting up Neon Postgres (5 min)

1. Sign up at https://neon.tech (free).
2. Create a project (any region).
3. From the project dashboard, copy:
   - **Pooled connection string** → `DATABASE_URL`
   - **Direct connection string** → `DIRECT_URL`
4. Run `npm run db:push` — Prisma will create all the tables.

> **App still works without auth/DB.** If `GITHUB_ID/SECRET` are missing the login page shows a friendly notice, and if `DATABASE_URL` is missing the app falls back to localStorage-only favorites (guest mode). Useful for quick experimentation.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync Prisma schema to the database (no migration files) |
| `npm run db:migrate` | Create + apply a migration in dev |
| `npm run db:studio` | Open Prisma Studio (GUI for the DB) |

## Deployment (Vercel + Neon)

1. Push this repo to GitHub.
2. Import it at https://vercel.com/new — Vercel detects Next.js automatically.
3. Add **all** env vars from `.env.local` to the Vercel project settings, but use the production GitHub callback URL: `https://your-domain.vercel.app/api/auth/callback/github` and update the GitHub OAuth App accordingly.
4. Deploy. The `postinstall` and `build` hooks both run `prisma generate`, so no extra config is needed.
5. After the first deploy, run `npm run db:push` (or trigger a Prisma deployment migration) to create the tables in Neon.

## Project structure

```
prisma/
  schema.prisma          User, Account, Session, VerificationToken, Favorite
src/
  app/
    layout.tsx           Root layout, providers, header, footer
    page.tsx             Home (SSR-prefetches first 20 cards + types)
    providers.tsx        React Query + NextAuth providers
    favorites/page.tsx
    profile/page.tsx     Auth-gated profile page (server-fetches DB record)
    login/page.tsx
    pokemon/[name]/      SSR detail page (ISR 24h, OG metadata)
    api/auth/[...nextauth]/route.ts
  components/            UI components (PokemonCard, PokemonDetail, EvolutionChain, DamageRelations, etc.)
  hooks/
    useFavorites.ts      Hybrid hook: localStorage for guests, server for signed-in users
  lib/
    pokeapi.ts           Typed PokéAPI client
    queries.ts           React Query hooks
    matchups.ts          Defensive type matchup calculator
    evolution.ts         Evolution chain helpers
    typeColors.ts, types.ts, format.ts, useDebouncedValue.ts
    auth.ts              NextAuth options + Prisma adapter
    db.ts                Singleton Prisma client
  server/
    favorites.ts         Server actions (getServerFavorites, addServerFavorite, ...)
  store/
    favorites.ts         Zustand store + localStorage persistence (guest mode)
  types/
    next-auth.d.ts       Augments Session with `user.id`
```

## Challenges & how they were solved

- **No search endpoint on PokéAPI** → fetched a single name index lazily (only when search/letter filter/name sort are active), letting the default home view stay on cheap offset pagination.
- **Multi-type filtering** → React Query's `useQueries` fetches each selected type in parallel; a `useMemo` computes the intersection.
- **HTML payload was 4.7 MB** initially because each Pokémon's full PokéAPI response (~150 KB with all moves, game indices, etc.) was being dehydrated into the page. Introduced a slim `PokemonCardData` view-model (`{ id, name, types, totalStats, height, weight }`) and dropped the page size to ~50 KB.
- **Pagination off-by-N** — PokéAPI's `count` includes ~280 alternate forms (Mega evolutions, Galarian variants) starting at id 10001. Removing an ID-range filter that was stripping them out fixed empty pages near the end of the dex.
- **SSR hydration mismatch with localStorage favorites** → introduced a `useHasHydrated` hook that gates all favorites-dependent UI so the server and client render the same thing initially.
- **Sign-in data loss risk** — when a guest favorites Pokémon and then signs in, their localStorage data must merge into the server. Implemented an idempotent `syncLocalFavorites` action with `skipDuplicates: true`, ref-guarded so it only runs once per session, then clears `localStorage`.
- **Image pop-in on pagination** — fade-in + pulsing placeholder, with `priority` on the first row for LCP, and graceful fallback for forms without official-artwork sprites.
- **Branching evolution rendering** (Eevee → 8 evolutions) — recursive parser flattens the chain into stages keyed by parent name; non-branching stages render horizontally, branches stack vertically.
- **Type matchup math for dual-types** — multiplied each defender's resistance map (×2 / ×½ / ×0); a Fire/Flying Pokémon correctly gets ×4 Rock without any hand-coded special cases.

## Credits

- Data: [PokéAPI](https://pokeapi.co/)
- Sprites: [PokeAPI/sprites](https://github.com/PokeAPI/sprites)
