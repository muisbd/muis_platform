import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { SirahRegistration } from '../models/SirahRegistration.js';
import { SeerahRosterPhone } from '../models/SeerahRosterPhone.js';
import { SEERAH_BOOTH_PHONES, SEERAH_UNCLEAR_PHONES } from '../data/seerahBoothPhones.js';
import { getFlag, setFlag } from './seerahSettings.js';

export async function ensureLuVerifier() {
  const email = String(env.luVerifierEmail || '').toLowerCase().trim();
  const password = String(env.luVerifierPassword || '');
  if (!email || !password) {
    console.warn('LU_VERIFIER_EMAIL / LU_VERIFIER_PASSWORD not set — Leading University login is disabled.');
    return;
  }
  if (password.length < 8) {
    console.warn('Leading University password must be at least 8 characters. Account was not updated.');
    return;
  }

  const existing = await User.findOne({ email }).select('+password');
  if (existing && existing.role !== 'lu_verifier') {
    console.warn('Leading University email is already used by another account. Choose a different LU_VERIFIER_EMAIL.');
    return;
  }

  if (!existing) {
    await User.create({
      name: env.luVerifierName || 'Leading University Verifier',
      email,
      password,
      role: 'lu_verifier',
      memberStatus: 'none'
    });
    console.log('Leading University verifier ready:', email);
    return;
  }

  existing.name = env.luVerifierName || existing.name;
  existing.role = 'lu_verifier';
  existing.memberStatus = 'none';
  existing.frozen = false;
  existing.password = password;
  await existing.save();
  console.log('Leading University verifier updated:', email);
}

// Loads the booth list once. After that, admins manage the list from the dashboard.
export async function ensureSeerahRoster() {
  const flag = 'seerah-2026-roster-seeded';
  if (await getFlag(flag)) return;
  const ops = SEERAH_BOOTH_PHONES.map((phone) => ({
    updateOne: {
      filter: { phone },
      update: { $setOnInsert: { phone, source: 'booth', unclear: SEERAH_UNCLEAR_PHONES.includes(phone) } },
      upsert: true
    }
  }));
  const result = await SeerahRosterPhone.bulkWrite(ops, { ordered: false });
  await setFlag(flag);
  console.log(`Seerah booth list loaded: ${result.upsertedCount} numbers added.`);
}

export async function normalizeSirahPaths() {
  await SirahRegistration.updateMany(
    { $or: [{ registrantType: { $exists: false } }, { registrantType: null }, { registrantType: '' }] },
    { $set: { registrantType: 'mu', luStatus: 'not_required' } }
  );
}
