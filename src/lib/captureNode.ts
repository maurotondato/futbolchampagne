/** Renders a DOM node to a PNG data URL via html-to-image, with a hard
 * timeout — if a cross-origin image (e.g. a Supabase Storage player photo)
 * fails to load in a way html-to-image doesn't reject cleanly on, the
 * capture can hang forever with no error and no result. A timed-out
 * capture rejects instead, so the caller's error state always resolves. */
export async function captureNodeToPng(node: HTMLElement, timeoutMs = 12000): Promise<string> {
  const { toPng } = await import("html-to-image");

  function capture() {
    return toPng(node, { pixelRatio: 2.5, cacheBust: true });
  }

  function withTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error("capture timed out")), timeoutMs);
      }),
    ]);
  }

  // Two passes: fonts/layout settle better on the second capture.
  await withTimeout(capture());
  return withTimeout(capture());
}
