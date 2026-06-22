import React, { useRef, useState } from "react";
import { styles } from "./BoardItem.styles";

// ─────────────────────────────────────────────────────────────────────────────
// BoardItem — a free-drag, z-ordered frame that positions any child on a board.
//
// Owns its own pointer drag (so it can be used and demoed in isolation). The
// host board passes the layout box (`bounds`) and `scale` so positions clamp
// correctly even when the board is rendered under a CSS transform: scale().
// Anything inside marked [data-no-drag] (inputs, buttons) won't start a drag.
// ─────────────────────────────────────────────────────────────────────────────

export type BoardItemPos = { x: number; y: number };

export type BoardItemProps = {
  x: number;
  y: number;
  z?: number;
  /** Item box size in unscaled board px (used for drag clamping). */
  width: number;
  height: number;
  /** Let the item's content drive its height (e.g. a note that grows). */
  autoHeight?: boolean;
  rotation?: number;
  /** Board layout scale, if the board is rendered under transform: scale(). */
  scale?: number;
  /** Board layout box in unscaled px; positions are clamped inside it. */
  bounds?: { width: number; height: number };
  /** View mode: disables dragging and hides the remove control. */
  locked?: boolean;
  removable?: boolean;
  onChange?: (pos: BoardItemPos) => void;
  /** Fired on pointer-down so the board can bring this item to the front. */
  onFocus?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Pointer travel (px) before a press becomes a drag — keeps clicks clickable.
const DRAG_THRESHOLD = 4;

export function BoardItem({
  x,
  y,
  z = 1,
  width,
  height,
  autoHeight = false,
  rotation = 0,
  scale = 1,
  bounds,
  locked = false,
  removable = true,
  onChange,
  onFocus,
  onRemove,
  children,
  style,
}: BoardItemProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (locked) return;
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    onFocus?.();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* no active pointer (e.g. synthetic event) — drag still tracks via state */
    }
    start.current = { px: e.clientX, py: e.clientY, ox: x, oy: y };
    moved.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const s = scale || 1;
    const dx = (e.clientX - start.current.px) / s;
    const dy = (e.clientY - start.current.py) / s;
    // Below the threshold it's a click, not a drag — leave the item put so
    // interactive widgets (calendar days, buttons) stay clickable.
    if (!moved.current && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    if (!moved.current) {
      moved.current = true;
      setDragging(true);
    }
    let nx = start.current.ox + dx;
    let ny = start.current.oy + dy;
    if (bounds) {
      const h = autoHeight ? rootRef.current?.offsetHeight ?? height : height;
      nx = clamp(nx, 0, Math.max(0, bounds.width - width));
      ny = clamp(ny, 0, Math.max(0, bounds.height - h));
    }
    onChange?.({ x: Math.round(nx), y: Math.round(ny) });
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!start.current) return;
    start.current = null;
    moved.current = false;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        ...styles.root,
        left: x,
        top: y,
        width,
        height: autoHeight ? undefined : height,
        zIndex: z,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        cursor: locked ? "default" : dragging ? "grabbing" : "grab",
        ...style,
      }}
    >
      {children}
      {!locked && removable && onRemove && (
        <button
          data-no-drag
          onClick={onRemove}
          style={styles.removeBtn}
          aria-label="Remove from board"
          title="Remove"
        >
          ✕
        </button>
      )}
    </div>
  );
}
