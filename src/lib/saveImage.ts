/** iOS Safari doesn't support the `download` attribute on `<a>` — clicking
 * it just opens the data URL in a new tab instead of saving anything, so
 * the "Descargar" button silently did nothing there. The only reliable way
 * to get an image into Photos on iOS is the native share sheet's "Guardar
 * imagen", so prefer that whenever the platform can share files, and fall
 * back to the classic anchor download where it actually works (desktop). */
export async function saveImage(dataUrl: string, filename: string) {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
        throw err;
      }
      return;
    }
  } catch {
    // fall through to the anchor download below
  }
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
