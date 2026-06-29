import React from "react";
import { colors, fonts } from "../../styles/theme";

/**
 * DocsShelf — one labelled shelf in the Docs library: a heading with an
 * optional "Full shelf →" action, a row of BookletCovers, and a wooden-ledge
 * plank they rest on. Mirrors the Home queue shelves' rhythm but in the warm
 * primary tints.
 */
export type DocsShelfProps = {
  title: string;
  onFull?: () => void;
  children: React.ReactNode;
};

export function DocsShelf({ title, onFull, children }: DocsShelfProps) {
  return (
    <section style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, paddingRight: 4 }}>
        <h3 style={{ margin: 0, fontFamily: fonts.family.primary, fontSize: fonts.size.m, lineHeight: fonts.lineHeight.m, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>
          {title}
        </h3>
        {onFull && (
          <button
            type="button"
            onClick={onFull}
            style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: fonts.family.primary, fontSize: fonts.size.xs, color: colors.neutral600, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Full shelf
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end", overflowX: "auto", padding: "2px 4px 0", scrollbarWidth: "none" }}>
          {children}
        </div>
        {/* Ledge plank — books rest on its top edge; a darker front face adds depth. */}
        <div style={{ position: "relative", marginTop: -3 }}>
          <div style={{ height: 12, borderRadius: 3, background: colors.primary300, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)" }} />
          <div style={{ height: 5, borderRadius: "0 0 3px 3px", background: colors.primary400, opacity: 0.6 }} />
          <div style={{ height: 12, marginTop: 2, background: "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0))" }} />
        </div>
      </div>
    </section>
  );
}
