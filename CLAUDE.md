# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
```

There are no tests in this project.

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=admin@example.com        # comma-separated; parsed at startup by Zod
```

Optional (emails are silently skipped if absent):
```
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=                 # used in admin notification email CTA link
```

All env vars are validated via Zod in `src/lib/env.ts` at startup — a missing required var throws immediately.

## Architecture

Next.js 15 App Router with Server Actions only (no REST API). All data fetching happens in async server components via direct Supabase queries; mutations go through `"use server"` actions.

### Supabase Clients

Two clients are created once at module load in `src/lib/supabase/server.ts`:

- **`supabaseServerAnonClient`** — anon key; used for session validation (`getUser`)
- **`supabaseServiceRoleClient`** — service role key; used for all DB mutations and admin queries (bypasses RLS)

`src/lib/supabase/public.ts` exports a third anon client intended for client-side use (not currently used in any RSC).

### Auth Flow

Magic link email → Supabase redirects to `/auth/magic` with tokens in the URL **hash** (not query string — browsers never send hash to server). The `/auth/magic` client page reads `#access_token` and `#refresh_token` from `window.location.hash` and calls a Server Action (`src/app/auth/magic/actions.ts`) that writes them as `HttpOnly` cookies (`sb-access-token`, `sb-refresh-token`).

Middleware at `src/middleware.ts` runs on all `/admin/*` routes: validates the access token, and if expired, calls `refreshSession` to silently rotate both cookies.

Every admin page/action calls `requireAdminUser()` from `src/lib/admin-auth.ts`, which:
1. Reads the session via `getSessionUser()` (checks the access token cookie)
2. Verifies the email is in `ADMIN_EMAILS`
3. Redirects to `/admin?error=...` on failure

### Server Action Conventions

- All actions in `src/app/**/actions.ts` with `"use server"` directive
- Zod validates FormData at the top of every action before any DB call
- Admin actions always call `await requireAdminUser()` as the first line
- Actions returning `ItemFormState` / `ReserveFormState` are used with `useActionState`; actions that only redirect use plain `formAction` bindings
- After mutations, call `revalidatePath` for every affected route before returning/redirecting

### Database Schema (actual column names)

**`items`**: `id`, `title`, `description`, `price`, `category`, `condition`, `pickup_area`, `status` (`available`|`reserved`|`sold`), `created_at`

**`item_images`**: `id`, `item_id`, `image_url`, `sort_order`

**`reservations`**: `id`, `item_id`, `customer_name`, `customer_email`, `customer_phone`, `message`, `status` (`pending`|`confirmed`|`cancelled`), `reserved_at`, `created_at`
- Index on `(customer_email, created_at)` for rate-limit queries

### Reservation Flow

Public users submit the form at `/items/[id]`. `createReservationAction` in `src/app/items/[id]/actions.ts`:
1. Validates with Zod (includes a honeypot `website` field — bots filling it get a fake success)
2. Rate-limits by email: max 3 per hour via DB count query
3. Atomically claims the item: `UPDATE items SET status='reserved' WHERE id=? AND status='available'` — if no row updated, item is already taken
4. Inserts the reservation record
5. Fires `sendReservationEmails` (Resend) as fire-and-forget — email failures never roll back the reservation

### Image Storage

Bucket: `item-images` (public). Path pattern: `items/{itemId}/{timestamp}-{uuid}-{filename}`. Images are uploaded server-side via the service role client. Reordering swaps `sort_order` values between adjacent rows.
