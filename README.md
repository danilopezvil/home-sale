## Create the project (exact command used)

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Supabase admin magic-link auth setup

1. In Supabase, open **Authentication → URL Configuration**.
2. Set **Site URL** to your app URL (for local dev: `http://localhost:3000`).
3. Add this exact redirect URL to **Redirect URLs**:
   - `http://localhost:3000/auth/magic`
   - Add your production equivalent too (for example `https://your-domain.com/auth/magic`).
4. In **Authentication → Providers → Email**, enable Email provider and keep **Magic Link** enabled.
5. Create at least one user whose email appears in `ADMIN_EMAILS` (or invite that email) from **Authentication → Users**.
6. Copy Supabase project keys from **Project Settings → API** and set environment variables.

### Environment variables

Use these values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
ADMIN_EMAILS=admin@example.com,ops@example.com
```

### Auth flow implemented

- `/admin` renders a magic-link login form when no session is present.
- The login action only sends magic links for emails listed in `ADMIN_EMAILS`.
- The email link lands on `/auth/magic`, a client-side page that reads the session tokens from the URL hash fragment (Supabase implicit flow) and persists them as secure `HttpOnly` cookies via a server action.
- `/admin/items` and `/admin/reservations` are protected server-side and redirect to `/admin` if the user is unauthenticated or not listed in `ADMIN_EMAILS`.
- Middleware refreshes the session from Supabase refresh token for `/admin/*` routes and keeps cookies updated.

> **Why `/auth/magic` and not `/auth/confirm`?**
> Supabase's default implicit flow places auth tokens in the URL hash fragment (`#access_token=...`). Browsers never send hash fragments to the server, so a server-side Route Handler at `/auth/confirm` could not read them and always redirected back to `/admin`. The new `/auth/magic` page runs client-side JavaScript to extract the tokens from the hash and forward them to a server action that sets the cookies.

### If the magic-link email is not sent

Check these items in order:

1. **Email must be in `ADMIN_EMAILS`**
   - The `/admin` action exits early when the submitted email is not in `ADMIN_EMAILS`, so no email is sent in that case.
2. **User must already exist in Supabase Auth**
   - This app calls `signInWithOtp` with `shouldCreateUser: false`, so Supabase will not create a new account on first sign-in.
   - Create/invite the admin user first in **Authentication → Users**.
3. **Redirect URL must match exactly**
   - Add `http://localhost:3000/auth/magic` (and your production `/auth/magic`) under **Authentication → URL Configuration → Redirect URLs**.
4. **Site URL must be configured**
   - Under **Authentication → URL Configuration**, set **Site URL** to your current app URL.
5. **Email provider must be enabled**
   - Under **Authentication → Providers → Email**, ensure the provider is enabled and Magic Link is enabled.
6. **Check Supabase Auth logs for delivery/validation errors**
   - In Supabase Dashboard, review Auth logs for issues like rate limits, blocked recipients, or provider errors.

## Supabase database schema setup

Run the following SQL in **Supabase Dashboard → SQL Editor** to create or migrate the required tables.

### `items` table

```sql
create table if not exists items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  price       numeric not null,
  category    text,
  condition   text not null,
  pickup_area text,
  status      text not null default 'available',
  created_at  timestamptz not null default now(),
  constraint items_status_check    check (status    in ('available', 'reserved', 'sold')),
  constraint items_condition_check check (condition in ('new', 'like_new', 'good', 'fair', 'parts'))
);
```

### `item_images` table

```sql
create table if not exists item_images (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references items (id),
  image_url  text not null,
  sort_order integer not null default 0
);
```

### `reservations` table

```sql
create table if not exists reservations (
  id                  uuid primary key default gen_random_uuid(),
  item_id             uuid not null references items (id),
  name                text not null,
  email               text not null,
  phone               text,
  message             text,
  preferred_pickup_at timestamptz,
  created_at          timestamptz not null default now()
);

-- Index used by the rate-limit check (email + created_at)
create index if not exists reservations_email_created_at_idx
  on reservations (email, created_at);
```

### Migrations (if tables already exist)

If your tables were created before these columns existed, add them with:

```sql
-- items: add pickup_area if missing
alter table items
  add column if not exists pickup_area text;

-- item_images: add sort_order if missing
alter table item_images
  add column if not exists sort_order integer not null default 0;
```

## Supabase Storage bucket setup for item images

The admin item image upload flow uses the bucket name `item-images` and stores files under `items/<item_id>/...`.

1. In Supabase, open **Storage → Buckets**.
2. Create a new bucket named **`item-images`**.
3. Set bucket visibility:
   - **Public bucket** (recommended for this app as currently written): enable Public so `getPublicUrl(...)` links are directly viewable in the storefront.
   - If you require private access, you must switch image rendering to signed URLs instead of public URLs.
4. Optional but recommended: set a file size limit and restrict MIME types to images.

### SQL example (optional bucket creation)

```sql
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;
```

### Suggested storage policies

Because admin uploads use the service role key on the server, RLS policies are not strictly required for those server actions. If you also want browser-side reads for public assets, use a public bucket. For private buckets, add explicit policies aligned to your auth model.

---

## Deploying to Vercel

### Pre-deploy checklist

Before pushing to production, confirm:

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] All required env vars are documented below and ready to paste into Vercel
- [ ] Supabase project is on a plan that supports your expected traffic (free tier has pause-on-inactivity)
- [ ] `item-images` bucket exists and is set to **Public**
- [ ] Production redirect URL is added to Supabase Auth (`https://yourdomain.com/auth/magic`)

---

### Step 1 — Environment variables

In **Vercel → Project → Settings → Environment Variables**, add the following. Set each to the **Production** environment (add to Preview too if you want preview deploys to work).

#### Required

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key (**keep secret**) |
| `ADMIN_EMAILS` | Comma-separated list: `admin@example.com` or `a@x.com,b@x.com` |

#### Optional

| Variable | Notes |
|---|---|
| `RESEND_API_KEY` | From [resend.com](https://resend.com) — enables reservation + admin notification emails |
| `RESEND_FROM_EMAIL` | Must be a verified Resend sender domain, e.g. `noreply@yourdomain.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` — used in the admin notification email CTA link |

> All variables are validated at startup by Zod (`src/lib/env.ts`). A missing required variable throws immediately — the Vercel function will crash on cold start with a clear error message in logs.

---

### Step 2 — Build settings

Vercel auto-detects Next.js. No overrides needed.

| Setting | Value |
|---|---|
| Framework preset | **Next.js** (auto-detected) |
| Build command | `next build` (default) |
| Output directory | `.next` (default) |
| Install command | `npm install` (default) |
| Node.js version | **20.x** (set in Vercel → Project → Settings → General) |

---

### Step 3 — Supabase settings for production

#### Authentication — redirect URLs

In **Supabase → Authentication → URL Configuration**:

1. **Site URL** → `https://yourdomain.com`
2. **Redirect URLs** — add:
   ```
   https://yourdomain.com/auth/magic
   ```
   If you use Vercel preview deployments, also add:
   ```
   https://*-yourteam.vercel.app/auth/magic
   ```

Without this, Supabase will reject the magic-link redirect and sign-in will fail silently.

#### Admin user

The app calls `signInWithOtp` with `shouldCreateUser: false`. The admin user **must already exist** in Supabase:

1. Supabase → Authentication → Users → **Invite user** (use the email in `ADMIN_EMAILS`)
2. The user does not need to set a password — magic link is the only sign-in method used

#### Storage bucket

The `item-images` bucket must exist and be public (see [Storage bucket setup](#supabase-storage-bucket-setup-for-item-images) above). Run this in **SQL Editor** if not done yet:

```sql
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;
```

---

### Step 4 — Post-deploy verification

Run through this checklist after each production deploy.

**Public storefront**
- [ ] `/` loads, hero and category links render correctly
- [ ] `/items` shows item grid with images, filter pills and sort work
- [ ] `/items/[id]` shows photos, price, status badge, and reservation form
- [ ] Submit the reservation form on an `available` item → row appears in Supabase `reservations` table with `status = pending`

**Email (only if Resend is configured)**
- [ ] Customer receives reservation confirmation email
- [ ] Admin address(es) in `ADMIN_EMAILS` receive the notification email

**Admin area**
- [ ] `/admin` shows sign-in form when unauthenticated
- [ ] Magic-link email arrives → clicking it lands on `/admin` dashboard
- [ ] `/admin/items` — create an item → verify it appears on `/items`
- [ ] Upload at least one image → verify it renders on the detail page
- [ ] Toggle status (Available ↔ Sold) → badge updates on storefront
- [ ] Select items via checkboxes → **Delete selected** → items removed from storefront and images removed from storage
- [ ] `/admin/items/import` — paste a valid JSON object → item created successfully
- [ ] `/admin/reservations` — confirm a reservation → status updates to `confirmed`

**Auth hardening**
- [ ] Accessing `/admin/items` while signed out redirects to `/admin` with an error
- [ ] Signing in with a non-`ADMIN_EMAILS` address shows "not in ADMIN_EMAILS" error
- [ ] Sign out → session cookies cleared → subsequent `/admin` visit requires re-auth
