"use client";

import { useEffect } from "react";
import { BUILD_ID } from "@/lib/buildId";
import { withBasePath } from "@/lib/basePath";
import { safeGet, safeSet } from "@/lib/safeStorage";

const CHECKED_KEY = "fc-build-check";

/**
 * GitHub Pages / browser HTTP caching can leave a tab stuck on an old
 * index.html + JS bundle well after a fix has shipped — the single biggest
 * source of "I swear this is still broken" reports even after a real fix
 * is live. This compares the build id baked into the currently loaded
 * bundle against build-id.txt fetched fresh (cache: "no-store") from the
 * server, and forces one hard reload if they differ.
 *
 * The sessionStorage guard is keyed by the *server's* id, not a boolean,
 * so it reloads again if a newer build ships mid-session, but never loops:
 * once reloaded for a given id, it won't retry for that same id again.
 */
export function VersionGuard() {
  useEffect(() => {
    if (!BUILD_ID) return; // local dev — nothing deployed to compare against

    fetch(`${withBasePath("/build-id.txt")}?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.text() : null))
      .then((latest) => {
        const serverBuildId = latest?.trim();
        if (!serverBuildId || serverBuildId === BUILD_ID) return;
        if (safeGet("session", CHECKED_KEY) === serverBuildId) return;
        safeSet("session", CHECKED_KEY, serverBuildId);
        window.location.reload();
      })
      .catch(() => {
        // Offline, or the request itself got cached somehow — nothing we
        // can do, and definitely not worth breaking the app over.
      });
  }, []);

  return null;
}
