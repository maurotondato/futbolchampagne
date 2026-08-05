/** Git SHA of the deployed build, baked in at build time by the GitHub
 * Pages workflow. Empty in local dev, where there's nothing to check. */
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || "";
