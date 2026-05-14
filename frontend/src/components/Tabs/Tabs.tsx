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
};

export function Tabs({
  items,
  activeId,
  onSelect,
  actions,
  activeBackgroundColor,
}: TabsProps) {
  return (
    <div style={styles.container}>
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            onContextMenu={item.onContextMenu}
            style={{
              ...styles.tab,
              ...(isActive ? {
                ...styles.activeTab,
                backgroundColor: activeBackgroundColor || styles.activeTab.backgroundColor
              } : {}),
              ...(item.rightSlot ? { display: "inline-flex", alignItems: "center", gap: 8 } : null),
            }}
          >
            <span>{item.label}</span>
            {item.rightSlot}
          </button>
        );
      })}

      {actions && (
        <div style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              style={styles.actionButton}
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
