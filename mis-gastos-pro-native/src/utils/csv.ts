export function toCsv(rows: (string | number)[][]): string {
  const body = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  return '﻿' + body;
}
