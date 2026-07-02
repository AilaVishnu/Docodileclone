import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";

export type LottieIconHandle = { play: () => void };

type LottieIconProps = {
  /** Parsed Lottie JSON (an imported animationData object). */
  animationData: unknown;
  /**
   * Plays a one-shot on the rising edge (false → true) — e.g. when the icon's
   * module becomes the active one. Leave undefined and drive it via the ref.
   */
  active?: boolean;
  /** px square. Default 24 (sidebar size). */
  size?: number;
  style?: React.CSSProperties;
};

// ─────────────────────────────────────────────────────────────────────────────
// LottieIcon — a Lottie animation rendered as an icon that plays a one-shot on
// activation, then rests on frame 0 (its static glyph). No autoplay, no loop, so
// there is NO idle runtime cost — CPU is spent only during the brief play. On
// "reduce motion" it jumps straight to the final frame instead of animating.
//
// This lives beside <Icon> but is intentionally separate: the icon REGISTRY stays
// SVG-only; animated Lottie glyphs are opt-in (e.g. the sidebar).
// ─────────────────────────────────────────────────────────────────────────────
export const LottieIcon = forwardRef<LottieIconHandle, LottieIconProps>(
  function LottieIcon({ animationData, active, size = 24, style }, ref) {
    const box = useRef<HTMLDivElement>(null);
    const anim = useRef<AnimationItem | null>(null);

    const play = () => {
      const a = anim.current;
      if (!a) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        a.goToAndStop(Math.max(0, a.totalFrames - 1), true);
        return;
      }
      a.goToAndPlay(0, true);
    };
    useImperativeHandle(ref, () => ({ play }), []);

    // Load once per animationData; sit on the resting frame until played.
    useEffect(() => {
      if (!box.current) return;
      const a = lottie.loadAnimation({
        container: box.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: animationData as object,
      });
      a.goToAndStop(0, true);
      anim.current = a;
      return () => {
        a.destroy();
        anim.current = null;
      };
    }, [animationData]);

    // Play a one-shot whenever this becomes the active module. Fires on the
    // false→true transition AND on mount-while-active, so it works whether the
    // sidebar persists the icon across navigation or remounts it each time.
    useEffect(() => {
      if (active) play();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    return <div ref={box} style={{ width: size, height: size, ...style }} aria-hidden />;
  }
);
