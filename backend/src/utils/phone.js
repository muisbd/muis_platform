const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯';
const BD_MOBILE = /^01[3-9]\d{8}$/;

function asciiDigits(value) {
  return String(value ?? '').replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d)));
}

/** Returns a clean 01XXXXXXXXX number, or '' when it is not a valid Bangladesh mobile number. */
export function normalizePhone(value) {
  let digits = asciiDigits(value).replace(/\D/g, '');
  if (digits.startsWith('00880')) digits = digits.slice(4);
  if (digits.startsWith('880')) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;
  return BD_MOBILE.test(digits) ? digits : '';
}

/**
 * Pulls every phone number out of pasted text (one per line, commas, notes, emojis are fine).
 * Two numbers written together without a space (22 digits) are split. Anything else that is
 * not 11 digits is returned in `skipped`.
 */
export function extractPhones(text) {
  const found = [];
  const skipped = [];
  const lines = asciiDigits(text).split(/\r?\n/);
  for (const line of lines) {
    const unclear = /⚠|\?/.test(line);
    const cleaned = line.replace(/(\+880|\b880)[\s-]*(?=1)/g, '0').replace(/(\d)-(?=\d)/g, '$1');
    for (const match of cleaned.matchAll(/\d{9,}/g)) {
      const digits = match[0];
      const parts = digits.length === 22 ? [digits.slice(0, 11), digits.slice(11)] : [digits];
      for (const part of parts) {
        const phone = normalizePhone(part);
        if (phone) found.push({ phone, unclear });
        else skipped.push(part);
      }
    }
  }
  return { found, skipped };
}

/** Positions where two same-length numbers differ. */
export function diffPositions(a, b) {
  const out = [];
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) out.push(i);
  return out;
}

/** One digit different, or two side-by-side digits swapped. */
export function isCloseNumber(a, b) {
  if (!a || !b || a === b || a.length !== b.length) return false;
  const diff = diffPositions(a, b);
  if (diff.length === 1) return true;
  if (diff.length === 2 && diff[1] === diff[0] + 1) {
    const [i, j] = diff;
    return a[i] === b[j] && a[j] === b[i];
  }
  return false;
}
