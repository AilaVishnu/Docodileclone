import React, { ReactNode, useState, useRef, useLayoutEffect, useEffect } from "react";
import { styles } from "./Tabs.styles";
import { colors, radii, shadows } from "../../styles/theme";

export type TabItem = {
  id: string;
  label: string;
  // Optional badge/chip rendered inside the tab, to the right of the label.
  // Used by the Print Template tabs to surface the "Default" marker.
  rightSlot?: ReactNode;
  // Right-click handler — used to surface tab-specific actions (e.g.
  // "Duplicate" on the Print Template tabs) without cluttering the tab UI.
  onContextMenu?: (e: React.MouseEvent) => void;
};

type ActionButton = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  actions?: ActionButton[];
  activeBackgroundColor?: string;
  // "connected" — original look (rounded-top trapezoid tabs attached to the
  // content below). Used by ClinicTabs.
  // "block"     — pill-shaped rounded blocks, matching the Stats tab strip.
  //               No visual attachment to content; tabs float above.
  variant?: "connected" | "block";
  // Block-variant size: "md" (the larger "E" tab, compacts below 1440) or
  // "sm" (the smaller "visit" tab, always compact). Ignored for "connected".
  size?: "md" | "sm";
  // Block variant only: shrink the container to its content width instead of
  // stretching to 100%. Use when two tab groups share one row (e.g. Stats'
  // section tabs + date-range sit side-by-side). Default false keeps the
  // full-width strip so the `actions` slot can right-align.
  inline?: boolean;
};

export function Tabs({
  items,
  activeId,
  onSelect,
  actions,
  activeBackgroundColor,
  variant = "connected",
  size = "md",
  inline = false,
}: TabsProps) {
  const isBlock = variant === "block";

  const tabBase    = isBlock ? (size === "sm" ? styles.blockTabSm : styles.blockTab) : styles.tab;
  const tabActive  = isBlock ? styles.blockTabActive      : styles.activeTab;
  const container  = isBlock
    ? (inline ? { ...styles.blockContainer, width: "auto" as const } : styles.blockContainer)
    : styles.container;
  const actionsCtr = isBlock ? styles.blockActionsContainer : styles.actionsContainer;
  const actionBtn  = isBlock ? styles.blockActionButton   : styles.actionButton;

  // Block variant: a single "pill" slides to sit behind the active tab, instead
  // of each tab toggling its own background. Measured (tabs are variable-width
  // and can wrap); reduced-motion-safe via the tokenised transition. Falls back
  // to the active tab's own background until measured, so it never renders empty.
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const tabIds = items.map((i) => i.id).join("|");
  const measure = () => {
    const el = tabRefs.current[activeId];
    if (el) setInd({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
  };
  useLayoutEffect(() => {
    if (!isBlock) { setInd(null); return; }
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlock, activeId, tabIds, size, inline]);
  useEffect(() => {
    if (!isBlock) return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlock, activeId, tabIds]);
  const pillRadius: number | string = size === "sm" ? radii.m : "var(--tab-md-r, 12px)";

  return (
    <div style={container}>
      {/* Block variant wraps tabs in their own strip so the "+ Add"
          actions slot can flex to the right via marginLeft:auto. */}
      <div role="tablist" style={isBlock ? { ...styles.blockStrip, position: "relative" } : { display: "contents" }}>
        {isBlock && ind && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: ind.left, top: ind.top, width: ind.width, height: ind.height,
              backgroundColor: activeBackgroundColor ?? colors.neutral100,
              borderRadius: pillRadius,
              boxShadow: shadows.card,
              transition:
                "left var(--motion-slow) var(--ease-standard), " +
                "top var(--motion-slow) var(--ease-standard), " +
                "width var(--motion-slow) var(--ease-standard)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        )}
        {items.map((item) => {
          const isActive = item.id === activeId;
          const overrideBg = isActive && activeBackgroundColor
            ? { backgroundColor: activeBackgroundColor }
            : null;
          // Block active tab shows text colour only — the sliding pill provides
          // the fill (falls back to the tab's own bg until measured). Connected
          // keeps its original background.
          const activeStyle = isActive
            ? (isBlock
                ? { ...tabActive, ...(ind ? { backgroundColor: "transparent" as const } : null) }
                : { ...tabActive, ...overrideBg })
            : null;
          return (
            <button
              key={item.id}
              ref={isBlock ? (el) => { tabRefs.current[item.id] = el; } : undefined}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(item.id)}
              onContextMenu={item.onContextMenu}
              style={{
                ...tabBase,
                ...(isBlock ? { position: "relative" as const, zIndex: 1 } : null),
                ...activeStyle,
                ...(item.rightSlot ? { display: "inline-flex", alignItems: "center", gap: 8 } : null),
              }}
            >
              <span
                style={
                  item.rightSlot
                    ? { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }
                    : undefined
                }
              >
                {item.label}
              </span>
              {item.rightSlot}
            </button>
          );
        })}
      </div>

      {actions && (
        <div style={actionsCtr}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              style={actionBtn}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
