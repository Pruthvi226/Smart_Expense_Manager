/** Quote CSV cells and neutralize spreadsheet formulas from user-entered text. */
export function encodeCsv(rows: string[][]): string {
  return rows.map(row => row.map(value => {
    const text = String(value);
    const safe = /^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  }).join(',')).join('\r\n');
}
