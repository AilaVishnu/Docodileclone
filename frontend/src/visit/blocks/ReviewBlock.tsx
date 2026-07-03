import React from "react";
import { Icon } from "../../components/Icon";
import { DatePicker } from "../../components/DatePicker/DatePicker";
import {
  noteRow,
  noteLabel,
  noteLabelText,
  sectionIcon,
  reviewRow,
  reviewDate as reviewDateStyle,
  reviewDateText,
  reviewOr,
  reviewDaysWrap,
  reviewDaysInput,
  reviewDaysLabel,
  reviewLong,
} from "./bottomRowStyles";

// ReviewBlock — the next review, lifted VERBATIM from PrescriptionPage's inline
// "Review" row: a custom DatePicker popup (NOT a generic DateField) triggered by
// the calendar chip, an "or ___ days" segment linked to the date, and a notes
// field. The picker-open state lives INSIDE the block; the page owns date/days/
// notes and the date⇄days linkage (pickDate / daysChange), passed as callbacks.
const formatReviewDate = (d: Date): string =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export type ReviewBlockProps = {
  date: Date | null;
  days: string;
  notes: string;
  /** Pick a review date (page keeps date⇄days in sync + flags dirty). */
  onPickDate: (d: Date) => void;
  /** Edit the "days" input (page recomputes the date). */
  onDaysChange: (raw: string) => void;
  onNotesChange: (value: string) => void;
};

export function ReviewBlock({ date, days, notes, onPickDate, onDaysChange, onNotesChange }: ReviewBlockProps) {
  const [showReviewDatePicker, setShowReviewDatePicker] = React.useState(false);
  return (
    <div style={noteRow}>
      <div style={noteLabel}>
        <Icon name="restart" tone="inherit" style={sectionIcon} />
        <span style={noteLabelText}>Review</span>
      </div>
      <div style={reviewRow}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={reviewDateStyle}
            onClick={() => setShowReviewDatePicker((v) => !v)}
          >
            <Icon name="calendar" size={24} tone="inherit" />
            <span
              style={{
                ...reviewDateText,
                color: date ? "inherit" : reviewDateText.color,
              }}
            >
              {date ? formatReviewDate(date) : "Select Date"}
            </span>
          </div>
          {showReviewDatePicker && (
            <DatePicker
              selectedDate={date ?? new Date()}
              onSelect={(d) => { onPickDate(d); setShowReviewDatePicker(false); }}
              onClose={() => setShowReviewDatePicker(false)}
              disablePast
            />
          )}
        </div>
        <span style={reviewOr}>or</span>
        <div style={reviewDaysWrap}>
          <input
            style={reviewDaysInput}
            value={days}
            onChange={(e) => onDaysChange(e.target.value)}
            inputMode="numeric"
            placeholder=""
          />
          <span style={reviewDaysLabel}>days</span>
        </div>
        <input
          style={reviewLong}
          placeholder="Notes for Review..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
    </div>
  );
}
