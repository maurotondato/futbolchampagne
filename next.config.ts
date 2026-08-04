import type { NextConfig } from "next";

// Static export so the app can run on GitHub Pages (no server needed —
// everything is client-side already: Zustand store + optional Supabase).
// Works just as well on Vercel. NEXT_PUBLIC_BASE_PATH is set only by the
// GitHub Pages deploy workflow (project pages are served under
// /<repo-name>/); it's empty for local dev and root-domain hosts.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
