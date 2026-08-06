"use client";

import { useEffect } from "react";

/** `overflow: hidden` on <body> alone doesn't actually stop scrolling on
 * iOS Safari — the page can still rubber-band/scroll behind a fixed-position
 * overlay via touch gestures. When that happens while the overlay is open,
 * iOS can leave it painted relative to a stale scroll offset, so it shows up
 * off-screen (looks like the modal "vanished" until you scroll all the way
 * back up, with the blurred backdrop stuck). Pinning the body itself with
 * `position: fixed` at the current scroll offset — and restoring the real
 * scroll position on close — is the fix that actually holds on iOS. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
