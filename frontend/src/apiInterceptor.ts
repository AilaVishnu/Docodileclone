import { API_BASE_URL } from "./apiConfig";
import { currentTenant } from "./tenant";

// Installs a one-time global fetch wrapper that adds the X-Tenant header to every
// request to the backend. Because the frontend and API are cross-origin in dev,
// the Host header can't carry the tenant — so we derive it from our own subdomain
// and send it explicitly. (The ~100 hand-rolled fetch call sites stay untouched.)
export function installApiInterceptor() {
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith(API_BASE_URL)) {
      const tenant = currentTenant();
      if (tenant) {
        const headers = new Headers(
          init?.headers || (input instanceof Request ? input.headers : undefined),
        );
        if (!headers.has("X-Tenant")) headers.set("X-Tenant", tenant);
        init = { ...init, headers };
      }
    }
    return original(input, init);
  };
}
