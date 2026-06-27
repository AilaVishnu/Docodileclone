import React, { CSSProperties } from "react";
import { Icon } from "../Icon";
import { styles } from "./VisitTabs.styles";

export interface VisitTabItem {
  /** Stable key for the tab. */
  id: string;
  /** Pre-formatted date label shown beside the visit number (e.g. "23 May", "Today"). */
  label: string;
}

export interface VisitTabsProps {
  /** Visits in chronological order; the number shown is the 1-based index. */
  tabs: VisitTabItem[];
  /** Index of the active visit. */
  activeIndex: number;
  /** Called with the clicked tab's index. */
  onSelect: (index: number) => void;
  /** Optional "+ New Visit" action — omit to hide the add button. */
  onAddVisit?: () => void;
  /** Disables the add button and shows "Creating…". */
  addingVisit?: boolean;
  /** Label for the add button (default "New Visit"). */
  addLabel?: string;
  /** Merged into the root row — e.g. marginTop, pointerEvents. */
  style?: CSSProperties;
}

/**
 * Horizontal strip of visit tabs (segmented "number │ date" pills). When the
 * tabs overflow the available width, left/right chevrons page through them
 * (each disabled at its end) and the active visit is kept scrolled into view.
 * The "+ New Visit" affordance sits outside the scroller so it stays reachable.
 */
export function VisitTabs({
  tabs,
  activeIndex,
  onSelect,
  onAddVisit,
  addingVisit = false,
  addLabel = "New Visit",
  style,
}: VisitTabsProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [nav, setNav] = React.useState({ overflow: false, left: false, right: false });

  const updateNav = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setNav({
      overflow: el.scrollWidth > el.clientWidth + 1,
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  // Track overflow + scroll position; re-measure when the bar resizes.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateNav();
    el.addEventListener("scroll", updateNav, { passive: true });
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateNav);
      ro.observe(el);
    }
    return () => {
      el.removeEventListener("scroll", updateNav);
      ro?.disconnect();
    };
  }, [updateNav, tabs.length]);

  // Keep the active visit in view (it may be a mid-list visit, not just the
  // latest) — scroll only the strip, never the page.
  React.useEffect(() => {
    const el = scrollRef.current;
    const tab = el?.children[activeIndex] as HTMLElement | undefined;
    if (!el || !tab) return;
    const er = el.getBoundingClientRect();
    const tr = tab.getBoundingClientRect();
    if (tr.left < er.left) el.scrollLeft -= er.left - tr.left + 12;
    else if (tr.right > er.right) el.scrollLeft += tr.right - er.right + 12;
    updateNav();
  }, [activeIndex, tabs.length, updateNav]);

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <div style={{ ...styles.root, ...style }}>
      {nav.overflow && (
        <button
          type="button"
          style={{ ...styles.arrow, ...(nav.left ? {} : styles.arrowDisabled) }}
          onClick={() => scrollByPage(-1)}
          disabled={!nav.left}
          aria-label="Show earlier visits"
        >
          <Icon name="chevron-left" size={18} tone="inherit" />
        </button>
      )}
      <div ref={scrollRef} style={styles.scroller} className="no-scrollbar">
        {tabs.map((t, i) => {
          const active = i === activeIndex;
          return (
            <div
              key={t.id}
              style={{ ...styles.tab, ...(active ? styles.tabActive : styles.tabInactive) }}
              onClick={() => onSelect(i)}
            >
              <span style={styles.seg}>
                <span style={{ ...styles.num, ...(active ? styles.numActive : {}) }}>{i + 1}</span>
                <span style={{ ...styles.date, ...(active ? styles.dateActive : {}) }}>{t.label}</span>
              </span>
            </div>
          );
        })}
      </div>
      {nav.overflow && (
        <button
          type="button"
          style={{ ...styles.arrow, ...(nav.right ? {} : styles.arrowDisabled) }}
          onClick={() => scrollByPage(1)}
          disabled={!nav.right}
          aria-label="Show later visits"
        >
          <Icon name="chevron-right" size={18} tone="inherit" />
        </button>
      )}
      {onAddVisit && (
        <button type="button" style={styles.addBtn} onClick={onAddVisit} disabled={addingVisit} title="Add a new visit">
          <span style={styles.addPlus} aria-hidden="true">+</span>
          <span>{addingVisit ? "Creating…" : addLabel}</span>
        </button>
      )}
    </div>
  );
}
