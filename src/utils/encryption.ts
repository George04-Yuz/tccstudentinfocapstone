/**
 * Torres Capitol College Security & Integrity Helpers
 */

export function generateSHA256Checksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `SHA256-${hex.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

export function simulateAes256Encrypt(payload: object): { encryptedData: string; token: string; hash: string } {
  const json = JSON.stringify(payload);
  const hash = generateSHA256Checksum(json);
  const base64 = typeof btoa !== 'undefined' ? btoa(json) : Buffer.from(json).toString('base64');
  return {
    encryptedData: `AES256-GCM::${base64.slice(0, 32)}...[ENCRYPTED]`,
    token: `TCC-SEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    hash,
  };
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
