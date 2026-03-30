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
  disabled?: boolean;
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
            style={{
              ...styles.tab,
              ...(isActive ? { 
                ...styles.activeTab, 
                backgroundColor: activeBackgroundColor || styles.activeTab.backgroundColor 
              } : {}),
            }}
            title={item.label}
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
              onClick={action.disabled ? undefined : action.onClick}
              disabled={action.disabled}
              style={action.disabled ? styles.disabledActionButton : styles.actionButton}
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
