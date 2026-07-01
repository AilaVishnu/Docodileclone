import React from "react";
import { Icon } from "../../components/Icon";
import { colors } from "../../styles/theme";
import type { Doctor } from "../../hooks/useDoctors";
import {
  noteRow,
  noteLabel,
  noteLabelText,
  sectionIcon,
  referDropdown,
  referText,
  referChevron,
  referMenu,
  referMenuEmpty,
  referMenuItem,
  referMenuItemName,
  referMenuItemMeta,
} from "./bottomRowStyles";

// ReferBlock — refer the patient to another doctor. Lifted VERBATIM from
// PrescriptionPage's inline "Refer to" row: a custom click-outside dropdown (NOT
// a generic Select) populated with the clinic's real doctors, with the doctor
// currently treating the visit filtered out. The open state + click-outside
// listener + wrapper ref live INSIDE the block; the page owns the selected
// doctor id + the doctors list and passes them as props.
export type ReferBlockProps = {
  /** Clinic doctors (from useDoctors()). */
  doctors: Doctor[];
  /** Selected doctor id (referDoctorId on the page), or null. */
  value: string | null;
  onChange: (doctorId: string) => void;
  /** Doctor already treating this visit — hidden from the list (no self-referral). */
  excludeDoctorId?: string | null;
};

export function ReferBlock({ doctors, value, onChange, excludeDoctorId }: ReferBlockProps) {
  const [referOpen, setReferOpen] = React.useState(false);
  const referWrapRef = React.useRef<HTMLDivElement>(null);
  const referDoctorName = doctors.find((d) => d.id === value)?.name ?? "";

  React.useEffect(() => {
    if (!referOpen) return;
    const handler = (e: MouseEvent) => {
      if (referWrapRef.current && !referWrapRef.current.contains(e.target as Node)) {
        setReferOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [referOpen]);

  return (
    <div style={noteRow}>
      <div style={noteLabel}>
        <Icon name="users-group-rounded" tone="inherit" style={sectionIcon} />
        <span style={noteLabelText}>Refer to</span>
      </div>
      <div ref={referWrapRef} style={{ position: "relative" }}>
        <div
          style={referDropdown}
          onClick={() => setReferOpen((v) => !v)}
          role="button"
          aria-haspopup="listbox"
          aria-expanded={referOpen}
        >
          <span
            style={{
              ...referText,
              ...(referDoctorName ? { color: colors.neutral900 } : {}),
            }}
          >
            {referDoctorName || "Select doctor"}
          </span>
          <span style={referChevron}>
            <Icon
              name="chevron-up"
              size={16}
              tone="inherit"
              style={{ transform: referOpen ? "rotate(0deg)" : "rotate(180deg)" }}
            />
          </span>
        </div>
        {referOpen && (() => {
          // Hide the doctor who's already treating this visit
          // — referring to yourself isn't a referral.
          const referableDoctors = doctors.filter((d) => d.id !== excludeDoctorId);
          return (
            <div style={referMenu}>
              {referableDoctors.length === 0 ? (
                <div style={referMenuEmpty}>No other doctors in this clinic</div>
              ) : (
                referableDoctors.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    style={referMenuItem}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(d.id);
                      setReferOpen(false);
                    }}
                  >
                    <span style={referMenuItemName}>{d.name}</span>
                    {(d.specialty || d.department) && (
                      <span style={referMenuItemMeta}>{d.specialty || d.department}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
