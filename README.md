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
