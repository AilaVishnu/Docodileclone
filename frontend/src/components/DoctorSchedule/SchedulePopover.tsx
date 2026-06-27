import React, { useEffect, useRef, useState } from "react";
import { colors, fonts, radii, spacing, zIndex } from "../../styles/theme";
import { Button } from "../Button";
import {
  DAY_KEYS,
  DAY_LONG,
  DAY_SHORT,
  DaySchedule,
  DayKey,
  Session,
  format12,
  formatTime24,
  parseTime,
} from "./scheduleStorage";

type ApplyScope = "this" | "weekdays" | "all";

type SchedulePopoverProps = {
  dayKey: DayKey;
  day: DaySchedule;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onSave: (next: DaySchedule, applyTo: ApplyScope) => void;
};

// ─── Time picker (15-min snap) ────────────────────────────────────────────────

function buildTimeOptions(): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      out.push(formatTime24(h, m));
    }
  }
  return out;
}

const TIME_OPTIONS = buildTimeOptions();

function TimeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
    >
      {TIME_OPTIONS.map((t) => (
        <option key={t} value={t}>
          {format12(t)}
        </option>
      ))}
    </select>
  );
}

const selectStyle: React.CSSProperties = {
  fontFamily: fonts.family.primary,
  fontSize: fonts.control.sm,
  fontWeight: 500,
  color: colors.neutral900,
  backgroundColor: colors.neutral100,
  border: `1px solid ${colors.primary300}`,
  borderRadius: radii.s,
  padding: "6px 10px",
  outline: "none",
  cursor: "pointer",
  minWidth: "92px",
  appearance: "none",
  WebkitAppearance: "none",
};

// ─── Popover ──────────────────────────────────────────────────────────────────

export function SchedulePopover({
  dayKey,
  day,
  anchorRect,
  onClose,
  onSave,
}: SchedulePopoverProps) {
  const [draft, setDraft] = useState<DaySchedule>(() => ({
    off: day.off,
    sessions: day.sessions.length
      ? day.sessions.map((s) => ({ ...s }))
      : [{ start: "17:00", end: "20:00" }],
  }));
  const [applyTo, setApplyTo] = useState<ApplyScope>("this");
  const ref = useRef<HTMLDivElement>(null);

  // Click-outside to close (and save)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        commit();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, applyTo]);

  // ESC closes without committing draft (but committed state is auto-saved on blur in v1)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") commit();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, applyTo]);

  const commit = () => {
    const cleaned: DaySchedule = draft.off
      ? { off: true, sessions: [] }
      : { off: false, sessions: draft.sessions.filter(validSession) };
    onSave(cleaned, applyTo);
    onClose();
  };

  const updateSession = (i: number, patch: Partial<Session>) => {
    setDraft((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  };

  const addSession = () => {
    setDraft((prev) => ({
      ...prev,
      sessions: [...prev.sessions, { start: "09:00", end: "12:00" }],
    }));
  };

  const removeSession = (i: number) => {
    setDraft((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, idx) => idx !== i),
    }));
  };

  const setOff = (off: boolean) => {
    setDraft((prev) => ({
      off,
      sessions: off ? [] : prev.sessions.length ? prev.sessions : [{ start: "17:00", end: "20:00" }],
    }));
  };

  // Position popover below the anchor chip
  const popoverPos: React.CSSProperties = anchorRect
    ? {
        position: "fixed",
        top: anchorRect.bottom + 8,
        left: Math.min(anchorRect.left, window.innerWidth - 320),
        zIndex: zIndex.popover,
      }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: zIndex.popover };

  return (
    <div ref={ref} style={{ ...styles.popover, ...popoverPos }}>
      <div style={styles.header}>
        <p style={styles.title}>{DAY_LONG[dayKey]}</p>
        <button
          onClick={() => setOff(!draft.off)}
          style={{
            ...styles.toggle,
            ...(draft.off ? styles.toggleOff : styles.toggleOn),
          }}
          title={draft.off ? "Currently off — click to open" : "Currently open — click to mark off"}
        >
          <span style={styles.toggleDot(draft.off)} />
          {draft.off ? "Off" : "Open"}
        </button>
      </div>

      {!draft.off && (
        <>
          <div style={styles.sessionList}>
            {draft.sessions.map((s, i) => (
              <div key={i} style={styles.sessionRow}>
                <span style={styles.sessionLabel}>
                  {draft.sessions.length > 1 ? `Session ${i + 1}` : "Hours"}
                </span>
                <div style={styles.timeRow}>
                  <TimeSelect value={s.start} onChange={(v) => updateSession(i, { start: v })} />
                  <span style={styles.dash}>–</span>
                  <TimeSelect value={s.end} onChange={(v) => updateSession(i, { end: v })} />
                  {draft.sessions.length > 1 && (
                    <button
                      onClick={() => removeSession(i)}
                      style={styles.removeBtn}
                      title="Remove session"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {draft.sessions.length < 2 && (
            <button onClick={addSession} style={styles.addSessionBtn}>
              + Add session
            </button>
          )}

          <div style={styles.divider} />

          <p style={styles.applyTitle}>Apply to</p>
          <div style={styles.applyRow}>
            {(["this", "weekdays", "all"] as ApplyScope[]).map((scope) => (
              <button
                key={scope}
                onClick={() => setApplyTo(scope)}
                style={{
                  ...styles.scopeChip,
                  ...(applyTo === scope ? styles.scopeChipActive : {}),
                }}
              >
                {scope === "this" && DAY_SHORT[dayKey]}
                {scope === "weekdays" && "Mon–Fri"}
                {scope === "all" && "All days"}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={styles.footer}>
        <Button variant="primary" size="sm" onClick={commit}>
          Done
        </Button>
      </div>
    </div>
  );
}

function validSession(s: Session): boolean {
  const a = parseTime(s.start);
  const b = parseTime(s.end);
  return a.h * 60 + a.m < b.h * 60 + b.m;
}

// Apply helper used by parent
export function applyDayToWeek(
  week: Record<DayKey, DaySchedule>,
  source: DayKey,
  scope: ApplyScope,
  newDay: DaySchedule
): Record<DayKey, DaySchedule> {
  if (scope === "this") {
    return { ...week, [source]: newDay };
  }
  if (scope === "weekdays") {
    const weekdays: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];
    const next = { ...week };
    for (const k of weekdays) next[k] = { ...newDay, sessions: newDay.sessions.map((s) => ({ ...s })) };
    return next;
  }
  // all
  const next = { ...week };
  for (const k of DAY_KEYS) next[k] = { ...newDay, sessions: newDay.sessions.map((s) => ({ ...s })) };
  return next;
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, any> = {
  popover: {
    width: "300px",
    backgroundColor: colors.neutral100,
    borderRadius: radii.xl,
    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.18)",
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    border: `1px solid ${colors.primary200}`,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    fontWeight: 400,
    color: colors.neutral900,
    margin: 0,
  },
  toggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 10px",
    borderRadius: radii.full,
    fontSize: fonts.control.xs,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
  },
  toggleOn: {
    backgroundColor: colors.greenAlpha10,
    color: colors.green200,
  },
  toggleOff: {
    backgroundColor: colors.neutral200,
    color: colors.neutral700,
  },
  toggleDot: (off: boolean): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: off ? colors.neutral500 : colors.green200,
    display: "inline-block",
  }),
  sessionList: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  sessionRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sessionLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral600,
    fontWeight: 500,
  },
  timeRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  dash: {
    color: colors.neutral500,
    fontSize: fonts.control.sm,
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: colors.neutral500,
    cursor: "pointer",
    fontSize: "14px",
    padding: "4px",
    lineHeight: 1,
  },
  addSessionBtn: {
    background: "none",
    border: `1px dashed ${colors.primary400}`,
    color: colors.primary700,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    fontWeight: 500,
    padding: "8px",
    borderRadius: radii.s,
    cursor: "pointer",
    width: "100%",
  },
  divider: {
    height: "1px",
    backgroundColor: colors.primary200,
  },
  applyTitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral600,
    fontWeight: 500,
    margin: 0,
  },
  applyRow: {
    display: "flex",
    gap: "6px",
  },
  scopeChip: {
    flex: 1,
    padding: "6px 10px",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    fontWeight: 500,
    color: colors.neutral700,
    backgroundColor: colors.neutral150,
    border: "none",
    borderRadius: radii.full,
    cursor: "pointer",
  },
  scopeChipActive: {
    backgroundColor: colors.primary300,
    color: colors.neutral900,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
  },
};
