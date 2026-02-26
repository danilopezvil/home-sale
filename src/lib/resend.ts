import { Resend } from "resend";

import { env } from "@/lib/env";

// ── types ─────────────────────────────────────────────────────────────────────

export type ReservationEmailData = {
  itemTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  message: string | null;
  preferredPickupAt: string | null;
};

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── email templates ───────────────────────────────────────────────────────────

function adminNotificationHtml(data: ReservationEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#f97316;padding:24px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">🔔 New reservation</p>
            <p style="margin:6px 0 0;font-size:14px;color:#fff7ed;opacity:0.9;">Someone wants to pick up one of your items.</p>
          </td>
        </tr>

        <!-- Item -->
        <tr>
          <td style="padding:24px 32px 0;">
            <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;">Item</p>
            <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#1c1917;">${data.itemTitle}</p>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:20px 32px 0;"><hr style="border:none;border-top:1px solid #f5f5f4;margin:0;" /></td></tr>

        <!-- Buyer info -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;">Buyer</p>
            <table cellpadding="0" cellspacing="0" style="margin-top:12px;width:100%;">
              <tr>
                <td style="padding:4px 0;width:120px;font-size:13px;color:#78716c;">Name</td>
                <td style="padding:4px 0;font-size:13px;font-weight:600;color:#1c1917;">${data.buyerName}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#78716c;">Email</td>
                <td style="padding:4px 0;font-size:13px;color:#1c1917;">
                  <a href="mailto:${data.buyerEmail}" style="color:#f97316;text-decoration:none;">${data.buyerEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#78716c;">Phone</td>
                <td style="padding:4px 0;font-size:13px;color:#1c1917;">${data.buyerPhone ?? "—"}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#78716c;">Pickup</td>
                <td style="padding:4px 0;font-size:13px;color:#1c1917;">${formatDate(data.preferredPickupAt)}</td>
              </tr>
            </table>
          </td>
        </tr>

        ${data.message ? `
        <!-- Message -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;">Message</p>
            <p style="margin:8px 0 0;font-size:14px;color:#44403c;font-style:italic;background:#fafaf9;border-left:3px solid #f97316;padding:10px 14px;border-radius:0 8px 8px 0;">"${data.message}"</p>
          </td>
        </tr>` : ""}

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/reservations"
               style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 24px;border-radius:10px;">
              View in admin →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 32px 24px;">
            <p style="margin:0;font-size:11px;color:#a8a29e;">Home Sale · Admin notification</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buyerConfirmationHtml(data: ReservationEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#f97316;padding:24px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">✅ Reservation received!</p>
            <p style="margin:6px 0 0;font-size:14px;color:#fff7ed;opacity:0.9;">We got your request and will be in touch soon.</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 0;">
            <p style="margin:0;font-size:15px;color:#1c1917;">Hi <strong>${data.buyerName}</strong>,</p>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#44403c;">
              Your reservation request for <strong>${data.itemTitle}</strong> has been submitted.
              We&rsquo;ll review it and reach out at <strong>${data.buyerEmail}</strong> to confirm the pickup details.
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:20px 32px 0;"><hr style="border:none;border-top:1px solid #f5f5f4;margin:0;" /></td></tr>

        <!-- Reservation summary -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;">Your reservation</p>
            <table cellpadding="0" cellspacing="0" style="margin-top:12px;width:100%;">
              <tr>
                <td style="padding:4px 0;width:140px;font-size:13px;color:#78716c;">Item</td>
                <td style="padding:4px 0;font-size:13px;font-weight:600;color:#1c1917;">${data.itemTitle}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#78716c;">Preferred pickup</td>
                <td style="padding:4px 0;font-size:13px;color:#1c1917;">${formatDate(data.preferredPickupAt)}</td>
              </tr>
              ${data.message ? `
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#78716c;vertical-align:top;">Your message</td>
                <td style="padding:4px 0;font-size:13px;color:#1c1917;font-style:italic;">"${data.message}"</td>
              </tr>` : ""}
            </table>
          </td>
        </tr>

        <!-- Next steps -->
        <tr>
          <td style="padding:20px 32px 0;">
            <div style="background:#fafaf9;border-radius:12px;padding:16px 20px;border:1px solid #f5f5f4;">
              <p style="margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;">What happens next</p>
              <ul style="margin:10px 0 0;padding-left:18px;font-size:13px;line-height:1.8;color:#44403c;">
                <li>We&rsquo;ll review your request shortly.</li>
                <li>You&rsquo;ll receive a confirmation email once we approve it.</li>
                <li>We&rsquo;ll agree on a pickup time that works for both of us.</li>
              </ul>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 32px 24px;">
            <p style="margin:0;font-size:13px;color:#78716c;">
              Questions? Just reply to this email.
            </p>
            <p style="margin:16px 0 0;font-size:11px;color:#a8a29e;">Home Sale · Buyer confirmation</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── send function ─────────────────────────────────────────────────────────────

/**
 * Sends both the admin notification and buyer confirmation in parallel.
 * Failures are logged but never throw — a broken email must not roll back
 * an already-committed reservation.
 */
export async function sendReservationEmails(data: ReservationEmailData): Promise<void> {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    console.warn("Resend not configured — skipping reservation emails. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const from = env.RESEND_FROM_EMAIL;
  const adminEmails = env.ADMIN_EMAILS;

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to: adminEmails,
      subject: `🔔 New reservation — ${data.itemTitle}`,
      html: adminNotificationHtml(data),
    }),
    resend.emails.send({
      from,
      to: data.buyerEmail,
      subject: `✅ Your reservation for "${data.itemTitle}"`,
      html: buyerConfirmationHtml(data),
    }),
  ]);

  for (const [label, result] of [
    ["admin notification", results[0]],
    ["buyer confirmation", results[1]],
  ] as const) {
    if (result.status === "rejected") {
      console.error(`Failed to send ${label} email.`, result.reason);
    } else if (result.value.error) {
      console.error(`Resend error on ${label} email.`, result.value.error);
    }
  }
}
