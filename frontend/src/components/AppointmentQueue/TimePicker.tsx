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

  return (
    <div style={{ ...styles.overlay, ...style }} onClick={(e) => e.stopPropagation()}>
      <div style={styles.container} ref={containerRef}>
        <div style={styles.header}>
          <h4 style={styles.title}>Select Time</h4>
        </div>

        <div style={styles.selectors}>
          <div style={styles.column}>
            <span style={styles.unitHeader}>Hours</span>
            <div style={styles.scrollBox}>
              {hours.map(h => (
                <div 
                  key={h} 
                  style={{ ...styles.item, ...(hour === h ? styles.selectedItem : {}) }}
                  onClick={() => setHour(h)}
                >
                  {h}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.separator}>:</div>

          <div style={styles.column}>
            <span style={styles.unitHeader}>Minutes</span>
            <div style={styles.scrollBox}>
              {minutes.map(m => (
                <div 
                  key={m} 
                  style={{ ...styles.item, ...(minute === m ? styles.selectedItem : {}) }}
                  onClick={() => setMinute(m)}
                >
                  {m.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
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

        <button style={styles.doneButton} onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  );
}
