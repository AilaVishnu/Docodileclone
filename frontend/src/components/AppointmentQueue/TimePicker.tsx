import React, { useState, useEffect, useRef } from "react";
import { styles } from "./TimePicker.styles";

type TimePickerProps = {
  initialTime: string; // "HH:MM AM/PM" or "HH:MM"
  onSelect: (time: string) => void;
  onClose: () => void;
  style?: React.CSSProperties;
};

export function TimePicker({ initialTime, onSelect, onClose, style }: TimePickerProps) {
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
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [ampm, setAmpm] = useState(parsed.ampm);
  
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
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
    onSelect(formattedTime);
    onClose();
  };

  // Snap to the current wall-clock time, rounded to the nearest 5 minutes
  // so it lines up with the minute selector below. Commits + closes in one
  // click — typical walk-in flow is "book for right now".
  const handleNow = () => {
    const now = new Date();
    let h = now.getHours();
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    let m = Math.round(now.getMinutes() / 5) * 5;
    if (m === 60) {
      m = 0;
      h = h === 12 ? 1 : h + 1;
    }
    const formattedTime = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
    onSelect(formattedTime);
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
                style={{ ...styles.cell, ...(hour === h ? styles.selectedCell : {}) }}
                onClick={() => setHour(h)}
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
                style={{ ...styles.cell, ...(minute === m ? styles.selectedCell : {}) }}
                onClick={() => setMinute(m)}
              >
                {m.toString().padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.amPmToggle}>
          <button 
            style={{ ...styles.toggleBtn, ...(ampm === "AM" ? styles.activeToggleBtn : {}) }}
            onClick={() => setAmpm("AM")}
          >
            AM
          </button>
          <button 
            style={{ ...styles.toggleBtn, ...(ampm === "PM" ? styles.activeToggleBtn : {}) }}
            onClick={() => setAmpm("PM")}
          >
            PM
          </button>
        </div>

        <div style={styles.actionsRow}>
          <button type="button" style={styles.nowButton} onClick={handleNow}>
            Now
          </button>
          <button type="button" style={styles.doneButton} onClick={handleDone}>
            Done
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
