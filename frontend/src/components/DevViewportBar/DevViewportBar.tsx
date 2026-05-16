import React, { useEffect, useState } from "react";

// Floating dev-only viewport tester. Mounted at the React tree root in
// development. Renders a small bar at top-center with the current
// `window.innerWidth` and preset buttons that open a popup window at
// the picked width so you can sanity-check responsive behavior without
// resizing your real browser window.
//
// Does NOT participate in the design system — `position: fixed`, very
// high z-index, monospace styling, hard-coded colors. The whole point
// is that it sits *outside* the responsive layout it's observing.
//
// In production builds (`process.env.NODE_ENV !== "development"`) this
// component renders nothing and is dead-code-eliminated by the bundler.

type Preset = { label: string; width: number; height: number; hint: string };

const PRESETS: Preset[] = [
  { label: "1093", width: 1093, height: 614,  hint: "Windows 1366×768 @125% — compact desktop" },
  { label: "1280", width: 1280, height: 800,  hint: "13″ MacBook Air, Windows @100%" },
  { label: "1440", width: 1440, height: 900,  hint: "14″ MacBook Pro — design baseline" },
  { label: "1920", width: 1920, height: 1080, hint: "External Full-HD monitor" },
];

export function DevViewportBar() {
  const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);
  const [hidden, setHidden] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;
  if (hidden) {
    return (
      <button
        type="button"
        style={styles.miniHandle}
        onClick={() => setHidden(false)}
        title="Show viewport bar"
      >
        {width}px
      </button>
    );
  }

  const openAt = (p: Preset) => {
    // Single named target — opening the same name reuses the popup so
    // repeated clicks update its size instead of stacking windows.
    const features = `width=${p.width},height=${p.height},resizable=yes,scrollbars=yes,location=no,menubar=no,toolbar=no`;
    const popup = window.open(window.location.href, "docodile_viewport_test", features);
    // Belt-and-braces: some browsers ignore the size hint on reuse.
    // Resizing after-the-fact works for windows opened by this script.
    if (popup) {
      try { popup.resizeTo(p.width, p.height); } catch {}
      try { popup.focus(); } catch {}
    }
  };

  return (
    <div style={styles.bar} role="toolbar" aria-label="Viewport tester (development only)">
      <span style={styles.label}>viewport: <strong style={styles.widthValue}>{width}px</strong></span>
      <span style={styles.divider} />
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          style={{ ...styles.btn, ...(width === p.width ? styles.btnActive : null) }}
          onClick={() => openAt(p)}
          title={`${p.hint}\n(opens in a new window)`}
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
    pointerEvents: "auto",
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
};
