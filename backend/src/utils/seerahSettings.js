import { AppSetting } from '../models/AppSetting.js';

const SETTINGS_KEY = 'seerah-2026';

export const NAME_FONTS = ['playfair', 'tinos', 'greatvibes'];

// Positions and sizes are fractions of the template width/height, so they work at any image size.
export const DEFAULT_NAME_STYLE = {
  font: 'playfair',
  color: '#5B2C14',
  x: 0.5,
  y: 0.585,
  size: 0.058,
  maxWidth: 0.53
};

function clamp(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function cleanNameStyle(input = {}, base = DEFAULT_NAME_STYLE) {
  const color = String(input.color ?? base.color);
  return {
    font: NAME_FONTS.includes(input.font) ? input.font : base.font,
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : base.color,
    x: clamp(input.x, 0, 1, base.x),
    y: clamp(input.y, 0, 1, base.y),
    size: clamp(input.size, 0.01, 0.2, base.size),
    maxWidth: clamp(input.maxWidth, 0.1, 1, base.maxWidth)
  };
}

/** One person's fine-tuning on top of the shared style. `null` means "use the shared style". */
export function cleanPersonStyle(input) {
  if (!input) return null;
  return {
    scale: clamp(input.scale, 0.3, 3, 1),
    dx: clamp(input.dx, -0.5, 0.5, 0),
    dy: clamp(input.dy, -0.5, 0.5, 0)
  };
}

export async function getSeerahSettings() {
  const doc = await AppSetting.findOne({ key: SETTINGS_KEY }).lean();
  const value = doc?.value || {};
  return {
    registrationOpen: value.registrationOpen === true,
    requestsOpen: value.requestsOpen !== false,
    nameStyle: cleanNameStyle(value.nameStyle || {})
  };
}

export async function saveSeerahSettings(patch = {}) {
  const current = await getSeerahSettings();
  const next = { ...current };
  if (patch.registrationOpen !== undefined) next.registrationOpen = Boolean(patch.registrationOpen);
  if (patch.requestsOpen !== undefined) next.requestsOpen = Boolean(patch.requestsOpen);
  if (patch.nameStyle === 'reset') next.nameStyle = { ...DEFAULT_NAME_STYLE };
  else if (patch.nameStyle) next.nameStyle = cleanNameStyle(patch.nameStyle, current.nameStyle);
  await AppSetting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: { value: next } },
    { upsert: true, new: true }
  );
  return next;
}

export async function getFlag(key) {
  const doc = await AppSetting.findOne({ key }).lean();
  return Boolean(doc?.value?.done);
}

export async function setFlag(key) {
  await AppSetting.findOneAndUpdate({ key }, { $set: { value: { done: true } } }, { upsert: true });
}
