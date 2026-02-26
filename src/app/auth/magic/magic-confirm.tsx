"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { setSessionFromHash, verifyOtpAndSetSession } from "./actions";

export function MagicConfirm({ signingIn }: { signingIn: string }) {
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const next = searchParams.get("next") ?? "/admin";
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    async function confirm() {
      // token_hash flow (e.g. email-change confirmation)
      if (tokenHash && type) {
        const ok = await verifyOtpAndSetSession(tokenHash, type);
        window.location.replace(ok ? next : "/admin?error=not-signed-in");
        return;
      }

      // Implicit flow: Supabase puts tokens in the URL hash fragment
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const expiresIn = hashParams.get("expires_in");
      const expiresAt = expiresIn
        ? Math.floor(Date.now() / 1000) + parseInt(expiresIn, 10)
        : undefined;

      if (accessToken && refreshToken) {
        const ok = await setSessionFromHash(accessToken, refreshToken, expiresAt);
        window.location.replace(ok ? next : "/admin?error=not-signed-in");
        return;
      }

      window.location.replace("/admin?error=not-signed-in");
    }

    confirm();
  }, [searchParams]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-slate-600">{signingIn}</p>
    </section>
  );
}
