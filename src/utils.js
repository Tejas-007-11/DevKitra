export function convertJsonToCsv(parsed) {
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of objects.');
  if (!parsed.length) return '';

  const rows = parsed.map((entry) => (
    entry !== null && typeof entry === 'object' && !Array.isArray(entry)
      ? entry
      : { value: entry }
  ));
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escapeCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const lines = [keys.map(escapeCell).join(',')];

  rows.forEach((row) => {
    const values = keys.map((key) => {
      const value = row[key];
      const text = value === null || value === undefined
        ? ''
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);
      return escapeCell(text);
    });
    lines.push(values.join(','));
  });

  return lines.join('\n');
}

export function createUuidV4(cryptoApi = globalThis.crypto) {
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID();
  if (typeof cryptoApi?.getRandomValues !== 'function') {
    throw new Error('Secure random number generation is unavailable in this browser.');
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
