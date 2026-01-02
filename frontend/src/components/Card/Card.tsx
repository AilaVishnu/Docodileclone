import React from "react";
import { styles } from "./Card.styles";

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        ...styles.card,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
