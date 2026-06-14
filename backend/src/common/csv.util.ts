import type { Response } from 'express';

// Escapa un valor para CSV (RFC 4180 simplificado): comillas duplicadas y
// envoltura con comillas. Usamos ';' como separador para que Excel-AR/ES
// no necesite asistente de importación.
function escapar(valor: unknown): string {
  const s = valor === null || valor === undefined ? '' : String(valor);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Convierte una lista de objetos en CSV con cabecera. */
export function toCsv<T extends Record<string, unknown>>(
  filas: T[],
  columnas: { key: keyof T; etiqueta: string }[],
): string {
  const sep = ';';
  const cabecera = columnas.map((c) => escapar(c.etiqueta)).join(sep);
  const cuerpo = filas
    .map((fila) => columnas.map((c) => escapar(fila[c.key])).join(sep))
    .join('\n');
  return `${cabecera}\n${cuerpo}`;
}

// BOM UTF-8 — sin él, Excel abre el CSV interpretándolo como Latin-1
// y rompe acentos y eñes.
const BOM_UTF8 = '﻿';

/** Manda el CSV con BOM y headers de descarga. */
export function enviarCsv(res: Response, nombreArchivo: string, csv: string): void {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${nombreArchivo}"`,
  );
  res.send(BOM_UTF8 + csv);
}
