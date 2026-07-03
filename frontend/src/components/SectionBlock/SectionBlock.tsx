import React from "react";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import type { BlockSurface } from "../../visit/block";
import { styles } from "./SectionBlock.styles";

// ─────────────────────────────────────────────────────────────────────────────
// SectionBlock — the uniform chrome for a visit block: an icon + title header
// with an optional collapse chevron, a kebab/actions slot, and a remove action,
// wrapping any body content. Mirrors the prescription page's existing collapsible
// sections so every block (Vitals, Rx, Procedure…) looks identical. The body is
// passed as children; the block component supplies only its fields.
// ─────────────────────────────────────────────────────────────────────────────

type SectionBlockProps = {
  title: string;
  /** Icon registry name shown left of the title. */
  icon?: string;
  children: React.ReactNode;
  /** "flush" = divider-separated section in the sheet (default); "card" = its own surface. */
  surface?: BlockSurface;
  /** Show a collapse chevron. Controlled via `open`/`onToggle`, else self-managed. */
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
  defaultOpen?: boolean;
  /** When provided, a remove (trash) action shows in the header. */
  onRemove?: () => void;
  /** A short summary shown next to the title when collapsed (e.g. name · site). */
  summary?: React.ReactNode;
  /** Extra header actions (e.g. a kebab menu), left of remove/collapse. */
  actions?: React.ReactNode;
  /** Drop the bottom divider (flush surface only) — e.g. the last block. */
  noDivider?: boolean;
};

export function SectionBlock({
  title,
  icon,
  children,
  surface = "flush",
  collapsible = true,
  open,
  onToggle,
  defaultOpen = true,
  onRemove,
  summary,
  actions,
  noDivider,
}: SectionBlockProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = collapsible ? open ?? internalOpen : true;
  const toggle = onToggle ?? (() => setInternalOpen((o) => !o));

  const titleInner = (
    <span style={styles.titleWrap}>
      {icon ? <Icon name={icon} tone="inherit" style={styles.icon} /> : null}
      <span style={styles.title}>{title}</span>
      {collapsible && !isOpen && summary ? <span style={styles.summary}>· {summary}</span> : null}
    </span>
  );

  const chevron = collapsible ? (
    <Icon
      name="chevron-up"
      tone="inherit"
      style={{ ...styles.icon, transform: isOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.15s ease" }}
    />
  ) : null;

  const header = (
    <div style={styles.header}>
      {collapsible ? (
        // Whole title row is the click target — the chevron alone is too small.
        <button
          type="button"
          style={styles.titleToggle}
          onClick={toggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
        >
          {titleInner}
          {chevron}
        </button>
      ) : (
        <div style={{ ...styles.titleToggle, cursor: "default" }}>{titleInner}</div>
      )}
      {actions || onRemove ? (
        <div style={styles.actions}>
          {actions}
          {onRemove ? (
            <IconButton ariaLabel={`Remove ${title}`} title="Remove" size={30} onClick={onRemove}>
              <Icon name="trash" tone="inherit" size={18} />
            </IconButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const inner = (
    <>
      {header}
      {isOpen ? children : null}
    </>
  );

  if (surface === "card") {
    return <section style={styles.card}>{inner}</section>;
  }
  return <section style={{ ...styles.flush, ...(noDivider ? styles.flushNoDivider : null) }}>{inner}</section>;
}
