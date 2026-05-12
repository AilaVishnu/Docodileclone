import React, { useState, useEffect, useRef } from "react";
import { styles } from "./DatePicker.styles";
import { ChevronLeftIcon, ChevronRightIcon } from "../../iconsUtil";
import { fonts, colors } from "../../styles/theme";

type DatePickerProps = {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
  style?: React.CSSProperties;
  disablePast?: boolean;
  showDoneButton?: boolean;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function DatePicker({ selectedDate, onSelect, onClose, style, disablePast, showDoneButton }: DatePickerProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
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

  const handlePrevYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const handleNextYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  const renderDays = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
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
      const isPast = disablePast && currentDay < todayAtMidnight;

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
            ...(isPast ? { opacity: 0.3, cursor: "not-allowed" } : {}),
          }}
        >
          {day}
        </div>
      );
    }
    return cells;
  };

  const renderMonths = () => {
    return MONTHS.map((m, i) => (
      <div
        key={m}
        onClick={(e) => {
          e.stopPropagation();
          setViewDate(new Date(viewDate.getFullYear(), i, 1));
          setViewMode("days");
        }}
        style={{
          padding: "10px",
          textAlign: "center",
          cursor: "pointer",
          borderRadius: "8px",
          fontSize: fonts.size.s,
          fontWeight: viewDate.getMonth() === i ? 600 : 400,
          backgroundColor: viewDate.getMonth() === i ? colors.primary600 : "transparent",
          color: viewDate.getMonth() === i ? colors.neutral100 : colors.neutral900,
        }}
        onMouseEnter={(e) => { if (viewDate.getMonth() !== i) e.currentTarget.style.backgroundColor = colors.neutral150; }}
        onMouseLeave={(e) => { if (viewDate.getMonth() !== i) e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        {m}
      </div>
    ));
  };

  const renderYears = () => {
    const currentYear = viewDate.getFullYear();
    const startYear = currentYear - 6;
    const years = [];
    for (let y = startYear; y <= startYear + 11; y++) {
      years.push(
        <div
          key={y}
          onClick={(e) => {
            e.stopPropagation();
            setViewDate(new Date(y, viewDate.getMonth(), 1));
            setViewMode("months");
          }}
          style={{
            padding: "10px",
            textAlign: "center",
            cursor: "pointer",
            borderRadius: "8px",
            fontSize: fonts.size.s,
            fontWeight: currentYear === y ? 600 : 400,
            backgroundColor: currentYear === y ? colors.primary600 : "transparent",
            color: currentYear === y ? colors.neutral100 : colors.neutral900,
          }}
          onMouseEnter={(e) => { if (currentYear !== y) e.currentTarget.style.backgroundColor = colors.neutral150; }}
          onMouseLeave={(e) => { if (currentYear !== y) e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          {y}
        </div>
      );
    }
    return years;
  };

  const formatMonth = (date: Date) => date.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <>
    <div style={styles.backdrop} onClick={onClose} />
    <div style={{ ...styles.overlay, ...style }} onClick={(e) => e.stopPropagation()}>
      <div style={styles.container} ref={containerRef}>
        <div style={styles.header}>
          <button onClick={viewMode === "years" ? (e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1)); } : viewMode === "months" ? handlePrevYear : handlePrevMonth} style={styles.navButton}>
            <ChevronLeftIcon style={{ width: 16, height: 16 }} />
          </button>
          <h4
            style={{ ...styles.monthTitle, cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              if (viewMode === "days") setViewMode("months");
              else if (viewMode === "months") setViewMode("years");
            }}
          >
            {viewMode === "days" && formatMonth(viewDate)}
            {viewMode === "months" && viewDate.getFullYear()}
            {viewMode === "years" && `${viewDate.getFullYear() - 6} – ${viewDate.getFullYear() + 5}`}
          </h4>
          <button onClick={viewMode === "years" ? (e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1)); } : viewMode === "months" ? handleNextYear : handleNextMonth} style={styles.navButton}>
            <ChevronRightIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {viewMode === "days" && (
          <>
            <div style={styles.weekDays}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} style={styles.weekDay}>{d}</div>
              ))}
            </div>
            <div style={styles.daysGrid}>
              {renderDays()}
            </div>
          </>
        )}

        {viewMode === "months" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", padding: "8px 0" }}>
            {renderMonths()}
          </div>
        )}

        {viewMode === "years" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", padding: "8px 0" }}>
            {renderYears()}
          </div>
        )}

        {showDoneButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(new Date());
              onClose();
            }}
            style={styles.doneButton}
          >
            Go to today
          </button>
        )}
      </div>
    </div>
    </>
  );
}
