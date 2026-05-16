import React, { useEffect, useMemo, useState } from "react";

// Floating dev-only viewport tester. Mounted at the React tree root in
// development. Renders a small bar at top-center; clicking a width
// opens an in-page overlay with an iframe at that exact size so you
// can see the app render at a real viewport width — media queries
// inside the iframe fire correctly, CSS clamp() resolves against the
// iframe's vw, useMediaQuery reads the iframe's own matchMedia.
//
// Iframe approach is used (not window.open) because some embedded
// preview environments block popups. The iframe variant works
// everywhere.
//
// The bar and overlay are NOT part of the design system — `position:
// fixed`, hard-coded colors, max z-index. They sit outside the
// responsive layout they're observing.
//
// In production builds this component renders nothing and is dead-code-
// eliminated by the bundler.

type Preset = { label: string; width: number; height: number; hint: string };

const PRESETS: Preset[] = [
  { label: "1093", width: 1093, height: 614,  hint: "Windows 1366×768 @125% — compact desktop" },
  { label: "1280", width: 1280, height: 800,  hint: "13″ MacBook Air, Windows @100%" },
  { label: "1440", width: 1440, height: 900,  hint: "14″ MacBook Pro — design baseline" },
  { label: "1920", width: 1920, height: 1080, hint: "External Full-HD monitor" },
];

const SIM_PARAM = "nodevbar";

function isInsideSimFrame(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(SIM_PARAM) === "1";
}

export function DevViewportBar() {
  const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);
  const [hidden, setHidden] = useState<boolean>(false);
  const [preview, setPreview] = useState<Preset | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Esc closes the simulator overlay.
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [preview]);

  const iframeSrc = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set(SIM_PARAM, "1");
    return url.toString();
  }, []);

  // Inside the simulated iframe we suppress the bar entirely — otherwise
  // each iframe would render its own bar, click would nest again, etc.
  if (process.env.NODE_ENV !== "development") return null;
  if (isInsideSimFrame()) return null;

  return (
    <>
      {!hidden && (
        <div style={styles.bar} role="toolbar" aria-label="Viewport tester (development only)">
          <span style={styles.label}>viewport: <strong style={styles.widthValue}>{width}px</strong></span>
          <span style={styles.divider} />
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              style={{ ...styles.btn, ...(preview?.label === p.label ? styles.btnActive : null) }}
              onClick={() => setPreview(p)}
              title={p.hint}
            >
              {p.label}
            </button>
          ))}
          <span style={styles.divider} />
          <button
            type="button"
            style={styles.closeBtn}
            onClick={() => setHidden(true)}
            aria-label="Hide viewport bar"
            title="Hide"
          >
            ×
          </button>
        </div>
      )}

      {hidden && (
        <button
          type="button"
          style={styles.miniHandle}
          onClick={() => setHidden(false)}
          title="Show viewport bar"
        >
          {width}px
        </button>
      )}

      {preview && (
        <div style={styles.overlay} onClick={() => setPreview(null)}>
          <div style={styles.overlayHeader} onClick={(e) => e.stopPropagation()}>
            <span style={styles.overlayLabel}>
              Preview at <strong style={styles.widthValue}>{preview.width}×{preview.height}</strong>
              <span style={styles.overlayHint}> — {preview.hint}</span>
            </span>
            <div style={styles.overlaySwitch}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  style={{ ...styles.btn, ...(preview.label === p.label ? styles.btnActive : null) }}
                  onClick={() => setPreview(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button type="button" style={styles.overlayClose} onClick={() => setPreview(null)} aria-label="Close preview">
              ✕ close
            </button>
          </div>
          <div style={styles.overlayBody} onClick={(e) => e.stopPropagation()}>
            <iframe
              key={preview.label}
              title={`Viewport preview ${preview.width}×${preview.height}`}
              src={iframeSrc}
              style={{ ...styles.iframe, width: preview.width, height: preview.height }}
            />
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 2147483647,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 10px",
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    color: "#fff",
    borderRadius: "0 0 10px 10px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 11,
    lineHeight: "16px",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
    userSelect: "none",
  },
  label: { opacity: 0.7 },
  widthValue: { color: "#FFD86B", fontWeight: 600 },
  divider: {
    display: "inline-block",
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  btn: {
    padding: "3px 9px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 11,
    lineHeight: "14px",
  },
  btnActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.4)",
  },
  closeBtn: {
    padding: "2px 6px",
    background: "transparent",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    opacity: 0.55,
    fontSize: 14,
    lineHeight: 1,
  },
  miniHandle: {
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 2147483647,
    padding: "1px 8px",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    color: "#FFD86B",
    border: "none",
    borderRadius: "0 0 6px 6px",
    cursor: "pointer",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 10,
    lineHeight: "14px",
    opacity: 0.85,
  },

  // ─── Overlay (simulator) ────────────────────────────────────────────
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    zIndex: 2147483646,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    overflow: "auto",
  },
  overlayHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 14px",
    marginBottom: 12,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    color: "#fff",
    borderRadius: 10,
    fontSize: 11,
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
  },
  overlayLabel: {
    opacity: 0.85,
  },
  overlayHint: {
    opacity: 0.55,
    marginLeft: 4,
  },
  overlaySwitch: {
    display: "inline-flex",
    gap: 4,
  },
  overlayClose: {
    padding: "3px 10px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 11,
  },
  overlayBody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 0,
  },
  iframe: {
    border: "none",
    backgroundColor: "#fff",
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.5)",
    borderRadius: 6,
  },
};
