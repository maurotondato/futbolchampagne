"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

/** Counts up from its previous value to `value` whenever it changes —
 * used for OVR/attribute cards and stat tiles so numbers feel alive
 * instead of just popping in. */
export function AnimatedNumber({
  value,
  duration = 1,
  decimals = 0,
  suffix = "",
  prefix = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    const from = mountedRef.current ? prevValue.current : 0;
    mountedRef.current = true;
    const controls = animate(from, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return (
    <>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </>
  );
}
