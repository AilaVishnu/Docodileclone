import React from "react";
import { spacing } from "../../styles/theme";
import { styles, cardSurface, CardVariant, CardElevation } from "./Card.styles";

type CardProps = {
  children: React.ReactNode;
  /** Paper colour. "plain" (default) = transparent layout shell (legacy). */
  variant?: CardVariant;
  /** "raised" adds the one canonical soft card shadow; "none" stays flat. */
  elevation?: CardElevation;
  /** Optional interior padding token (only meaningful for non-plain variants). */
  padding?: keyof typeof spacing;
  style?: React.CSSProperties;
};

export function Card({
  children,
  variant = "plain",
  elevation = "none",
  padding,
  style,
}: CardProps) {
  const surface = variant === "plain" ? null : cardSurface(variant, elevation);
  return (
    <div
      style={{
        ...styles.card,
        ...surface,
        ...(padding ? { padding: spacing[padding] } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
