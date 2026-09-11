const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function computeDailyPoints(entry) {
  let points = 0;
  const salah = entry.salah || {};
  for (const key of PRAYERS) {
    if (salah[key] === 'prayed') points += 2;
  }
  if (entry.avoidedSin) points += 3;
  if (entry.helpedSomeone) points += 3;
  if (entry.productive) points += 2;
  return Math.min(points, 18);
}
