import React from "react";
import { styles, windowColors } from "./StaffWindow.styles";

type StaffWindowProps = {
  children: React.ReactNode;
  colorIndex?: number;
  onClick?: () => void;
  dashed?: boolean;
};

export function StaffWindow({
  children,
  colorIndex = 0,
  onClick,
  dashed = false,
}: StaffWindowProps) {
  const color = windowColors[colorIndex % windowColors.length];

  const windowStyle: React.CSSProperties = dashed
    ? { ...styles.window, ...styles.dashedWindow }
    : { ...styles.window, borderColor: color };

  return (
    <div style={windowStyle} onClick={onClick}>
      {children}
    </div>
  );
}
