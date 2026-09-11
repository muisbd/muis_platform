export function buildIcs({ title, description, location, dateLabel }) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${Date.now()}@muis.edu.bd`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MUIS//Events//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${location || ''}`,
    `COMMENT:${dateLabel || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
