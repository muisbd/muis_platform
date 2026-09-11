export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function nextBloggerId(count) {
  const n = String(count + 1).padStart(3, '0');
  return `MUIS-BLG-${new Date().getFullYear()}-${n}`;
}
