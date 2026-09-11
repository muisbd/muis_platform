import crypto from 'crypto';

export function sixDigitCode() {
  return String(crypto.randomInt(100000, 999999));
}

export function hashSecret(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 8; i += 1) {
    out += chars[crypto.randomInt(0, chars.length)];
  }
  return out;
}
