import React from "react";
import { styles } from "./HintCard.styles";

type HintCardProps = {
  title?: string;
  description: string;
};

export function HintCard({
  title = "Get started",
  description,
}: HintCardProps) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
    </div>
  );
}
