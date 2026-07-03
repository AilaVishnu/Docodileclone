import React from "react";
import { colors, icon } from "../../styles/theme";
import { ICONS, MULTICOLOR_ICONS } from "./iconRegistry";

// ─────────────────────────────────────────────────────────────────────────────
// <Icon> — the one way to render an icon. Replaces the 24 iconsUtil wrappers
// and the scattered `ReactComponent as XIcon` imports.
//
//   <Icon name="bell" />              24px, neutral900 (the default)
//   <Icon name="bell" size={20} />    small variant — same SVG, scaled
//   <Icon name="bell" tone="muted" /> recolour from a token
//   <Icon name="bell" disabled />     = neutral400; one mechanism, every icon
//
// Recolouring works by painting the SVG with `currentColor`; monochrome icons
// must therefore use currentColor in their paths (see the normalize pass).
// Multicolor / brand icons (MULTICOLOR_ICONS) keep their baked palette.
// ─────────────────────────────────────────────────────────────────────────────

export type IconName = keyof typeof ICONS;

export type IconTone = "default" | "muted" | "disabled" | "inverse" | "inherit";

const TONE_COLOR: Record<IconTone, string> = {
  default: colors.neutral900,
  muted: colors.neutral500,
  disabled: colors.neutral400,
  inverse: colors.neutral100,
  // Inherit the ambient CSS color — for icons placed in a slot that already
  // sets a colour (Field iconLeft/iconRight, etc.).
  inherit: "inherit",
};

export type IconProps = {
  /** Registered icon name (see iconRegistry / the Foundations/Icons gallery). */
  name: string;
  /** px square. Default 24; use 20 for the small variant. */
  size?: number;
  /** Token tone — sets currentColor. Ignored for multicolor icons. */
  tone?: IconTone;
  /** Explicit colour override (wins over tone). */
  color?: string;
  /** Shorthand for the disabled tone (neutral400). */
  disabled?: boolean;
  /** Accessible label. When omitted the icon is decorative (aria-hidden). */
  title?: string;
  style?: React.CSSProperties;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
};

export function Icon({
  name,
  size = icon.size,
  tone = "default",
  color,
  disabled,
  title,
  style,
  className,
  onClick,
}: IconProps) {
  const Svg = ICONS[name];
  if (!Svg) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`<Icon>: unknown name "${name}"`);
    }
    return null;
  }

  const isMulti = MULTICOLOR_ICONS.has(name);
  // Monochrome icons paint with currentColor from the tone/color/disabled
  // inputs; multicolor icons keep their own palette (just dimmed when disabled).
  const resolved = disabled ? TONE_COLOR.disabled : color ?? TONE_COLOR[tone];

  return (
    <Svg
      width={size}
      height={size}
      onClick={onClick}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{
        color: isMulti ? undefined : resolved,
        opacity: isMulti && disabled ? 0.4 : undefined,
        flexShrink: 0,
        display: "block",
        ...style,
      }}
      className={className}
    />
  );
}
