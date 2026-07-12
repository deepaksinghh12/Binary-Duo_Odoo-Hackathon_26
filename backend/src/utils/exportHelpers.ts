import ExcelJS from 'exceljs';
import { Response } from 'express';

/**
 * Utility helpers for report export — CSV, Excel (xlsx), and simple text-based PDF.
 * Used by GET /api/reports/:type/export?format=csv|xlsx|pdf
 */

// ── CSV ────────────────────────────────────────────────────────────────────────
export function exportCSV(res: Response, filename: string, rows: Record<string, unknown>[]): void {
  if (!rows || rows.length === 0) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.end('No data\n');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val === null || val === undefined ? '' : String(val);
          // Escape commas and quotes
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',')
    ),
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.end(csvLines.join('\n'));
}

// ── Excel (xlsx) ───────────────────────────────────────────────────────────────
export async function exportXLSX(
  res: Response,
  filename: string,
  sheetName: string,
  rows: Record<string, unknown>[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EcoSphere';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName);

  if (!rows || rows.length === 0) {
    sheet.addRow(['No data available']);
  } else {
    const headers = Object.keys(rows[0]);

    // Header row with styling
    sheet.columns = headers.map((h) => ({
      header: h.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      key: h,
      width: Math.max(h.length + 4, 14),
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A7D4E' }, // EcoSphere green
    };
    headerRow.alignment = { horizontal: 'center' };

    rows.forEach((row) => sheet.addRow(row));
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
}

// ── PDF (plaintext CSV wrapped in a basic HTTP response) ──────────────────────
// Full PDF generation (pdfkit/puppeteer) is heavy. We return a text/plain stream
// labelled as PDF for now — the frontend can trigger browser print-to-PDF on the
// data view. Replace with pdfkit if a richer layout is required later.
export function exportPDF(res: Response, filename: string, rows: Record<string, unknown>[]): void {
  if (!rows || rows.length === 0) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
    res.end('No data available.');
    return;
  }

  const headers = Object.keys(rows[0]);
  const colWidths = headers.map((h) =>
    Math.max(h.length, ...rows.map((r) => String(r[h] ?? '').length)) + 2
  );

  const pad = (s: string, w: number) => s.padEnd(w, ' ');

  const separator = colWidths.map((w) => '-'.repeat(w)).join('+');
  const headerLine = headers.map((h, i) => pad(h.toUpperCase(), colWidths[i])).join('|');
  const dataLines = rows.map((row) =>
    headers.map((h, i) => pad(String(row[h] ?? ''), colWidths[i])).join('|')
  );

  const content = [
    `EcoSphere Report — Generated ${new Date().toISOString()}`,
    '',
    headerLine,
    separator,
    ...dataLines,
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
  res.end(content);
}
