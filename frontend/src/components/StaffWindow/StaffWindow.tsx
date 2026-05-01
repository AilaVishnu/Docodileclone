import React, { useState } from "react";
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
  const [hovered, setHovered] = useState(false);
  const color = windowColors[colorIndex % windowColors.length];

  const windowStyle: React.CSSProperties = dashed
    ? { ...styles.window, ...styles.dashedWindow, ...(hovered ? styles.dashedWindowHover : {}) }
    : { ...styles.window, backgroundColor: color, ...(hovered ? styles.windowHover : {}) };

  return (
    <div
      style={windowStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}
