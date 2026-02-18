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
   - `http://localhost:3000/auth/confirm`
   - Add your production equivalent too (for example `https://your-domain.com/auth/confirm`).
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
- The email link lands on `/auth/confirm`, which verifies the one-time token and stores auth cookies in secure `HttpOnly` cookies.
- `/admin/items` and `/admin/reservations` are protected server-side and redirect to `/admin` if the user is unauthenticated or not listed in `ADMIN_EMAILS`.
- Middleware refreshes the session from Supabase refresh token for `/admin/*` routes and keeps cookies updated.

### If the magic-link email is not sent

Check these items in order:

1. **Email must be in `ADMIN_EMAILS`**
   - The `/admin` action exits early when the submitted email is not in `ADMIN_EMAILS`, so no email is sent in that case.
2. **User must already exist in Supabase Auth**
   - This app calls `signInWithOtp` with `shouldCreateUser: false`, so Supabase will not create a new account on first sign-in.
   - Create/invite the admin user first in **Authentication → Users**.
3. **Redirect URL must match exactly**
   - Add `http://localhost:3000/auth/confirm` (and your production `/auth/confirm`) under **Authentication → URL Configuration → Redirect URLs**.
4. **Site URL must be configured**
   - Under **Authentication → URL Configuration**, set **Site URL** to your current app URL.
5. **Email provider must be enabled**
   - Under **Authentication → Providers → Email**, ensure the provider is enabled and Magic Link is enabled.
6. **Check Supabase Auth logs for delivery/validation errors**
   - In Supabase Dashboard, review Auth logs for issues like rate limits, blocked recipients, or provider errors.

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
