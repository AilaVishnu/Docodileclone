import React, { useState, useEffect, useRef } from "react";
import { styles } from "./DatePicker.styles";
import { ChevronLeftIcon, ChevronRightIcon } from "../../iconsUtil";

type DatePickerProps = {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
  style?: React.CSSProperties;
};

export function DatePicker({ selectedDate, onSelect, onClose, style }: DatePickerProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    // Use capture to handle the event before it bubbles to the toggle button
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    // Adjust for Monday start: Sun=0, Mon=1, ..., Sat=6
    // We want Mon=0, ..., Sun=6
    let firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    firstDay = (firstDay === 0) ? 6 : firstDay - 1;

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} style={styles.emptyCell} />);
    }

    const todayAtMidnight = new Date();
    todayAtMidnight.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const currentDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isPast = currentDay < todayAtMidnight;

      const isSelected = 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === viewDate.getMonth() && 
        selectedDate.getFullYear() === viewDate.getFullYear();

      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === viewDate.getMonth() && 
        new Date().getFullYear() === viewDate.getFullYear();

      cells.push(
        <div
          key={day}
          onClick={(e) => {
            if (isPast) return;
            e.stopPropagation();
            onSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
          }}
          style={{
            ...styles.dayCell,
            ...(isSelected ? styles.selectedDay : {}),
            ...(isToday && !isSelected ? styles.today : {}),
            ...(isPast ? styles.disabledDay : {}),
          }}
        >
          {day}
        </div>
      );
    }
    return cells;
  };

  const isCurrentMonth = 
    viewDate.getMonth() === new Date().getMonth() && 
    viewDate.getFullYear() === new Date().getFullYear();

  const formatMonth = (date: Date) => {
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div style={{ ...styles.overlay, ...style }} onClick={(e) => e.stopPropagation()}>
      <div style={styles.container} ref={containerRef}>
        <div style={styles.header}>
          <button 
            onClick={handlePrevMonth} 
            style={{ ...styles.navButton, opacity: isCurrentMonth ? 0.3 : 1, cursor: isCurrentMonth ? "default" : "pointer" }}
            disabled={isCurrentMonth}
          >
            <ChevronLeftIcon style={{ width: 16, height: 16 }} />
          </button>
          <h4 style={styles.monthTitle}>{formatMonth(viewDate)}</h4>
          <button onClick={handleNextMonth} style={styles.navButton}>
            <ChevronRightIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={styles.weekDays}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <div key={d} style={styles.weekDay}>{d}</div>
          ))}
        </div>

        <div style={styles.daysGrid}>
          {renderDays()}
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          style={styles.doneButton}
        >
          Done
        </button>
      </div>
    </div>
  );
}
