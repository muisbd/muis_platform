import { Resend } from 'resend';
import { env } from '../config/env.js';

let client = null;
function getClient() {
  if (!env.resendApiKey) return null;
  if (!client) client = new Resend(env.resendApiKey);
  return client;
}

export async function sendMail({ to, subject, html, text, attachments }) {
  const resend = getClient();
  if (!resend) {
    console.warn('[mailer] RESEND_API_KEY not set — email skipped:', subject, '→', to);
    return { skipped: true };
  }
  try {
    await resend.emails.send({
      from: env.resendFrom,
      to,
      subject,
      html,
      text,
      attachments
    });
    return { skipped: false };
  } catch (err) {
    console.error('[mailer]', err.message);
    return { skipped: true, error: err.message };
  }
}

export async function notifyCommittee(subject, html) {
  return sendMail({ to: env.committeeEmail, subject, html });
}

export function wrapEmail(title, bodyHtml) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#070913;color:#F3F4F6;padding:24px;">
      <h2 style="color:#C084FC;">${title}</h2>
      <div style="line-height:1.6;">${bodyHtml}</div>
      <p style="margin-top:24px;color:#9CA3AF;font-size:12px;">Metropolitan University Islamic Society (MUIS)</p>
    </div>
  `;
}
