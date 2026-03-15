import React, { ReactNode } from "react";
import { styles } from "./Tabs.styles";

export type TabItem = {
  id: string;
  label: string;
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
};

export function Tabs({
  items,
  activeId,
  onSelect,
  actions,
}: TabsProps) {
  return (
    <div style={styles.container}>
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              ...styles.tab,
              ...(isActive ? styles.activeTab : {}),
            }}
          >
            {item.label}
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
