import React, { useState, useEffect, useRef } from "react";
import { styles } from "./TimePicker.styles";
import { Button } from "../Button";

type TimePickerProps = {
  initialTime: string; // "HH:MM AM/PM" or "HH:MM"
  onSelect: (time: string) => void;
  onClose: () => void;
  style?: React.CSSProperties;
  // The appointment date. When it's today, slots earlier than the current
  // wall-clock time are locked so you can't book into the past.
  selectedDate?: Date;
  // Optional: when provided, the picker shows a "Walk-in" button. The caller
  // is expected to set the appointment's scheduled time to the current wall
  // clock and mark isWalkin=true; the picker just emits the intent and the
  // current time string so the caller doesn't have to recompute it.
  onWalkin?: (time: string) => void;
};

export function TimePicker({ initialTime, onSelect, onClose, style, selectedDate, onWalkin }: TimePickerProps) {
  const now = new Date();
  const isToday = !!selectedDate &&
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();
  // 12-hour (hour, AM/PM) → 24-hour hour, for comparing against `now`.
  const to24 = (h12: number, ap: string) => (ap === "PM" ? (h12 % 12) + 12 : h12 % 12);

  const parseInitialTime = (time: string) => {
    const ampmMatch = time.match(/(AM|PM)/i);
    const ampm = ampmMatch ? ampmMatch[0].toUpperCase() : "AM";
    const cleanTime = time.replace(/(AM|PM)/i, "").trim();
    const [h, m] = cleanTime.split(":").map(s => s.trim());

    let hour = parseInt(h) || 10;
    if (hour > 12) hour = 12;
    if (hour < 1) hour = 1;

    let minute = parseInt(m) || 0;
    // Round to nearest 5 for selector
    minute = Math.round(minute / 5) * 5;
    if (minute >= 60) minute = 55;

    return { hour, minute, ampm };
  };

  const parsed = parseInitialTime(initialTime);
  // If the appointment is for today and the parsed time is already past,
  // open the picker on the next valid 5-minute slot instead of a past one.
  const initial = (() => {
    if (!isToday) return parsed;
    const p24 = to24(parsed.hour, parsed.ampm);
    const past = p24 < now.getHours() || (p24 === now.getHours() && parsed.minute < now.getMinutes());
    if (!past) return parsed;
    let h24 = now.getHours();
    let m = Math.ceil(now.getMinutes() / 5) * 5;
    if (m >= 60) { m = 0; h24 = (h24 + 1) % 24; }
    const ap = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12; if (h12 === 0) h12 = 12;
    return { hour: h12, minute: m, ampm: ap };
  })();
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [ampm, setAmpm] = useState(initial.ampm);

  // ── Past-slot locking (only when the chosen date is today) ───────────────
  const hourDisabled = (h12: number) => isToday && to24(h12, ampm) < now.getHours();
  const minuteDisabled = (m: number) => {
    if (!isToday) return false;
    const h24 = to24(hour, ampm);
    if (h24 < now.getHours()) return true;
    return h24 === now.getHours() && m < now.getMinutes();
  };
  const ampmDisabled = (ap: string) => isToday && ap === "AM" && now.getHours() >= 12;
  const selectionPast = isToday && (() => {
    const h24 = to24(hour, ampm);
    return h24 < now.getHours() || (h24 === now.getHours() && minute < now.getMinutes());
  })();
  const nextValidMinute = () => Math.min(55, Math.ceil(now.getMinutes() / 5) * 5);

  // Picking an hour / AM-PM that lands on the current hour can leave the
  // selected minute in the past — bump it to the first valid slot.
  const pickHour = (h12: number) => {
    if (hourDisabled(h12)) return;
    setHour(h12);
    if (isToday && to24(h12, ampm) === now.getHours() && minute < now.getMinutes()) {
      setMinute(nextValidMinute());
    }
  };
  const pickAmpm = (ap: string) => {
    if (ampmDisabled(ap)) return;
    setAmpm(ap);
    if (isToday && to24(hour, ap) === now.getHours() && minute < now.getMinutes()) {
      setMinute(nextValidMinute());
    }
  };
  const disabledCell: React.CSSProperties = { opacity: 0.3, cursor: "not-allowed" };

  // If the current selection ever lands on a locked slot — e.g. you toggle
  // from 12 PM to AM, making it 12 AM (midnight, past) — snap to the next
  // valid time so the picker never sits on a disabled cell with Done stuck.
  useEffect(() => {
    if (!isToday) return;
    if (!(hourDisabled(hour) || ampmDisabled(ampm) || minuteDisabled(minute))) return;
    let h24 = now.getHours();
    let m = Math.ceil(now.getMinutes() / 5) * 5;
    if (m >= 60) { m = 0; h24 = (h24 + 1) % 24; }
    let h12 = h24 % 12; if (h12 === 0) h12 = 12;
    setHour(h12);
    setAmpm(h24 >= 12 ? "PM" : "AM");
    setMinute(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, ampm, minute, isToday]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleDone = () => {
    if (selectionPast) return; // can't confirm a past time
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
    onSelect(formattedTime);
    onClose();
  };

  // Commit the exact current wall-clock time via the walk-in channel —
  // caller flags the appointment as a walk-in (isWalkin=true) and renders
  // "Walk-in" instead of the time string in the queue.
  const handleWalkin = () => {
    if (!onWalkin) return;
    const now = new Date();
    let h = now.getHours();
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    const m = now.getMinutes();
    const formattedTime = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
    onWalkin(formattedTime);
    onClose();
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={{ ...styles.overlay, ...style }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container} ref={containerRef}>
        <div style={styles.header}>
          <h4 style={styles.title}>Select Time</h4>
        </div>

        <div>
          <div style={styles.sectionLabel}>Hour</div>
          <div style={styles.grid}>
            {hours.map(h => (
              <button
                key={h}
                type="button"
                style={{ ...styles.cell, ...(hour === h ? styles.selectedCell : {}), ...(hourDisabled(h) ? disabledCell : {}) }}
                onClick={() => pickHour(h)}
                disabled={hourDisabled(h)}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={styles.sectionLabel}>Minute</div>
          <div style={styles.grid}>
            {minutes.map(m => (
              <button
                key={m}
                type="button"
                style={{ ...styles.cell, ...(minute === m ? styles.selectedCell : {}), ...(minuteDisabled(m) ? disabledCell : {}) }}
                onClick={() => { if (!minuteDisabled(m)) setMinute(m); }}
                disabled={minuteDisabled(m)}
              >
                {m.toString().padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.amPmToggle}>
          <button
            style={{ ...styles.toggleBtn, ...(ampm === "AM" ? styles.activeToggleBtn : {}), ...(ampmDisabled("AM") ? disabledCell : {}) }}
            onClick={() => pickAmpm("AM")}
            disabled={ampmDisabled("AM")}
          >
            AM
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(ampm === "PM" ? styles.activeToggleBtn : {}) }}
            onClick={() => pickAmpm("PM")}
          >
            PM
          </button>
        </div>

        <div style={styles.actionsRow}>
          {onWalkin && (
            <Button variant="light" size="sm" onClick={handleWalkin} style={{ flex: 1 }}>Walk-in</Button>
          )}
          <Button variant="dark" size="sm" onClick={handleDone} disabled={selectionPast} style={{ flex: 1 }}>Done</Button>
        </div>
        </div>
      </div>
    </>
  );
}
