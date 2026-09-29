import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { SirahRegistration } from '../models/SirahRegistration.js';

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

export async function normalizeSirahPaths() {
  await SirahRegistration.updateMany(
    { $or: [{ registrantType: { $exists: false } }, { registrantType: null }, { registrantType: '' }] },
    { $set: { registrantType: 'mu', luStatus: 'not_required' } }
  );
}
