import { SeerahRosterPhone } from '../models/SeerahRosterPhone.js';
import { SirahRegistration } from '../models/SirahRegistration.js';
import { normalizePhone, isCloseNumber, diffPositions } from './phone.js';

function sourceLabel(entry) {
  if (entry.source === 'website') {
    return entry.unclear ? 'Website registration (never approved)' : 'Website registration';
  }
  if (entry.source === 'whatsapp') return entry.unclear ? 'WhatsApp group (unclear)' : 'WhatsApp group';
  return entry.unclear ? 'Booth list (unclear in notebook)' : 'Booth list';
}

/** Loads every known Seerah phone number once, so many requests can be checked quickly. */
export async function loadPhoneDirectory() {
  const [roster, regs] = await Promise.all([
    SeerahRosterPhone.find().lean(),
    SirahRegistration.find({ status: { $ne: 'rejected' } }).select('phone email status').lean()
  ]);
  const entries = [];
  for (const row of roster) entries.push({ phone: row.phone, source: row.source, unclear: row.unclear });
  for (const reg of regs) {
    const phone = normalizePhone(reg.phone);
    if (phone) entries.push({ phone, source: 'website', unclear: reg.status !== 'accepted' });
  }
  const byPhone = new Map();
  for (const entry of entries) {
    if (!byPhone.has(entry.phone)) byPhone.set(entry.phone, []);
    byPhone.get(entry.phone).push(entry);
  }
  const acceptedEmails = new Set(regs.filter((r) => r.status === 'accepted').map((r) => r.email));
  return { entries, byPhone, acceptedEmails };
}

/**
 * status:
 *  verified   – exact match in a trusted list
 *  unclear    – exact match, but only with a number that was unclear / never approved
 *  close      – no exact match, but a list number differs by one digit or two swapped digits
 *  not_found  – nothing similar
 */
export function checkPhone(directory, phone, email = '') {
  const exact = directory.byPhone.get(phone) || [];
  const sources = [...new Set(exact.map(sourceLabel))];
  const emailMatch = Boolean(email && directory.acceptedEmails.has(email));

  if (exact.some((e) => !e.unclear)) return { status: 'verified', sources, emailMatch, close: [] };
  if (emailMatch) {
    return { status: 'verified', sources: [...sources, 'Website registration (same email)'], emailMatch, close: [] };
  }
  if (exact.length) return { status: 'unclear', sources, emailMatch, close: [] };

  const close = new Map();
  for (const entry of directory.entries) {
    if (!isCloseNumber(phone, entry.phone)) continue;
    const item = close.get(entry.phone) || { phone: entry.phone, diff: diffPositions(phone, entry.phone), sources: [] };
    const label = sourceLabel(entry);
    if (!item.sources.includes(label)) item.sources.push(label);
    close.set(entry.phone, item);
  }
  if (close.size) return { status: 'close', sources: [], emailMatch, close: [...close.values()] };
  return { status: 'not_found', sources: [], emailMatch, close: [] };
}
