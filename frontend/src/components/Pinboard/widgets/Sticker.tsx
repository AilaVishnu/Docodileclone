import React from "react";
import { colors, radii } from "../../../styles/theme";
import { Icon } from "../../Icon";

// Decorative board decals — an icon decal or a strip of "washi tape". Purely
// visual; no card chrome. Sits in a BoardItem like anything else.

export type StickerProps = {
  /** "icon" = a coloured Icon decal; "tape" = a translucent tape strip. */
  variant?: "icon" | "tape";
  /** Icon registry name (icon variant only). */
  name?: string;
  color?: string;
  /** Icon glyph size in px (icon variant). */
  size?: number;
  rotation?: number;
  style?: React.CSSProperties;
};

export function Sticker({
  variant = "icon",
  name = "star",
  color = colors.primary600,
  size = 40,
  rotation = 0,
  style,
}: StickerProps) {
  if (variant === "tape") {
    return (
      <div
        aria-hidden
        style={{
          width: "100%",
          height: "100%",
          minWidth: 56,
          minHeight: 18,
          background: color,
          opacity: 0.55,
          borderRadius: radii["2xs"],
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          ...style,
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        ...style,
      }}
    >
      <Icon name={name} size={size} color={color} />
    </div>
  );
}
