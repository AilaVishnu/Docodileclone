import React from "react";
import { styles } from "./Card.styles";

type CardProps = {
  children: React.ReactNode;
};

export function Card({ children }: CardProps) {
  return <div style={styles.card}>{children}</div>;
}
