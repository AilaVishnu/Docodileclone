import React, { ReactNode } from "react";
import { styles } from "./Tabs.styles";

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
};

export function Tabs({
  items,
  activeId,
  onSelect,
  actions,
  activeBackgroundColor,
  variant = "connected",
}: TabsProps) {
  const isBlock = variant === "block";

  const tabBase    = isBlock ? styles.blockTab            : styles.tab;
  const tabActive  = isBlock ? styles.blockTabActive      : styles.activeTab;
  const container  = isBlock ? styles.blockContainer      : styles.container;
  const actionsCtr = isBlock ? styles.blockActionsContainer : styles.actionsContainer;
  const actionBtn  = isBlock ? styles.blockActionButton   : styles.actionButton;

  return (
    <div style={container}>
      {/* Block variant wraps tabs in their own strip so the "+ Add"
          actions slot can flex to the right via marginLeft:auto. */}
      <div style={isBlock ? styles.blockStrip : { display: "contents" }}>
        {items.map((item) => {
          const isActive = item.id === activeId;
          const overrideBg = isActive && activeBackgroundColor
            ? { backgroundColor: activeBackgroundColor }
            : null;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              onContextMenu={item.onContextMenu}
              style={{
                ...tabBase,
                ...(isActive ? tabActive : null),
                ...overrideBg,
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
