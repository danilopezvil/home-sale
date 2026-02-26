import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_EMAILS: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().email()).min(1)),
  // Resend — optional; emails are skipped if not configured
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
});

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
});

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
