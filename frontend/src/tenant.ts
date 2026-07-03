// Resolves the current clinic tenant (its schema/subdomain slug), used for the
// X-Tenant header so the schema-per-clinic backend knows which clinic a request
// is for. Prod: acme.docodile.app -> "acme". Dev: acme.lvh.me -> "acme", or
// REACT_APP_DEV_TENANT for plain localhost (which has no subdomain).
const RESERVED = new Set(["www", "api", "app", "localhost", ""]);

export function currentTenant(): string | null {
  const host = window.location.hostname.toLowerCase();
  for (const suffix of [".docodile.app", ".lvh.me", ".localhost"]) {
    if (host.endsWith(suffix)) {
      const label = host.slice(0, -suffix.length);
      if (label && !label.includes(".") && !RESERVED.has(label)) return label;
    }
  }
  // Dev fallback for plain localhost / IP (no subdomain available).
  const dev = process.env.REACT_APP_DEV_TENANT;
  return dev && dev.trim() ? dev.trim().toLowerCase() : null;
}
