"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** `backdrop-filter` (used by .glass/.glass-strong) establishes a new
 * containing block for `position: fixed` descendants, same as `filter` or
 * `transform` — any full-screen modal opened from inside a glass panel
 * isn't actually fixed to the viewport, it's confined to that panel's box,
 * which is why it can render off-screen requiring a scroll to find it.
 * Portaling straight to <body> sidesteps whatever ancestor styling the
 * trigger happens to be nested inside. */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
