const FROM = 'BrickScore <onboarding@resend.dev>'
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

interface SendArgs {
  to: string
  subject: string
  html: string
}

interface ResendResponse {
  id?: string
  message?: string
  name?: string
}

export async function sendEmail({ to, subject, html }: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'missing_resend_key' }
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    const json = await res.json().catch(() => ({})) as ResendResponse
    if (!res.ok) {
      return { ok: false, error: json.message ?? `resend_http_${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'send_failed' }
  }
}

interface TemplateArgs {
  heading: string
  intro: string
  buttonLabel: string
  buttonHref: string
  fallbackNote?: string
}

/**
 * Inline-styled, email-safe HTML template (max 600px container, white bg, black CTA).
 */
export function buildEmailHtml({ heading, intro, buttonLabel, buttonHref, fallbackNote }: TemplateArgs): string {
  const safeHref = String(buttonHref)
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0a0a0a;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f5f3;padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;border:1px solid #ececec;">
            <tr>
              <td style="padding:32px 36px 24px;">
                <div style="font-weight:600;font-size:20px;letter-spacing:-0.4px;color:#0a0a0a;">brickscore</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 8px;">
                <h1 style="margin:0;font-weight:700;font-size:24px;line-height:1.25;letter-spacing:-0.4px;color:#0a0a0a;">
                  ${escapeHtml(heading)}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 36px 20px;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:#4a4a4a;">
                  ${escapeHtml(intro)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 36px 28px;">
                <a href="${safeHref}"
                   style="display:inline-block;padding:13px 22px;background:#0a0a0a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:500;font-size:14.5px;letter-spacing:-0.1px;">
                  ${escapeHtml(buttonLabel)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 24px;">
                <p style="margin:0;font-size:12.5px;line-height:1.6;color:#9a9a9a;word-break:break-all;">
                  Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
                  <span style="color:#6a6a6a;">${safeHref}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 28px;">
                <p style="margin:0;font-size:12.5px;line-height:1.6;color:#9a9a9a;">
                  ${escapeHtml(fallbackNote ?? 'Falls du diese Aktion nicht angefordert hast, ignoriere diese E-Mail.')}
                </p>
              </td>
            </tr>
          </table>
          <div style="max-width:600px;margin-top:18px;font-size:11.5px;color:#9a9a9a;">
            © 2026 BrickScore — brickscore.de
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function appBaseUrl(): string {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}
