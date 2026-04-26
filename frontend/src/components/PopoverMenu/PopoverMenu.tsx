import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Generic popover menu — a click-trigger that opens a list of action items.
// Used by the Tuning button in the visit tabs and (eventually) the per-row
// kebab in the appointment queue. Closes on outside click or item select.
// ─────────────────────────────────────────────────────────────────────────────

export type PopoverMenuItem = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

type PopoverMenuProps = {
  /** The clickable element rendered inline (icon button, kebab, etc.). */
  trigger: React.ReactNode;
  items: PopoverMenuItem[];
  /** Where the menu opens relative to the trigger. Default: bottom-right. */
  align?: "left" | "right";
  /** Optional aria-label for the trigger button. */
  ariaLabel?: string;
};

export function PopoverMenu({ trigger, items, align = "right", ariaLabel }: PopoverMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={styles.wrap}>
      <button
        type="button"
        style={styles.triggerButton}
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div style={{ ...styles.menu, ...(align === "left" ? { left: 0, right: "auto" } : {}) }}>
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              style={{
                ...styles.item,
                ...(item.destructive ? styles.itemDestructive : {}),
              }}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: "relative",
    display: "inline-flex",
  },
  triggerButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.neutral900,
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    right: 0,
    minWidth: 180,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    zIndex: 1000,
  },
  item: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: `${spacing.xs} ${spacing.s}`,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    borderRadius: radii.xs,
  },
  itemDestructive: {
    color: "#c0392b",
  },
};
