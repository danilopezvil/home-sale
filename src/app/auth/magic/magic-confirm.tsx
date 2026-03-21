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
      if (tokenHash && type) {
        const ok = await verifyOtpAndSetSession(tokenHash, type);
        window.location.replace(ok ? next : "/admin?error=not-signed-in");
        return;
      }

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
    <section className="surface section-pad text-center">
      <p className="eyebrow">Admin access</p>
      <p className="mt-2 text-base font-semibold text-stone-950">{signingIn}</p>
      <p className="mt-2 text-sm text-stone-500">We are validating the sign-in link and preparing the admin session.</p>
    </section>
  );
}
