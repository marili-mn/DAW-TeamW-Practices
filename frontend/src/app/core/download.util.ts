// Dispara la descarga de un blob como archivo `nombre`.
// Crea un <a download> temporal y lo clickea programáticamente.
export function descargarBlob(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
