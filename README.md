# Pokédex

A full-stack Pokédex web app I built end-to-end. Browse all ~1300 Pokémon, search/filter/sort, open a detail page with stats and evolutions, sign in with GitHub, and "catch" your favorites — which sync to a real database so they follow you across devices.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Prisma + Postgres (Neon) · NextAuth (GitHub OAuth) · TanStack Query · Zustand · Framer Motion.

> Live: _add your Vercel URL after deploying_

---

## High-level architecture

There's no separate backend service — it's one Next.js app that has both a frontend and a backend layer.

```
                                  ┌──────────────────────────┐
                                  │        Browser           │
                                  │   React (frontend)       │
                                  └────────────┬─────────────┘
                                               │
                                               │  (one Next.js process on Vercel)
                                               │
                  ┌────────────────────────────┼────────────────────────────┐
                  ▼                            ▼                            ▼
       Server Components              Server Actions             /api/auth/[...nextauth]
       (render pages on               (mutation/RPC layer,       (NextAuth route — runs
        the server, fetch              auth-gated, talks to       the GitHub OAuth flow,
        from PokéAPI)                  Postgres via Prisma)       issues a JWT cookie)
                  │                            │                            │
                  │                            │                            │
                  ▼                            ▼                            ▼
            ┌──────────┐              ┌────────────────┐           ┌────────────────┐
            │ PokéAPI  │              │   Postgres     │           │     GitHub     │
            │ (public) │              │ (Neon, HTTPS)  │           │     OAuth      │
            └──────────┘              └────────────────┘           └────────────────┘
```

### Frontend

The user-facing UI. React components, Tailwind for the retro GBA-style theme, Framer Motion for animations. State is managed with TanStack Query (for remote data — caching, deduping, optimistic updates) and Zustand (for local stuff like the mute toggle, toast queue, and guest favorites in localStorage). All routes live under `src/app/` and components under `src/components/`.

### Backend

Three things, all inside the same Next.js app:

1. **React Server Components** render pages on the server and fetch from PokéAPI with 24-hour edge caching.
2. **Server Actions** (in `src/server/favorites.ts`) handle every database write. They check the session first via `getServerSession`, then run a Prisma query against Postgres. Acts as the "API layer" without me having to write REST routes.
3. **NextAuth route** at `/api/auth/[...nextauth]` handles GitHub OAuth and issues a signed JWT cookie that subsequent server actions verify.

Postgres lives on Neon and is accessed through Prisma's HTTP adapter (works on serverless without raw TCP). The schema is just the standard NextAuth tables (`User`, `Account`, `Session`) plus a `Favorite` table with a unique `(userId, pokemonId)` index.

---

## What you can do in the app

- Browse a paginated grid of every Pokémon
- Search by name (debounced)
- Filter by multiple types (intersection — must match all selected)
- A–Z letter filter
- Sort by dex / name / total stats / height / weight
- Open a detail page with stats, abilities, sprite gallery, Pokédex flavor text, evolution chain (with branching paths and trigger conditions), type damage relations, and full move list
- Sign in with GitHub to save favorites to a real database that syncs across devices
- "Catch" Pokémon with a Poké Ball animation and chiptune SFX (with mute toggle)
- See your favorites on `/favorites` and your profile + recent catches on `/profile`

---

## Running it locally

```bash
git clone <repo>
cd deepsolv
npm install                    # postinstall runs `prisma generate` automatically
cp .env.example .env.local     # then fill in the values below
npm run db:push                # pushes the schema to Neon
npm run dev                    # http://localhost:3000
```

If you want to skip auth/DB and just see the UI, run `npm run dev` with no `.env.local` — the app works in guest mode and shows a friendly "auth not configured" message on the login page.

### Setting up GitHub OAuth

1. Go to https://github.com/settings/developers → "New OAuth App".
2. Homepage URL: `http://localhost:3000`.
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`.
4. Copy `Client ID` and a generated client secret into `.env.local`.

### Setting up Neon (Postgres)

1. https://neon.tech → create a project.
2. Copy two connection strings:
   - **Pooled** → `DATABASE_URL`
   - **Direct** → `DIRECT_URL` (used by `prisma db push` for DDL)
3. Make sure both end with `?sslmode=require`.

### Env vars

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
GITHUB_ID=<github oauth app client id>
GITHUB_SECRET=<github oauth app client secret>
DATABASE_URL=postgres://...?sslmode=require
DIRECT_URL=postgres://...?sslmode=require
```

| Var               | What it does                                                            |
| ----------------- | ----------------------------------------------------------------------- |
| `NEXTAUTH_URL`    | Where NextAuth thinks "home" is. Set to your prod domain on Vercel.     |
| `NEXTAUTH_SECRET` | Signs JWTs. Run `openssl rand -base64 32`.                              |
| `GITHUB_ID`       | OAuth app Client ID. Missing → sign-in disabled (graceful).             |
| `GITHUB_SECRET`   | OAuth app secret.                                                       |
| `DATABASE_URL`    | Pooled Neon URL. Missing → favorites stay in localStorage (guest mode). |
| `DIRECT_URL`      | Direct Neon URL — used for migrations / `db push`.                      |

### Scripts

| Command              | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `npm run dev`        | Next.js dev server                                                  |
| `npm run build`      | `prisma generate && next build`                                     |
| `npm start`          | Run the production build                                            |
| `npm run lint`       | ESLint                                                              |
| `npm run db:push`    | Sync the Prisma schema to the DB                                    |
| `npm run db:migrate` | Create + apply a migration                                          |
| `npm run db:studio`  | Open Prisma Studio                                                  |

---

## Stuff I'm proud of

A few specific bits that took some thinking:

- **Slim view-model for the grid.** PokéAPI's full response per Pokémon is huge (sprites, all moves, version-game indices…). I project to a tiny `PokemonCardData` (id, name, types, totalStats, height, weight) before shipping it to the client. Cut the initial HTML payload from ~4.7 MB to ~50 KB on the first page.

- **Hybrid pagination strategy.** Default view paginates with cheap `?limit=20&offset=N` calls. The moment the user filters/searches/name-sorts, we lazily fetch the full ~1300-name index and switch to client-side slicing. The full list is pre-warmed in `requestIdleCallback` so the switch feels instant.

- **Optimistic favorites that survive rapid clicks.** The mutation reads the latest cached state on each click (not a stale closure), and the intent (`makeFavorite: true | false`) is passed as a variable. Clicking the Poké Ball five times rapidly produces five correct toggles, not undefined behavior. Per-id pending guard prevents double-firing.

- **Server actions instead of REST routes.** All DB writes go through `"use server"` functions in `src/server/favorites.ts`. Each one calls `requireUserId()` first (verifies the JWT cookie via `getServerSession`) before touching the database — so there's no public mutation surface to harden.

- **Auth-gated favorites with a clean redirect flow.** Hitting the favorite button while signed out shows a toast and bounces you to `/login?callbackUrl=<current page>`, so after signing in you land back exactly where you were. The `callbackUrl` is validated against open-redirect attacks (only same-origin paths allowed).

- **JWT sessions instead of database sessions.** No DB roundtrip per request. Trade-off accepted (revocation requires rotating `NEXTAUTH_SECRET`) because favorites are low-risk.

- **Static prerender preserved across the site.** I deliberately avoid `useSearchParams()` in components used by the root layout (header, favorite buttons), because that hook forces every page to opt out of static prerendering. Reading `window.location` inside click handlers gives me the same info without the bailout.

- **Graceful degradation everywhere.** No `GITHUB_*` env vars → sign-in button shows a friendly "auth not configured" message. No `DATABASE_URL` → app stays in guest mode, no crashes. The frontend never knows the difference.

- **Type matchup math runs locally.** No extra API call for damage relations — I take each type's `damage_relations` and multiply through. Multi-type Pokémon (Charizard's ×4 weakness to Rock, immunity to Ground) fall out naturally without special cases.

- **Web Audio chiptunes, no audio files.** All catch/release/click sounds are pure oscillator + gain envelope sequences. Zero MP3s in the bundle.

---

## Credits

- Data: [PokéAPI](https://pokeapi.co/) · Sprites: [PokeAPI/sprites](https://github.com/PokeAPI/sprites)
- Fonts: Press Start 2P, VT323 (Google Fonts)
